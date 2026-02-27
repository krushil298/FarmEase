import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, StatusBar, RefreshControl, Animated, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useRentalStore, EQUIPMENT_OPTIONS } from '../../store/useRentalStore';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

// ---- Loading Screen ----
function RentalsLoader() {
    const bounceAnims = [0, 1, 2, 3, 4].map(() => new Animated.Value(0));
    const fadeAnim = new Animated.Value(0);
    const pulseAnim = new Animated.Value(1);
    const progressAnim = new Animated.Value(0);
    const ITEMS = ['🚜', '🌾', '⚙️', '🏭', '💧'];

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        const bounces = bounceAnims.map((anim, i) =>
            Animated.loop(Animated.sequence([
                Animated.delay(i * 120),
                Animated.timing(anim, { toValue: -16, duration: 350, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 350, useNativeDriver: true }),
                Animated.delay((ITEMS.length - i - 1) * 120),
            ]))
        );
        Animated.stagger(0, bounces).start();
        Animated.loop(Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])).start();
        Animated.timing(progressAnim, { toValue: 1, duration: 2000, useNativeDriver: false }).start();
    }, []);

    return (
        <Animated.View style={[loaderStyles.container, { opacity: fadeAnim }]}>
            <Animated.View style={[loaderStyles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={loaderStyles.mainIcon}>🚜</Text>
            </Animated.View>
            <View style={loaderStyles.bounceRow}>
                {ITEMS.map((item, i) => (
                    <Animated.View key={i} style={[loaderStyles.bounceItem, { transform: [{ translateY: bounceAnims[i] }] }]}>
                        <Text style={{ fontSize: 22 }}>{item}</Text>
                    </Animated.View>
                ))}
            </View>
            <Text style={loaderStyles.title}>Finding equipment nearby</Text>
            <Text style={loaderStyles.subtitle}>Connecting with local farmers 🌿</Text>
            <View style={loaderStyles.track}>
                <Animated.View style={[loaderStyles.fill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) as any }]} />
            </View>
        </Animated.View>
    );
}

