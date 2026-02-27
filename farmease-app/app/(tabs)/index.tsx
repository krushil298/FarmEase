import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useFarmStore } from '../../store/useFarmStore';
import { getGreeting } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import WeatherWidget from '../../components/dashboard/WeatherWidget';
import CategoryGrid from '../../components/dashboard/CategoryGrid';
import QuickActions from '../../components/dashboard/QuickActions';
import { DailyTipModal, useDailyTip, ALL_TIPS } from '../../components/dashboard/DailyTipModal';
import type { DailyTip } from '../../components/dashboard/DailyTipModal';
import { usePreloadTranslations } from '../../hooks/useTranslation';
import ChatFAB from '../../components/chat/ChatFAB';
import ChatbotModal from '../../components/chat/ChatbotModal';

// Category data for horizontal scroll
const CATEGORIES = [
    { id: '1', title: 'Scan Disease', emoji: '🔬' },
    { id: '2', title: 'Crop Advice', emoji: '🌱' },
    { id: '3', title: 'Marketplace', emoji: '🛒' },
    { id: '4', title: 'Fertilizer', emoji: '🧪' },
    { id: '5', title: 'Schemes', emoji: '📚' },
    { id: '6', title: 'Soil Info', emoji: '🌍' },
];

// Quick action cards
const QUICK_ACTIONS = [
    { title: 'Disease Detection', emoji: '📸', desc: 'Scan crop leaves', route: '/(tabs)/detect', color: '#6B4226' },
    { title: 'Crop Recommend', emoji: '🌾', desc: 'Get best crops', route: '/crop-recommend', color: '#C06014' },
    { title: 'Marketplace', emoji: '🛒', desc: 'Buy & sell crops', route: '/(tabs)/marketplace', color: '#2D6A4F' },
    { title: 'Rent Equipment', emoji: '🚜', desc: 'Rent from locals', route: '/rentals', color: '#8B6F47' },
    { title: 'Gov Schemes', emoji: '📋', desc: 'Browse schemes', route: '/schemes', color: '#B8860B' },
];

// Farming tips
const TIPS = [
    { title: 'Seasonal Tip', text: 'Prepare soil for monsoon crops!', emoji: '🌧️', bg: '#3E6B48' },
    { title: 'Market Alert', text: 'Tomato prices rising — list now!', emoji: '📈', bg: '#B8860B' },
    { title: 'Health Tip', text: 'Check wheat for rust disease', emoji: '🔍', bg: '#8B5E3C' },
];

// Map the inline TIPS to matching DailyTip entries for the modal
const TIP_MODAL_MAP: Record<string, DailyTip> = {
    'Seasonal Tip': ALL_TIPS.find(t => t.category === 'Seasonal Tip')!,
    'Market Alert': ALL_TIPS.find(t => t.category === 'Market Alert')!,
    'Health Tip': ALL_TIPS.find(t => t.category === 'Health Tip')!,
};

