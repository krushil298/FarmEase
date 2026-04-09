# 🌾 FarmEase — 24-Hour Hackathon Battle Plan
## "From Soil to Sale" — React Native + Expo

> **Team #1 — Jain University**
> Krushil Uchadadia · Vijyot Balyan · Archi Jain · Shirin Lohiya · Aum Patel

---

## 🛠️ 1. Project Setup & Foundation

| # | Task | Priority | Est. Time |
|---|---|---|---|
| 1 | Expo project init (`npx create-expo-app`) + TypeScript config | 🔴 Critical | 30 min |
| 2 | Install core deps: `react-navigation`, `expo-router`, `zustand`, `react-native-paper`, `nativewind` | 🔴 Critical | 20 min |
| 3 | Set up folder structure (`app/`, `components/`, `services/`, `store/`, `hooks/`, `utils/`) | 🔴 Critical | 15 min |
| 4 | Design system: color palette (greens #2D6A4F, #40916C, #52B788), typography (Poppins), spacing tokens | 🔴 Critical | 1 hr |
| 5 | Reusable UI components: `Button`, `Card`, `Input`, `Header` | 🔴 Critical | 1.5 hr |
| 6 | Navigation skeleton: Auth stack → Tab navigator (Dashboard, Detect, Market, Profile) | 🔴 Critical | 45 min |
| 7 | Supabase project setup (Auth + PostgreSQL DB + Storage bucket) | 🔴 Critical | 30 min |
| 8 | Supabase tables setup (`users`, `crops`, `products`, `orders`, `disease_logs`) | 🔴 Critical | 45 min |
| 9 | FastAPI server scaffold + Supabase client + load pre-trained disease model | 🔴 Critical | 1.5 hr |
| 10 | Row Level Security (RLS) policies for Supabase tables | 🔴 Critical | 30 min |

---

## � 2. Authentication

| # | Task | Priority | Est. Time |
|---|---|---|---|
| 11 | Login screen UI (phone number input + OTP) | 🔴 Critical | 1 hr |
| 12 | Role selection screen after login — **Farmer** or **Buyer** (determines dashboard & features) | 🔴 Critical | 30 min |
| 13 | Register screen — Farmer flow (name, phone, farm location, land size, crop history) | 🔴 Critical | 45 min |
| 14 | Register screen — Buyer flow (name, phone, delivery address) | 🔴 Critical | 30 min |
| 15 | Supabase Auth Phone OTP integration | 🔴 Critical | 1 hr |
| 16 | Auth store (Zustand) + role-based protected routes (farmer vs buyer views) | 🔴 Critical | 45 min |
| 17 | Simple onboarding (3 swipeable slides — what FarmEase does) | 🟡 Medium | 30 min |

---

## 🏠 3. Dashboard

| # | Task | Priority | Est. Time |
|---|---|---|---|
| 16 | Dashboard layout with scrollable sections | 🔴 Critical | 1 hr |
| 17 | Weather widget (OpenWeatherMap API integration) | 🟠 High | 1 hr |
| 18 | Quick action cards (Disease Detection, Crop Recommend, Marketplace, Schemes) | 🔴 Critical | 45 min |
| 19 | Weather API endpoint (FastAPI proxy) | 🟠 High | 30 min |
| 20 | Seasonal farming tips static carousel | 🟡 Medium | 30 min |
| 21 | Government scheme notification cards (static data for demo) | 🟡 Medium | 30 min |

---

## 🔬 4. AI Disease Detection

| # | Task | Priority | Est. Time |
|---|---|---|---|
| 22 | Camera screen UI (`expo-camera` + `expo-image-picker`) | 🔴 Critical | 1.5 hr |
| 23 | Image capture + gallery upload flow | 🔴 Critical | 1 hr |
| 24 | Disease detection ML model API endpoint (FastAPI) | 🔴 Critical | 3 hr |
| 25 | Pre-trained model integration (PlantVillage CNN) | 🔴 Critical | 2 hr |
| 26 | Result screen: disease name, confidence %, treatment steps | 🔴 Critical | 1 hr |
| 27 | Treatment recommendation cards with product suggestions | 🟠 High | 45 min |
| 28 | Disease history log (save past scans to Supabase) | 🟡 Medium | 45 min |

---

## 🛒 5. Marketplace

| # | Task | Priority | Est. Time |
|---|---|---|---|
| 29 | Product listing screen (browse crops by category) | 🔴 Critical | 1.5 hr |
| 30 | Product detail screen (photo, price, seller info) | 🟠 High | 1 hr |
| 31 | Add product form (farmers list their crops) | 🟠 High | 1 hr |
| 32 | Marketplace CRUD APIs (Supabase products table + FastAPI) | 🔴 Critical | 1.5 hr |
| 33 | Search & filter (by crop type, price range, location) | 🟠 High | 1 hr |
| 34 | Cart state management (Zustand) | 🟡 Medium | 45 min |

---

## 🌱 6. Smart Crop Recommendation

| # | Task | Priority | Est. Time |
|---|---|---|---|
| 35 | Crop recommendation screen (input: soil type, pH, climate) | 🟠 High | 1 hr |
| 36 | Crop recommendation ML API endpoint | 🟠 High | 2 hr |
| 37 | Results display: top 5 crops + yield predictions | 🟠 High | 45 min |
| 38 | Crop recommendation FastAPI route | 🟠 High | 30 min |

---

## 🧪 7. Fertilizer Advisory

| # | Task | Priority | Est. Time |
|---|---|---|---|
| 39 | Fertilizer input form (N, P, K levels, soil type) | 🟡 Medium | 45 min |
| 40 | Fertilizer ML model API | 🟡 Medium | 1.5 hr |
| 41 | Fertilizer result screen with schedule | 🟡 Medium | 45 min |

---

## 📚 8. Government Schemes & E-Learning

| # | Task | Priority | Est. Time |
|---|---|---|---|
| 42 | Government schemes list screen (static JSON data) | 🟡 Medium | 1 hr |
| 43 | Scheme detail screen with eligibility info | 🟡 Medium | 45 min |
| 44 | Schemes endpoint (Supabase table or FastAPI static JSON) | 🟢 Low | 30 min |

---

## ✨ 9. Polish & Demo Prep

| # | Task | Priority | Est. Time |
|---|---|---|---|
| 45 | End-to-end flow testing (auth → dashboard → detect → marketplace) | 🔴 Critical | 1.5 hr |
| 46 | UI polish: animations, transitions, loading states | 🔴 Critical | 2 hr |
| 47 | Error handling & edge cases (no internet, empty states, invalid inputs) | 🟠 High | 1 hr |
| 48 | Lottie animations for loading & success states | 🟡 Medium | 1 hr |
| 49 | App icon + splash screen design & setup | 🟠 High | 45 min |
| 50 | Multi-language toggle (Hindi + English — at least 2 key screens) | 🟡 Medium | 1.5 hr |
| 51 | Demo data seeding (sample products, sample crops, test images) | 🔴 Critical | 45 min |
| 52 | Build APK for demo (`eas build --platform android --profile preview`) | 🔴 Critical | 1 hr |
| 53 | Presentation slides (problem, solution, demo, tech stack, impact) | 🔴 Critical | 1.5 hr |
| 54 | Demo rehearsal — practice the pitch (3 min) | 🔴 Critical | 30 min |

---

## 🎯 Feature Priority Matrix

| Feature | Priority | Build in 24hr? | Demo Impact |
|---|---|---|---|
| 🔐 Auth (Phone OTP) | 🔴 Critical | ✅ YES | Medium — expected |
| 🏠 Dashboard + Weather | 🔴 Critical | ✅ YES | High — first impression |
| 🔬 AI Disease Detection | 🔴 Critical | ✅ YES — THIS IS YOUR USP | 🔥 Very High — wow factor |
| 🛒 Marketplace (basic) | 🔴 Critical | ✅ YES (listing + browse) | High — shows utility |
| 🌱 Crop Recommendation | 🟠 High | ✅ YES (if time) | High — AI differentiator |
| 🧪 Fertilizer Advisory | 🟡 Medium | ⚡ STRETCH | Medium |
| 📚 Gov Schemes | 🟡 Medium | ⚡ STRETCH (static data) | Medium |
| 📊 Farm Analytics | 🟢 Low | ❌ SKIP | Low — not demo-worthy |
| 💬 In-app Chat | 🟢 Low | ❌ SKIP | Low |
| 💳 Razorpay Payments | 🟢 Low | ❌ SKIP (mock it) | Low — hard to demo |
| 🔔 Push Notifications | 🟢 Low | ❌ SKIP | Low |
| 🌐 Full i18n (5+ langs) | 🟢 Low | ❌ SKIP (do 2 langs max) | Low |

---

## 🏗️ Tech Stack (Confirmed: React Native + Supabase + FastAPI)

| Layer | Technology |
|---|---|
| **Mobile** | React Native + Expo + TypeScript |
| **UI** | React Native Paper + NativeWind |
| **Navigation** | Expo Router |
| **State** | Zustand |
| **Backend API + ML** | FastAPI (Python) — single backend for APIs + ML models |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Phone OTP, Google sign-in) |
| **Storage** | Supabase Storage (crop images, assets) |
| **Realtime** | Supabase Realtime (live marketplace updates) |
| **Weather** | OpenWeatherMap API (free tier) |
| **Maps** | React Native Maps (for marketplace location) |

