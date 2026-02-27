import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { getGreeting } from '../../utils/helpers';
import { formatPrice } from '../../utils/helpers';
import SearchBar from '../../components/ui/SearchBar';
import CategoryPill from '../../components/ui/CategoryPill';
import { CROP_CATEGORIES } from '../../utils/constants';
import { useTranslation } from '../../hooks/useTranslation';
import ChatFAB from '../../components/chat/ChatFAB';
import ChatbotModal from '../../components/chat/ChatbotModal';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

// Featured deals for buyers
const FEATURED_DEALS = [
    { id: '1', nameKey: 'marketplace.deals.tomatoes', price: 45, originalPrice: 60, unit: 'kg', seller: 'Rajesh Kumar', location: 'Nashik, MH', emoji: '🍅', discount: '25% OFF' },
    { id: '2', nameKey: 'marketplace.deals.rice', price: 85, originalPrice: 110, unit: 'kg', seller: 'Lakshmi Singh', location: 'Vijayawada, AP', emoji: '🍚', discount: '23% OFF' },
    { id: '3', nameKey: 'marketplace.deals.mangoes', price: 150, originalPrice: 200, unit: 'kg', seller: 'Kiran Patil', location: 'Ratnagiri, MH', emoji: '🥭', discount: '25% OFF' },
];



// Nearby farmers
const NEARBY_FARMERS = [
    { id: '1', name: 'Rajesh Kumar', emoji: '👨‍🌾', location: 'Nashik, MH', rating: 4.8, products: 12, distance: '2.3 km' },
    { id: '2', name: 'Lakshmi Singh', emoji: '👩‍🌾', location: 'Pune, MH', rating: 4.9, products: 8, distance: '3.1 km' },
    { id: '3', name: 'Amit Patel', emoji: '👨‍🌾', location: 'Nashik, MH', rating: 4.7, products: 15, distance: '4.5 km' },
];

