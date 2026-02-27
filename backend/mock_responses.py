"""
FarmEase AI - Smart Mock Responses
Used when MOCK_MODE=true in .env. Returns realistic, structured agriculture
answers based on keyword matching — perfect for demos and hackathons.
"""

import random

# ── Refusal for off-topic ──────────────────────────────────────────────────────
OFF_TOPIC_REPLY = (
    "I am designed specifically for agriculture and FarmEase-related assistance. "
    "Please ask a farming-related question."
)

# ── Agriculture keyword categories ────────────────────────────────────────────
CROP_KEYWORDS = [
    "rice", "wheat", "corn", "maize", "tomato", "potato", "onion", "sugarcane",
    "cotton", "mango", "banana", "soybean", "soya", "groundnut", "peanut",
    "mustard", "barley", "jowar", "bajra", "chilli", "pepper", "carrot",
    "spinach", "cabbage", "cauliflower", "brinjal", "eggplant", "grow", "crop",
    "seed", "sow", "plant", "harvest", "yield", "cultivat", "farm",
]

DISEASE_KEYWORDS = [
    "disease", "blight", "rot", "rust", "mildew", "fungus", "fungal",
    "bacterial", "virus", "pest", "insect", "yellowing", "yellow leaves",
    "wilting", "wilt", "spot", "lesion", "dying", "dead", "infect",
    "symptom", "treatment", "cure",
]

FERTILIZER_KEYWORDS = [
    "fertilizer", "fertiliser", "npk", "nitrogen", "phosphorus", "potassium",
    "urea", "dap", "compost", "manure", "nutrient", "deficiency", "soil health",
    "micronutrient", "zinc", "iron", "magnesium",
]

FARMEASE_KEYWORDS = [
    "farmease", "feature", "platform", "app", "application", "dashboard",
    "sensor", "iot", "monitor", "alert", "report", "predict", "ai", "smart",
    "what is", "how does", "how do i use",
]

OFF_TOPIC_KEYWORDS = [
    "movie", "song", "music", "cricket", "football", "sport", "game",
    "politics", "stock", "share market", "bitcoin", "crypto", "weather forecast",
    "recipe", "code", "programming", "python", "javascript", "history",
    "geography", "math", "physics", "chemistry", "comedian", "actor", "actress",
]

# ── Mock response banks ───────────────────────────────────────────────────────

CROP_RESPONSES = {
    "rice": """🌾 **Rice Cultivation Guide**

✅ **Suitable Soil:** Clayey loam or clay soil that retains water well (pH 5.5–7.0).

📅 **Ideal Season:** Kharif season (June–November) for wet rice; Rabi (Nov–Apr) in irrigated areas.

🌿 **Fertilizer Requirement:**
- Apply 120 kg N, 60 kg P₂O₅, 60 kg K₂O per hectare.
- Split nitrogen: 40% basal + 30% tillering + 30% panicle initiation.

🦠 **Common Diseases & Pests:**
- Blast (Magnaporthe oryzae) — most destructive fungal disease.
- Brown Plant Hopper (BPH) — causes "hopper burn".
- Sheath blight and neck rot.

💡 **Yield Tip:** Use System of Rice Intensification (SRI) — less seed, wider spacing, intermittent irrigation. Increases yield by 20–50%.

I recommend confirming with your local agriculture officer for precise guidance.""",

    "wheat": """🌾 **Wheat Cultivation Guide**

✅ **Suitable Soil:** Well-drained loam or clay loam soil (pH 6.0–7.5).

📅 **Ideal Season:** Rabi crop — sow October to December, harvest March to April.

🌿 **Fertilizer Requirement:**
- Apply 120 kg N, 60 kg P₂O₅, 40 kg K₂O per hectare.
- Apply full P & K + 30% N as basal; remaining N in two splits at tillering and jointing.

🦠 **Common Diseases & Pests:**
- Yellow rust (Puccinia striiformis) — watch for yellow stripes on leaves.
- Loose smut and Karnal bunt.
- Aphids and Armyworm during grain filling.

💡 **Yield Tip:** Timely sowing (Nov 1–15) is the single most impactful factor. Delayed sowing after November 25 can reduce yield by 1–1.5 quintals/week.

I recommend confirming with your local agriculture officer for precise guidance.""",

    "tomato": """🍅 **Tomato Cultivation Guide**

✅ **Suitable Soil:** Well-drained sandy loam or loam soil (pH 6.0–7.0), rich in organic matter.

📅 **Ideal Season:** Kharif (June–July transplanting), Rabi (Oct–Nov transplanting) in most Indian states.

🌿 **Fertilizer Requirement:**
- Basally apply FYM 25 t/ha + 75 kg N + 50 kg P + 50 kg K per hectare.
- Top dress 50 kg N at flowering and 25 kg N at fruit set.

🦠 **Common Diseases & Pests:**
- Early Blight (Alternaria solani) — dark concentric spots on leaves.
- Tomato Leaf Curl Virus (TLCV) — spread by whitefly.
- Fruit borer (Helicoverpa armigera).

💡 **Yield Tip:** Use mulching with black polythene — it conserves moisture, controls weeds, and improves fruit quality by up to 30%.

I recommend confirming with your local agriculture officer for precise guidance.""",
}