// ---- Add Equipment Modal ----
function AddEquipmentModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const { user } = useAuthStore();
    const { addItem } = useRentalStore();
    const [step, setStep] = useState<'pick' | 'details'>('pick');
    const [selected, setSelected] = useState<typeof EQUIPMENT_OPTIONS[0] | null>(null);
    const [customName, setCustomName] = useState('');
    const [price, setPrice] = useState('');

    const reset = () => {
        setStep('pick');
        setSelected(null);
        setCustomName('');
        setPrice('');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handlePick = (eq: typeof EQUIPMENT_OPTIONS[0]) => {
        setSelected(eq);
        setCustomName(eq.name);
        setPrice(eq.suggestedPrice.toString());
        setStep('details');
    };

    const handleSubmit = async () => {
        if (!selected || !customName.trim() || !price.trim()) {
            Alert.alert('Missing Info', 'Please fill in all fields.');
            return;
        }
        await addItem({
            name: customName.trim(),
            image: selected.image,
            price: parseInt(price) || selected.suggestedPrice,
            unit: 'per day',
            owner: user?.name || 'You',
            distance: 'Your listing',
            available: true,
            isUserListing: true,
        });
        Alert.alert('✅ Listed!', `${customName} has been added to rentals.`);
        handleClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View style={modalStyles.overlay}>
                <View style={modalStyles.sheet}>
                    {/* Header */}
                    <View style={modalStyles.header}>
                        <Text style={modalStyles.title}>
                            {step === 'pick' ? '🚜 List Your Equipment' : `${selected?.image} Set Details`}
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Text style={modalStyles.closeBtn}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {step === 'pick' ? (
                        /* Step 1: Pick equipment type */
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modalStyles.pickGrid}>
                            <Text style={modalStyles.pickSubtitle}>What equipment do you want to list?</Text>
                            {EQUIPMENT_OPTIONS.map((eq, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={modalStyles.pickCard}
                                    onPress={() => handlePick(eq)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={modalStyles.pickEmoji}>{eq.image}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={modalStyles.pickName}>{eq.name}</Text>
                                        <Text style={modalStyles.pickPrice}>Suggested: ₹{eq.suggestedPrice}/day</Text>
                                    </View>
                                    <Text style={modalStyles.pickArrow}>→</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        /* Step 2: Enter details */
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={modalStyles.previewCard}>
                                <Text style={{ fontSize: 48 }}>{selected?.image}</Text>
                            </View>

                            <Text style={modalStyles.inputLabel}>Equipment Name</Text>
                            <TextInput
                                style={modalStyles.input}
                                value={customName}
                                onChangeText={setCustomName}
                                placeholder="e.g. Mahindra 575 DI Tractor"
                                placeholderTextColor={colors.textLight}
                            />

                            <Text style={modalStyles.inputLabel}>Price per Day (₹)</Text>
                            <TextInput
                                style={modalStyles.input}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="e.g. 800"
                                placeholderTextColor={colors.textLight}
                                keyboardType="numeric"
                            />

                            <View style={modalStyles.btnRow}>
                                <TouchableOpacity style={modalStyles.backBtn} onPress={() => setStep('pick')}>
                                    <Text style={modalStyles.backBtnText}>← Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={modalStyles.submitBtn} onPress={handleSubmit}>
                                    <Text style={modalStyles.submitBtnText}>List Equipment</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}

// ---- Main Rentals Screen ----
export default function RentalsScreen() {
    const { user } = useAuthStore();
    const { items, initialize, removeItem, toggleAvailability } = useRentalStore();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        initialize();
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleRequest = (itemName: string) => {
        Alert.alert("Request Sent", `Your rental request for ${itemName} has been sent to the owner.`, [{ text: "OK" }]);
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert("Remove Listing", `Remove "${name}" from rentals?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: () => removeItem(id) },
        ]);
    };

    if (isLoading) return <RentalsLoader />;

    // Separate user listings from others
    const userListings = items.filter(i => i.isUserListing);
    const otherListings = items.filter(i => !i.isUserListing);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🚜 Rent Equipment</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                    <Text style={styles.addBtnText}>+ List</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* User's own listings */}
                {userListings.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>📋 Your Listings</Text>
                        <View style={styles.listContainer}>
                            {userListings.map(item => (
                                <View key={item.id} style={[styles.card, styles.userCard]}>
                                    <View style={styles.userBadge}>
                                        <Text style={styles.userBadgeText}>YOUR LISTING</Text>
                                    </View>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.imageContainer}>
                                            <Text style={styles.emoji}>{item.image}</Text>
                                        </View>
                                        <View style={styles.details}>
                                            <Text style={styles.name}>{item.name}</Text>
                                            <Text style={styles.price}>₹{item.price} <Text style={styles.unit}>{item.unit}</Text></Text>
                                        </View>
                                    </View>
                                    <View style={styles.userActions}>
                                        <TouchableOpacity
                                            style={[styles.toggleBtn, { backgroundColor: item.available ? '#E8F5E9' : '#FFF3E0' }]}
                                            onPress={() => toggleAvailability(item.id)}
                                        >
                                            <Text style={{ color: item.available ? colors.primary : '#E65100', fontWeight: '600', fontSize: typography.sizes.xs }}>
                                                {item.available ? '✓ Available' : '⏸ Paused'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteBtn}
                                            onPress={() => handleDelete(item.id, item.name)}
                                        >
                                            <Text style={styles.deleteBtnText}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Browse equipment */}
                <Text style={styles.sectionTitle}>🔍 Available Nearby</Text>
                <View style={styles.listContainer}>
                    {otherListings.map(item => (
                        <View key={item.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.imageContainer}>
                                    <Text style={styles.emoji}>{item.image}</Text>
                                </View>
                                <View style={styles.details}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.owner}>Listed by: {item.owner}</Text>
                                    <View style={styles.metaRow}>
                                        <Text style={styles.distance}>📍 {item.distance}</Text>
                                        <Text style={[styles.status, { color: item.available ? colors.primary : colors.error }]}>
                                            {item.available ? '• Available' : '• In Use'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.actionRow}>
                                <Text style={styles.price}>₹{item.price} <Text style={styles.unit}>{item.unit}</Text></Text>
                                <TouchableOpacity
                                    style={[styles.btn, !item.available && styles.btnDisabled]}
                                    disabled={!item.available}
                                    onPress={() => handleRequest(item.name)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.btnText}>Request</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
                <View style={{ height: spacing['3xl'] }} />
            </ScrollView>

            <AddEquipmentModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
        </View>
    );
}

// ---- Loader Styles ----
const loaderStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
    iconCircle: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF3E0',
        justifyContent: 'center', alignItems: 'center', marginBottom: spacing['2xl'],
        shadowColor: '#8B6F47', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
    },
    mainIcon: { fontSize: 48 },
    bounceRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing['2xl'] },
    bounceItem: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    title: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs, textAlign: 'center' },
    subtitle: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.xl, textAlign: 'center' },
    track: { width: '60%', height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 3, backgroundColor: '#8B6F47' },
});

// ---- Modal Styles ----
const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        maxHeight: '85%', paddingBottom: spacing['2xl'],
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    title: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text },
    closeBtn: { fontSize: 20, color: colors.textLight, padding: spacing.sm },
    pickSubtitle: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.md, paddingHorizontal: spacing.base },
    pickGrid: { paddingHorizontal: spacing.base, paddingBottom: spacing.xl },
    pickCard: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        backgroundColor: colors.background, padding: spacing.md, borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    pickEmoji: { fontSize: 32 },
    pickName: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.text },
    pickPrice: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
    pickArrow: { fontSize: 16, color: colors.primary, fontWeight: '700' },
    previewCard: {
        alignSelf: 'center', marginVertical: spacing.lg,
        width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF3E0',
        justifyContent: 'center', alignItems: 'center',
    },
    inputLabel: {
        fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text,
        marginHorizontal: spacing.base, marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
        borderRadius: borderRadius.lg, padding: spacing.md, marginHorizontal: spacing.base,
        marginBottom: spacing.base, fontSize: typography.sizes.base, color: colors.text,
    },
    btnRow: {
        flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.base, marginTop: spacing.md,
    },
    backBtn: {
        flex: 1, padding: spacing.md, borderRadius: borderRadius.pill,
        borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
    },
    backBtnText: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.textSecondary },
    submitBtn: {
        flex: 2, padding: spacing.md, borderRadius: borderRadius.pill,
        backgroundColor: '#8B6F47', alignItems: 'center',
    },
    submitBtnText: { fontSize: typography.sizes.sm, fontWeight: '700', color: '#fff' },
});

// ---- Main Styles ----
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.base, paddingTop: STATUSBAR_HEIGHT + spacing.md, paddingBottom: spacing.lg,
        backgroundColor: '#8B6F47', borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },
    headerTitle: { fontSize: typography.sizes['2xl'], fontWeight: '700', color: colors.textOnPrimary },
    addBtn: {
        backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm, borderRadius: borderRadius.pill,
    },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: typography.sizes.base },
    content: { padding: spacing.base },
    sectionTitle: {
        fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text,
        marginBottom: spacing.md, marginTop: spacing.sm,
    },
    listContainer: { gap: spacing.base, marginBottom: spacing.lg },

    // Cards
    card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.base, ...shadows.md },
    userCard: { borderWidth: 1.5, borderColor: '#8B6F47' },
    userBadge: {
        alignSelf: 'flex-start', backgroundColor: '#8B6F47', paddingHorizontal: spacing.sm,
        paddingVertical: 2, borderRadius: borderRadius.sm, marginBottom: spacing.sm,
    },
    userBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
    cardHeader: { flexDirection: 'row', gap: spacing.base },
    imageContainer: {
        width: 60, height: 60, backgroundColor: '#FFF3E0',
        borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center',
    },
    emoji: { fontSize: 32 },
    details: { flex: 1, justifyContent: 'center' },
    name: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.text },
    owner: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    distance: { fontSize: typography.sizes.xs, color: '#8B6F47', fontWeight: '500' },
    status: { fontSize: typography.sizes.xs, fontWeight: '600' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.base },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text },
    unit: { fontSize: typography.sizes.sm, color: colors.textSecondary, fontWeight: '400' },
    btn: { backgroundColor: '#8B6F47', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.pill },
    btnDisabled: { backgroundColor: colors.border },
    btnText: { color: colors.textOnPrimary, fontSize: typography.sizes.sm, fontWeight: '600' },

    // User listing actions
    userActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, alignItems: 'center' },
    toggleBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill },
    deleteBtn: { padding: spacing.xs },
    deleteBtnText: { fontSize: 18 },
});
