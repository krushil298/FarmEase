import Constants from 'expo-constants';
import { Platform } from 'react-native';

// App constants
export const APP_NAME = 'FarmEase';
export const APP_TAGLINE = 'From Soil to Sale';

// Supabase config
export const SUPABASE_URL = 'https://nmzigjuysnepapgyperl.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5temlnanV5c25lcGFwZ3lwZXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzAyMzYsImV4cCI6MjA4Nzc0NjIzNn0.u9Fg6ul8-8OubfbVnnZACw180pCIPWWD8cJX0yJartU';

// API endpoints
let localIp = Constants.expoConfig?.hostUri?.split(':')[0];
if (!localIp) {
    // Fallbacks if not running via Expo Go local dev server
    localIp = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
} else if (localIp === 'localhost' && Platform.OS === 'android') {
    localIp = '10.0.2.2'; // Ensure Android Emulator can reach host local loopback
}

export const FASTAPI_BASE_URL = `http://${localIp}:8000`;

// OpenWeatherMap (removed as we use Open-Meteo proxy via FASTAPI_BASE_URL)

// Google Maps
export const GOOGLE_MAPS_API_KEY = 'your-google-maps-api-key';

// User roles
export type UserRole = 'farmer' | 'buyer';

// Crop categories for marketplace
export const CROP_CATEGORIES = [
    'All',
    'Vegetables',
    'Fruits',
    'Grains',
    'Spices',
    'Pulses',
    'Oilseeds',
    'Flowers',
] as const;

// Soil types for crop recommendation
export const SOIL_TYPES = [
    'Loam',
    'Clay',
    'Sandy',
    'Silt',
    'Peat',
    'Chalk',
    'Red Soil',
    'Black Soil',
    'Alluvial',
    'Laterite',
] as const;

// Government scheme categories
export const SCHEME_CATEGORIES = [
    'Subsidy',
    'Insurance',
    'Loan',
    'Training',
    'Equipment',
    'Irrigation',
] as const;

export const ONBOARDING_SLIDES = [
    {
        title: 'Scan & Detect',
        description: 'AI-powered disease detection from a single photo of your crop leaf',
        icon: 'camera' as const,
    },
    {
        title: 'Smart Farming',
        description: 'Get personalized crop & fertilizer recommendations based on your soil',
        icon: 'leaf' as const,
    },
    {
        title: 'Sell Directly',
        description: 'List your crops on the marketplace and connect with buyers directly',
        icon: 'cart' as const,
    },
];
