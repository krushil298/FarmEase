import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { getCurrentLocation, reverseGeocode, LocationCoords } from '../services/location';

interface LocationPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (coords: LocationCoords, address: string) => void;
    initialCoords?: LocationCoords | null;
}

export default function LocationPickerModal({
    visible,
    onClose,
    onConfirm,
    initialCoords,
}: LocationPickerModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<LocationCoords | null>(initialCoords || null);
    const [address, setAddress] = useState<string>('');
    const [gettingLocation, setGettingLocation] = useState(false);

    useEffect(() => {
        if (visible && !initialCoords) {
            handleUseMyLocation();
        }
    }, [visible]);

    const handleUseMyLocation = async () => {
        setGettingLocation(true);
        try {
            const result = await getCurrentLocation();
            setSelectedCoords(result.coords);
            setAddress(result.address);
        } catch {
            setAddress('Selected Location');
        } finally {
            setGettingLocation(false);
        }
    };

    const handleConfirm = () => {
        if (selectedCoords && address) {
            onConfirm(selectedCoords, address);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Pick Location</Text>
                        <View style={styles.closeBtn} />
                    </View>
                    <View style={styles.body}>
                        <View style={styles.mapPlaceholder}>
                            <Text style={styles.icon}>🌍</Text>
                            <Text style={styles.info}>
                                On the web version, interactive maps are limited. Please use "Use My Location" to fetch your current GPS coordinates.
                            </Text>
                        </View>

                        {address ? (
                            <View style={styles.addressBox}>
                                <Text style={styles.addressLabel}>Selected Location:</Text>
                                <Text style={styles.addressText}>{address}</Text>
                                {selectedCoords && (
                                    <Text style={styles.coordsText}>{selectedCoords.lat.toFixed(4)}°N, {selectedCoords.lng.toFixed(4)}°E</Text>
                                )}
                            </View>
                        ) : null}

                        <TouchableOpacity style={styles.btn} onPress={handleUseMyLocation} disabled={gettingLocation}>
                            {gettingLocation ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.btnText}>📍 Use My Location</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.confirmBtn, (!selectedCoords || !address) && styles.confirmBtnDisabled]}
                            onPress={handleConfirm}
                            disabled={!selectedCoords || !address || gettingLocation}
                        >
                            <Text style={styles.confirmBtnText}>Confirm Location</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    content: { width: '90%', maxWidth: 500, backgroundColor: colors.surface, borderRadius: borderRadius.xl, overflow: 'hidden' },
    header: { padding: spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
    closeBtn: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 15 },
    closeText: { fontSize: typography.sizes.base, color: colors.textSecondary, fontWeight: '700' },
    title: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text },
    body: { padding: spacing.xl, gap: spacing.lg },
    mapPlaceholder: { backgroundColor: colors.background, padding: spacing.xl, borderRadius: borderRadius.lg, alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
    icon: { fontSize: 48 },
    info: { fontSize: typography.sizes.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
    addressBox: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: borderRadius.md },
    addressLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: '600', marginBottom: 4 },
    addressText: { fontSize: typography.sizes.base, color: colors.text, fontWeight: '500' },
    coordsText: { fontSize: typography.sizes.xs, color: colors.textLight, marginTop: 4 },
    btn: { backgroundColor: colors.surfaceLight, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    btnText: { fontSize: typography.sizes.base, color: colors.text, fontWeight: '600' },
    confirmBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
    confirmBtnDisabled: { backgroundColor: colors.border, opacity: 0.7 },
    confirmBtnText: { fontSize: typography.sizes.base, color: colors.textOnPrimary, fontWeight: '600' },
});
