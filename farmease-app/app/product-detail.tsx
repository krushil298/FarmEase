import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import { useCartStore } from '../store/useCartStore';
import { colors, borderRadius, spacing, typography, shadows } from '../utils/theme';
import { fetchProductById, Product } from '../services/marketplace';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { addItem } = useCartStore();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    const isSoldOut = product ? (!product.is_available || product.quantity <= 0) : false;
    const maxQuantity = product ? Math.max(0, product.quantity) : 0;

    useEffect(() => {
        if (id) {
            setLoading(true);
            fetchProductById(id)
                .then(setProduct)
                .finally(() => setLoading(false));
        }
    }, [id]);

    // Cap quantity to available stock
    useEffect(() => {
        if (product && quantity > maxQuantity && maxQuantity > 0) {
            setQuantity(maxQuantity);
        }
    }, [product, maxQuantity]);

    const handleAddToCart = () => {
        if (!product || isSoldOut) return;
        for (let i = 0; i < quantity; i++) {
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
        }
        Alert.alert('Added to Cart', `${quantity} × ${product.name} added to your cart`, [
            { text: 'Continue Shopping', onPress: () => router.back() },
            { text: 'View Cart', onPress: () => router.push('/cart') },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.loader}>
                <Text style={styles.errorText}>Product not found</Text>
                <Button title="Go Back" onPress={() => router.back()} variant="outline" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                title="Product Details"
                showBack
                onBack={() => router.back()}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    {product.image_url ? (
                        <Image
                            source={{ uri: product.image_url }}
                            style={[styles.image, isSoldOut && styles.soldImage]}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.image, styles.imagePlaceholder]}>
                            <Text style={styles.placeholderEmoji}>🌾</Text>
                        </View>
                    )}
                    {/* Category Badge */}
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{product.category}</Text>
                    </View>

                    {/* SOLD OUT Banner */}
                    {isSoldOut && (
                        <View style={styles.soldOverlay}>
                            <View style={styles.soldBanner}>
                                <Text style={styles.soldBannerText}>SOLD OUT</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{product.price}</Text>
                        <Text style={styles.unit}>per {product.unit}</Text>
                    </View>
                    {isSoldOut ? (
                        <View style={styles.soldOutBadge}>
                            <View style={styles.soldDot} />
                            <Text style={styles.soldOutText}>Sold Out</Text>
                        </View>
                    ) : (
                        <View style={styles.availabilityBadge}>
                            <View style={styles.dot} />
                            <Text style={styles.availabilityText}>
                                {product.quantity} {product.unit} available
                            </Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                {product.description ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{product.description}</Text>
                    </View>
                ) : null}

                {/* Seller Info */}
                <View style={styles.sellerCard}>
                    <Text style={styles.sectionTitle}>Seller Information</Text>
                    <View style={styles.sellerRow}>
                        <View style={styles.sellerAvatar}>
                            <Text style={styles.sellerAvatarText}>
                                {product.seller_name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.sellerInfo}>
                            <Text style={styles.sellerName}>{product.seller_name}</Text>
                            {product.seller_location && (
                                <Text style={styles.sellerDetail}>📍 {product.seller_location}</Text>
                            )}
                            {product.seller_phone && (
                                <Text style={styles.sellerDetail}>📞 {product.seller_phone}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Quantity Selector — only if not sold out */}
                {!isSoldOut && (
                    <View style={styles.quantitySection}>
                        <Text style={styles.sectionTitle}>Quantity</Text>
                        <View style={styles.quantityRow}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.quantityButtonText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityValue}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                            <Text style={styles.totalPrice}>
                                ₹{(product.price * quantity).toLocaleString('en-IN')}
                            </Text>
                        </View>
                        {quantity >= maxQuantity && (
                            <Text style={styles.maxQtyHint}>Max available: {maxQuantity} {product.unit}</Text>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Bottom CTA */}
            <View style={styles.bottomBar}>
                {isSoldOut ? (
                    <View style={styles.soldOutBottomBtn}>
                        <Text style={styles.soldOutBottomText}>🚫  Sold Out</Text>
                    </View>
                ) : (
                    <Button
                        title={`Add to Cart  ·  ₹${(product.price * quantity).toLocaleString('en-IN')}`}
                        onPress={handleAddToCart}
                        fullWidth
                        size="lg"
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        gap: spacing.lg,
    },
    errorText: {
        fontSize: typography.sizes.lg,
        color: colors.textSecondary,
    },
    content: {
        paddingBottom: 100,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 280,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    soldImage: {
        opacity: 0.4,
    },
    imagePlaceholder: {
        backgroundColor: colors.accentLighter,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderEmoji: {
        fontSize: 80,
    },
    badge: {
        position: 'absolute',
        bottom: spacing.md,
        left: spacing.md,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.pill,
    },
    badgeText: {
        color: colors.textOnPrimary,
        fontSize: typography.sizes.sm,
        fontWeight: '600',
    },

    // SOLD overlay
    soldOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    soldBanner: {
        backgroundColor: 'rgba(230, 57, 70, 0.9)',
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        transform: [{ rotate: '-15deg' }],
    },
    soldBannerText: {
        color: '#FFF',
        fontSize: typography.sizes['2xl'],
        fontWeight: '800',
        letterSpacing: 3,
    },

    infoSection: {
        padding: spacing.base,
    },
    productName: {
        fontSize: typography.sizes['2xl'],
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    price: {
        fontSize: typography.sizes['2xl'],
        fontWeight: '700',
        color: colors.primary,
    },
    unit: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.successLight,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.pill,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.success,
    },
    availabilityText: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: '500',
    },
    soldOutBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.errorLight,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.pill,
        alignSelf: 'flex-start',
    },
    soldDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.error,
    },
    soldOutText: {
        fontSize: typography.sizes.sm,
        color: colors.error,
        fontWeight: '600',
    },

    section: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    description: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    sellerCard: {
        margin: spacing.base,
        padding: spacing.base,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    sellerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sellerAvatarText: {
        color: colors.textOnPrimary,
        fontSize: typography.sizes.xl,
        fontWeight: '700',
    },
    sellerInfo: {
        flex: 1,
    },
    sellerName: {
        fontSize: typography.sizes.base,
        fontWeight: '600',
        color: colors.text,
    },
    sellerDetail: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    quantitySection: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.md,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    quantityButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        borderWidth: 1.5,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.primary,
    },
    quantityValue: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.text,
        minWidth: 32,
        textAlign: 'center',
    },
    totalPrice: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.primary,
        marginLeft: 'auto',
    },
    maxQtyHint: {
        fontSize: typography.sizes.xs,
        color: colors.warning,
        marginTop: spacing.xs,
        fontWeight: '500',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.base,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        ...shadows.lg,
    },
    soldOutBottomBtn: {
        backgroundColor: colors.divider,
        paddingVertical: spacing.base,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    soldOutBottomText: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.textLight,
    },
});
