import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/ui/Header';
import RentalForm from '../components/rentals/RentalForm';
import { colors } from '../utils/theme';
import { useAuthStore } from '../store/useAuthStore';
import { createRentalListing } from '../services/rentals';
import { uploadProductImage } from '../services/marketplace';
import { supabase } from '../services/supabase';
import type { CreateRentalInput } from '../components/rentals/RentalForm';

// Seeded demo farmer ID (matches what's in the DB)
const DEMO_SELLER_ID = 'a1b2c3d4-1111-4000-8000-000000000001';

export default function AddRentalScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: CreateRentalInput) => {
        setLoading(true);
        console.log('[AddRental] Starting submit with data:', JSON.stringify(data, null, 2));
        try {
            let ownerId = user?.id;
            const isDummy = !ownerId || ownerId.startsWith('dummy');
            console.log('[AddRental] isDummy:', isDummy, 'ownerId:', ownerId);

            if (isDummy) {
                ownerId = DEMO_SELLER_ID;

                // Sync the farmer's profile name to the demo user so listings show the correct name
                if (user?.name) {
                    console.log('[AddRental] Syncing dummy profile name:', user.name);
                    const { error: syncErr } = await supabase
                        .from('users')
                        .update({
                            name: user.name,
                            phone: user.phone || null,
                            farm_location: user.farm_location || data.location || null,
                        })
                        .eq('id', DEMO_SELLER_ID);

                    if (syncErr) console.error('[AddRental] Sync error:', syncErr);
                }
            }

            // Upload image to Supabase Storage if a local image was selected
            let imageUrl = data.image_url;
            console.log('[AddRental] Image URL before upload:', imageUrl);
            if (imageUrl && (imageUrl.startsWith('file://') || imageUrl.startsWith('ph://') || imageUrl.startsWith('/var/'))) {
                console.log('[AddRental] Uploading local image to storage...');
                const uploadedUrl = await uploadProductImage(imageUrl); // We can reuse the marketplace image upload storage
                console.log('[AddRental] Upload result:', uploadedUrl);
                imageUrl = uploadedUrl || undefined;
            }

            console.log('[AddRental] Calling createRentalListing API...');
            const result = await createRentalListing(ownerId!, { ...data, image_url: imageUrl });
            console.log('[AddRental] Final API result:', result);

            if (result) {
                Alert.alert(
                    '🚜 Equipment Listed!',
                    `"${data.name}" is now available for rent.`,
                    [{ text: 'Great!', onPress: () => router.back() }]
                );
            } else {
                console.error('[AddRental] Result is null, but no error was thrown to catch block');
                Alert.alert(
                    'Oops',
                    'Could not list the equipment. Please try again.',
                );
            }
        } catch (error) {
            console.error('[AddRental] Caught error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header
                title="List Equipment"
                subtitle="Rent machinery to local farmers"
                showBack
                onBack={() => router.back()}
            />
            <RentalForm onSubmit={handleSubmit} loading={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