---

## 📂 Project Structure

```
farmease-app/
├── app/                        # Expo Router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/
│   │   ├── index.tsx           # Dashboard
│   │   ├── marketplace.tsx
│   │   ├── detect.tsx          # Disease Detection
│   │   └── profile.tsx
│   ├── crop-recommend.tsx
│   ├── fertilizer.tsx
│   ├── schemes.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                     # Reusable UI
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Header.tsx
│   ├── dashboard/
│   │   ├── WeatherWidget.tsx
│   │   ├── QuickActions.tsx
│   │   └── FarmingTips.tsx
│   ├── marketplace/
│   │   ├── ProductCard.tsx
│   │   └── ProductForm.tsx
│   └── detection/
│       ├── CameraView.tsx
│       └── ResultCard.tsx
├── services/
│   ├── supabase.ts             # Supabase client init
│   ├── auth.ts                 # Supabase auth helpers
│   ├── disease.ts              # Disease detection API
│   ├── crops.ts                # Crop recommendation API
│   └── marketplace.ts          # Marketplace API (Supabase queries)
├── store/
│   ├── useAuthStore.ts
│   ├── useCartStore.ts
│   └── useFarmStore.ts
├── hooks/
│   ├── useCamera.ts
│   └── useWeather.ts
├── utils/
│   ├── constants.ts
│   └── helpers.ts
├── assets/
│   ├── images/
│   ├── fonts/
│   └── animations/             # Lottie JSON files
├── backend/                    # FastAPI server (API + ML)
│   ├── app/
│   │   ├── main.py             # FastAPI entry point
│   │   ├── config.py           # Supabase keys, env vars
│   │   ├── supabase_client.py  # Supabase Python client
│   │   ├── routes/
│   │   │   ├── disease.py      # Disease detection endpoint
│   │   │   ├── crop.py         # Crop recommendation endpoint
│   │   │   ├── fertilizer.py   # Fertilizer advisory endpoint
│   │   │   ├── marketplace.py  # Marketplace CRUD endpoints
│   │   │   └── weather.py      # Weather proxy endpoint
│   │   └── models/
│   │       ├── disease_model.h5
│   │       ├── crop_model.pkl
│   │       └── fertilizer_model.pkl
│   ├── requirements.txt
│   └── Dockerfile
├── app.json
├── package.json
└── tsconfig.json
```

