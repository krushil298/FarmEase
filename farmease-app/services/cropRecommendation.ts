/**
 * Crop Recommendation Engine — Rule-based scoring system.
 *
 * Uses real agronomic data to score crops against user-provided soil,
 * climate, and rainfall parameters. Each crop has documented optimal
 * ranges for pH, temperature, humidity, and rainfall drawn from
 * Indian agricultural extension service guidelines.
 */

export interface CropInput {
    soilType: string;
    ph: number;
    temperature: number;   // °C
    humidity: number;       // %
    rainfall: number;       // mm/year
}

export interface CropResult {
    name: string;
    yield: string;
    season: string;
    water: string;
    score: number;          // 0-100 final suitability score
    emoji: string;
    matchDetails: string;   // Why this crop scored the way it did
}

// ── Crop database with real agronomic ranges ─────────────────────────────────

interface CropProfile {
    name: string;
    emoji: string;
    season: string;
    yield: string;
    water: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
    optimalPh: [number, number];
    optimalTemp: [number, number];    // °C
    optimalHumidity: [number, number]; // %
    optimalRainfall: [number, number]; // mm/year
    suitableSoils: string[];           // soil types that this crop thrives in
}

const CROP_DATABASE: CropProfile[] = [
    {
        name: 'Rice', emoji: '🌾', season: 'Kharif (Jun-Oct)',
        yield: '2.5-4.0 tons/hectare', water: 'Very High',
        optimalPh: [5.5, 7.0], optimalTemp: [22, 32],
        optimalHumidity: [70, 90], optimalRainfall: [1000, 2000],
        suitableSoils: ['Clay', 'Alluvial', 'Loam', 'Silt'],
    },
    {
        name: 'Wheat', emoji: '🌾', season: 'Rabi (Nov-Mar)',
        yield: '2.0-3.5 tons/hectare', water: 'Medium',
        optimalPh: [6.0, 7.5], optimalTemp: [15, 25],
        optimalHumidity: [50, 70], optimalRainfall: [500, 1000],
        suitableSoils: ['Loam', 'Clay', 'Alluvial', 'Black Soil'],
    },
    {
        name: 'Cotton', emoji: '🧵', season: 'Kharif (Apr-Oct)',
        yield: '1.5-2.5 tons/hectare', water: 'Medium',
        optimalPh: [6.0, 8.0], optimalTemp: [25, 35],
        optimalHumidity: [40, 65], optimalRainfall: [600, 1200],
        suitableSoils: ['Black Soil', 'Loam', 'Alluvial', 'Red Soil'],
    },
    {
        name: 'Maize', emoji: '🌽', season: 'Kharif (Jun-Sep)',
        yield: '2.5-4.0 tons/hectare', water: 'High',
        optimalPh: [5.5, 7.5], optimalTemp: [21, 32],
        optimalHumidity: [55, 80], optimalRainfall: [600, 1200],
        suitableSoils: ['Loam', 'Sandy', 'Alluvial', 'Red Soil'],
    },
    {
        name: 'Sugarcane', emoji: '🎋', season: 'Annual (12-18 months)',
        yield: '60-80 tons/hectare', water: 'Very High',
        optimalPh: [6.0, 7.5], optimalTemp: [25, 38],
        optimalHumidity: [60, 85], optimalRainfall: [1000, 2000],
        suitableSoils: ['Loam', 'Alluvial', 'Clay', 'Black Soil'],
    },
    {
        name: 'Groundnut', emoji: '🥜', season: 'Kharif (Jun-Oct)',
        yield: '1.5-2.5 tons/hectare', water: 'Low',
        optimalPh: [6.0, 7.0], optimalTemp: [25, 35],
        optimalHumidity: [50, 70], optimalRainfall: [500, 1000],
        suitableSoils: ['Sandy', 'Loam', 'Red Soil', 'Laterite'],
    },
    {
        name: 'Soybean', emoji: '🫘', season: 'Kharif (Jun-Oct)',
        yield: '1.0-2.0 tons/hectare', water: 'Medium',
        optimalPh: [6.0, 7.0], optimalTemp: [20, 30],
        optimalHumidity: [60, 80], optimalRainfall: [600, 1200],
        suitableSoils: ['Loam', 'Clay', 'Black Soil', 'Alluvial'],
    },
    {
        name: 'Tomato', emoji: '🍅', season: 'Rabi/Year-round',
        yield: '20-30 tons/hectare', water: 'Medium',
        optimalPh: [6.0, 7.0], optimalTemp: [20, 30],
        optimalHumidity: [50, 70], optimalRainfall: [400, 800],
        suitableSoils: ['Loam', 'Sandy', 'Red Soil', 'Alluvial'],
    },
    {
        name: 'Onion', emoji: '🧅', season: 'Rabi (Oct-Feb)',
        yield: '15-25 tons/hectare', water: 'Low',
        optimalPh: [6.0, 7.5], optimalTemp: [15, 25],
        optimalHumidity: [50, 70], optimalRainfall: [350, 750],
        suitableSoils: ['Loam', 'Sandy', 'Alluvial', 'Red Soil'],
    },
    {
        name: 'Potato', emoji: '🥔', season: 'Rabi (Oct-Feb)',
        yield: '20-30 tons/hectare', water: 'Medium',
        optimalPh: [5.5, 6.5], optimalTemp: [15, 22],
        optimalHumidity: [60, 80], optimalRainfall: [500, 800],
        suitableSoils: ['Loam', 'Sandy', 'Alluvial', 'Silt'],
    },
    {
        name: 'Mustard', emoji: '🌻', season: 'Rabi (Oct-Feb)',
        yield: '1.0-1.8 tons/hectare', water: 'Low',
        optimalPh: [6.0, 7.5], optimalTemp: [15, 25],
        optimalHumidity: [40, 65], optimalRainfall: [300, 600],
        suitableSoils: ['Loam', 'Sandy', 'Alluvial', 'Clay'],
    },
    {
        name: 'Chickpea (Chana)', emoji: '🫘', season: 'Rabi (Oct-Feb)',
        yield: '1.0-2.0 tons/hectare', water: 'Very Low',
        optimalPh: [6.0, 8.0], optimalTemp: [15, 30],
        optimalHumidity: [30, 60], optimalRainfall: [250, 700],
        suitableSoils: ['Loam', 'Clay', 'Black Soil', 'Red Soil'],
    },
    {
        name: 'Mango', emoji: '🥭', season: 'Perennial (harvest Apr-Jul)',
        yield: '8-12 tons/hectare', water: 'Medium',
        optimalPh: [5.5, 7.5], optimalTemp: [24, 35],
        optimalHumidity: [50, 70], optimalRainfall: [500, 2500],
        suitableSoils: ['Alluvial', 'Loam', 'Red Soil', 'Laterite', 'Sandy'],
    },
    {
        name: 'Turmeric', emoji: '🟡', season: 'Kharif (Jun-Jan)',
        yield: '5-8 tons/hectare', water: 'High',
        optimalPh: [5.5, 7.0], optimalTemp: [20, 30],
        optimalHumidity: [70, 90], optimalRainfall: [800, 1500],
        suitableSoils: ['Loam', 'Clay', 'Alluvial', 'Red Soil'],
    },
    {
        name: 'Sunflower', emoji: '🌻', season: 'Kharif/Rabi',
        yield: '1.5-2.5 tons/hectare', water: 'Low',
        optimalPh: [6.0, 7.5], optimalTemp: [20, 30],
        optimalHumidity: [40, 65], optimalRainfall: [400, 900],
        suitableSoils: ['Loam', 'Black Soil', 'Alluvial', 'Red Soil'],
    },
];

