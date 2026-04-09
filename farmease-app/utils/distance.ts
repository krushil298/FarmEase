/**
 * Calculate distance between two lat/lng points using the Haversine formula.
 * Returns distance in kilometres.
 */
export function haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Format distance nicely: "< 1 km", "3.2 km", "125 km"
 */
export function formatDistance(km: number): string {
    if (km < 1) return '< 1 km';
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${Math.round(km)} km`;
}
