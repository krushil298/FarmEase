import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { sendOtp, verifyOtp } from '../../services/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslation } from '../../hooks/useTranslation';
import type { Language } from '../../utils/i18n';

import { usePreloadTranslations } from '../../hooks/useTranslation';
import LanguagePicker from '../../components/ui/LanguagePicker';
import { getLanguageByCode } from '../../utils/languages';

export default function LoginScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showLangModal, setShowLangModal] = useState(false);
    const { setSession } = useAuthStore();
    const { language, setLanguage } = useLanguageStore();

    // Add preloading for login strings to make language switching instant
    const { t } = usePreloadTranslations([
        'login.title',
        'login.otpTitle',
        'login.phoneLabel',
        'login.phonePlaceholder',
        'login.otpLabel',
        'login.otpPlaceholder',
        'login.sendOtp',
        'login.verifyOtp',
        'login.resendOtp',
        'login.terms',
        'login.phoneError',
        'login.otpError',
        'login.invalidOtp',
        'login.otpFailed',
        'login.languageLabel',
        'common.appName',
        'common.tagline',
    ]);

    const selectedLang = getLanguageByCode(language);

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            setError(t('login.phoneError'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            await sendOtp(`+91${phone}`);
            setOtpSent(true);
        } catch (err: any) {
            setError(err.message || t('login.otpFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) {
            setError(t('login.otpError'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await verifyOtp(`+91${phone}`, otp);
            setSession(data.session);
            router.replace('/(auth)/role-select');
        } catch (err: any) {
            setError(err.message || t('login.invalidOtp'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {/* Hero illustration area */}
            <View style={styles.heroSection}>
                <Image source={require('../../assets/farm_hero_banner.png')} style={styles.heroImage} />
                <View style={styles.heroOverlay}>
                    <Text style={styles.heroTitle}>{t('common.appName')}</Text>
                    <Text style={styles.heroSubtitle}>{t('common.tagline')}</Text>
                </View>
            </View>

            {/* Login form */}
            <View style={styles.formSection}>
                {/* Language Selector */}
                <View style={styles.langRow}>
                    <Text style={styles.langLabel}>{t('login.languageLabel')}:</Text>
                    <TouchableOpacity
                        style={styles.langSelector}
                        onPress={() => setShowLangModal(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.langSelectorText}>
                            {selectedLang.flag} {selectedLang.nativeName}
                        </Text>
                        <Text style={styles.langChevron}>▼</Text>
                    </TouchableOpacity>

                    <LanguagePicker
                        visible={showLangModal}
                        onClose={() => setShowLangModal(false)}
                    />
                </View>

                <Text style={styles.formTitle}>
                    {otpSent ? t('login.otpTitle') : t('login.title')}
                </Text>

                {!otpSent ? (
                    <>
                        <Input
                            label={t('login.phoneLabel')}
                            placeholder={t('login.phonePlaceholder')}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                            leftIcon={<Text style={styles.countryCode}>+91</Text>}
                            error={error}
                        />
                        <Button
                            title={t('login.sendOtp')}
                            onPress={handleSendOtp}
                            loading={loading}
                            fullWidth
                            size="lg"
                        />
                    </>
                ) : (
                    <>
                        <Input
                            label={t('login.otpLabel')}
                            placeholder={t('login.otpPlaceholder')}
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                            error={error}
                        />
                        <Button
                            title={t('login.verifyOtp')}
                            onPress={handleVerifyOtp}
                            loading={loading}
                            fullWidth
                            size="lg"
                        />
                        <Button
                            title={t('login.resendOtp')}
                            onPress={handleSendOtp}
                            variant="ghost"
                            style={{ marginTop: spacing.sm }}
                        />
                    </>
                )}

                <Text style={styles.termsText}>{t('login.terms')}</Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    heroSection: {
        flex: 0.4, position: 'relative',
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden',
    },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.8 },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    heroTitle: { fontSize: typography.sizes['4xl'], fontWeight: '700', color: colors.textOnPrimary },
    heroSubtitle: { fontSize: typography.sizes.base, color: colors.textOnPrimary, marginTop: spacing.xs, fontWeight: '500' },
    formSection: { flex: 0.6, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },

    // Language selector
    langRow: { marginBottom: spacing.md, zIndex: 10 },
    langLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginBottom: 4 },
    langSelector: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
    },
    langSelectorText: { fontSize: typography.sizes.sm, color: colors.text, fontWeight: '500' },
    langChevron: { fontSize: 10, color: colors.textLight },
    langDropdown: {
        position: 'absolute', top: 64, left: 0, right: 0,
        backgroundColor: colors.surface,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: borderRadius.md,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 8, elevation: 8,
        zIndex: 100,
    },
    langOption: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    },
    langOptionActive: { backgroundColor: colors.accentLighter },
    langOptionText: { fontSize: typography.sizes.base, color: colors.text },
    langCheck: { fontSize: typography.sizes.base, color: colors.primary, fontWeight: '700' },

    formTitle: { fontSize: typography.sizes['2xl'], fontWeight: '700', color: colors.text, marginBottom: spacing.xl },
    countryCode: { fontSize: typography.sizes.base, color: colors.text, fontWeight: '600' },
    termsText: { fontSize: typography.sizes.xs, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
