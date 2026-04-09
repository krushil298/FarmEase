import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../utils/theme';
import LocationPickerModal from '../LocationPickerModal';
import { LocationCoords } from '../../services/location';

export interface CreateRentalInput {
    name: string;
    description: string;
    price_per_day: number;
    location: string;
    lat?: number | null;
    lng?: number | null;
    image_url?: string;
}

interface RentalFormProps {
    onSubmit: (data: CreateRentalInput) => void;
    loading?: boolean;
}

export default function RentalForm({ onSubmit, loading = false }: RentalFormProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);

    // Location State
    const [showMap, setShowMap] = useState(false);
    const [address, setAddress] = useState('');
    const [coords, setCoords] = useState<LocationCoords | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload an image.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleLocationConfirm = (selectedCoords: LocationCoords, selectedAddr: string) => {
        setCoords(selectedCoords);
        setAddress(selectedAddr);
        setShowMap(false);
    };

    const submit = () => {
        if (!name.trim()) return Alert.alert('Missing Field', 'Please enter equipment name');
        if (!price || isNaN(Number(price)) || Number(price) <= 0) return Alert.alert('Invalid Price', 'Please enter a valid price per day');
        if (!address.trim()) return Alert.alert('Missing Location', 'Please set the pickup location');

        onSubmit({
            name: name.trim(),
            description: description.trim(),
            price_per_day: Number(price),
            location: address,
            lat: coords?.lat || null,
            lng: coords?.lng || null,
            image_url: image || undefined,
        });
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Image Picker */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.uploadIcon}>📷</Text>
                        <Text style={styles.uploadText}>Add Photo</Text>
                    </ View>
                )}
            </TouchableOpacity>

            <View style={styles.form}>
                <Input
                    label="Equipment Name"
                    placeholder="e.g. Mahindra Tractor 575 DI"
                    value={name}
                    onChangeText={setName}
                />

                <Input
                    label="Price per Day (₹)"
                    placeholder="e.g. 800"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                />

                <Input
                    label="Description (Optional)"
                    placeholder="Condition, available features, etc."
                    multiline
                    numberOfLines={3}
                    value={description}
                    onChangeText={setDescription}
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                />

                {/* Location Picker Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Pickup Location *</Text>
                    <View style={styles.locationCard}>
                        {address ? (
                            <View style={styles.locationResult}>
                                <Text style={{ fontSize: 24, marginRight: spacing.sm }}>📍</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
                                    {coords && (
                                        <Text style={styles.coordsText}>
                                            Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.noLocationText}>No location selected</Text>
                        )}
                        <Button
                            title={address ? "Change Location" : "Set Location on Map"}
                            onPress={() => setShowMap(true)}
                            variant={address ? "outline" : "primary"}
                            style={{ marginTop: spacing.sm }}
                        />
                    </View>
                </View>

                <Button
                    title="List Equipment"
                    onPress={submit}
                    loading={loading}
                    style={styles.submitBtn}
                />
            </View>

            <LocationPickerModal
                visible={showMap}
                onClose={() => setShowMap(false)}
                onConfirm={handleLocationConfirm}
                initialCoords={coords || undefined}
            />

            <View style={{ height: spacing['4xl'] }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.base },
    imagePicker: {
        width: '100%',
        height: 200,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginBottom: spacing.xl,
        ...shadows.sm,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
    },
    uploadIcon: { fontSize: 40, marginBottom: spacing.sm },
    uploadText: { fontSize: typography.sizes.md, color: colors.textSecondary, fontWeight: '500' },
    form: { gap: spacing.base },
    section: { marginBottom: spacing.sm },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    locationCard: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    locationResult: { flexDirection: 'row', alignItems: 'center' },
    addressText: { fontSize: typography.sizes.sm, color: colors.text, fontWeight: '500' },
    coordsText: { fontSize: 10, color: colors.textSecondary, marginTop: 2, fontFamily: 'monospace' },
    noLocationText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.sm,
        fontStyle: 'italic',
    },
    submitBtn: { marginTop: spacing.xl },
});
