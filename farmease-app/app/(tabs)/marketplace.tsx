import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import SearchBar from '../../components/ui/SearchBar';
import CategoryPill from '../../components/ui/CategoryPill';
import { CROP_CATEGORIES } from '../../utils/constants';
import { useAuthStore } from '../../store/useAuthStore';
import { formatPrice } from '../../utils/helpers';
import { fetchProducts, Product } from '../../services/marketplace';
import MarketplaceLoader from '../../components/ui/MarketplaceLoader';
import { usePreloadTranslations } from '../../hooks/useTranslation';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

export default function MarketplaceScreen() {
    const router = useRouter();
    const { role } = useAuthStore();
    const { t } = usePreloadTranslations([
        'marketplace.title',
        'marketplace.mandiTitle',
        'marketplace.mandiSubtext',
        'marketplace.addToCart',
        'marketplace.noProducts',
        'marketplace.noProductsDesc',
    ]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProducts = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            setError(null);

            const data = await fetchProducts({
                category: selectedCategory,
                search: search.trim() || undefined,
            });

            setProducts(data);
        } catch (err) {
            console.error('Failed to load products:', err);
            setError('Failed to load products. Pull to retry.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedCategory, search]);

    // Fetch products on mount and filter changes
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadProducts(true);
    }, [loadProducts]);

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Marketplace</Text>
                {role === 'farmer' && (
                    <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-product' as any)}>
                        <Text style={styles.addBtnText}>+ List Crop</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollArea}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
                }
            >
                <SearchBar value={search} onChangeText={setSearch} onFilterPress={() => { }} />
                <CategoryPill categories={CROP_CATEGORIES} selected={selectedCategory} onSelect={setSelectedCategory} />

                {/* Mandi Prices Banner */}
                <TouchableOpacity style={styles.mandiBanner}>
                    <Text style={{ fontSize: 20 }}>📈</Text>
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Text style={styles.mandiTitle}>Today's Mandi Prices</Text>
                        <Text style={styles.mandiSubtext}>Tomato ₹40/kg ↑ • Rice ₹120/kg → • Wheat ₹35/kg ↓</Text>
                    </View>
                    <Text style={styles.mandiArrow}>→</Text>
                </TouchableOpacity>

                {/* Loading State */}
                {loading && (
                    <View style={styles.centerState}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.stateText}>Loading products...</Text>
                    </View>
                )}

                {/* Error State */}
                {!loading && error && (
                    <View style={styles.centerState}>
                        <Text style={{ fontSize: 40 }}>😕</Text>
                        <Text style={styles.stateText}>{error}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={() => loadProducts()}>
                            <Text style={styles.retryBtnText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Empty State */}
                {!loading && !error && products.length === 0 && (
                    <View style={styles.centerState}>
                        <Text style={{ fontSize: 40 }}>🌾</Text>
                        <Text style={styles.stateText}>No products found</Text>
                        <Text style={styles.stateSubtext}>Try a different category or search term</Text>
                    </View>
                )}

                {/* Product Grid */}
                {!loading && !error && products.length > 0 && (
                    <View style={styles.productGrid}>
                        {products.map((product) => (
                            <TouchableOpacity
                                key={product.id}
                                style={styles.productCard}
                                onPress={() => router.push({ pathname: '/product-detail', params: { id: product.id } } as any)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.productImageBox}>
                                    {product.image_url ? (
                                        <Image
                                            source={{ uri: product.image_url }}
                                            style={styles.productImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Text style={{ fontSize: 40 }}>🌾</Text>
                                    )}
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryBadgeText}>{product.category}</Text>
                                    </View>
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                                    <Text style={styles.productPrice}>{formatPrice(product.price)}/{product.unit}</Text>
                                    <Text style={styles.productSeller} numberOfLines={1}>🧑‍🌾 {product.seller_name}</Text>
                                    <Text style={styles.productLocation} numberOfLines={1}>📍 {product.location || product.seller_location || 'India'}</Text>
                                </View>
                                <TouchableOpacity style={styles.cartBtn}>
                                    <Text style={styles.cartBtnText}>Add to Cart</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.base, paddingTop: STATUSBAR_HEIGHT + spacing.sm, paddingBottom: spacing.sm,
        backgroundColor: colors.background,
    },
    title: { fontSize: typography.sizes['2xl'], fontWeight: '700', color: colors.text },
    addBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderRadius: borderRadius.pill },
    addBtnText: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.textOnPrimary },
    scrollArea: { flex: 1 },
    mandiBanner: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.base,
        backgroundColor: colors.warningLight, padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.md,
    },
    mandiTitle: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text },
    mandiSubtext: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
    mandiArrow: { fontSize: typography.sizes.lg, color: colors.textSecondary },

    // States
    centerState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: spacing.md },
    stateText: { fontSize: typography.sizes.base, fontWeight: '500', color: colors.textSecondary },
    stateSubtext: { fontSize: typography.sizes.sm, color: colors.textLight },
    retryBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.pill, marginTop: spacing.sm },
    retryBtnText: { color: colors.textOnPrimary, fontWeight: '600', fontSize: typography.sizes.sm },

    // Product Grid
    productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.base, gap: spacing.md, paddingBottom: 100 },
    productCard: {
        width: '47%', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        ...shadows.sm, overflow: 'hidden',
    },
    productImageBox: {
        height: 110, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
    },
    productImage: { width: '100%', height: '100%' },
    categoryBadge: {
        position: 'absolute', top: spacing.xs, left: spacing.xs,
        backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm,
    },
    categoryBadgeText: { color: colors.textOnPrimary, fontSize: 10, fontWeight: '600' },
    productInfo: { padding: spacing.sm },
    productName: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.text },
    productPrice: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary, marginTop: 2 },
    productSeller: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 4 },
    productLocation: { fontSize: typography.sizes.xs, color: colors.textLight, marginTop: 2 },
    cartBtn: { backgroundColor: colors.primary, margin: spacing.sm, paddingVertical: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' },
    cartBtnText: { fontSize: typography.sizes.xs, fontWeight: '600', color: colors.textOnPrimary },
});
