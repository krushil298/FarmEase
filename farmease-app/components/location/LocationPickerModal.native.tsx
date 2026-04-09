import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { getCurrentLocation, reverseGeocode, LocationCoords } from '../services/location';

type Region = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
};

interface LocationPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (coords: LocationCoords, address: string) => void;
    initialCoords?: LocationCoords | null;
}

const DEFAULT_REGION: Region = {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 20,
    longitudeDelta: 20,
};

export default function LocationPickerModal({
    visible,
    onClose,
    onConfirm,
    initialCoords,
}: LocationPickerModalProps) {
    const mapRef = useRef<MapView>(null);
    const [selectedCoords, setSelectedCoords] = useState<LocationCoords | null>(
        initialCoords || null
    );
    const [address, setAddress] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [region, setRegion] = useState<Region>(
        initialCoords
            ? {
                latitude: initialCoords.lat,
                longitude: initialCoords.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }
            : DEFAULT_REGION
    );

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

            const newRegion = {
                latitude: result.coords.lat,
                longitude: result.coords.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 800);
        } catch (error) {
            console.error('Error getting location:', error);
        } finally {
            setGettingLocation(false);
        }
    };

    const handleMapPress = async (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        const coords = { lat: latitude, lng: longitude };
        setSelectedCoords(coords);
        setLoading(true);
        try {
            const addr = await reverseGeocode(latitude, longitude);
            setAddress(addr);
        } catch {
            setAddress('Selected Location');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (selectedCoords && address) {
            onConfirm(selectedCoords, address);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Pick Location</Text>
                    <View style={styles.closeButton} />
                </View>

                {/* Map */}
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                        initialRegion={region}
                        onPress={handleMapPress}
                        showsUserLocation
                        showsMyLocationButton={false}
                        mapType="standard"
                    >
                        {selectedCoords && (
                            <Marker
                                coordinate={{
                                    latitude: selectedCoords.lat,
                                    longitude: selectedCoords.lng,
                                }}
                                draggable
                                onDragEnd={(e) => {
                                    const { latitude, longitude } = e.nativeEvent.coordinate;
                                    const coords = { lat: latitude, lng: longitude };
                                    setSelectedCoords(coords);
                                    setLoading(true);
                                    reverseGeocode(latitude, longitude)
                                        .then((addr) => setAddress(addr))
                                        .catch(() => setAddress('Selected Location'))
                                        .finally(() => setLoading(false));
                                }}
                            />
                        )}
                    </MapView>

                    {/* Use My Location button */}
                    <TouchableOpacity
                        style={styles.myLocationButton}
                        onPress={handleUseMyLocation}
                        disabled={gettingLocation}
                    >
                        {gettingLocation ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Text style={styles.myLocationIcon}>📍</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Bottom Panel */}
                <View style={styles.bottomPanel}>
                    <View style={styles.addressSection}>
                        <Text style={styles.addressLabel}>Selected Location</Text>
                        {loading ? (
                            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 4 }} />
                        ) : (
                            <Text style={styles.addressText} numberOfLines={2}>
                                {address || 'Tap on the map to select a location'}
                            </Text>
                        )}
                        {selectedCoords && (
                            <Text style={styles.coordsText}>
                                {selectedCoords.lat.toFixed(4)}°N, {selectedCoords.lng.toFixed(4)}°E
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.confirmButton, (!selectedCoords || !address) && styles.confirmButtonDisabled]}
                        onPress={handleConfirm}
                        disabled={!selectedCoords || !address || loading}
                    >
                        <Text style={styles.confirmText}>Confirm Location</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing.md,
        paddingHorizontal: spacing.base, backgroundColor: colors.primary,
    },
    closeButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
    },
    closeText: { fontSize: 18, color: colors.textOnPrimary, fontWeight: '600' },
    headerTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.textOnPrimary },
    mapContainer: { flex: 1, position: 'relative' },
    map: { flex: 1 },
    myLocationButton: {
        position: 'absolute', bottom: spacing.base, right: spacing.base,
        width: 50, height: 50, borderRadius: 25, backgroundColor: colors.surface,
        justifyContent: 'center', alignItems: 'center', ...shadows.lg,
    },
    myLocationIcon: { fontSize: 22 },
    bottomPanel: {
        backgroundColor: colors.surface, paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg, paddingBottom: Platform.OS === 'ios' ? 36 : spacing.xl,
        borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, ...shadows.lg,
    },
    addressSection: { marginBottom: spacing.lg },
    addressLabel: {
        fontSize: typography.sizes.xs, color: colors.textSecondary,
        fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1,
    },
    addressText: { fontSize: typography.sizes.base, color: colors.text, fontWeight: '600', marginTop: 4, lineHeight: 22 },
    coordsText: { fontSize: typography.sizes.xs, color: colors.textLight, marginTop: 2 },
    confirmButton: { backgroundColor: colors.primary, paddingVertical: spacing.md + 2, borderRadius: borderRadius.lg, alignItems: 'center' },
    confirmButtonDisabled: { backgroundColor: colors.textLight, opacity: 0.6 },
    confirmText: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.textOnPrimary },
});
