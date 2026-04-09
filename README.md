# 🌾 FarmEase — AI-Powered Agriculture Platform

> **"From Soil to Sale"** — An end-to-end mobile platform empowering Indian farmers with AI-driven crop disease detection, smart recommendations, and a digital marketplace.

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-black)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688)](https://fastapi.tiangolo.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [AI/ML Models](#aiml-models)
- [Database Schema](#database-schema)
- [Team](#team)

---

## Overview

FarmEase is a multi-modal AI-powered mobile application designed to address the challenges faced by Indian farmers — including crop disease identification, soil-based crop recommendations, fertilizer advisory, equipment access, and market connectivity.

### Problem Statement

- **30% of crop yield** is lost annually to diseases and pests in India
- **Language barriers** prevent farmers from accessing digital agricultural services
- **Middlemen exploitation** — farmers receive only 15-20% of the final consumer price
- **Lack of equipment** — small farmers cannot afford modern farm machinery

### Solution

FarmEase integrates **computer vision**, **NLP chatbot**, **voice I/O**, and a **digital marketplace** into a single mobile app accessible in **10 Indian regional languages**.

---

## Key Features

| Feature | Technology | Description |
|---------|-----------|-------------|
| 🔬 **Disease Detection** | MobileNet V2 (HuggingFace) | Scan crop leaves — AI identifies disease with treatment steps |
| 🤖 **AI Chatbot** | LLaMA 3.3 70B (Groq) | Domain-restricted agricultural assistant with voice I/O |
| 🌱 **Crop Recommendation** | Rule-based scoring engine | 15 crops scored against soil, pH, climate, rainfall |
| 🧪 **Fertilizer Advisory** | NPK analysis engine | Dosage calculations for 12 crops using Indian soil thresholds |
| 🛒 **Marketplace** | Supabase CRUD + Realtime | Farmers list crops, buyers browse and order directly |
| 🚜 **Equipment Rental** | Haversine geo-search | Peer-to-peer equipment sharing with radius-based discovery |
| 🌐 **Multilingual** | Translation API | 10 Indian languages with native script enforcement |
| 🎙️ **Voice I/O** | Whisper STT + Sooktam TTS | Voice input and output for low-literacy accessibility |
| 📋 **Gov Schemes** | Static + Supabase | Browse government agricultural schemes with eligibility |
| 🌤️ **Weather** | Open-Meteo API | Real-time weather with farming alerts |

---

## System Architecture

```
┌─────────────────────────────────────────────┐
│            MOBILE APP (CLIENT)              │
│     React Native + Expo + TypeScript        │
│     Zustand State │ Expo Router Nav         │
├─────────────────────────────────────────────┤
│              AI/ML SERVICES                 │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │ HuggingFace  │  │  Groq LLM API      │   │
│  │ MobileNet V2 │  │  LLaMA 3.3 70B     │   │
│  │ (Disease)    │  │  (Chat + Advisory)  │   │
│  └──────────────┘  └────────────────────┘   │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │ Whisper      │  │  Sooktam2          │   │
│  │ (STT)        │  │  (TTS)             │   │
│  └──────────────┘  └────────────────────┘   │
├─────────────────────────────────────────────┤
│           BACKEND API (FastAPI)             │
│    Chat + TTS + STT + Rate Limiting         │
│    Weather Proxy + Domain Safety            │
├─────────────────────────────────────────────┤
│           DATABASE (Supabase)               │
│    PostgreSQL + Row Level Security          │
│    6 Tables │ Storage Buckets               │
│    Haversine RPC for Geo Search             │
└─────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native 0.81 + Expo 54 + TypeScript |
| **UI** | React Native Paper + Custom Design System |
| **Navigation** | Expo Router (file-based) |
| **State** | Zustand |
| **Backend** | FastAPI (Python) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Phone OTP) |
| **Storage** | Supabase Storage |
| **Disease Detection** | HuggingFace Inference API (MobileNet V2) |
| **Chatbot LLM** | Groq API (LLaMA 3.3 70B Versatile) |
| **Speech-to-Text** | Groq Whisper Large V3 Turbo |
| **Text-to-Speech** | HuggingFace (bharatgenai/sooktam2) |
| **Translation** | Google Translate + MyMemory API |
| **Weather** | Open-Meteo API (free, no key required) |
| **Maps** | React Native Maps |

---

## Project Structure

```
farmease-app/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Login, Register, Onboarding
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── index.tsx             # Dashboard
│   │   ├── detect.tsx            # Disease Detection (Camera)
│   │   ├── marketplace.tsx       # Browse products
│   │   └── profile.tsx           # User profile
│   ├── crop-recommend.tsx        # Crop recommendation
│   ├── fertilizer.tsx            # Fertilizer advisory
│   ├── schemes.tsx               # Government schemes
│   ├── rentals.tsx               # Equipment rental
│   ├── cart.tsx                  # Shopping cart
│   └── disease-result.tsx        # Detection results
├── components/                   # Reusable UI components
│   ├── ui/                       # Button, Card, Input, Header
│   ├── dashboard/                # WeatherWidget, QuickActions
│   ├── marketplace/              # ProductCard, ProductForm
│   ├── detection/                # CameraView, ResultCard
│   ├── chat/                     # ChatFAB, ChatbotModal
│   └── rentals/                  # RentalForm
├── services/                     # API & business logic
│   ├── ml.ts                     # Disease detection (HuggingFace)
│   ├── cropRecommendation.ts     # Crop scoring engine
│   ├── fertilizerRecommendation.ts # NPK analysis engine
│   ├── chatApi.ts                # AI chatbot (Groq LLM)
│   ├── auth.ts                   # Supabase auth
│   ├── marketplace.ts            # Product CRUD
│   ├── rentals.ts                # Equipment rental
│   ├── translate.ts              # Multilingual translation
│   └── supabase.ts               # Supabase client
├── store/                        # Zustand state management
├── hooks/                        # Custom hooks
├── utils/                        # Theme, constants, helpers
└── backend/                      # FastAPI server (in-app)
    └── app/
        ├── main.py
        └── routes/

backend/                          # Standalone FastAPI server
├── main.py                       # Chat + TTS + STT endpoints
├── system_prompt.py              # Domain-restricted AI prompt
├── mock_responses.py             # Offline fallback responses
└── requirements.txt
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- Python 3.10+
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier)

### 1. Mobile App

```bash
cd farmease-app
npm install
npx expo start
```

### 2. Backend (AI Chatbot)

```bash
cd backend
pip install -r requirements.txt

# Create .env file
cp .env.example .env   # if available
# Add your API keys:
# GROQ_API_KEY=your_groq_key
# HUGGINGFACE_API_KEY=your_hf_key

# Run server
uvicorn main:app --reload --port 8000
```

### 3. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes (or MOCK_MODE=true) | Groq API key for LLaMA chatbot |
| `HUGGINGFACE_API_KEY` | Optional | HuggingFace key for TTS |
| `MOCK_MODE` | Optional | Set `true` to run without API keys |
| `EXPO_PUBLIC_HF_TOKEN` | Yes | HuggingFace token for disease detection |

---

## AI/ML Models

| Model | Purpose | Architecture | Accuracy |
|-------|---------|-------------|----------|
| **Disease Detector** | Identify crop diseases from leaf photos | MobileNet V2 (Transfer Learning) | ~95% on PlantVillage dataset |
| **Crop Recommender** | Suggest crops for soil/climate conditions | Rule-based weighted scoring | 15 crops, 5 parameters |
| **Fertilizer Advisor** | Recommend fertilizers with dosage | NPK threshold analysis | 12 crop profiles |
| **AI Chatbot** | Agricultural assistant | LLaMA 3.3 70B (Groq) | Domain-restricted |
| **Speech-to-Text** | Voice input | Whisper Large V3 Turbo | Multi-language |
| **Text-to-Speech** | Voice output | Sooktam2 (HuggingFace) | Hindi + English |

### Disease Detection Coverage

25 diseases across 9 crop types: Tomato (9), Potato (2), Apple (3), Corn (3), Grape (3), Bell Pepper (1), Cherry (1), Strawberry (1), Peach (1).

---

## Database Schema

6 tables with Row Level Security (RLS) enabled:

| Table | Purpose | RLS Policy |
|-------|---------|------------|
| `users` | User profiles (farmer/buyer) | Read: public, Write: own |
| `products` | Marketplace listings | Read: public, Write: seller |
| `orders` | Purchase orders | Read+Write: buyer/seller |
| `disease_logs` | Disease scan history | Read+Write: own |
| `crop_logs` | Crop recommendation logs | Read+Write: own |
| `schemes` | Government schemes | Read: public |
| `equipment_rentals` | Equipment listings | Read: public, Write: owner |
| `rental_requests` | Booking requests | Read+Write: owner/requester |

---

## Team

**Team #1 — Jain University**

| Member | Role |
|--------|------|
| Krushil Uchadadia | Full-Stack Lead, AI/ML Integration |
| Vijyot Balyan | Backend, Database Design |
| Archi Jain | AI Chatbot, Voice Features |
| Shirin Lohiya | UI/UX, Frontend |
| Aum Patel | Marketplace, Equipment Rental |

---

## License

This project was built for the Inceptrix 2.0 Hackathon and is intended for academic use (PCL Final Project).
