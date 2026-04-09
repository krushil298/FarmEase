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
import { CROP_CATEGORIES } from '../../utils/constants';
import { CreateProductInput } from '../../services/marketplace';
import LocationPickerModal from '../LocationPickerModal';
import { LocationCoords } from '../../services/location';

const UNITS = ['kg', 'quintal', 'dozen', 'piece', 'litre', 'ton'] as const;

interface ProductFormProps {
    initialValues?: Partial<CreateProductInput>;
    onSubmit: (data: CreateProductInput) => void;
    loading?: boolean;
    submitLabel?: string;
}

export default function ProductForm({
    initialValues,
    onSubmit,
    loading = false,
    submitLabel = 'List Product',
}: ProductFormProps) {
    const [name, setName] = useState(initialValues?.name || '');
    const [description, setDescription] = useState(initialValues?.description || '');
    const [category, setCategory] = useState(initialValues?.category || 'Vegetables');
    const [price, setPrice] = useState(initialValues?.price?.toString() || '');
    const [quantity, setQuantity] = useState(initialValues?.quantity?.toString() || '');
    const [unit, setUnit] = useState(initialValues?.unit || 'kg');
    const [location, setLocation] = useState(initialValues?.location || '');
    const [locationCoords, setLocationCoords] = useState<LocationCoords | null>(null);
    const [imageUri, setImageUri] = useState(initialValues?.image_url || '');
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = 'Product name is required';
        if (!price.trim() || parseFloat(price) <= 0) newErrors.price = 'Enter a valid price';
        if (!quantity.trim() || parseFloat(quantity) <= 0) newErrors.quantity = 'Enter a valid quantity';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'We need access to your photos to upload product images.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSubmit({
            name: name.trim(),
            description: description.trim(),
            category,
            price: parseFloat(price),
            quantity: parseFloat(quantity),
            unit,
            image_url: imageUri || undefined,
            location: location.trim() || undefined,
            lat: locationCoords?.lat,
            lng: locationCoords?.lng,
        });
    };

    // Categories without the "All" option
    const formCategories = CROP_CATEGORIES.filter((c) => c !== 'All');

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Image Picker */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.7}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.imageIcon}>📷</Text>
                        <Text style={styles.imageLabel}>Tap to add photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Product Info */}
            <Input
                label="Product Name *"
                placeholder="e.g. Fresh Tomatoes"
                value={name}
                onChangeText={setName}
                error={errors.name}
            />

            <Input
                label="Description"
                placeholder="Describe your product..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
            />

            {/* Category Selector */}
            <Text style={styles.label}>Category</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
            >
                {formCategories.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.chip, category === cat && styles.chipActive]}
                        onPress={() => setCategory(cat)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Price & Quantity */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Input
                        label="Price (₹) *"
                        placeholder="0"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        error={errors.price}
                    />
                </View>
                <View style={styles.halfInput}>
                    <Input
                        label="Quantity *"
                        placeholder="0"
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                        error={errors.quantity}
                    />
                </View>
            </View>

            {/* Unit Selector */}
            <Text style={styles.label}>Unit</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
            >
                {UNITS.map((u) => (
                    <TouchableOpacity
                        key={u}
                        style={[styles.chip, unit === u && styles.chipActive]}
                        onPress={() => setUnit(u)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>{u}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Product Location */}
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity
                style={styles.locationButton}
                onPress={() => setShowMapPicker(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.locationIcon}>📍</Text>
                <Text
                    style={[
                        styles.locationText,
                        !location && styles.locationPlaceholder,
                    ]}
                    numberOfLines={1}
                >
                    {location || 'Tap to pick location on map'}
                </Text>
                <Text style={styles.locationArrow}>→</Text>
            </TouchableOpacity>
            {locationCoords && (
                <Text style={styles.coordsHint}>
                    {locationCoords.lat.toFixed(4)}°N, {locationCoords.lng.toFixed(4)}°E
                </Text>
            )}

            <LocationPickerModal
                visible={showMapPicker}
                onClose={() => setShowMapPicker(false)}
                onConfirm={(coords, address) => {
                    setLocationCoords(coords);
                    setLocation(address);
                    setShowMapPicker(false);
                }}
                initialCoords={locationCoords}
            />

            {/* Submit */}
            <Button
                title={submitLabel}
                onPress={handleSubmit}
                loading={loading}
                fullWidth
                size="lg"
                style={styles.submitButton}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.base,
        paddingBottom: spacing['3xl'],
    },
    imagePicker: {
        width: '100%',
        height: 200,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: borderRadius.lg,
    },
    imageIcon: {
        fontSize: 40,
        marginBottom: spacing.sm,
    },
    imageLabel: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: '500',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    chipsRow: {
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        marginBottom: spacing.md,
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius['2xl'],
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        fontSize: typography.sizes.sm,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    chipTextActive: {
        color: colors.textOnPrimary,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    halfInput: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md + 2,
        gap: spacing.sm,
    },
    locationIcon: {
        fontSize: 18,
    },
    locationText: {
        flex: 1,
        fontSize: typography.sizes.base,
        color: colors.text,
        fontWeight: '500',
    },
    locationPlaceholder: {
        color: colors.textLight,
        fontWeight: '400',
    },
    locationArrow: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '700',
    },
    coordsHint: {
        fontSize: typography.sizes.xs,
        color: colors.textLight,
        marginTop: 4,
        marginLeft: spacing.xs,
    },
    submitButton: {
        marginTop: spacing.xl,
    },
});
