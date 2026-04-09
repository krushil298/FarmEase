import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import Header from '../components/ui/Header';
import { useAuthStore } from '../store/useAuthStore';
import { fetchMyRentalRequests, updateRentalRequestStatus, RentalRequest } from '../services/rentals';

export default function RentalRequestsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [incoming, setIncoming] = useState<RentalRequest[]>([]);
    const [outgoing, setOutgoing] = useState<RentalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming'); // incoming = people renting my stuff, outgoing = stuff I want to rent

    const loadRequests = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await fetchMyRentalRequests(user.id);
            setIncoming(data.incoming);
            setOutgoing(data.outgoing);

            // Auto switch to outgoing if there are no incoming but there are outgoing
            if (data.incoming.length === 0 && data.outgoing.length > 0 && activeTab === 'incoming') {
                setActiveTab('outgoing');
            }
        } catch (error) {
            console.error('Failed to load rental requests:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, activeTab]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleUpdateStatus = async (request: RentalRequest, newStatus: 'accepted' | 'rejected' | 'completed' | 'cancelled') => {
        const actionText = newStatus === 'accepted' ? 'Accept' : newStatus === 'rejected' ? 'Reject' : newStatus === 'cancelled' ? 'Cancel' : 'Complete';

        Alert.alert(
            `${actionText} Request`,
            `Are you sure you want to ${actionText.toLowerCase()} this rental request?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        const success = await updateRentalRequestStatus(request.id, newStatus);
                        if (success) {
                            Alert.alert('Success', `Request marked as ${newStatus}.`);
                            loadRequests(); // refresh list
                        } else {
                            Alert.alert('Error', 'Failed to update request status.');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return colors.warning;
            case 'accepted': return colors.primary;
            case 'rejected': return colors.error;
            case 'completed': return colors.success;
            case 'cancelled': return colors.textSecondary;
            default: return colors.textSecondary;
        }
    };

    // Card component to keep it DRY
    const RequestCard = ({ req, type }: { req: RentalRequest, type: 'incoming' | 'outgoing' }) => {
        const isOwner = type === 'incoming';
        const personName = isOwner ? req.requester?.name : req.rental?.owner?.name || 'Owner';
        const personPhone = isOwner ? req.requester?.phone : req.rental?.owner?.phone;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.imageContainer}>
                        <Text style={styles.emoji}>🚜</Text>
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.name}>{req.rental?.name || 'Equipment'}</Text>
                        <Text style={styles.personText}>
                            {isOwner ? `Requested by: ${personName}` : `Owned by: ${personName}`}
                        </Text>
                        <Text style={[styles.statusBadge, { color: getStatusColor(req.status) }]}>
                            • {req.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.metaRow}>
                    <View>
                        <Text style={styles.metaLabel}>Dates</Text>
                        <Text style={styles.metaValue}>{req.start_date} to {req.end_date}</Text>
                    </View>
                    <View>
                        <Text style={styles.metaLabel}>Total Price</Text>
                        <Text style={styles.metaValue}>₹{req.total_price}</Text>
                    </View>
                </View>

                {(req.status === 'accepted' || req.status === 'completed') && personPhone && (
                    <Text style={styles.phoneText}>📞 Contact: {personPhone}</Text>
                )}

                <View style={styles.actionRow}>
                    {/* Incoming Actions (Owner) */}
                    {isOwner && req.status === 'pending' && (
                        <View style={styles.actionBtns}>
                            <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleUpdateStatus(req, 'rejected')}>
                                <Text style={styles.btnRejectText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnAccept]} onPress={() => handleUpdateStatus(req, 'accepted')}>
                                <Text style={styles.btnText}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {isOwner && req.status === 'accepted' && (
                        <TouchableOpacity style={[styles.btn, styles.btnComplete, { width: '100%' }]} onPress={() => handleUpdateStatus(req, 'completed')}>
                            <Text style={styles.btnText}>Mark as Completed</Text>
                        </TouchableOpacity>
                    )}

                    {/* Outgoing Actions (Requester) */}
                    {!isOwner && req.status === 'pending' && (
                        <TouchableOpacity style={[styles.btn, styles.btnReject, { width: '100%' }]} onPress={() => handleUpdateStatus(req, 'cancelled')}>
                            <Text style={styles.btnRejectText}>Cancel Request</Text>
                        </TouchableOpacity>
                    )}
                    {!isOwner && req.status !== 'pending' && (
                        <Text style={styles.readOnlyText}>
                            {req.status === 'accepted' ? 'Waiting for owner to mark complete.' : `Request is ${req.status}.`}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    const currentList = activeTab === 'incoming' ? incoming : outgoing;

    return (
        <View style={styles.container}>
            <Header title="Rental Bookings" showBack onBack={() => router.back()} />

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'incoming' && styles.tabActive]}
                    onPress={() => setActiveTab('incoming')}
                >
                    <Text style={[styles.tabText, activeTab === 'incoming' && styles.tabTextActive]}>
                        My Equipment ({incoming.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'outgoing' && styles.tabActive]}
                    onPress={() => setActiveTab('outgoing')}
                >
                    <Text style={[styles.tabText, activeTab === 'outgoing' && styles.tabTextActive]}>
                        My Requests ({outgoing.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRequests(); }} />}
            >
                {loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Loading bookings...</Text>
                    </View>
                ) : currentList.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No {activeTab} rentals found.</Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {currentList.map(req => (
                            <RequestCard key={req.id} req={req} type={activeTab} />
                        ))}
                    </View>
                )}
                <View style={{ height: spacing['4xl'] }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    tabs: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: colors.primary },
    tabText: { fontSize: typography.sizes.sm, color: colors.textSecondary, fontWeight: '500' },
    tabTextActive: { color: colors.primary, fontWeight: '700' },
    content: { padding: spacing.base },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['3xl'] },
    emptyText: { fontSize: typography.sizes.base, color: colors.textSecondary },
    listContainer: { gap: spacing.base },

    // Card styles
    card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.base, ...shadows.sm, borderWidth: 1, borderColor: colors.border },
    cardHeader: { flexDirection: 'row', gap: spacing.base },
    imageContainer: { width: 50, height: 50, backgroundColor: colors.background, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center' },
    emoji: { fontSize: 24 },
    details: { flex: 1, justifyContent: 'center' },
    name: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.text },
    personText: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
    statusBadge: { fontSize: typography.sizes.xs, fontWeight: '700', marginTop: 4 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    metaLabel: { fontSize: 10, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    metaValue: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text, marginTop: 2 },
    phoneText: { fontSize: typography.sizes.sm, color: colors.text, fontWeight: '500', marginBottom: spacing.sm, backgroundColor: colors.surfaceLight, padding: 8, borderRadius: borderRadius.sm },
    actionRow: { marginTop: spacing.xs },
    actionBtns: { flexDirection: 'row', gap: spacing.sm },
    btn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.pill, alignItems: 'center', justifyContent: 'center' },
    btnAccept: { backgroundColor: colors.primary },
    btnComplete: { backgroundColor: colors.success },
    btnReject: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.error },
    btnText: { color: colors.textOnPrimary, fontSize: typography.sizes.sm, fontWeight: '600' },
    btnRejectText: { color: colors.error, fontSize: typography.sizes.sm, fontWeight: '600' },
    readOnlyText: { fontSize: typography.sizes.sm, color: colors.textSecondary, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.xs }
});
