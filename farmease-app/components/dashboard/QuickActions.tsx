import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, borderRadius, spacing, typography, shadows } from '../../utils/theme';
import { useTranslation } from '../../hooks/useTranslation';

function GlassCard({ icon, label, subtitle, cardBg, circleBg, fullWidth, onPress }: { icon: string; label: string; subtitle: string; cardBg: string; circleBg: string; fullWidth?: boolean; onPress: () => void }) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    };

    return (
        <Animated.View style={[fullWidth ? styles.cardOuterFull : styles.cardOuter, { transform: [{ scale }] }]}>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: cardBg }]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
            >
                <View style={[styles.iconCircle, { backgroundColor: circleBg }]}>
                    <Text style={styles.icon}>{icon}</Text>
                </View>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

export default function QuickActions() {
    const router = useRouter();
    const { t } = useTranslation();

    const ACTIONS = [
        {
            id: 'detect',
            icon: '🔬',
            label: t('dashboard.diseaseDetection'),
            subtitle: t('dashboard.diseaseDetectionDesc'),
            route: '/(tabs)/detect',
            cardBg: 'rgba(62, 107, 72, 0.12)',
            circleBg: 'rgba(62, 107, 72, 0.18)',
        },
        {
            id: 'crop',
            icon: '🌱',
            label: t('dashboard.cropRecommend'),
            subtitle: t('dashboard.cropRecommendDesc'),
            route: '/crop-recommend',
            cardBg: 'rgba(192, 96, 20, 0.10)',
            circleBg: 'rgba(192, 96, 20, 0.16)',
        },
        {
            id: 'market',
            icon: '🛒',
            label: t('dashboard.marketplace'),
            subtitle: t('dashboard.marketplaceDesc'),
            route: '/(tabs)/marketplace',
            cardBg: 'rgba(45, 106, 79, 0.10)',
            circleBg: 'rgba(45, 106, 79, 0.16)',
        },
        {
            id: 'schemes',
            icon: '📋',
            label: t('dashboard.govSchemes'),
            subtitle: t('dashboard.govSchemesDesc'),
            route: '/schemes',
            cardBg: 'rgba(184, 134, 11, 0.10)',
            circleBg: 'rgba(184, 134, 11, 0.16)',
        },
        {
            id: 'rent',
            icon: '🚜',
            label: t('dashboard.rentEquipment'),
            subtitle: t('dashboard.rentEquipmentDesc'),
            route: '/rentals',
            cardBg: 'rgba(139, 111, 71, 0.12)',
            circleBg: 'rgba(139, 111, 71, 0.18)',
        },
    ];

    return (
        <View style={styles.wrapper}>
            <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
            <View style={styles.grid}>
                {ACTIONS.map((action, i) => (
                    <GlassCard
                        key={action.id}
                        icon={action.icon}
                        label={action.label}
                        subtitle={action.subtitle}
                        cardBg={action.cardBg}
                        circleBg={action.circleBg}
                        fullWidth={ACTIONS.length % 2 !== 0 && i === ACTIONS.length - 1}
                        onPress={() => router.push(action.route as any)}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: spacing.base,
        marginTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: '800',
        color: colors.text,
        marginBottom: spacing.base,
        letterSpacing: 0.3,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: spacing.md,
    },
    cardOuter: {
        width: '48%',
    },
    cardOuterFull: {
        width: '100%',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(45, 106, 79, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(45, 106, 79, 0.12)',
    },
    icon: {
        fontSize: 38,
    },
    label: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1a1a1a',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: typography.sizes.xs,
        color: '#777',
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '500',
    },
});
