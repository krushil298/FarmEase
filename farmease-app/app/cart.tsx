import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { placeOrder } from '../services/orders';
import { colors, borderRadius, spacing, typography, shadows } from '../utils/theme';
import { useTranslation } from '../hooks/useTranslation';
import LocationPickerModal from '../components/location/LocationPickerModal';
import { LocationCoords } from '../services/location';

const DELIVERY_FEE = 49;

export default function CartScreen() {
    const router = useRouter();
    const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
    const { user } = useAuthStore();
    const { t } = useTranslation();

    const [deliveryAddress, setDeliveryAddress] = useState(user?.delivery_address || '');
    const [deliveryCoords, setDeliveryCoords] = useState<LocationCoords | null>(null);
    const [placing, setPlacing] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    const subtotal = getTotal();
    const total = items.length > 0 ? subtotal + DELIVERY_FEE : 0;

    const handlePlaceOrder = async () => {
        if (!user?.id) {
            Alert.alert('Login Required', 'Please log in to place an order.');
            return;
        }

        if (!deliveryAddress.trim()) {
            Alert.alert('Address Required', 'Please enter a delivery address to continue.');
            return;
        }

        setPlacing(true);

        const orderItems = items.map((item) => ({
            product_id: item.id,
            seller_id: item.seller_id,
            quantity: item.quantity,
            unit_price: item.price,
            product_name: item.name,
        }));

        const result = await placeOrder(user.id, orderItems, deliveryAddress.trim());

        setPlacing(false);

        if (result.success) {
            clearCart();
            Alert.alert(
                '🎉 Order Placed!',
                `Your order of ₹${total.toLocaleString('en-IN')} has been placed successfully!\n\n${result.orderIds.length} item(s) ordered.\nYou'll be contacted by the seller(s) shortly.`,
                [{ text: 'Back to Marketplace', onPress: () => router.back() }]
            );
        } else {
            Alert.alert(
                'Order Failed',
                result.error || 'Something went wrong. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const renderCartItem = ({ item }: { item: typeof items[0] }) => (
        <View style={styles.cartItem}>
            {/* Product Image */}
            {item.image_url ? (
                <Image
                    source={{ uri: item.image_url }}
                    style={styles.itemImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                    <Text style={styles.placeholderEmoji}>🌾</Text>
                </View>
            )}

            {/* Item Info */}
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemSeller}>🧑‍🌾 {item.seller_name}</Text>
                <Text style={styles.itemPrice}>
                    ₹{item.price}/{item.unit}
                </Text>
            </View>

            {/* Quantity Controls */}
            <View style={styles.quantityControls}>
                <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.qtyButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Remove */}
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
                activeOpacity={0.7}
            >
                <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>{t('cart.emptyTitle') || 'Your cart is empty'}</Text>
            <Text style={styles.emptySubtitle}>{t('cart.emptySubtitle') || 'Add some fresh produce from the marketplace'}</Text>
            <Button title={t('cart.browseMarketplace') || 'Browse Marketplace'} onPress={() => router.back()} variant="outline" style={styles.browseButton} />
        </View>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Cart"
                subtitle={items.length > 0 ? `${items.length} item${items.length > 1 ? 's' : ''}` : undefined}
                showBack
                onBack={() => router.back()}
                rightAction={
                    items.length > 0 ? (
                        <TouchableOpacity onPress={clearCart} activeOpacity={0.7}>
                            <Text style={styles.clearText}>{t('cart.clearAll') || 'Clear All'}</Text>
                        </TouchableOpacity>
                    ) : undefined
                }
            />

            <FlatList
                data={items}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={
                    items.length > 0 ? (
                        <View style={styles.addressSection}>
                            <View style={styles.addressHeaderRow}>
                                <Text style={styles.addressLabel}>📍 Delivery Address</Text>
                                <TouchableOpacity onPress={() => setShowLocationPicker(true)}>
                                    <Text style={styles.changeAddressText}>
                                        {deliveryAddress ? 'Change' : 'Select on Map'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.addressDisplayBox}
                                onPress={() => setShowLocationPicker(true)}
                                activeOpacity={0.7}
                            >
                                {deliveryAddress ? (
                                    <Text style={styles.addressDisplayText}>{deliveryAddress}</Text>
                                ) : (
                                    <Text style={styles.addressPlaceholderText}>Tap to select delivery location...</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />

            {/* Order Summary & Checkout */}
            {items.length > 0 && (
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>{t('cart.orderSummary') || 'Order Summary'}</Text>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{t('cart.subtotal') || 'Subtotal'}</Text>
                            <Text style={styles.summaryValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{t('cart.deliveryFee') || 'Delivery Fee'}</Text>
                            <Text style={styles.summaryValue}>₹{DELIVERY_FEE}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>{t('cart.total') || 'Total'}</Text>
                            <Text style={styles.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
                        </View>

                        <Button
                            title={placing ? 'Placing Order...' : `Place Order  ·  ₹${total.toLocaleString('en-IN')}`}
                            onPress={handlePlaceOrder}
                            fullWidth
                            size="lg"
                            style={styles.checkoutButton}
                            disabled={placing}
                        />
                        {placing && (
                            <ActivityIndicator
                                size="small"
                                color={colors.primary}
                                style={{ marginTop: spacing.sm }}
                            />
                        )}
                    </View>
                </View>
            )}

            <LocationPickerModal
                visible={showLocationPicker}
                initialCoords={deliveryCoords}
                onClose={() => setShowLocationPicker(false)}
                onConfirm={(coords, address) => {
                    setDeliveryCoords(coords);
                    setDeliveryAddress(address);
                    setShowLocationPicker(false);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: spacing.base,
        paddingBottom: 300,
    },
    clearText: {
        color: colors.error,
        fontSize: typography.sizes.md,
        fontWeight: '600',
    },

    // Cart Item
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    itemImage: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.md,
    },
    itemImagePlaceholder: {
        backgroundColor: colors.accentLighter,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderEmoji: {
        fontSize: 28,
    },
    itemInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    itemName: {
        fontSize: typography.sizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    itemSeller: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    itemPrice: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 2,
    },

    // Quantity
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginLeft: spacing.sm,
    },
    qtyButton: {
        width: 28,
        height: 28,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyButtonText: {
        fontSize: typography.sizes.base,
        fontWeight: '700',
        color: colors.primary,
    },
    qtyValue: {
        fontSize: typography.sizes.md,
        fontWeight: '600',
        color: colors.text,
        minWidth: 20,
        textAlign: 'center',
    },

    // Remove
    removeButton: {
        marginLeft: spacing.sm,
        padding: spacing.xs,
    },
    removeIcon: {
        fontSize: 14,
        color: colors.textLight,
    },

    // Delivery Address
    addressSection: {
        marginTop: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.base,
        ...shadows.sm,
    },
    addressLabel: {
        fontSize: typography.sizes.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    addressHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    changeAddressText: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    addressDisplayBox: {
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 60,
        justifyContent: 'center',
    },
    addressDisplayText: {
        fontSize: typography.sizes.base,
        color: colors.text,
        lineHeight: 22,
    },
    addressPlaceholderText: {
        fontSize: typography.sizes.base,
        color: colors.textLight,
        fontStyle: 'italic',
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyIcon: {
        fontSize: 72,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing['2xl'],
        marginBottom: spacing.xl,
    },
    browseButton: {
        minWidth: 200,
    },

    // Summary
    summaryContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    summaryCard: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.xl,
        ...shadows.lg,
    },
    summaryTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    summaryLabel: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    summaryValue: {
        fontSize: typography.sizes.md,
        color: colors.text,
        fontWeight: '500',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.md,
        marginTop: spacing.sm,
    },
    totalLabel: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    totalValue: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.primary,
    },
    checkoutButton: {
        marginTop: spacing.lg,
    },
});
