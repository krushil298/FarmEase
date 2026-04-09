import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ─── Auto-detect backend URL ─────────────────────────────────────────────────
// Expo Go runs on your phone, so "localhost" won't work.
// We extract your computer's IP from the Expo dev server URL.
function getBackendUrl(): string {
    // Try to get the host IP from Expo's dev server
    const debuggerHost =
        Constants.expoConfig?.hostUri ||          // Expo SDK 49+
        (Constants.manifest2 as any)?.extra?.expoGo?.debuggerHost ||
        (Constants.manifest as any)?.debuggerHost;

    if (debuggerHost) {
        // debuggerHost is like "192.168.1.5:8081" — extract just the IP
        const ip = debuggerHost.split(':')[0];
        if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
            return `http://${ip}:8000`;
        }
    }

    // Fallback for emulators/simulators
    return Platform.select({
        android: 'http://10.0.2.2:8000',
        ios: 'http://localhost:8000',
        default: 'http://localhost:8000',
    }) as string;
}

const BASE_URL = getBackendUrl();
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';
console.log('[ChatAPI] Backend URL:', BASE_URL);

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    reply: string;
    tokens_used: number | null;
    mock: boolean;
}

// ─── Chat ────────────────────────────────────────────────────────────────────
export async function sendChatMessage(
    message: string,
    history: ChatMessage[] = []
): Promise<ChatResponse> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const resp = await fetch(`${BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
            body: JSON.stringify({
                message,
                history: history.slice(-10),
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(err.detail || `Server error ${resp.status}`);
        }

        return await resp.json();
    } catch (error: any) {
        // Any network/connection error → use mock fallback
        console.log('[ChatAPI] Error:', error.message, '→ using mock fallback');
        return getMockFallback(message);
    }
}

// ─── TTS (speak) ─────────────────────────────────────────────────────────────
export async function speakText(text: string, language: string = 'en'): Promise<ArrayBuffer | null> {
    try {
        const resp = await fetch(`${BASE_URL}/speak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
            body: JSON.stringify({ text, language }),
        });

        if (!resp.ok) return null;
        return await resp.arrayBuffer();
    } catch {
        return null;
    }
}

// ─── STT (transcribe) ────────────────────────────────────────────────────────
export async function transcribeAudio(audioUri: string): Promise<string> {
    try {
        const formData = new FormData();
        formData.append('file', {
            uri: audioUri,
            type: 'audio/m4a',
            name: 'recording.m4a',
        } as any);

        const resp = await fetch(`${BASE_URL}/transcribe`, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data', 'X-API-Key': API_KEY },
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ detail: 'Transcription failed' }));
            throw new Error(err.detail || 'Transcription failed');
        }

        const data = await resp.json();
        return data.text || '';
    } catch (error: any) {
        throw new Error(error.message || 'Voice transcription failed. Please type your message.');
    }
}

// ─── Health ──────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
    try {
        const resp = await fetch(`${BASE_URL}/health`, { method: 'GET' });
        return resp.ok;
    } catch {
        return false;
    }
}

