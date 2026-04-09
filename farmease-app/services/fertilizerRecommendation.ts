/**
 * Fertilizer Recommendation Engine — Rule-based NPK analysis.
 *
 * Analyzes user-provided Nitrogen (N), Phosphorus (P), and Potassium (K)
 * soil levels along with crop type to recommend appropriate fertilizers,
 * quantities, and application schedules. Uses real agronomic guidelines
 * from Indian agriculture extension services.
 */

export interface FertilizerInput {
    nitrogen: number;     // mg/kg (ppm) in soil
    phosphorus: number;   // mg/kg (ppm) in soil
    potassium: number;    // mg/kg (ppm) in soil
    cropType: string;     // e.g. 'Rice', 'Wheat', 'Tomato'
}

export interface FertilizerResult {
    name: string;
    composition: string;
    quantity: string;     // per acre
    schedule: string;
    emoji: string;
    reason: string;       // Why this fertilizer is recommended
    priority: 'high' | 'medium' | 'low';
}

export interface FertilizerAnalysis {
    nitrogenStatus: 'deficient' | 'adequate' | 'excess';
    phosphorusStatus: 'deficient' | 'adequate' | 'excess';
    potassiumStatus: 'deficient' | 'adequate' | 'excess';
    results: FertilizerResult[];
    soilHealthNote: string;
}

// ── Nutrient thresholds (mg/kg in soil) based on Indian Soil Standards ──────

const N_THRESHOLDS = { low: 75, adequate: 150 };   // < 75 = deficient, 75-150 = adequate, > 150 = excess
const P_THRESHOLDS = { low: 12, adequate: 25 };     // Olsen P method
const K_THRESHOLDS = { low: 110, adequate: 280 };   // Ammonium acetate extractable

function nutrientStatus(value: number, thresholds: { low: number; adequate: number }): 'deficient' | 'adequate' | 'excess' {
    if (value < thresholds.low) return 'deficient';
    if (value <= thresholds.adequate) return 'adequate';
    return 'excess';
}

// ── Crop-specific ideal NPK requirements (kg/acre) ─────────────────────────

interface CropNPK {
    n: number; p: number; k: number;
    basalSchedule: string;
    topDressSchedule: string;
}

const CROP_NPK_NEEDS: Record<string, CropNPK> = {
    rice:       { n: 50, p: 25, k: 25, basalSchedule: 'At transplanting', topDressSchedule: '30 & 60 days after transplanting' },
    wheat:      { n: 50, p: 25, k: 12, basalSchedule: 'At sowing', topDressSchedule: '21 & 42 days after sowing' },
    maize:      { n: 50, p: 25, k: 20, basalSchedule: 'At sowing', topDressSchedule: '25 & 45 days after sowing' },
    cotton:     { n: 40, p: 20, k: 20, basalSchedule: 'At sowing', topDressSchedule: '30 & 60 days after sowing' },
    sugarcane:  { n: 60, p: 30, k: 30, basalSchedule: 'At planting', topDressSchedule: 'At 30, 60, and 90 days' },
    tomato:     { n: 45, p: 25, k: 25, basalSchedule: 'Before transplanting', topDressSchedule: 'Every 20 days until fruiting' },
    potato:     { n: 50, p: 25, k: 30, basalSchedule: 'At planting', topDressSchedule: '30 days after planting' },
    onion:      { n: 40, p: 20, k: 20, basalSchedule: 'Before transplanting', topDressSchedule: '30 & 45 days after transplanting' },
    groundnut:  { n: 10, p: 20, k: 20, basalSchedule: 'At sowing', topDressSchedule: 'Not required (legume)' },
    soybean:    { n: 10, p: 30, k: 15, basalSchedule: 'At sowing', topDressSchedule: 'Not required (legume)' },
    mustard:    { n: 30, p: 15, k: 10, basalSchedule: 'At sowing', topDressSchedule: '30 days after sowing' },
    default:    { n: 40, p: 20, k: 20, basalSchedule: 'At sowing/planting', topDressSchedule: '30 days after sowing' },
};

function getCropNeeds(cropType: string): CropNPK {
    const key = cropType.trim().toLowerCase();
    return CROP_NPK_NEEDS[key] || CROP_NPK_NEEDS.default;
}

// ── Main recommendation function ────────────────────────────────────────────

