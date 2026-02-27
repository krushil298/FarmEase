import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SOIL_TYPES } from '../utils/constants';
import { usePreloadTranslations } from '../hooks/useTranslation';

const SAMPLE_RESULTS = [
    { name: 'Rice', yield: '2.5 tons/hectare', season: 'Kharif', water: 'High', score: 85, emoji: '🌾' },
    { name: 'Wheat', yield: '2.1 tons/hectare', season: 'Rabi', water: 'Medium', score: 82, emoji: '🌾' },
    { name: 'Cotton', yield: '1.8 tons/hectare', season: 'Kharif', water: 'Medium', score: 78, emoji: '🧵' },
    { name: 'Maize', yield: '2.5 tons/hectare', season: 'Kharif', water: 'High', score: 75, emoji: '🌽' },
    { name: 'Sugarcane', yield: '3.0 tons/hectare', season: 'Annual', water: 'Very High', score: 72, emoji: '🎋' },
];

export default function CropRecommendScreen() {
    const router = useRouter();
    const { t } = usePreloadTranslations([
        'cropRecommend.title',
        'cropRecommend.resultsTitle',
        'cropRecommend.formTitle',
        'cropRecommend.soilType',
        'cropRecommend.phLevel',
        'cropRecommend.phPlaceholder',
        'cropRecommend.temperature',
        'cropRecommend.tempPlaceholder',
        'cropRecommend.humidity',
        'cropRecommend.humidityPlaceholder',
        'cropRecommend.rainfall',
        'cropRecommend.rainfallPlaceholder',
        'cropRecommend.getRecommendations',
        'cropRecommend.tryDifferent',
    ]);
    const [soilType, setSoilType] = useState('Loam');
    const [ph, setPh] = useState('6.8');
    const [temp, setTemp] = useState('28');
    const [humidity, setHumidity] = useState('70');
    const [rainfall, setRainfall] = useState('1200');
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRecommend = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowResults(true);
        }, 1500);
    };

    if (showResults) {
        return (
            <ScrollView style={styles.container}>
                <Header title={t('cropRecommend.resultsTitle')} showBack onBack={() => setShowResults(false)} />
                {SAMPLE_RESULTS.map((crop, i) => (
                    <View key={i} style={styles.resultCard}>
                        <Text style={{ fontSize: 36 }}>{crop.emoji}</Text>
                        <View style={styles.resultInfo}>
                            <Text style={styles.resultName}>{crop.name}</Text>
                            <Text style={styles.resultMeta}>{crop.yield} • {crop.season}</Text>
                            <Text style={styles.resultMeta}>💧 {crop.water}</Text>
                        </View>
                        <View style={styles.scoreBadge}>
                            <Text style={styles.scoreText}>{crop.score}%</Text>
                        </View>
                    </View>
                ))}
                <View style={{ padding: spacing.xl }}>
                    <Button title={t('cropRecommend.tryDifferent')} onPress={() => setShowResults(false)} variant="outline" fullWidth />
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Header title={t('cropRecommend.title')} showBack onBack={() => router.back()} />

            <View style={styles.form}>
                <Text style={{ fontSize: 50, textAlign: 'center', marginBottom: spacing.lg }}>🌱</Text>
                <Text style={styles.formTitle}>{t('cropRecommend.formTitle')}</Text>

                {/* Soil Type Selector */}
                <Text style={styles.label}>{t('cropRecommend.soilType')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.soilRow}>
                    {SOIL_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.soilChip, soilType === type && styles.soilChipActive]}
                            onPress={() => setSoilType(type)}
                        >
                            <Text style={[styles.soilChipText, soilType === type && styles.soilChipTextActive]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Input label={t('cropRecommend.phLevel')} placeholder={t('cropRecommend.phPlaceholder')} value={ph} onChangeText={setPh} keyboardType="numeric" />
                <Input label={t('cropRecommend.temperature')} placeholder={t('cropRecommend.tempPlaceholder')} value={temp} onChangeText={setTemp} keyboardType="numeric" />
                <Input label={t('cropRecommend.humidity')} placeholder={t('cropRecommend.humidityPlaceholder')} value={humidity} onChangeText={setHumidity} keyboardType="numeric" />
                <Input label={t('cropRecommend.rainfall')} placeholder={t('cropRecommend.rainfallPlaceholder')} value={rainfall} onChangeText={setRainfall} keyboardType="numeric" />

                <Button title={t('cropRecommend.getRecommendations')} onPress={handleRecommend} loading={loading} fullWidth size="lg" style={{ marginTop: spacing.lg }} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    form: { padding: spacing.xl },
    formTitle: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
    label: { fontSize: typography.sizes.sm, fontWeight: '500', color: colors.text, marginBottom: spacing.sm },
    soilRow: { marginBottom: spacing.base },
    soilChip: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderRadius: borderRadius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
    soilChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    soilChipText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
    soilChipTextActive: { color: colors.textOnPrimary },
    resultCard: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.base,
        backgroundColor: colors.surface, padding: spacing.base, borderRadius: borderRadius.lg,
        marginBottom: spacing.sm, ...shadows.sm,
    },
    resultInfo: { flex: 1 },
    resultName: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text },
    resultMeta: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
    scoreBadge: { backgroundColor: colors.accentLighter, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.pill },
    scoreText: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary },
});