DISEASE_RESPONSES = [
    """🔬 **Plant Disease Diagnosis**

Based on your description, here's a structured assessment:

**🔬 Likely Cause:** Fungal infection (most common cause of leaf yellowing, spots, and wilting). Could be Alternaria, Fusarium, or Cercospora depending on your crop.

**💊 Recommended Treatment:**
- Apply copper-based fungicide (Copper Oxychloride @ 3g/litre) or Mancozeb (@ 2.5g/litre).
- Remove and burn infected plant material — do not compost.
- Ensure proper drainage; avoid waterlogging.

**🛡️ Prevention:**
- Maintain plant spacing for good air circulation.
- Rotate crops every season to break disease cycles.
- Use disease-resistant seed varieties.
- Avoid overhead irrigation — use drip or furrow.

I recommend confirming with your local agriculture officer for precise guidance.""",

    """🔬 **Bacterial / Viral Issue Detected**

**🔬 Likely Cause:** Bacterial blight or viral infection spread by sucking pests (aphids, whiteflies, thrips).

**💊 Recommended Treatment:**
- For bacterial: Spray Streptomycin Sulphate (200ppm) + Copper Oxychloride (0.3%).
- For viral: No direct cure — control the vector (spray Imidacloprid 0.3 ml/litre).
- Uproot and destroy severely affected plants.

**🛡️ Prevention:**
- Use certified disease-free seeds.
- Install yellow sticky traps to monitor and trap vector insects.
- Apply neem oil spray (5ml/litre) as preventive bio-pesticide.
- Maintain field hygiene — remove weed hosts around the field.

I recommend confirming with your local agriculture officer for precise guidance.""",
]

FERTILIZER_RESPONSES = [
    """🧪 **Fertilizer & Nutrient Analysis**

**🔍 Likely Deficiency Identified:**
- **Yellow leaves + stunted growth** → Nitrogen (N) deficiency
- **Purple/reddish leaves** → Phosphorus (P) deficiency
- **Leaf edge browning** → Potassium (K) deficiency

**🧪 Suitable Fertilizer:**
- **For N:** Urea (46% N) — most economical nitrogen source.
- **For P:** DAP (18:46:0) or Single Super Phosphate (SSP).
- **For K:** Muriate of Potash (MOP) — 60% K₂O.
- **All-in-one:** NPK complex (10:26:26 or 12:32:16) for balanced nutrition.

**⚠️ Safe Usage Guidance:**
- Apply in split doses — not all at once (prevents leaching).
- Incorporate into soil at 5–7 cm depth rather than broadcasting.
- Avoid applying urea to waterlogged soil (volatilization loss).
- Always do a soil test first for precision application.

I recommend confirming with your local agriculture officer for precise guidance.""",
]

FARMEASE_RESPONSES = [
    """🌾 **About FarmEase Platform**

FarmEase is a smart agriculture management platform designed to help farmers make data-driven decisions.

**📌 Key Features:**

**1. Crop Advisory Engine**
- What it does: Provides crop-specific, season-specific guidance.
- How it works: AI analyzes your location, soil type, and season to recommend ideal crops.
- 💰 Impact: Reduces wrong crop selection — saving up to 30% in input costs.

**2. Disease Detection (Image AI)**
- What it does: Identifies crop diseases from photos.
- How it works: Upload a photo of the affected plant — AI diagnoses within seconds.
- 💰 Impact: Early detection reduces crop loss by up to 40%.

**3. IoT Soil & Weather Monitoring**
- What it does: Real-time tracking of soil moisture, temperature, and rainfall.
- How it works: Low-cost sensors send data to your FarmEase dashboard.
- 💰 Impact: Saves 25–35% water through precision irrigation.

**4. Market Price Alerts**
- What it does: Sends live mandi price notifications.
- How it works: Integrates with commodity markets — alerts when prices peak.
- 💰 Impact: Helps farmers sell at the right time for maximum profit.

Ask me about any specific FarmEase feature for more details! 🚀""",
]

GENERAL_RESPONSES = [
    """🌱 **General Farming Guidance**

I'd be happy to help! For the most accurate advice, please mention:
- The **crop** you're growing
- The **problem** you're facing (disease, nutrition, yield)
- Your **soil type** if known

Here's some general best-practice advice:

✅ **Soil Health First:** Test your soil every 2–3 years. Balanced pH (6–7) and organic matter (>1%) are the foundation of a good harvest.

💧 **Water Management:** Overwatering is as harmful as drought. Use drip irrigation wherever possible to save 30–50% water.

🌿 **IPM Approach:** Use Integrated Pest Management — biological controls, pheromone traps, and neem-based sprays before resorting to chemical pesticides.

📅 **Timely Operations:** Sowing date, weeding time, and harvest timing often matter more than input quantity.

I recommend confirming with your local agriculture officer for precise guidance.""",
]


def get_mock_response(message: str) -> str:
    """Return a realistic mock agriculture response based on keyword matching."""
    text = message.lower()

    # Check for off-topic content first
    if any(kw in text for kw in OFF_TOPIC_KEYWORDS):
        return OFF_TOPIC_REPLY

    # Crop-specific responses
    for crop, response in CROP_RESPONSES.items():
        if crop in text:
            return response

    # Generic crop response if crop keywords detected but no specific match
    if any(kw in text for kw in CROP_KEYWORDS):
        return random.choice(list(CROP_RESPONSES.values()))

    # Disease / pest
    if any(kw in text for kw in DISEASE_KEYWORDS):
        return random.choice(DISEASE_RESPONSES)

    # Fertilizer / nutrients
    if any(kw in text for kw in FERTILIZER_KEYWORDS):
        return random.choice(FERTILIZER_RESPONSES)

    # FarmEase platform
    if any(kw in text for kw in FARMEASE_KEYWORDS):
        return random.choice(FARMEASE_RESPONSES)

    # Generic agriculture fallback
    return random.choice(GENERAL_RESPONSES)