export default function DashboardScreen() {
    const router = useRouter();
    const { user, role } = useAuthStore();
    const { address: detectedAddress, location } = useFarmStore();
    const { t, isTranslating } = usePreloadTranslations([
        'Dashboard',
        'Farming Tips',
        'profile.farmer',
        'profile.buyer',
        'dashboard.setLocation',
        'dashboard.quickActions',
        'dashboard.diseaseDetection',
        'dashboard.diseaseDetectionDesc',
        'dashboard.cropRecommend',
        'dashboard.cropRecommendDesc',
        'dashboard.marketplace',
        'dashboard.marketplaceDesc',
        'dashboard.rentEquipment',
        'dashboard.rentEquipmentDesc',
        'dashboard.govSchemes',
        'dashboard.govSchemesDesc',
        'dashboard.seasonalTip',
        'dashboard.seasonalTipText',
        'dashboard.marketAlert',
        'dashboard.marketAlertText',
        'dashboard.healthTip',
        'dashboard.healthTipText',
        'dashboard.goodEvening',
        'tabs.home',
        'tabs.scan',
        'tabs.market',
        'tabs.rentals',
        'tabs.profile',
        'dashboard.shopCategories',
        'categories.seeds',
        'categories.fertilizers',
        'categories.pesticides',
        'categories.crops',
    ]);
    const [refreshing, setRefreshing] = useState(false);
    const { showTip, dismissTip, tip: dailyTip } = useDailyTip();
    const [tappedTip, setTappedTip] = useState<DailyTip | null>(null);
    const [showChat, setShowChat] = useState(false);

    const TIPS = [
        { title: t('dashboard.seasonalTip'), text: t('dashboard.seasonalTipText'), emoji: '🌧️', bg: '#3E6B48' },
        { title: t('dashboard.marketAlert'), text: t('dashboard.marketAlertText'), emoji: '📈', bg: '#B8860B' },
        { title: t('dashboard.healthTip'), text: t('dashboard.healthTipText'), emoji: '🔍', bg: '#8B5E3C' },
    ];

    const TIP_MODAL_MAP: Record<string, DailyTip> = {
        [t('dashboard.seasonalTip')]: ALL_TIPS.find(t => t.category === 'Seasonal Tip')!,
        [t('dashboard.marketAlert')]: ALL_TIPS.find(t => t.category === 'Market Alert')!,
        [t('dashboard.healthTip')]: ALL_TIPS.find(t => t.category === 'Health Tip')!,
    };

    const categoryRoutes: Record<string, string> = {
        '1': '/(tabs)/detect',
        '2': '/crop-recommend',
        '3': '/(tabs)/marketplace',
        '4': '/fertilizer',
        '5': '/schemes',
        '6': '/crop-recommend',
    };

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Greeting + Weather */}
                <View style={styles.greetingSection}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.greeting}>{t(getGreeting())}, {user?.name || (role === 'farmer' ? t('profile.farmer') : t('profile.buyer'))}!</Text>
                        <Text style={styles.location}>📍 {detectedAddress || user?.farm_location || t('dashboard.setLocation')}</Text>
                    </View>
                    {isTranslating && (
                        <View style={styles.translatingBadge}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={styles.translatingText}>Translating...</Text>
                        </View>
                    )}
                </View>

                {/* Weather Widget */}
                <WeatherWidget />

                {/* Category Grid (AI Images) */}
                <CategoryGrid />

                {/* Farming Tips */}
                <Text style={styles.sectionTitle}>🌿 {t('Farming Tips')}</Text>
                <View style={styles.tipsRow}>
                    {TIPS.map((tip, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.tipCard, { backgroundColor: tip.bg }]}
                            activeOpacity={0.8}
                            onPress={() => setTappedTip(TIP_MODAL_MAP[tip.title] || null)}
                        >
                            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                            <Text style={styles.tipTitle} numberOfLines={1}>{tip.title}</Text>
                            <Text style={styles.tipText} numberOfLines={2}>{tip.text}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Actions Grid */}
                <QuickActions />



                <View style={{ height: spacing['2xl'] }} />

                {/* Daily Tip Popup (auto once per day) */}
                <DailyTipModal visible={showTip} onClose={dismissTip} tip={dailyTip} />

                {/* Tip modal when tapping a tip card */}
                <DailyTipModal
                    visible={!!tappedTip}
                    onClose={() => setTappedTip(null)}
                    tip={tappedTip}
                />
            </ScrollView>

            {/* AI Chatbot FAB */}
            <ChatFAB onPress={() => setShowChat(true)} />
            <ChatbotModal visible={showChat} onClose={() => setShowChat(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    greetingSection: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.base, paddingTop: 60, paddingBottom: spacing.base,
        backgroundColor: colors.primary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },
    translatingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.pill,
    },
    translatingText: { fontSize: 10, color: colors.accentLighter, fontWeight: '500' },
    greeting: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.textOnPrimary },
    location: { fontSize: typography.sizes.sm, color: colors.accentLighter, marginTop: 4 },
    weatherBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm, borderRadius: borderRadius.pill,
    },
    weatherText: { fontSize: typography.sizes.sm, color: colors.textOnPrimary, fontWeight: '600' },

    categoryRow: { paddingHorizontal: spacing.base, paddingVertical: spacing.base, gap: spacing.base },
    categoryItem: { alignItems: 'center', width: 70 },
    categoryIcon: {
        width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface,
        justifyContent: 'center', alignItems: 'center', ...shadows.sm,
    },
    categoryLabel: { fontSize: typography.sizes.xs, color: colors.text, marginTop: 6, textAlign: 'center', fontWeight: '500' },

    tipsRow: { flexDirection: 'row', paddingHorizontal: spacing.base, gap: spacing.sm, marginTop: spacing.md },
    tipCard: {
        flex: 1, alignItems: 'center',
        paddingHorizontal: spacing.sm, paddingVertical: spacing.md, borderRadius: borderRadius.lg,
    },
    tipEmoji: { fontSize: 24, marginBottom: 4 },
    tipTitle: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textOnPrimary, textAlign: 'center' },
    tipText: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2, textAlign: 'center', lineHeight: 13 },

    sectionTitle: {
        fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text,
        paddingHorizontal: spacing.base, marginTop: spacing.lg, marginBottom: spacing.md,
    },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.base, gap: spacing.md },
    actionCard: {
        width: '47%', padding: spacing.base, borderRadius: borderRadius.lg,
        ...shadows.md, minHeight: 110,
    },
    actionEmoji: { fontSize: 28, marginBottom: spacing.sm },
    actionTitle: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.textOnPrimary },
    actionDesc: { fontSize: typography.sizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

    soilCard: {
        flexDirection: 'row', marginHorizontal: spacing.base, backgroundColor: colors.surface,
        borderRadius: borderRadius.lg, ...shadows.md, overflow: 'hidden',
    },
    soilLeft: { backgroundColor: colors.accentLighter, padding: spacing.xl, justifyContent: 'center' },
    soilRight: { flex: 1, padding: spacing.base },
    soilTitle: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.text },
    soilDesc: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
    soilCta: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.primary, marginTop: spacing.sm },

    planningRow: { flexDirection: 'row', paddingHorizontal: spacing.base, gap: spacing.md },
    planCard: {
        flex: 1, backgroundColor: colors.surface, padding: spacing.base,
        borderRadius: borderRadius.lg, ...shadows.sm, alignItems: 'center',
    },
    planTitle: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
    planDesc: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
});
