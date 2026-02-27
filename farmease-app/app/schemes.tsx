import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import Header from '../components/ui/Header';
import CategoryPill from '../components/ui/CategoryPill';
import { SCHEME_CATEGORIES } from '../utils/constants';
import { usePreloadTranslations } from '../hooks/useTranslation';
import { fetchSchemes, Scheme } from '../services/schemes';

const CATEGORY_EMOJIS: Record<string, string> = {
    'Subsidy': '💰',
    'Insurance': '🛡️',
    'Loan': '💳',
    'Training': '🌍',
    'Equipment': '🚜',
    'Irrigation': '💧',
    'Default': '📜'
};

export default function SchemesScreen() {
    const router = useRouter();
    const { t } = usePreloadTranslations([
        'schemes.title',
        'schemes.subtitle',
        'schemes.description',
        'schemes.eligibility',
        'schemes.deadline',
        'schemes.checkEligibility',
    ]);
    const [selected, setSelected] = useState('All');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadSchemes = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        const data = await fetchSchemes(selected);
        setSchemes(data);
        setLoading(false);
        setRefreshing(false);
    }, [selected]);

    useEffect(() => {
        loadSchemes();
    }, [loadSchemes]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadSchemes(true);
    }, [loadSchemes]);

    const handleApply = (url: string) => {
        if (url) {
            Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
        }
    };

    const allCategories = ['All', ...SCHEME_CATEGORIES] as unknown as readonly string[];

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
            <Header title={t('schemes.title')} showBack onBack={() => router.back()} />
            <Text style={styles.subtitle}>{t('schemes.subtitle')}</Text>

            <CategoryPill categories={allCategories} selected={selected} onSelect={setSelected} />

            {loading && !refreshing ? (
                <View style={[styles.schemeCard, { padding: spacing.xl, alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Loading schemes...</Text>
                </View>
            ) : schemes.length === 0 ? (
                <View style={[styles.schemeCard, { padding: spacing.xl, alignItems: 'center' }]}>
                    <Text style={{ color: colors.textSecondary }}>No schemes found for this category.</Text>
                </View>
            ) : (
                schemes.map((scheme) => (
                    <TouchableOpacity
                        key={scheme.id}
                        style={styles.schemeCard}
                        onPress={() => setExpandedId(expandedId === scheme.id ? null : scheme.id)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.schemeHeader}>
                            <Text style={{ fontSize: 28 }}>{CATEGORY_EMOJIS[scheme.category] || CATEGORY_EMOJIS.Default}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.schemeName}>{scheme.name}</Text>
                                <Text style={styles.schemeCategory}>{scheme.category}</Text>
                            </View>
                            <Text style={styles.chevron}>{expandedId === scheme.id ? '▲' : '▼'}</Text>
                        </View>

                        {expandedId === scheme.id && (
                            <View style={styles.schemeDetails}>
                                {scheme.benefits && (
                                    <>
                                        <Text style={styles.detailLabel}>Benefits / Description</Text>
                                        <Text style={styles.detailText}>{scheme.benefits}</Text>
                                    </>
                                )}
                                <Text style={styles.detailLabel}>{t('schemes.eligibility')}</Text>
                                <Text style={styles.detailText}>{scheme.eligibility}</Text>

                                {scheme.apply_url && (
                                    <TouchableOpacity
                                        style={styles.applyBtn}
                                        onPress={() => handleApply(scheme.apply_url)}
                                    >
                                        <Text style={styles.applyBtnText}>Check Eligibility on Portal →</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>
                ))
            )}

            <View style={{ height: spacing['2xl'] }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    subtitle: { fontSize: typography.sizes.base, color: colors.textSecondary, paddingHorizontal: spacing.base, marginBottom: spacing.sm },
    schemeCard: {
        marginHorizontal: spacing.base, marginBottom: spacing.md, backgroundColor: colors.surface,
        borderRadius: borderRadius.lg, ...shadows.sm, overflow: 'hidden',
    },
    schemeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.base },
    schemeName: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.text },
    schemeCategory: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
    chevron: { fontSize: 12, color: colors.textLight },
    schemeDetails: { padding: spacing.base, paddingTop: 0, borderTopWidth: 1, borderTopColor: colors.divider },
    detailLabel: { fontSize: typography.sizes.xs, fontWeight: '600', color: colors.primary, marginTop: spacing.md, textTransform: 'uppercase' },
    detailText: { fontSize: typography.sizes.sm, color: colors.text, marginTop: 2 },
    applyBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.lg },
    applyBtnText: { color: colors.textOnPrimary, fontWeight: '600', fontSize: typography.sizes.sm },
});
