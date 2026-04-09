import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Header from '../../components/ui/Header';
import { useAuthStore } from '../../store/useAuthStore';
import { upsertProfile } from '../../services/auth';
import { useTranslation } from '../../hooks/useTranslation';
import LocationPickerModal from '../../components/LocationPickerModal';
import type { LocationCoords } from '../../services/location';

export default function RegisterBuyerScreen() {
    const router = useRouter();
    const { session, user: existingUser, setUser, setOnboarded } = useAuthStore();
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [coords, setCoords] = useState<LocationCoords | null>(null);
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
                role: 'buyer',
                delivery_address: address,
                lat: coords?.lat,
                lng: coords?.lng,
            });
            setUser(profile);
            setOnboarded(true);
            router.replace('/(tabs)/buyer-home');
        } catch (err) {
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Header title={t('registerBuyer.title')} showBack onBack={() => router.back()} />
            <Text style={styles.emoji}>🛒</Text>
            <Text style={styles.subtitle}>{t('registerBuyer.subtitle')}</Text>
            <Input label={t('registerBuyer.nameLabel')} placeholder={t('registerBuyer.namePlaceholder')} value={name} onChangeText={setName} />

            <View style={styles.locationField}>
                <Text style={styles.fieldLabel}>{t('registerBuyer.addressLabel') || 'Delivery Address'}</Text>
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={() => setShowMapPicker(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text
                        style={[
                            styles.locationText,
                            !address && styles.locationPlaceholder,
                        ]}
                        numberOfLines={1}
                    >
                        {address || t('registerBuyer.addressPlaceholder') || 'Tap to pick location on map'}
                    </Text>
                    <Text style={styles.locationArrow}>→</Text>
                </TouchableOpacity>
                {coords && (
                    <Text style={styles.coordsHint}>
                        {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                    </Text>
                )}
            </View>

            <Button title={t('registerBuyer.submit')} onPress={handleSubmit} loading={loading} fullWidth size="lg" style={{ marginTop: spacing.xl }} />

            <LocationPickerModal
                visible={showMapPicker}
                initialCoords={coords}
                onClose={() => setShowMapPicker(false)}
                onConfirm={(c, addr) => {
                    setCoords(c);
                    setAddress(addr);
                    setShowMapPicker(false);
                }}
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
        marginLeft: spacing.xs,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
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
