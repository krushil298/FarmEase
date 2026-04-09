import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Header from '../../components/ui/Header';
import { useAuthStore } from '../../store/useAuthStore';
import { upsertProfile } from '../../services/auth';
import { SOIL_TYPES } from '../../utils/constants';
import LocationPickerModal from '../../components/LocationPickerModal';
import type { LocationCoords } from '../../services/location';

export default function RegisterFarmerScreen() {
    const router = useRouter();
    const { session, user: existingUser, setUser, setOnboarded } = useAuthStore();
    const [name, setName] = useState('');
    const [farmLocation, setFarmLocation] = useState('');
    const [farmCoords, setFarmCoords] = useState<LocationCoords | null>(null);
    const [landSize, setLandSize] = useState('');
    const [loading, setLoading] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            const profile = await upsertProfile({
                id: session?.user?.id || existingUser?.id,
                phone: session?.user?.phone || '',
                name,
                role: 'farmer',
                farm_location: farmLocation,
                land_size: parseFloat(landSize) || 0,
                lat: farmCoords?.lat,
                lng: farmCoords?.lng,
            });
            setUser(profile);
            setOnboarded(true);
            router.replace('/(tabs)');
        } catch (err) {
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationConfirm = (coords: LocationCoords, address: string) => {
        setFarmCoords(coords);
        setFarmLocation(address);
        setShowMapPicker(false);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Header title="Farmer Registration" showBack onBack={() => router.back()} />

            <Text style={styles.emoji}>👨‍🌾</Text>
            <Text style={styles.subtitle}>Tell us about your farm</Text>

            <Input label="Full Name" placeholder="Enter your name" value={name} onChangeText={setName} />

            {/* Map-based location picker */}
            <View style={styles.locationField}>
                <Text style={styles.fieldLabel}>Farm Location</Text>
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={() => setShowMapPicker(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text
                        style={[
                            styles.locationText,
                            !farmLocation && styles.locationPlaceholder,
                        ]}
                        numberOfLines={1}
                    >
                        {farmLocation || 'Tap to pick location on map'}
                    </Text>
                    <Text style={styles.locationArrow}>→</Text>
                </TouchableOpacity>
                {farmCoords && (
                    <Text style={styles.coordsHint}>
                        {farmCoords.lat.toFixed(4)}°N, {farmCoords.lng.toFixed(4)}°E
                    </Text>
                )}
            </View>

            <Input label="Land Size (acres)" placeholder="e.g. 5" value={landSize} onChangeText={setLandSize} keyboardType="numeric" />

            <Button title="Complete Registration" onPress={handleSubmit} loading={loading} fullWidth size="lg" style={{ marginTop: spacing.xl }} />

            <LocationPickerModal
                visible={showMapPicker}
                onClose={() => setShowMapPicker(false)}
                onConfirm={handleLocationConfirm}
                initialCoords={farmCoords}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl },
    emoji: { fontSize: 50, textAlign: 'center', marginVertical: spacing.lg },
    subtitle: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
    locationField: {
        marginBottom: spacing.base,
    },
    fieldLabel: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md + 2,
        gap: spacing.sm,
    },
    locationIcon: {
        fontSize: 18,
    },
    locationText: {
        flex: 1,
        fontSize: typography.sizes.base,
        color: colors.text,
        fontWeight: '500',
    },
    locationPlaceholder: {
        color: colors.textLight,
        fontWeight: '400',
    },
    locationArrow: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '700',
    },
    coordsHint: {
        fontSize: typography.sizes.xs,
        color: colors.textLight,
        marginTop: 4,
        marginLeft: spacing.xs,
    },
});
