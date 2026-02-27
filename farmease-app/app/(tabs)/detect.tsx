import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import Button from '../../components/ui/Button';
import { usePreloadTranslations } from '../../hooks/useTranslation';
import { analyzeCropImage } from '../../services/ml';

export default function DetectScreen() {
    const router = useRouter();
    const { t } = usePreloadTranslations([
        'detect.title',
        'detect.subtitle',
        'detect.gallery',
        'detect.flash',
        'detect.retake',
        'detect.analyze',
        'detect.permissionTitle',
        'detect.permissionDesc',
        'detect.grantPermission',
    ]);
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState<{ uri: string; base64?: string } | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const cameraRef = useRef<any>(null);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });
                setCapturedImage({ uri: photo.uri, base64: photo.base64 });
            } catch (err) {
                console.error('Camera error:', err);
            }
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            base64: true,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setCapturedImage({ uri: asset.uri, base64: asset.base64 || undefined });
        }
    };

    const analyzeImage = async () => {
        if (!capturedImage?.base64) {
            Alert.alert('Error', 'No image data available. Please re-capture or select another image.');
            return;
        }
        setAnalyzing(true);
        try {
            // Send base64 directly to avoid filesystem deprecations and React Native blob bugs
            const result = await analyzeCropImage(capturedImage.base64);
            if (result) {
                router.push({
                    pathname: '/disease-result',
                    params: {
                        imageUri: capturedImage.uri,
                        disease: result.disease,
                        confidence: result.confidence.toString(),
                        crop: result.crop,
                        treatmentsJson: JSON.stringify(result.treatments),
                    },
                });
            } else {
                Alert.alert('Error', 'Could not analyze image.');
            }
        } catch (err) {
            Alert.alert('Error', 'Analysis failed. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (!permission?.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={{ fontSize: 60 }}>📸</Text>
                <Text style={styles.permissionTitle}>{t('detect.permissionTitle')}</Text>
                <Text style={styles.permissionDesc}>{t('detect.permissionDesc')}</Text>
                <Button title={t('detect.grantPermission')} onPress={requestPermission} size="lg" />
            </View>
        );
    }

    if (capturedImage) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: capturedImage.uri }} style={styles.preview} />
                <View style={styles.previewActions}>
                    <Button title={t('detect.retake')} onPress={() => setCapturedImage(null)} variant="outline" />
                    <Button title={t('detect.analyze')} onPress={analyzeImage} loading={analyzing} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
                {/* Scan overlay */}
                <View style={styles.overlay}>
                    <Text style={styles.scanTitle}>{t('detect.title')}</Text>
                    <Text style={styles.scanSubtitle}>{t('detect.subtitle')}</Text>
                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                </View>
            </CameraView>

            {/* Bottom controls */}
            <View style={styles.controls}>
                <TouchableOpacity onPress={pickImage} style={styles.controlBtn}>
                    <Text style={{ fontSize: 24 }}>🖼️</Text>
                    <Text style={styles.controlLabel}>{t('detect.gallery')}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
                    <View style={styles.captureBtnInner} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { }} style={styles.controlBtn}>
                    <Text style={{ fontSize: 24 }}>⚡</Text>
                    <Text style={styles.controlLabel}>{t('detect.flash')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scanTitle: { fontSize: typography.sizes.xl, fontWeight: '700', color: '#fff', position: 'absolute', top: 60 },
    scanSubtitle: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.7)', position: 'absolute', top: 90 },
    scanFrame: { width: 250, height: 250, position: 'relative' },
    corner: { position: 'absolute', width: 40, height: 40, borderColor: colors.accent, borderWidth: 3 },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: spacing.xl, backgroundColor: 'rgba(0,0,0,0.8)' },
    controlBtn: { alignItems: 'center', gap: 4 },
    controlLabel: { fontSize: typography.sizes.xs, color: '#fff' },
    captureBtn: {
        width: 72, height: 72, borderRadius: 36, borderWidth: 4,
        borderColor: '#fff', justifyContent: 'center', alignItems: 'center',
    },
    captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
    preview: { flex: 1, resizeMode: 'contain' },
    previewActions: { flexDirection: 'row', gap: spacing.md, padding: spacing.xl, backgroundColor: '#000', justifyContent: 'center' },
    permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.xl, gap: spacing.lg },
    permissionTitle: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.text },
    permissionDesc: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center' },
});
