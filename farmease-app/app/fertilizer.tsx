import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { usePreloadTranslations } from '../hooks/useTranslation';
import { recommendFertilizers, FertilizerAnalysis } from '../services/fertilizerRecommendation';

export default function FertilizerScreen() {
    const router = useRouter();
    const { t } = usePreloadTranslations([
        'fertilizer.title',
        'fertilizer.resultsTitle',
        'fertilizer.formTitle',
        'fertilizer.nitrogenLabel',
        'fertilizer.nitrogenPlaceholder',
        'fertilizer.phosphorusLabel',
        'fertilizer.phosphorusPlaceholder',
        'fertilizer.potassiumLabel',
        'fertilizer.potassiumPlaceholder',
        'fertilizer.cropTypeLabel',
        'fertilizer.cropTypePlaceholder',
        'fertilizer.getAdvice',
        'fertilizer.tryDifferent',
        'fertilizer.soilSummary',
        'fertilizer.recommended',
    ]);
    const [nitrogen, setNitrogen] = useState('');
    const [phosphorus, setPhosphorus] = useState('');
    const [potassium, setPotassium] = useState('');
    const [cropType, setCropType] = useState('');
    const [analysis, setAnalysis] = useState<FertilizerAnalysis | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = () => {
        setLoading(true);
        setTimeout(() => {
            const result = recommendFertilizers({
                nitrogen: parseFloat(nitrogen) || 40,
                phosphorus: parseFloat(phosphorus) || 15,
                potassium: parseFloat(potassium) || 100,
                cropType: cropType || 'Rice',
            });
            setAnalysis(result);
            setLoading(false);
            setShowResults(true);
        }, 800);
    };

    const statusColor = (status: string) => {
        if (status === 'deficient') return '#E63946';
        if (status === 'excess') return '#F4A261';
        return '#2D6A4F';
    };

    const statusLabel = (status: string) => {
        if (status === 'deficient') return 'Low ⬇️';
        if (status === 'excess') return 'High ⬆️';
        return 'OK ✓';
    };

    const priorityColor = (priority: string) => {
        if (priority === 'high') return '#D4EDDA';
        if (priority === 'medium') return '#FFF3CD';
        return '#F0F0F0';
    };

    if (showResults && analysis) {
        return (
            <ScrollView style={styles.container}>
                <Header title={t('fertilizer.resultsTitle')} showBack onBack={() => setShowResults(false)} />

                {/* NPK Status Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>{t('fertilizer.soilSummary')}</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>N</Text>
                            <Text style={styles.summaryValue}>{nitrogen || '40'}</Text>
                            <Text style={[styles.statusBadge, { color: statusColor(analysis.nitrogenStatus) }]}>
                                {statusLabel(analysis.nitrogenStatus)}
                            </Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>P</Text>
                            <Text style={styles.summaryValue}>{phosphorus || '15'}</Text>
                            <Text style={[styles.statusBadge, { color: statusColor(analysis.phosphorusStatus) }]}>
                                {statusLabel(analysis.phosphorusStatus)}
                            </Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>K</Text>
                            <Text style={styles.summaryValue}>{potassium || '100'}</Text>
                            <Text style={[styles.statusBadge, { color: statusColor(analysis.potassiumStatus) }]}>
                                {statusLabel(analysis.potassiumStatus)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Soil Health Note */}
                <View style={styles.noteCard}>
                    <Text style={styles.noteText}>{analysis.soilHealthNote}</Text>
                </View>

                <Text style={styles.sectionTitle}>{t('fertilizer.recommended')}</Text>
                {analysis.results.map((fert, i) => (
                    <View key={i} style={[styles.fertCard, { borderLeftColor: priorityColor(fert.priority), borderLeftWidth: 4 }]}>
                        <Text style={{ fontSize: 28 }}>{fert.emoji}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fertName}>{fert.name}</Text>
                            <Text style={styles.fertComp}>{fert.composition}</Text>
                            <Text style={styles.fertMeta}>📦 {fert.quantity}</Text>
                            <Text style={styles.fertMeta}>📅 {fert.schedule}</Text>
                            <Text style={styles.fertReason}>{fert.reason}</Text>
                        </View>
                    </View>
                ))}
                <View style={{ padding: spacing.xl }}>
                    <Button title={t('fertilizer.tryDifferent')} onPress={() => setShowResults(false)} variant="outline" fullWidth />
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Header title={t('fertilizer.title')} showBack onBack={() => router.back()} />
            <View style={styles.form}>
                <Text style={{ fontSize: 50, textAlign: 'center', marginBottom: spacing.lg }}>🧪</Text>
                <Text style={styles.formTitle}>{t('fertilizer.formTitle')}</Text>

                <Input label={t('fertilizer.nitrogenLabel')} placeholder={t('fertilizer.nitrogenPlaceholder')} value={nitrogen} onChangeText={setNitrogen} keyboardType="numeric" />
                <Input label={t('fertilizer.phosphorusLabel')} placeholder={t('fertilizer.phosphorusPlaceholder')} value={phosphorus} onChangeText={setPhosphorus} keyboardType="numeric" />
                <Input label={t('fertilizer.potassiumLabel')} placeholder={t('fertilizer.potassiumPlaceholder')} value={potassium} onChangeText={setPotassium} keyboardType="numeric" />
                <Input label={t('fertilizer.cropTypeLabel')} placeholder={t('fertilizer.cropTypePlaceholder')} value={cropType} onChangeText={setCropType} />

                <Button title={t('fertilizer.getAdvice')} onPress={handleAnalyze} loading={loading} fullWidth size="lg" style={{ marginTop: spacing.lg }} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    form: { padding: spacing.xl },
    formTitle: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
    summaryCard: { margin: spacing.base, backgroundColor: colors.primary, padding: spacing.xl, borderRadius: borderRadius.lg },
    summaryTitle: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.textOnPrimary, marginBottom: spacing.md },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center' },
    summaryLabel: { fontSize: typography.sizes.sm, color: colors.accentLighter },
    summaryValue: { fontSize: typography.sizes['2xl'], fontWeight: '700', color: colors.textOnPrimary },
    statusBadge: { fontSize: typography.sizes.xs, fontWeight: '600', marginTop: 4 },
    noteCard: {
        marginHorizontal: spacing.base, padding: spacing.base,
        backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        ...shadows.sm, marginBottom: spacing.sm,
    },
    noteText: { fontSize: typography.sizes.sm, color: colors.text, lineHeight: 20 },
    sectionTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.base, marginTop: spacing.xl, marginBottom: spacing.md },
    fertCard: {
        flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginHorizontal: spacing.base,
        backgroundColor: colors.surface, padding: spacing.base, borderRadius: borderRadius.lg,
        marginBottom: spacing.sm, ...shadows.sm,
    },
    fertName: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.text },
    fertComp: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
    fertMeta: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
    fertReason: { fontSize: typography.sizes.xs, color: colors.primary, marginTop: 4, fontStyle: 'italic', lineHeight: 16 },
});
