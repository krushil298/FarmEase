import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { usePreloadTranslations } from '../hooks/useTranslation';

const FERTILIZER_RESULTS = [
    { name: 'DAP (Di-ammonium Phosphate)', quantity: '50 kg/acre', schedule: 'Before sowing', emoji: '🧪' },
    { name: 'Urea', quantity: '30 kg/acre', schedule: '30 days after sowing', emoji: '💊' },
    { name: 'Potash (MOP)', quantity: '25 kg/acre', schedule: 'At flowering stage', emoji: '🌿' },
];

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
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowResults(true);
        }, 1500);
    };

    if (showResults) {
        return (
            <ScrollView style={styles.container}>
                <Header title={t('fertilizer.resultsTitle')} showBack onBack={() => setShowResults(false)} />
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>{t('fertilizer.soilSummary')}</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}><Text style={styles.summaryLabel}>N</Text><Text style={styles.summaryValue}>{nitrogen || '40'}</Text></View>
                        <View style={styles.summaryItem}><Text style={styles.summaryLabel}>P</Text><Text style={styles.summaryValue}>{phosphorus || '35'}</Text></View>
                        <View style={styles.summaryItem}><Text style={styles.summaryLabel}>K</Text><Text style={styles.summaryValue}>{potassium || '50'}</Text></View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{t('fertilizer.recommended')}</Text>
                {FERTILIZER_RESULTS.map((fert, i) => (
                    <View key={i} style={styles.fertCard}>
                        <Text style={{ fontSize: 28 }}>{fert.emoji}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fertName}>{fert.name}</Text>
                            <Text style={styles.fertMeta}>📦 {fert.quantity}</Text>
                            <Text style={styles.fertMeta}>📅 {fert.schedule}</Text>
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
    sectionTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.base, marginTop: spacing.xl, marginBottom: spacing.md },
    fertCard: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.base,
        backgroundColor: colors.surface, padding: spacing.base, borderRadius: borderRadius.lg,
        marginBottom: spacing.sm, ...shadows.sm,
    },
    fertName: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.text },
    fertMeta: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
});
