import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../utils/theme';

export interface RadiusOption {
    label: string;
    value: number | null;
}

interface RadiusPillProps {
    options: readonly RadiusOption[];
    selectedValue: number | null;
    onSelect: (value: number | null) => void;
}

export default function RadiusPill({ options, selectedValue, onSelect }: RadiusPillProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {options.map((opt) => (
                <TouchableOpacity
                    key={opt.label}
                    onPress={() => onSelect(opt.value)}
                    style={[styles.pill, selectedValue === opt.value && styles.pillActive]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.pillText, selectedValue === opt.value && styles.pillTextActive]}>
                        {opt.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.sm,
        gap: spacing.sm,
    },
    pill: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius['2xl'],
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pillActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    pillText: {
        fontSize: typography.sizes.sm,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    pillTextActive: {
        color: colors.textOnPrimary,
    },
});
