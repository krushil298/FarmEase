import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { colors, typography } from '../../utils/theme';
import { useTranslation } from '../../hooks/useTranslation';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
    return (
        <View style={[styles.iconContainer, focused && styles.iconFocused]}>
            <Text style={styles.emoji}>{emoji}</Text>
        </View>
    );
}

export default function TabLayout() {
    const { isAuthenticated, isOnboarded, role } = useAuthStore();
    const { t } = useTranslation();
    const isBuyer = role === 'buyer';

    if (!isAuthenticated || !isOnboarded) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textLight,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            {/* Farmer Home — hidden for buyers */}
            <Tabs.Screen
                name="index"
                options={{
                    title: t('tabs.home'),
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
                    href: isBuyer ? null : '/(tabs)',
                }}
            />
            <Tabs.Screen
                name="buyer-home"
                options={{
                    title: t('tabs.home'),
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
                    href: isBuyer ? '/(tabs)/buyer-home' : null,
                }}
            />
            <Tabs.Screen
                name="detect"
                options={{
                    title: t('tabs.scan'),
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🔬" focused={focused} />,
                    href: isBuyer ? null : '/(tabs)/detect',
                }}
            />
            <Tabs.Screen
                name="marketplace"
                options={{
                    title: t('tabs.market'),
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🛒" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="rentals"
                options={{
                    title: t('tabs.rentals'),
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🚜" focused={focused} />,
                    href: isBuyer ? null : '/(tabs)/rentals',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('tabs.profile'),
                    tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.surface,
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        height: 70,
        paddingBottom: 10,
        paddingTop: 5,
    },
    tabLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '600',
    },
    iconContainer: {
        padding: 4,
        borderRadius: 12,
    },
    iconFocused: {
        backgroundColor: colors.accentLighter,
    },
    emoji: {
        fontSize: 22,
    },
});