export default function BuyerHomeScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [showChat, setShowChat] = useState(false);

    const BROWSE_CATEGORIES = [
        { id: '1', name: t('buyerDashboard.vegetables'), emoji: '🥬', color: '#E8F5E9', count: '120+ items' },
        { id: '2', name: t('buyerDashboard.fruits'), emoji: '🍎', color: '#FFF3E0', count: '80+ items' },
        { id: '3', name: t('buyerDashboard.grains'), emoji: '🌾', color: '#FFF8E1', count: '60+ items' },
        { id: '4', name: t('buyerDashboard.spices'), emoji: '🌶️', color: '#FCE4EC', count: '45+ items' },
        { id: '5', name: t('buyerDashboard.pulses'), emoji: '🫘', color: '#F3E5F5', count: '35+ items' },
        { id: '6', name: t('buyerDashboard.dairy'), emoji: '🥛', color: '#E3F2FD', count: '25+ items' },
    ];

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <View style={{ flex: 1 }}>
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()}, {user?.name || 'Buyer'}!</Text>
                    <Text style={styles.subtitle}>{t('buyerDashboard.subtitle')}</Text>
                </View>
                <TouchableOpacity style={styles.cartBadge} onPress={() => router.push('/cart' as any)}>
                    <Text style={styles.cartIcon}>🛒</Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search fresh produce..." />

            {/* Featured Deals */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('buyerDashboard.todaysDeals')}</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace' as any)}>
                        <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsRow}>
                    {FEATURED_DEALS.map((deal) => (
                        <TouchableOpacity
                            key={deal.id}
                            style={styles.dealCard}
                            activeOpacity={0.8}
                            onPress={() => router.push({ pathname: '/product-detail', params: deal } as any)}
                        >
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>{deal.discount}</Text>
                            </View>
                            <View style={styles.dealImageBox}>
                                <Text style={{ fontSize: 40 }}>{deal.emoji}</Text>
                            </View>
                            <View style={styles.dealInfo}>
                                <Text style={styles.dealName} numberOfLines={1}>{t(deal.nameKey)}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.dealPrice}>{formatPrice(deal.price)}/{deal.unit}</Text>
                                    <Text style={styles.originalPrice}>₹{deal.originalPrice}</Text>
                                </View>
                                <Text style={styles.dealSeller} numberOfLines={1}>🧑‍🌾 {deal.seller}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Browse Categories */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('buyerDashboard.browseCategories')}</Text>
                <View style={styles.categoryGrid}>
                    {BROWSE_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryCard, { backgroundColor: cat.color }]}
                            activeOpacity={0.8}
                            onPress={() => router.push('/(tabs)/marketplace' as any)}
                        >
                            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                            <Text style={styles.categoryName}>{cat.name}</Text>
                            <Text style={styles.categoryCount}>{cat.count}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Nearby Farmers */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('buyerDashboard.nearbyFarmers')}</Text>
                {NEARBY_FARMERS.map((farmer) => (
                    <TouchableOpacity key={farmer.id} style={styles.farmerCard} activeOpacity={0.8}>
                        <View style={styles.farmerAvatar}>
                            <Text style={{ fontSize: 28 }}>{farmer.emoji}</Text>
                        </View>
                        <View style={styles.farmerInfo}>
                            <Text style={styles.farmerName}>{farmer.name}</Text>
                            <Text style={styles.farmerLocation}>📍 {farmer.location} · {farmer.distance}</Text>
                            <Text style={styles.farmerMeta}>⭐ {farmer.rating} · {farmer.products} products</Text>
                        </View>
                        <View style={styles.visitBadge}>
                            <Text style={styles.visitText}>{t('buyerDashboard.visit')}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Quick actions for buyer */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('buyerDashboard.quickActions')}</Text>
                <View style={styles.quickRow}>
                    <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#8B6F47' }]} onPress={() => router.push('/(tabs)/marketplace' as any)}>
                        <Text style={styles.quickEmoji}>🛍️</Text>
                        <Text style={styles.quickLabel}>{t('buyerDashboard.shopNow')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#B8860B' }]} onPress={() => router.push('/cart' as any)}>
                        <Text style={styles.quickEmoji}>🛒</Text>
                        <Text style={styles.quickLabel}>{t('buyerDashboard.myCart')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#C06014' }]} onPress={() => router.push('/schemes' as any)}>
                        <Text style={styles.quickEmoji}>📋</Text>
                        <Text style={styles.quickLabel}>{t('buyerDashboard.schemes')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Mandi Prices */}
            <TouchableOpacity style={styles.mandiBanner}>
                <Text style={{ fontSize: 20 }}>📈</Text>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.mandiTitle}>{t('buyerDashboard.mandiTitle')}</Text>
                    <Text style={styles.mandiSubtext}>{t('buyerDashboard.mandiSubtext')}</Text>
                </View>
                <Text style={{ fontSize: typography.sizes.lg, color: colors.textSecondary }}>→</Text>
            </TouchableOpacity>

            <View style={{ height: spacing['3xl'] }} />
        </ScrollView>

            {/* AI Chatbot FAB */}
            <ChatFAB onPress={() => setShowChat(true)} />
            <ChatbotModal visible={showChat} onClose={() => setShowChat(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.base, paddingTop: STATUSBAR_HEIGHT + spacing.sm, paddingBottom: spacing.md,
        backgroundColor: '#8B6F47', borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },
    greeting: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.textOnPrimary },
    subtitle: { fontSize: typography.sizes.sm, color: '#F5E6D0', marginTop: 4 },
    cartBadge: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
    },
    cartIcon: { fontSize: 22 },

    section: { marginTop: spacing.lg, paddingHorizontal: spacing.base },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    sectionTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
    seeAll: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.primary },

    // Deals
    dealsRow: { gap: spacing.md },
    dealCard: {
        width: 180, backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        ...shadows.sm, overflow: 'hidden',
    },
    discountBadge: {
        position: 'absolute', top: spacing.sm, left: spacing.sm, zIndex: 1,
        backgroundColor: '#E63946', paddingHorizontal: spacing.sm, paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    discountText: { fontSize: 10, fontWeight: '700', color: '#fff' },
    dealImageBox: { height: 100, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
    dealInfo: { padding: spacing.sm },
    dealName: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
    dealPrice: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.primary },
    originalPrice: { fontSize: typography.sizes.xs, color: colors.textLight, textDecorationLine: 'line-through' },
    dealSeller: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 4 },

    // Categories
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    categoryCard: {
        width: '30%', padding: spacing.md, borderRadius: borderRadius.lg,
        alignItems: 'center', ...shadows.sm,
    },
    categoryEmoji: { fontSize: 28, marginBottom: spacing.xs },
    categoryName: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text },
    categoryCount: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },

    // Farmers
    farmerCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
        padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.sm, ...shadows.sm,
    },
    farmerAvatar: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: colors.accentLighter, justifyContent: 'center', alignItems: 'center',
    },
    farmerInfo: { flex: 1, marginLeft: spacing.md },
    farmerName: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.text },
    farmerLocation: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
    farmerMeta: { fontSize: typography.sizes.xs, color: colors.primary, fontWeight: '500', marginTop: 2 },
    visitBadge: {
        backgroundColor: colors.primary + '15', paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs, borderRadius: borderRadius.pill,
    },
    visitText: { fontSize: typography.sizes.xs, fontWeight: '600', color: colors.primary },

    // Quick Actions
    quickRow: { flexDirection: 'row', gap: spacing.md },
    quickCard: {
        flex: 1, padding: spacing.base, borderRadius: borderRadius.lg,
        alignItems: 'center', ...shadows.md,
    },
    quickEmoji: { fontSize: 28, marginBottom: spacing.xs },
    quickLabel: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.textOnPrimary },

    // Mandi banner
    mandiBanner: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.base,
        marginTop: spacing.lg,
        backgroundColor: colors.warningLight, padding: spacing.md, borderRadius: borderRadius.lg,
    },
    mandiTitle: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text },
    mandiSubtext: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
});