---

## 🧠 AI/ML Models (Pre-trained — No Training During Hackathon!)

| Model | Purpose | Pre-trained Source | Serve Via |
|---|---|---|---|
| **Disease Detector** | Identify crop diseases from leaf photos | PlantVillage CNN (TensorFlow/Keras) | FastAPI `/predict/disease` |
| **Crop Recommender** | Suggest best crops for soil/climate | Kaggle Indian crop dataset (Scikit-learn RF) | FastAPI `/predict/crop` |
| **Fertilizer Advisor** | Predict optimal fertilizer | Soil nutrient dataset (Scikit-learn DT) | FastAPI `/predict/fertilizer` |

> ⚠️ **IMPORTANT:** Train models BEFORE the hackathon. During the hackathon, only deploy & serve them.

---

## 🎨 Design Quick Reference

| Element | Value |
|---|---|
| **Primary** | `#2D6A4F` (Forest Green) |
| **Secondary** | `#40916C` (Emerald) |
| **Accent** | `#52B788` (Mint) |
| **Background** | `#FEFAE0` (Cream) |
| **Text** | `#1B4332` (Dark Green) |
| **Error** | `#E63946` (Red) |
| **Font** | Poppins (English) + Noto Sans (Hindi) |
| **Border Radius** | 12px (cards), 8px (inputs), 24px (buttons) |
| **Spacing** | 4px base unit (8, 12, 16, 24, 32) |

---

## 🚨 Hackathon Survival Rules

1. **Commit every 30 minutes** — don't lose work
2. **Mock what you can't build** — fake payment flow, fake chat
3. **Static data > No data** — hardcode gov schemes JSON, sample products
4. **Demo flow first** — optimize the exact path judges will see
5. **APK by Hour 20** — leave 4 hours for polish & presentation
6. **No new features after Hour 18** — only bug fixes and polish
7. **Sleep is optional, food is not** — keep snacks nearby 🍕

---

## 🎤 Demo Script (3 Minutes)

```
0:00 - 0:30  → Problem statement (Indian farmers' challenges)
0:30 - 0:45  → Solution intro (FarmEase — AI farming assistant)
0:45 - 1:15  → LIVE DEMO: Open app → Login → Dashboard with weather
1:15 - 2:00  → LIVE DEMO: Take photo of diseased leaf → AI identifies disease → Shows treatment
2:00 - 2:30  → LIVE DEMO: Browse marketplace → View products → List a crop
2:30 - 2:45  → LIVE DEMO: Crop recommendation (enter soil data → get suggestions)
2:45 - 3:00  → Impact statement + future roadmap
```

---

*Let's build this. Clock starts now! 🚀⏰*
