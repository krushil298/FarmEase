import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, ActivityIndicator, Image, RefreshControl, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import SearchBar from '../../components/ui/SearchBar';
import CategoryPill from '../../components/ui/CategoryPill';
import RadiusPill, { RadiusOption } from '../../components/ui/RadiusPill';
import { CROP_CATEGORIES } from '../../utils/constants';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { formatPrice } from '../../utils/helpers';
import { fetchProducts, Product } from '../../services/marketplace';
import MarketplaceLoader from '../../components/ui/MarketplaceLoader';
import { usePreloadTranslations } from '../../hooks/useTranslation';
import { haversineDistance, formatDistance } from '../../utils/distance';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

const RADIUS_OPTIONS: RadiusOption[] = [
    { label: 'Anywhere', value: null },
    { label: '< 10 km', value: 10 },
    { label: '< 25 km', value: 25 },
    { label: '< 50 km', value: 50 },
    { label: '< 100 km', value: 100 },
];

export default function MarketplaceScreen() {
    const router = useRouter();
    const { role, user } = useAuthStore();
    const { addItem, getItemCount } = useCartStore();
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
    const [radius, setRadius] = useState<number | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cartCount = getItemCount();

    const handleRadiusSelect = (val: number | null) => {
        if (val !== null && (!user?.lat || !user?.lng)) {
            Alert.alert(
                'Location Required',
                'Please update your profile field "Farm/Home Location" using the map to use the radius filter.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Update Profile', onPress: () => router.push('/profile') }
                ]
            );
            return;
        }
        setRadius(val);
    };

    const loadProducts = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            setError(null);

            const data = await fetchProducts({
                category: selectedCategory,
                search: search.trim() || undefined,
                includeSold: true, // Show sold products with SOLD badge
                radiusKm: radius || undefined,
                userLat: user?.lat,
                userLng: user?.lng,
            });

            setProducts(data);
        } catch (err) {
            console.error('Failed to load products:', err);
            setError('Failed to load products. Pull to retry.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedCategory, search, radius, user?.lat, user?.lng]);

    // Fetch products on mount and filter changes
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Re-fetch when screen comes back into focus (e.g., after checkout)
    useFocusEffect(
        useCallback(() => {
            loadProducts(true);
        }, [loadProducts])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadProducts(true);
    }, [loadProducts]);

    const handleAddToCart = (product: Product) => {
        if (!product.is_available || product.quantity <= 0) {
            Alert.alert('Sold Out', 'This product is no longer available.');
            return;
        }
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            unit: product.unit,
            image_url: product.image_url,
            seller_name: product.seller_name,
            seller_id: product.seller_id,
        });
        Alert.alert('Added! ✓', `${product.name} added to cart`, [
            { text: 'Continue', style: 'cancel' },
            { text: 'View Cart', onPress: () => router.push('/cart') },
        ]);
    };

    const isSoldOut = (product: Product) => !product.is_available || product.quantity <= 0;

    const getDistanceText = (product: Product): string | null => {
        if (user?.lat && user?.lng && product.lat && product.lng) {
            const km = haversineDistance(user.lat, user.lng, product.lat, product.lng);
            return formatDistance(km);
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Marketplace</Text>
                <View style={styles.headerRight}>
                    {/* Cart Button */}
                    <TouchableOpacity style={styles.cartHeaderBtn} onPress={() => router.push('/cart')}>
                        <Text style={styles.cartHeaderIcon}>🛒</Text>
                        {cartCount > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    {role === 'farmer' && (
                        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-product' as any)}>
                            <Text style={styles.addBtnText}>+ List Crop</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
                <RadiusPill options={RADIUS_OPTIONS} selectedValue={radius} onSelect={handleRadiusSelect} />

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
                        {products.map((product) => {
                            const soldOut = isSoldOut(product);
                            return (
                                <TouchableOpacity
                                    key={product.id}
                                    style={[styles.productCard, soldOut && styles.productCardSold]}
                                    onPress={() => router.push({ pathname: '/product-detail', params: { id: product.id } } as any)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.productImageBox}>
                                        {product.image_url ? (
                                            <Image
                                                source={{ uri: product.image_url }}
                                                style={[styles.productImage, soldOut && styles.soldImage]}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <Text style={{ fontSize: 40 }}>🌾</Text>
                                        )}
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryBadgeText}>{product.category}</Text>
                                        </View>

                                        {/* SOLD Overlay */}
                                        {soldOut && (
                                            <View style={styles.soldOverlay}>
                                                <View style={styles.soldBanner}>
                                                    <Text style={styles.soldBannerText}>SOLD</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.productInfo}>
                                        <Text style={[styles.productName, soldOut && styles.soldText]} numberOfLines={1}>{product.name}</Text>
                                        <Text style={[styles.productPrice, soldOut && styles.soldText]}>{formatPrice(product.price)}/{product.unit}</Text>
                                        <Text style={styles.productSeller} numberOfLines={1}>🧑‍🌾 {product.seller_name}</Text>
                                        {getDistanceText(product) && (
                                            <Text style={styles.productLocation} numberOfLines={1}>📍 {getDistanceText(product)} away</Text>
                                        )}
                                    </View>
                                    {soldOut ? (
                                        <View style={[styles.cartBtn, styles.soldCartBtn]}>
                                            <Text style={[styles.cartBtnText, styles.soldCartBtnText]}>Sold Out</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.cartBtn}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(product);
                                            }}
                                        >
                                            <Text style={styles.cartBtnText}>Add to Cart</Text>
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
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

    // Cart Header
    cartHeaderBtn: {
        position: 'relative',
        padding: spacing.sm,
    },
    cartHeaderIcon: {
        fontSize: 22,
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    cartBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },

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
    productCardSold: {
        opacity: 0.85,
    },
    productImageBox: {
        height: 110, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
    },
    productImage: { width: '100%', height: '100%' },
    soldImage: { opacity: 0.4 },
    categoryBadge: {
        position: 'absolute', top: spacing.xs, left: spacing.xs,
        backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm,
    },
    categoryBadgeText: { color: colors.textOnPrimary, fontSize: 10, fontWeight: '600' },

    // SOLD overlay
    soldOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    soldBanner: {
        backgroundColor: 'rgba(230, 57, 70, 0.9)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        transform: [{ rotate: '-20deg' }],
    },
    soldBannerText: {
        color: '#FFF',
        fontSize: typography.sizes.lg,
        fontWeight: '800',
        letterSpacing: 2,
    },

    productInfo: { padding: spacing.sm },
    productName: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.text },
    productPrice: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary, marginTop: 2 },
    productSeller: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 4 },
    productLocation: { fontSize: typography.sizes.xs, color: colors.textLight, marginTop: 2 },
    soldText: { color: colors.textLight },
    cartBtn: { backgroundColor: colors.primary, margin: spacing.sm, paddingVertical: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' },
    cartBtnText: { fontSize: typography.sizes.xs, fontWeight: '600', color: colors.textOnPrimary },
    soldCartBtn: { backgroundColor: colors.divider },
    soldCartBtnText: { color: colors.textLight },
});
