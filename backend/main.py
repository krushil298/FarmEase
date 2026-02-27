"""
FarmEase AI - FastAPI Backend
Main application entry point.

Run with: uvicorn main:app --reload --port 8000
"""

import os
import time
import requests as _requests
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv

from system_prompt import SYSTEM_PROMPT
from mock_responses import get_mock_response

# ─── Simple in-memory rate limiter ────────────────────────────────────────────
_rate_store: dict = defaultdict(list)   # ip -> list of timestamps
RATE_LIMIT  = int(os.getenv("RATE_LIMIT_PER_MIN", "10"))   # requests per minute

def _check_rate_limit(ip: str):
    now = time.time()
    window = [t for t in _rate_store[ip] if now - t < 60]
    if len(window) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a moment.")
    window.append(now)
    _rate_store[ip] = window

def _sanitize_error(exc: Exception) -> str:
    """Return a safe error message — never leak billing URLs, team IDs, or API keys."""
    raw = str(exc)
    # Catch common provider billing / auth messages
    if any(kw in raw.lower() for kw in ["credit", "billing", "license", "quota", "console.x.ai", "platform.openai", "team/"]):
        return "The AI service is temporarily unavailable due to account limits. Please try again later or contact support."
    if "401" in raw or "invalid_api_key" in raw or "api key" in raw.lower():
        return "AI service authentication failed. Please contact the administrator."
    if "404" in raw or "not found" in raw.lower():
        return "AI model not available. Please contact the administrator."
    # Generic fallback — still no raw trace
    return "AI service encountered an error. Please try again."

# ─── Load environment variables ───────────────────────────────────────────────
load_dotenv()

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

# ─── HuggingFace config ───────────────────────────────────────────────────────
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
HF_MODEL_URL = "https://api-inference.huggingface.co/models/bharatgenai/sooktam2"

# ─── Grok (xAI) client — OpenAI-compatible API ───────────────────────────────
if not MOCK_MODE:
    from openai import OpenAI

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if not GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not set. "
            "Add it to .env or set MOCK_MODE=true to demo without an API key."
        )

    grok_client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",   # Groq endpoint
    )
    GROK_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# ─── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="FarmEase AI API",
    description="Agriculture-domain-restricted AI chatbot backend for FarmEase.",
    version="1.0.0",
)

# ─── CORS middleware ──────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
_allow_credentials = "*" not in ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response schemas ───────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[ChatMessage] = Field(default=[], max_length=10)


class ChatResponse(BaseModel):
    reply: str
    tokens_used: int | None = None
    mock: bool = False


class SpeakRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=3000,
                      description="Chatbot reply text to convert to speech")
    language: Optional[str] = Field(default="en",
                                    description="Language hint (e.g. 'en', 'hi')")


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    # Never expose internal mode, model name, or key info publicly
    return {"status": "ok", "service": "FarmEase AI"}


# ─── /speak — HuggingFace TTS (bharatgenai/sooktam2) ─────────────────────────
@app.post("/speak")
def speak(req: SpeakRequest, request: Request):
    """
    Convert text to speech using the HuggingFace Inference API.
    Returns raw audio bytes (wav / mpeg) as a StreamingResponse.
    """
    if not HUGGINGFACE_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="HUGGINGFACE_API_KEY is not configured on the server."
        )

    # Rate-limit (shared store with /chat)
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    # Strip markdown / emoji for cleaner speech
    clean = (
        req.text
        .replace("**", "")
        .replace("## ", "")
        .replace("# ", "")
        .strip()
    )
    if not clean:
        raise HTTPException(status_code=422, detail="Text is empty after sanitization.")

    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {"inputs": clean}

    try:
        resp = _requests.post(
            HF_MODEL_URL,
            json=payload,
            headers=headers,
            timeout=30,
        )
    except _requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="HuggingFace API timed out. Please try again.")
    except _requests.exceptions.RequestException as exc:
        raise HTTPException(status_code=502, detail="Could not reach HuggingFace API.")

    if resp.status_code == 503:
        # Model is loading — tell client to retry
        raise HTTPException(
            status_code=503,
            detail="TTS model is loading, please retry in 20 seconds."
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"HuggingFace returned {resp.status_code}. TTS unavailable."
        )

    # Detect content type from response header
    content_type = resp.headers.get("Content-Type", "audio/wav")
    if "mpeg" in content_type or "mp3" in content_type:
        media_type = "audio/mpeg"
    else:
        media_type = "audio/wav"

    return StreamingResponse(
        iter([resp.content]),
        media_type=media_type,
        headers={"Content-Disposition": "inline; filename=speech.wav"},
    )


# ─── /transcribe — Speech-to-Text using Groq Whisper ─────────────────────────
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), request: Request = None):
    """
    Convert speech audio to text using Groq's Whisper model.
    Accepts audio files (wav, mp3, m4a, webm, ogg).
    """
    if MOCK_MODE:
        return {"text": "This is a mock transcription. Start the backend with a real API key for voice input."}

    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured.")

    audio_data = await file.read()
    if len(audio_data) == 0:
        raise HTTPException(status_code=422, detail="Empty audio file.")
    if len(audio_data) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file too large (max 25 MB).")

    try:
        import httpx
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}
        files = {"file": (file.filename or "audio.wav", audio_data, file.content_type or "audio/wav")}
        data = {"model": "whisper-large-v3-turbo", "response_format": "json"}

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                headers=headers,
                files=files,
                data=data,
            )

        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Whisper transcription failed.")

        result = resp.json()
        return {"text": result.get("text", "").strip()}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Transcription error: {_sanitize_error(exc)}")


# ─── Chat endpoint ────────────────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, req: Request):
    # Rate limiting
    client_ip = req.client.host if req.client else "unknown"
    _check_rate_limit(client_ip)

    # ── MOCK MODE ──────────────────────────────────────────────────────────────
    if MOCK_MODE:
        reply = get_mock_response(request.message)
        return ChatResponse(reply=reply, mock=True)

    # ── GROK MODE ──────────────────────────────────────────────────────────────
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in request.history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": request.message})

    try:
        response = grok_client.chat.completions.create(
            model=GROK_MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=800,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {_sanitize_error(exc)}")

    reply_text = response.choices[0].message.content.strip()
    tokens = response.usage.total_tokens if response.usage else None

    return ChatResponse(reply=reply_text, tokens_used=tokens)
