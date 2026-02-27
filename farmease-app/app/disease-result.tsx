import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import ResultCard from '../components/detection/ResultCard';
import TreatmentCard from '../components/detection/TreatmentCard';
import { usePreloadTranslations } from '../hooks/useTranslation';

const DISEASE_DESCRIPTIONS: Record<string, string> = {
    'Early Blight': 'A common fungal disease caused by Alternaria solani. Appears as dark brown concentric rings on lower leaves, spreading upward. Can reduce yield by 20-50% if untreated.',
    'Late Blight': 'Caused by Phytophthora infestans. Shows water-soaked lesions that turn brown. Highly destructive and spreads rapidly in cool, humid conditions.',
    'Leaf Curl': 'Viral disease spread by whiteflies. Causes upward leaf curling, stunted growth, and reduced fruit production.',
    'Healthy': 'Great news! No signs of disease detected. Keep up the good farming practices.',
    default: 'A plant disease detected in the scanned leaf. Follow the treatment recommendations below to manage and prevent further spread.',
};

export default function DiseaseResultScreen() {
    const router = useRouter();
    const { t } = usePreloadTranslations([
        'detect.resultsTitle',
        'detect.scannedImage',
        'detect.treatmentPlan',
        'detect.treatmentSubtitle',
        'detect.saveToHistory',
        'detect.scanAgain',
        'detect.severityHigh',
        'detect.severityMedium',
        'detect.severityLow',
        'detect.unknownDisease',
        'detect.unknownCrop',
    ]);
    const params = useLocalSearchParams<{ imageUri: string; disease: string; confidence: string; crop: string; treatmentsJson?: string }>();

    const confidence = parseInt(params.confidence || '0');
    const diseaseName = params.disease || t('detect.unknownDisease');
    const severityMap: Record<string, string> = {
        High: t('detect.severityHigh'),
        Medium: t('detect.severityMedium'),
        Low: t('detect.severityLow'),
    };
    const rawSeverity = diseaseName === 'Healthy' ? 'Low' : (confidence >= 80 ? 'High' : confidence >= 50 ? 'Medium' : 'Low');
    const severity = severityMap[rawSeverity];
    const description = DISEASE_DESCRIPTIONS[diseaseName] || DISEASE_DESCRIPTIONS.default;

    let treatments: any[] = [];
    try {
        if (params.treatmentsJson) {
            treatments = JSON.parse(params.treatmentsJson);
        }
    } catch (e) {
        console.error('Failed to parse treatments', e);
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Header title={t('detect.resultsTitle')} showBack onBack={() => router.back()} />

            {/* Scanned Image */}
            {params.imageUri && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: params.imageUri }} style={styles.image} />
                    <View style={styles.imageOverlay}>
                        <Text style={styles.imageLabel}>🔬 {t('detect.scannedImage')}</Text>
                    </View>
                </View>
            )}

            {/* Disease Result Card */}
            <View style={styles.resultSection}>
                <ResultCard
                    diseaseName={t(diseaseName)}
                    confidence={confidence}
                    severity={severity as 'High' | 'Medium' | 'Low'}
                    cropName={t(params.crop || 'detect.unknownCrop')}
                    description={t(description)}
                />
            </View>

            {/* Treatment Recommendations */}
            {treatments.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>💊 {t('detect.treatmentPlan')}</Text>
                    <Text style={styles.sectionSubtitle}>{t('detect.treatmentSubtitle')}</Text>

                    {treatments.map((treatment) => (
                        <TreatmentCard
                            key={treatment.step}
                            step={treatment.step}
                            title={treatment.title}
                            description={treatment.description}
                            type={treatment.type}
                            product={treatment.product}
                            onProductPress={() => router.push('/(tabs)/marketplace' as any)}
                        />
                    ))}
                </>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                <Button title={t('detect.saveToHistory')} onPress={() => router.back()} fullWidth variant="primary" />
                <Button title={t('detect.scanAgain')} onPress={() => router.back()} fullWidth variant="outline" />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    imageContainer: {
        margin: spacing.base,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        ...shadows.md,
    },
    image: { width: '100%', height: 220, resizeMode: 'cover' },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    imageLabel: {
        color: '#fff',
        fontSize: typography.sizes.sm,
        fontWeight: '500',
    },
    resultSection: {
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.text,
        paddingHorizontal: spacing.base,
        marginTop: spacing.md,
    },
    sectionSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        paddingHorizontal: spacing.base,
        marginBottom: spacing.md,
    },
    actions: { padding: spacing.xl, gap: spacing.md, marginBottom: spacing.base },
});