// ── Scoring functions ────────────────────────────────────────────────────────

/** Score how well a value fits within the optimal range. Returns 0-100. */
function rangeScore(value: number, [min, max]: [number, number]): number {
    if (value >= min && value <= max) return 100;
    // Partial credit if within ±30% outside the range
    const rangeWidth = max - min || 1;
    const tolerance = rangeWidth * 0.3;
    if (value < min) {
        const diff = min - value;
        if (diff > tolerance) return 0;
        return Math.round((1 - diff / tolerance) * 70); // max 70 for near-miss
    }
    // value > max
    const diff = value - max;
    if (diff > tolerance) return 0;
    return Math.round((1 - diff / tolerance) * 70);
}

/** Score how well the soil type matches. Returns 0 or 100. */
function soilScore(userSoil: string, suitableSoils: string[]): number {
    const normalised = userSoil.trim().toLowerCase();
    return suitableSoils.some(s => s.toLowerCase() === normalised) ? 100 : 20;
}

// ── Main recommendation function ────────────────────────────────────────────

/**
 * Recommend crops based on user's soil, climate, and rainfall inputs.
 * Returns top 5 crops sorted by suitability score (highest first).
 */
export function recommendCrops(input: CropInput): CropResult[] {
    const scored = CROP_DATABASE.map(crop => {
        const phScore = rangeScore(input.ph, crop.optimalPh);
        const tempScore = rangeScore(input.temperature, crop.optimalTemp);
        const humScore = rangeScore(input.humidity, crop.optimalHumidity);
        const rainScore = rangeScore(input.rainfall, crop.optimalRainfall);
        const soilSc = soilScore(input.soilType, crop.suitableSoils);

        // Weighted average — soil and temperature matter most
        const totalScore = Math.round(
            soilSc * 0.25 +
            phScore * 0.15 +
            tempScore * 0.25 +
            humScore * 0.15 +
            rainScore * 0.20
        );

        // Build match explanation
        const details: string[] = [];
        if (soilSc >= 100) details.push(`✓ Soil: ${input.soilType} is ideal`);
        else details.push(`△ Soil: ${input.soilType} is not optimal`);
        if (phScore >= 80) details.push(`✓ pH ${input.ph} is in range`);
        else details.push(`△ pH ${input.ph} is outside optimal ${crop.optimalPh[0]}-${crop.optimalPh[1]}`);
        if (tempScore >= 80) details.push(`✓ Temp ${input.temperature}°C is ideal`);
        if (rainScore >= 80) details.push(`✓ Rainfall ${input.rainfall}mm is suitable`);

        return {
            name: crop.name,
            yield: crop.yield,
            season: crop.season,
            water: crop.water,
            score: totalScore,
            emoji: crop.emoji,
            matchDetails: details.join(' · '),
        } satisfies CropResult;
    });

    // Sort by score descending and return top 5
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5);
}
