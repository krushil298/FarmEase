import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import Button from '../../components/ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import type { Language } from '../../utils/i18n';
import LocationPickerModal from '../../components/LocationPickerModal';
import { LocationCoords } from '../../services/location';
import { upsertProfile } from '../../services/auth';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
];

export default function ProfileScreen() {
    const router = useRouter();
    const { user, role, logout, setUser } = useAuthStore();
    const { language, setLanguage } = useLanguageStore();
    const { t } = useTranslation();
    const [showLangModal, setShowLangModal] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [updatingLocation, setUpdatingLocation] = useState(false);

    const handleLocationConfirm = async (coords: LocationCoords, address: string) => {
        if (!user) return;
        setUpdatingLocation(true);
        try {
            const updatedProfile = await upsertProfile({
                id: user.id,
                phone: user.phone || '',
                name: user.name || '',
                role: user.role,
                farm_location: address,
                // keep existing values if needed, assuming upsert merges or we need full object
            });
            setUser(updatedProfile);
            setShowMapPicker(false);
        } catch (error) {
            console.error('Failed to update location', error);
        } finally {
            setUpdatingLocation(false);
        }
    };

    const menuItems = [
        { title: t('profile.myOrders'), emoji: '📦', route: '', action: undefined },
        { title: t('profile.diseaseHistory'), emoji: '🔬', route: '', action: undefined },
        { title: t('profile.myListings'), emoji: '📋', route: '', farmerOnly: true, action: undefined },
        { title: t('profile.savedSchemes'), emoji: '⭐', route: '', action: undefined },
        { title: t('profile.language'), emoji: '🌐', route: '', action: () => setShowLangModal(true), badge: LANGUAGES.find(l => l.code === language)?.label },
        { title: t('profile.helpSupport'), emoji: '❓', route: '', action: undefined },
        { title: t('profile.about'), emoji: 'ℹ️', route: '', action: undefined },
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={{ fontSize: 40 }}>{role === 'farmer' ? '👨‍🌾' : '🛒'}</Text>
                </View>
                <Text style={styles.name}>{user?.name || 'User'}</Text>
                <Text style={styles.role}>{role === 'farmer' ? t('profile.farmer') : t('profile.buyer')}</Text>
                <Text style={styles.phone}>📱 {user?.phone || 'Not set'}</Text>

                <TouchableOpacity
                    style={styles.locationContainer}
                    onPress={() => setShowMapPicker(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.location}>📍 {user?.farm_location || 'Tap to add location'}</Text>
                    <Text style={styles.editIcon}>✎</Text>
                </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menu}>
                {menuItems
                    .filter((item) => !item.farmerOnly || role === 'farmer')
                    .map((item, i) => (
                        <TouchableOpacity key={i} style={styles.menuItem} onPress={item.action} activeOpacity={0.7}>
                            <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                            <Text style={styles.menuText}>{item.title}</Text>
                            {item.badge && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.badge}</Text>
                                </View>
                            )}
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                    ))}
            </View>

            {/* Logout */}
            <View style={styles.logoutSection}>
                <Button
                    title={t('profile.signOut')}
                    onPress={async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    }}
                    variant="outline"
                    fullWidth
                />
            </View>

            <Text style={styles.version}>{t('common.version')}</Text>

            {/* Language Selection Modal */}
            <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLangModal(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('common.selectLanguage')}</Text>
                        {LANGUAGES.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[styles.langOption, language === lang.code && styles.langOptionActive]}
                                onPress={() => {
                                    setLanguage(lang.code);
                                    setShowLangModal(false);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.langFlag}>{lang.flag}</Text>
                                <Text style={[styles.langLabel, language === lang.code && styles.langLabelActive]}>{lang.label}</Text>
                                {language === lang.code && <Text style={styles.langCheck}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Location Picker Modal */}
            <LocationPickerModal
                visible={showMapPicker}
                onClose={() => setShowMapPicker(false)}
                onConfirm={handleLocationConfirm}
            // We're not storing lat/lng in user profile currently, just Address
            // If we had them, pass initialCoords here
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        alignItems: 'center', paddingTop: 60, paddingBottom: spacing.xl,
        backgroundColor: colors.primary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    name: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.textOnPrimary, marginTop: spacing.md },
    role: { fontSize: typography.sizes.sm, color: colors.accentLighter, fontWeight: '500', textTransform: 'capitalize' },
    phone: { fontSize: typography.sizes.sm, color: colors.accentLighter, marginTop: spacing.xs },
    locationContainer: {
        flexDirection: 'row', alignItems: 'center', marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: spacing.md,
        paddingVertical: 6, borderRadius: borderRadius.full
    },
    location: { fontSize: typography.sizes.sm, color: colors.textOnPrimary, fontWeight: '500' },
    editIcon: { fontSize: 14, color: colors.textOnPrimary, marginLeft: 6, opacity: 0.8 },
    menu: { marginTop: spacing.lg, marginHorizontal: spacing.base },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
        padding: spacing.base, borderRadius: borderRadius.lg, marginBottom: spacing.sm, ...shadows.sm,
    },
    menuText: { flex: 1, fontSize: typography.sizes.base, color: colors.text, marginLeft: spacing.md, fontWeight: '500' },
    menuArrow: { fontSize: typography.sizes.xl, color: colors.textLight },
    badge: {
        backgroundColor: colors.accentLighter, paddingHorizontal: spacing.sm, paddingVertical: 2,
        borderRadius: borderRadius.pill, marginRight: spacing.sm,
    },
    badgeText: { fontSize: typography.sizes.xs, color: colors.primary, fontWeight: '600' },
    logoutSection: { padding: spacing.xl },
    version: { textAlign: 'center', fontSize: typography.sizes.xs, color: colors.textLight, paddingBottom: spacing['2xl'] },

    // Language Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.surface, borderRadius: borderRadius.xl,
        padding: spacing.xl, width: '80%', ...shadows.lg,
    },
    modalTitle: {
        fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text,
        textAlign: 'center', marginBottom: spacing.lg,
    },
    langOption: {
        flexDirection: 'row', alignItems: 'center', padding: spacing.base,
        borderRadius: borderRadius.lg, marginBottom: spacing.sm,
        backgroundColor: colors.background,
    },
    langOptionActive: {
        backgroundColor: colors.accentLighter, borderWidth: 2, borderColor: colors.primary,
    },
    langFlag: { fontSize: 24, marginRight: spacing.md },
    langLabel: { flex: 1, fontSize: typography.sizes.base, fontWeight: '500', color: colors.text },
    langLabelActive: { color: colors.primary, fontWeight: '700' },
    langCheck: { fontSize: typography.sizes.lg, color: colors.primary, fontWeight: '700' },
});
