import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import Header from '../components/ui/Header';
import { useAuthStore } from '../store/useAuthStore';
import { fetchRentals, createRentalRequest, EquipmentRental, RadiusParams } from '../services/rentals';
import { haversineDistance, formatDistance } from '../utils/distance';

const RADIUS_OPTIONS = [
    { label: 'Any', value: null },
    { label: '2 km', value: 2 },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
];

export default function RentalsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
    const [rentals, setRentals] = useState<EquipmentRental[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadRentals = useCallback(async () => {
        setLoading(true);
        try {
            let params: RadiusParams | undefined = undefined;
            if (selectedRadius && user?.lat && user?.lng) {
                params = {
                    lat: user.lat,
                    lng: user.lng,
                    radius_km: selectedRadius,
                };
            }

            const data = await fetchRentals(params);

            // Format distances locally if not using the RPC, or just format the returned distances
            const formatted = data.map(item => {
                let distanceText = null;
                // If the RPC returned a distance field
                if (item.distance !== undefined && item.distance !== null) {
                    distanceText = formatDistance(item.distance);
                }
                // Else calculate it locally
                else if (user?.lat && user?.lng && item.lat && item.lng) {
                    const km = haversineDistance(user.lat, user.lng, item.lat, item.lng);
                    distanceText = formatDistance(km);
                }

                return { ...item, distanceText };
            });

            setRentals(formatted);
        } catch (error) {
            console.error('Failed to load rentals:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedRadius, user]);

    useEffect(() => {
        loadRentals();
    }, [loadRentals]);

    const handleRadiusSelect = (value: number | null) => {
        if (value !== null && (!user?.lat || !user?.lng)) {
            Alert.alert(
                'Location Required',
                'Your exact location is not set. Please update your profile location to use the distance filter.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Update Profile', onPress: () => router.push('/(tabs)/profile') }
                ]
            );
            return;
        }
        setSelectedRadius(value);
    };

    const handleRequest = async (item: EquipmentRental) => {
        if (!user) {
            return Alert.alert('Login Required', 'You must be logged in to request rentals.');
        }

        // Simplistic 1-day booking request from today
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const startStr = today.toISOString().split('T')[0];
        const endStr = tomorrow.toISOString().split('T')[0];

        Alert.alert(
            "Request Rental",
            `Do you want to send a request to ${item.owner?.name || 'the owner'} to rent the ${item.name} for 1 day (₹${item.price_per_day})?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        const result = await createRentalRequest(item, user.id, startStr, endStr);
                        if (result.success) {
                            Alert.alert('Success', 'Rental request sent! The owner will review it soon.');
                        } else {
                            Alert.alert('Error', result.error || 'Failed to send request.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title="Equipment Rental"
                showBack
                rightAction={
                    <TouchableOpacity onPress={() => router.push('/add-rental')} style={styles.addBtn}>
                        <Text style={styles.addBtnText}>+ List Item</Text>
                    </TouchableOpacity>
                }
            />

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Radius:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {RADIUS_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.label}
                            style={[
                                styles.filterPill,
                                selectedRadius === option.value && styles.filterPillActive,
                            ]}
                            onPress={() => handleRadiusSelect(option.value)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedRadius === option.value && styles.filterTextActive,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRentals(); }} />}
            >
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Local Peer-to-Peer Rentals</Text>
                    <Text style={styles.infoText}>
                        Borrow farm equipment directly from nearby farmers. Save money on expensive machinery and help your local community.
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Finding equipment nearby...</Text>
                    </View>
                ) : rentals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No equipment found within this radius.</Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {rentals.map((item: any) => (
                            <View key={item.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.imageContainer}>
                                        <Text style={styles.emoji}>🚜</Text>
                                    </View>
                                    <View style={styles.details}>
                                        <Text style={styles.name}>{item.name}</Text>
                                        <Text style={styles.owner}>Listed by: {item.owner?.name || 'Unknown'}</Text>
                                        <View style={styles.metaRow}>
                                            <Text style={styles.distance}>📍 {item.location || 'India'}{item.distanceText ? ` · ${item.distanceText} away` : ''}</Text>
                                            <Text style={[styles.status, { color: item.is_available ? colors.primary : colors.error }]}>
                                                {item.is_available ? '• Available Now' : '• Unavailable'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.actionRow}>
                                    <Text style={styles.price}>
                                        ₹{item.price_per_day} <Text style={styles.unit}>/ day</Text>
                                    </Text>
                                    {item.owner_id === user?.id ? (
                                        <TouchableOpacity style={[styles.btn, styles.btnOwner]} activeOpacity={0.8}>
                                            <Text style={styles.btnOwnerText}>Your Listing</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.btn, !item.is_available && styles.btnDisabled]}
                                            disabled={!item.is_available}
                                            onPress={() => handleRequest(item)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.btnText}>Request Rental</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                <View style={{ height: spacing['2xl'] }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    addBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    addBtnText: { color: colors.textOnPrimary, fontSize: typography.sizes.sm, fontWeight: '600' },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...shadows.sm,
        zIndex: 1,
    },
    filterLabel: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        color: colors.textSecondary,
        marginRight: spacing.sm,
    },
    filterScroll: { gap: spacing.sm, paddingRight: spacing.xl },
    filterPill: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.pill,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { fontSize: typography.sizes.sm, color: colors.textSecondary, fontWeight: '500' },
    filterTextActive: { color: colors.textOnPrimary, fontWeight: '600' },
    content: { padding: spacing.base },
    infoBox: {
        backgroundColor: colors.surface,
        padding: spacing.base,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    infoTitle: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
    infoText: { fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 20 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
    emptyText: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center' },
    listContainer: { gap: spacing.base },
    card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.base, ...shadows.md },
    cardHeader: { flexDirection: 'row', gap: spacing.base },
    imageContainer: { width: 60, height: 60, backgroundColor: colors.background, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center' },
    emoji: { fontSize: 32 },
    details: { flex: 1, justifyContent: 'center' },
    name: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.text },
    owner: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
    metaRow: { marginTop: 8 },
    distance: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginBottom: 4 },
    status: { fontSize: typography.sizes.xs, fontWeight: '600' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.base },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text },
    unit: { fontSize: typography.sizes.sm, color: colors.textSecondary, fontWeight: '400' },
    btn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.pill },
    btnOwner: { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
    btnDisabled: { backgroundColor: colors.border },
    btnText: { color: colors.textOnPrimary, fontSize: typography.sizes.sm, fontWeight: '600' },
    btnOwnerText: { color: colors.textSecondary, fontSize: typography.sizes.sm, fontWeight: '600' }
});
