// Utility helpers

export const formatPrice = (price: number): string => `₹${price.toLocaleString('en-IN')}`;

export const formatWeight = (kg: number): string => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)} ton`;
    return `${kg} kg`;
};

export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'dashboard.goodMorning';
    if (hour < 17) return 'dashboard.goodAfternoon';
    return 'dashboard.goodEvening';
};

export const truncate = (str: string, len: number): string =>
    str.length > len ? str.slice(0, len) + '...' : str;

export const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return '#52B788';
    if (confidence >= 50) return '#F59E0B';
    return '#E63946';
};
