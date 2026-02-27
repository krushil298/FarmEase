import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { useTranslation } from '../../hooks/useTranslation';

const CATEGORIES = [
    { id: '1', nameKey: 'categories.seeds', image: require('../../assets/farm_category_seeds.png'), route: '/marketplace?category=seeds' },
    { id: '2', nameKey: 'categories.fertilizers', image: require('../../assets/farm_category_fertilizer.png'), route: '/marketplace?category=fertilizers' },
    { id: '3', nameKey: 'categories.pesticides', image: require('../../assets/farm_category_pesticide.png'), route: '/marketplace?category=pesticides' },
    { id: '5', nameKey: 'categories.crops', image: require('../../assets/farm_category_crops.png'), route: '/marketplace?category=crops' },
];

export default function CategoryGrid() {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('dashboard.shopCategories')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={styles.card}
                        onPress={() => router.push(cat.route as any)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.imageContainer}>
                            <Image source={cat.image} style={styles.image} />
                        </View>
                        <Text style={styles.name}>{t(cat.nameKey)}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: spacing.lg, marginBottom: spacing.sm },
    title: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.base, marginBottom: spacing.md },
    scrollContent: { paddingHorizontal: spacing.base, gap: spacing.md },
    card: { alignItems: 'center', width: 80, marginRight: spacing.sm },
    imageContainer: {
        width: 80,
        height: 80,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
        marginBottom: spacing.xs,
        overflow: 'hidden'
    },
    image: { width: '80%', height: '80%', resizeMode: 'contain' },
    name: { fontSize: typography.sizes.xs, fontWeight: '600', color: colors.text, textAlign: 'center' }
});
