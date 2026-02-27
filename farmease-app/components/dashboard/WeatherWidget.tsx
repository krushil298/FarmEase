import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../../utils/theme';
import { FASTAPI_BASE_URL } from '../../utils/constants';
import { getCurrentLocation } from '../../services/location';
import { useFarmStore } from '../../store/useFarmStore';
import { requestNotificationPermissions, evaluateWeatherAndNotify } from '../../services/notifications';

interface WeatherData {
    temp: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    location: string;
    feelsLike: number;
}

const WEATHER_ICONS: Record<string, string> = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Haze: '🌫️',
    Fog: '🌫️',
    default: '🌤️',
};

const MOCK_WEATHER: WeatherData = {
    temp: 28,
    condition: 'Partly Cloudy',
    icon: '🌤️',
    humidity: 65,
    windSpeed: 12,
    location: 'Bangalore, IN',
    feelsLike: 30,
};

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const { setLocation, setAddress } = useFarmStore();

    useEffect(() => {
        // Init permissions and fetch real weather
        requestNotificationPermissions().then(() => fetchWeather());
    }, []);

    const fetchWeather = async () => {
        try {
            // Get real device location
            const loc = await getCurrentLocation();
            const { lat, lng } = loc.coords;

            // Store in farm store for reuse
            setLocation({ lat, lng });
            setAddress(loc.address);

            const url = `${FASTAPI_BASE_URL}/api/weather?lat=${lat}&lon=${lng}&units=metric`;
            console.log(`[WeatherWidget] Fetching real weather from: ${url}`);

            const response = await fetch(url);

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Proxy failed: ${response.status} ${errText}`);
            }
            const data = await response.json();

            setWeather({
                temp: Math.round(data.current.temp),
                condition: data.current.condition || 'Clear',
                icon: WEATHER_ICONS[data.current.condition] || WEATHER_ICONS.default,
                humidity: Math.round(data.current.humidity),
                windSpeed: Math.round(data.current.wind_speed),
                location: `${data.location.city}, ${data.location.country}`,
                feelsLike: Math.round(data.current.feels_like),
            });

            // Push notification checks based on backend data
            evaluateWeatherAndNotify(data);
        } catch (e: any) {
            console.error('[WeatherWidget] Weather fetch failed. Error:', e.message || e);
            console.warn('Weather fetch failed, utilizing mock.');
            setWeather(MOCK_WEATHER);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator color={colors.textOnPrimary} />
            </View>
        );
    }

    if (!weather) return null;

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View style={styles.tempSection}>
                    <Text style={styles.icon}>{weather.icon}</Text>
                    <View>
                        <Text style={styles.temp}>{weather.temp}°C</Text>
                        <Text style={styles.condition}>{weather.condition}</Text>
                    </View>
                </View>
                <View style={styles.locationSection}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.location}>{weather.location}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>💧</Text>
                    <Text style={styles.detailLabel}>Humidity</Text>
                    <Text style={styles.detailValue}>{weather.humidity}%</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>💨</Text>
                    <Text style={styles.detailLabel}>Wind</Text>
                    <Text style={styles.detailValue}>{weather.windSpeed} km/h</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>🌡️</Text>
                    <Text style={styles.detailLabel}>Feels Like</Text>
                    <Text style={styles.detailValue}>{weather.feelsLike}°C</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.base,
        marginVertical: spacing.sm,
        borderRadius: borderRadius.xl,
        padding: spacing.base,
        backgroundColor: '#4A90D9', // Deep sky blue
        ...shadows.lg,
    },
    loadingContainer: {
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    tempSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    icon: {
        fontSize: 44,
    },
    temp: {
        fontSize: typography.sizes['4xl'],
        fontWeight: '700',
        color: colors.textOnPrimary,
    },
    condition: {
        fontSize: typography.sizes.sm,
        color: '#C8DCFF',
        fontWeight: '500',
    },
    locationSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    locationIcon: {
        fontSize: 12,
    },
    location: {
        fontSize: typography.sizes.xs,
        color: colors.textOnPrimary,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginVertical: spacing.md,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    detailItem: {
        alignItems: 'center',
        gap: 2,
    },
    detailIcon: {
        fontSize: 18,
    },
    detailLabel: {
        fontSize: typography.sizes.xs,
        color: '#C8DCFF',
    },
    detailValue: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        color: colors.textOnPrimary,
    },
});