// ─── Mock Fallback (when backend is unreachable) ─────────────────────────────
function getMockFallback(message: string): ChatResponse {
    const text = message.toLowerCase();

    // Greetings
    if (['hello', 'hi', 'hey', 'namaste', 'namaskar'].some(w => text.includes(w))) {
        return {
            reply: "🌾 **Namaste!** I'm FarmEase AI, your agriculture assistant.\n\nI can help you with:\n• 🌱 Crop guidance & planning\n• 🔬 Disease & pest control\n• 🧪 Fertilizer recommendations\n• 💧 Irrigation methods\n• 📋 Government schemes\n• 🚜 FarmEase app features\n\nAsk me anything!",
            tokens_used: null, mock: true,
        };
    }

    // Crops
    if (['rice', 'wheat', 'tomato', 'potato', 'onion', 'sugarcane', 'cotton', 'mango', 'crop', 'grow', 'seed', 'sow', 'harvest', 'yield', 'farm'].some(w => text.includes(w))) {
        return {
            reply: "🌾 **Crop Guidance**\n\nHere are best practices for healthy crops:\n\n1. **Soil Testing** 🔬 — Get your soil tested to know NPK levels before sowing\n2. **Seed Selection** 🌱 — Choose disease-resistant, high-yield varieties suited to your region\n3. **Timely Sowing** 📅 — Follow recommended sowing dates for your crop & season\n4. **Smart Irrigation** 💧 — Drip irrigation saves 30-50% water vs flood irrigation\n5. **Crop Rotation** 🔄 — Rotate crops every season to maintain soil health\n\n💡 **Pro Tip:** System of Rice Intensification (SRI) can increase rice yield by 20-50% with less seed and water.\n\n_I recommend confirming with your local agriculture officer for precise guidance._",
            tokens_used: null, mock: true,
        };
    }

    // Disease & Pest
    if (['disease', 'blight', 'rot', 'rust', 'fungus', 'pest', 'insect', 'yellow', 'wilt', 'spot', 'dying', 'infect', 'treatment', 'cure', 'keede', 'rog'].some(w => text.includes(w))) {
        return {
            reply: "🔬 **Plant Disease Diagnosis**\n\nBased on common symptoms:\n\n**🔬 Likely Causes:**\n• Fungal infection — yellow/brown spots, wilting\n• Bacterial blight — water-soaked lesions\n• Viral — leaf curl, mosaic patterns\n\n**💊 Recommended Treatment:**\n• Copper fungicide (3g/litre) for fungal issues\n• Neem oil spray (5ml/litre) as bio-pesticide\n• Remove and burn infected plant material\n\n**🛡️ Prevention:**\n• Proper plant spacing for air circulation\n• Crop rotation every season\n• Use disease-resistant seed varieties\n• Avoid overhead irrigation — use drip\n\n📸 Use FarmEase's **Disease Detection** scanner for AI-powered diagnosis!\n\n_I recommend confirming with your local agriculture officer for precise guidance._",
            tokens_used: null, mock: true,
        };
    }

    // Fertilizer
    if (['fertilizer', 'fertiliser', 'npk', 'nitrogen', 'phosphorus', 'potassium', 'urea', 'dap', 'compost', 'manure', 'nutrient', 'khad'].some(w => text.includes(w))) {
        return {
            reply: "🧪 **Fertilizer & Nutrient Guide**\n\n**🔍 Identify Deficiency:**\n• Yellow leaves + stunted growth → **Nitrogen (N)** deficiency\n• Purple/reddish leaves → **Phosphorus (P)** deficiency  \n• Leaf edge browning → **Potassium (K)** deficiency\n\n**🧪 Recommended Fertilizers:**\n• **Urea** (46% N) — for nitrogen needs\n• **DAP** (18:46:0) — for phosphorus\n• **MOP** (60% K₂O) — for potassium\n• **NPK Complex** (10:26:26) — balanced nutrition\n\n**⚠️ Safe Usage:**\n• Apply in split doses — not all at once\n• Mix into soil at 5-7 cm depth\n• Avoid urea on waterlogged soil\n• Always do a soil test first!\n\n_I recommend confirming with your local agriculture officer for precise guidance._",
            tokens_used: null, mock: true,
        };
    }

    // Irrigation
    if (['water', 'irrigation', 'drip', 'sprinkler', 'rain', 'drought', 'paani', 'sinchai'].some(w => text.includes(w))) {
        return {
            reply: "💧 **Irrigation Guide**\n\n**Methods (best to least efficient):**\n1. **Drip Irrigation** — saves 30-50% water, reduces weeds\n2. **Sprinkler** — good for large fields, even distribution\n3. **Furrow** — traditional, moderate efficiency\n4. **Flood** — least efficient, avoid if possible\n\n**💡 Water-Saving Tips:**\n• Use mulching to reduce evaporation by 25-30%\n• Schedule irrigation early morning or evening\n• Monitor soil moisture before watering\n• Rainwater harvesting for supplemental irrigation\n\n_I recommend confirming with your local agriculture officer for precise guidance._",
            tokens_used: null, mock: true,
        };
    }

    // Schemes
    if (['scheme', 'subsidy', 'government', 'pmkisan', 'pm-kisan', 'loan', 'sarkari', 'yojana'].some(w => text.includes(w))) {
        return {
            reply: "📋 **Government Agricultural Schemes**\n\n1. **PM-KISAN** 💰\n   - ₹6,000/year direct support\n   - For all land-holding farmer families\n\n2. **PM Fasal Bima Yojana** 🛡️\n   - Crop insurance at subsidized premium\n   - Covers all food crops\n\n3. **Kisan Credit Card** 🏦\n   - Credit up to ₹3 lakhs at 4% interest\n   - Easy repayment terms\n\n4. **eNAM** 🏪\n   - Online trading platform for crops\n   - Connect directly with buyers\n\nCheck the **Schemes** section in FarmEase for eligibility details!\n\n_I recommend confirming with your local agriculture officer for precise guidance._",
            tokens_used: null, mock: true,
        };
    }

    // FarmEase app
    if (['farmease', 'app', 'feature', 'how to', 'what is', 'kaise'].some(w => text.includes(w))) {
        return {
            reply: "📱 **FarmEase Platform Features**\n\n🔬 **Disease Detection** — Scan plant photos for AI diagnosis\n🌱 **Crop Advisory** — Personalized crop recommendations\n🧪 **Fertilizer Guide** — NPK analysis & recommendations\n🛒 **Marketplace** — Buy/sell directly with farmers\n🚜 **Equipment Rental** — Rent machinery near you\n📋 **Gov Schemes** — Browse eligible subsidies & schemes\n🤖 **AI Chatbot** — Voice & text farming advice (this!)\n\nAll designed to **increase productivity, reduce crop loss, and improve farmer income!** 🌾",
            tokens_used: null, mock: true,
        };
    }

    // Default
    return {
        reply: "🌱 **FarmEase AI — Your Farming Assistant!**\n\nI can help you with:\n\n• 🌾 **Crop guidance** — Ask about any crop!\n• 🔬 **Disease diagnosis** — Describe symptoms\n• 🧪 **Fertilizer advice** — NPK recommendations\n• 💧 **Irrigation tips** — Save water\n• 📋 **Government schemes** — Subsidies & support\n• 📱 **FarmEase features** — How to use the app\n\n**Try asking:**\n_\"How to grow rice?\"_\n_\"My crop has yellow leaves\"_\n_\"Best fertilizer for wheat\"_\n\nI speak English, Hindi, Kannada, Tamil & Telugu! 🌍",
        tokens_used: null, mock: true,
    };
}