export function recommendFertilizers(input: FertilizerInput): FertilizerAnalysis {
    const nStatus = nutrientStatus(input.nitrogen, N_THRESHOLDS);
    const pStatus = nutrientStatus(input.phosphorus, P_THRESHOLDS);
    const kStatus = nutrientStatus(input.potassium, K_THRESHOLDS);
    const cropNeeds = getCropNeeds(input.cropType);

    const results: FertilizerResult[] = [];

    // ── Nitrogen recommendations ────────────────────────────────────────────
    if (nStatus === 'deficient') {
        const ureaQty = Math.round(cropNeeds.n / 0.46); // Urea is 46% N
        results.push({
            name: 'Urea',
            composition: '46-0-0 (46% Nitrogen)',
            quantity: `${ureaQty} kg/acre in split doses`,
            schedule: `Basal: ${Math.round(ureaQty * 0.33)} kg ${cropNeeds.basalSchedule} — Top dress: ${Math.round(ureaQty * 0.67)} kg ${cropNeeds.topDressSchedule}`,
            emoji: '💊',
            reason: `Soil N is low (${input.nitrogen} mg/kg). ${input.cropType || 'Your crop'} needs ~${cropNeeds.n} kg N/acre.`,
            priority: 'high',
        });
    } else if (nStatus === 'adequate') {
        const ureaQty = Math.round((cropNeeds.n * 0.5) / 0.46);
        results.push({
            name: 'Urea (maintenance dose)',
            composition: '46-0-0 (46% Nitrogen)',
            quantity: `${ureaQty} kg/acre`,
            schedule: `Top dress only: ${cropNeeds.topDressSchedule}`,
            emoji: '💊',
            reason: `Soil N is adequate (${input.nitrogen} mg/kg). Reduced dose recommended.`,
            priority: 'low',
        });
    }

    // ── Phosphorus recommendations ──────────────────────────────────────────
    if (pStatus === 'deficient') {
        const dapQty = Math.round(cropNeeds.p / 0.46); // DAP is 46% P2O5
        results.push({
            name: 'DAP (Di-Ammonium Phosphate)',
            composition: '18-46-0 (18% N, 46% P₂O₅)',
            quantity: `${dapQty} kg/acre`,
            schedule: `Full dose ${cropNeeds.basalSchedule} (basal application)`,
            emoji: '🧪',
            reason: `Soil P is low (${input.phosphorus} mg/kg). Phosphorus promotes root growth and flowering.`,
            priority: 'high',
        });
    } else if (pStatus === 'adequate') {
        results.push({
            name: 'SSP (Single Super Phosphate)',
            composition: '0-16-0 + 11% Sulphur',
            quantity: `${Math.round(cropNeeds.p * 0.6 / 0.16)} kg/acre`,
            schedule: `${cropNeeds.basalSchedule} (maintenance)`,
            emoji: '🧪',
            reason: `Soil P is adequate (${input.phosphorus} mg/kg). SSP also supplies Sulphur.`,
            priority: 'low',
        });
    }

    // ── Potassium recommendations ───────────────────────────────────────────
    if (kStatus === 'deficient') {
        const mopQty = Math.round(cropNeeds.k / 0.60); // MOP is 60% K2O
        results.push({
            name: 'MOP (Muriate of Potash)',
            composition: '0-0-60 (60% K₂O)',
            quantity: `${mopQty} kg/acre`,
            schedule: `${cropNeeds.basalSchedule} — apply in 2 split doses for heavy feeders`,
            emoji: '🌿',
            reason: `Soil K is low (${input.potassium} mg/kg). Potassium improves disease resistance and fruit quality.`,
            priority: 'high',
        });
    } else if (kStatus === 'adequate') {
        results.push({
            name: 'MOP (maintenance)',
            composition: '0-0-60 (60% K₂O)',
            quantity: `${Math.round(cropNeeds.k * 0.5 / 0.60)} kg/acre`,
            schedule: `${cropNeeds.basalSchedule}`,
            emoji: '🌿',
            reason: `Soil K is adequate (${input.potassium} mg/kg). Small maintenance dose.`,
            priority: 'low',
        });
    }

    // ── Balanced fertilizer if multiple nutrients are moderate ───────────────
    const deficientCount = [nStatus, pStatus, kStatus].filter(s => s === 'deficient').length;
    if (deficientCount >= 2) {
        results.unshift({
            name: 'NPK Complex (10:26:26)',
            composition: '10% N, 26% P₂O₅, 26% K₂O',
            quantity: `50 kg/acre`,
            schedule: `Full bag ${cropNeeds.basalSchedule} as base fertilizer`,
            emoji: '⚡',
            reason: `Multiple nutrient deficiencies detected. Complex fertilizer provides balanced nutrition in one application.`,
            priority: 'high',
        });
    }

    // ── Organic recommendation (always suggested as supplement) ──────────────
    results.push({
        name: 'Farm Yard Manure (FYM)',
        composition: '0.5-0.3-0.5 (Organic)',
        quantity: '2-3 tons/acre',
        schedule: '2-3 weeks before sowing/planting',
        emoji: '🌱',
        reason: 'Organic matter improves soil structure, water retention, and microbial activity.',
        priority: 'medium',
    });

    // ── Soil health note ────────────────────────────────────────────────────
    const excessNutrients = [
        nStatus === 'excess' ? 'Nitrogen' : null,
        pStatus === 'excess' ? 'Phosphorus' : null,
        kStatus === 'excess' ? 'Potassium' : null,
    ].filter(Boolean);

    let soilHealthNote = '';
    if (excessNutrients.length > 0) {
        soilHealthNote = `⚠️ ${excessNutrients.join(' and ')} levels are high. Avoid adding more — excess can harm crops and pollute groundwater.`;
    } else if (deficientCount === 0) {
        soilHealthNote = '✅ Your soil nutrient levels are in a healthy range. Focus on organic amendments and micronutrients.';
    } else {
        soilHealthNote = `📋 ${deficientCount} nutrient(s) need attention. Follow the recommended fertilizer schedule for best results.`;
    }

    return {
        nitrogenStatus: nStatus,
        phosphorusStatus: pStatus,
        potassiumStatus: kStatus,
        results,
        soilHealthNote,
    };
}
