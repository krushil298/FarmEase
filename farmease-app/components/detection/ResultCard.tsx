import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../../utils/theme';
import { getConfidenceColor } from '../../utils/helpers';

interface ResultCardProps {
    diseaseName: string;
    confidence: number;
    severity: 'Low' | 'Medium' | 'High';
    severityLabel?: string;
    cropName: string;
    description: string;
}

const SEVERITY_COLORS = {
    Low: { bg: '#D1FAE5', text: '#065F46' },
    Medium: { bg: '#FEF3C7', text: '#92400E' },
    High: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function ResultCard({
    diseaseName,
    confidence,
    severity,
    severityLabel,
    cropName,
    description,
}: ResultCardProps) {
    const confidenceColor = getConfidenceColor(confidence);
    const severityStyle = SEVERITY_COLORS[severity] || SEVERITY_COLORS.Low;

    return (
        <View style={styles.container}>
            {/* Status indicator */}
            <View style={[styles.statusBar, { backgroundColor: confidenceColor }]} />

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.cropLabel}>Crop: {cropName}</Text>
                        <Text style={styles.diseaseName}>{diseaseName}</Text>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: severityStyle.bg }]}>
                        <Text style={[styles.severityText, { color: severityStyle.text }]}>
                            {severityLabel || severity}
                        </Text>
                    </View>
                </View>

                {/* Confidence bar */}
                <View style={styles.confidenceSection}>
                    <View style={styles.confidenceHeader}>
                        <Text style={styles.confidenceLabel}>Confidence</Text>
                        <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
                            {confidence}%
                        </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${confidence}%`, backgroundColor: confidenceColor },
                            ]}
                        />
                    </View>
                </View>

                {/* Description */}
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginHorizontal: spacing.base,
        ...shadows.md,
    },
    statusBar: {
        height: 4,
    },
    content: {
        padding: spacing.base,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
    },
    cropLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    diseaseName: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.text,
        marginTop: 4,
    },
    severityBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    severityText: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
    },
    confidenceSection: {
        marginTop: spacing.base,
    },
    confidenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    confidenceLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    confidenceValue: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: colors.divider,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    description: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: 20,
        marginTop: spacing.md,
    },
});
