import { supabase } from './supabase';

export interface EquipmentRental {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    price_per_day: number;
    location: string | null;
    lat: number | null;
    lng: number | null;
    is_available: boolean;
    created_at: string;
    updated_at: string;
    distance?: number; // Added locally if requested with radius
    owner?: {
        name: string;
        phone: string;
    };
}

export interface RentalRequest {
    id: string;
    rental_id: string;
    requester_id: string;
    owner_id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    start_date: string;
    end_date: string;
    total_price: number;
    created_at: string;
    updated_at: string;
    rental?: EquipmentRental;
    requester?: {
        name: string;
        phone: string;
    };
}

export interface RadiusParams {
    lat: number;
    lng: number;
    radius_km: number;
}

// ── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch rental listings. If radiusParams is provided, uses the haversine RPC.
 * Otherwise, fetches all available non-RPC listings.
 */
export async function fetchRentals(radiusParams?: RadiusParams): Promise<EquipmentRental[]> {
    try {
        if (radiusParams) {
            const { data, error } = await supabase
                .rpc('get_rentals_within_radius', {
                    user_lat: radiusParams.lat,
                    user_lng: radiusParams.lng,
                    radius_km: radiusParams.radius_km
                });

            if (error) {
                console.error('[fetchRentals] RPC error:', error);
                // Fallback to basic fetch if RPC fails
                return fetchRentalsBasic();
            }
            return data as EquipmentRental[];
        } else {
            return fetchRentalsBasic();
        }
    } catch (err) {
        console.error('[fetchRentals] Try-catch error:', err);
        return [];
    }
}

async function fetchRentalsBasic(): Promise<EquipmentRental[]> {
    const { data, error } = await supabase
        .from('equipment_rentals')
        .select(`
            *,
            owner:users!owner_id ( name, phone )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[fetchRentalsBasic] error:', error);
        return [];
    }

    // Flatten owner
    return (data || []).map((row: any) => {
        const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
        return {
            ...row,
            owner: owner || undefined,
        };
    });
}

/**
 * Create a new equipment rental listing.
 */
export async function createRentalListing(
    ownerId: string,
    data: {
        name: string;
        description: string;
        price_per_day: number;
        location: string;
        lat?: number | null;
        lng?: number | null;
        image_url?: string;
    }
): Promise<EquipmentRental | null> {
    try {
        const { data: result, error } = await supabase
            .from('equipment_rentals')
            .insert({
                owner_id: ownerId,
                name: data.name,
                description: data.description,
                price_per_day: data.price_per_day,
                location: data.location,
                lat: data.lat || null,
                lng: data.lng || null,
                image_url: data.image_url || null,
                is_available: true
            })
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (err) {
        console.error('[createRentalListing] error:', err);
        return null;
    }
}

/**
 * Request to book an equipment rental.
 */
export async function createRentalRequest(
    rental: EquipmentRental,
    requesterId: string,
    startDate: string, // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
): Promise<{ success: boolean; error?: string }> {
    try {
        // Calculate days simply (rough estimate)
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const totalPrice = diffDays * rental.price_per_day;

        const { error } = await supabase
            .from('rental_requests')
            .insert({
                rental_id: rental.id,
                requester_id: requesterId,
                owner_id: rental.owner_id,
                status: 'pending',
                start_date: startDate,
                end_date: endDate,
                total_price: totalPrice
            });

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('[createRentalRequest] error:', err);
        return { success: false, error: err.message || 'Failed to request rental.' };
    }
}

/**
 * Fetch incoming and outgoing rental requests for a user.
 */
export async function fetchMyRentalRequests(userId: string): Promise<{
    incoming: RentalRequest[];
    outgoing: RentalRequest[];
}> {
    try {
        // We select the joined data across rental_requests -> rentals and users.
        const { data, error } = await supabase
            .from('rental_requests')
            .select(`
                *,
                rental:equipment_rentals!rental_id (*),
                requester:users!requester_id (name, phone)
            `)
            .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const allRequests = (data || []).map((row: any) => {
            const rental = Array.isArray(row.rental) ? row.rental[0] : row.rental;
            const requester = Array.isArray(row.requester) ? row.requester[0] : row.requester;
            return {
                ...row,
                rental: rental || undefined,
                requester: requester || undefined,
            };
        });

        const incoming = allRequests.filter(r => r.owner_id === userId);
        const outgoing = allRequests.filter(r => r.requester_id === userId);

        return { incoming, outgoing };
    } catch (err) {
        console.error('[fetchMyRentalRequests] error:', err);
        return { incoming: [], outgoing: [] };
    }
}

/**
 * Update the status of a rental request (accept/reject/complete).
 */
export async function updateRentalRequestStatus(
    requestId: string,
    newStatus: 'accepted' | 'rejected' | 'completed' | 'cancelled'
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('rental_requests')
            .update({ status: newStatus })
            .eq('id', requestId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('[updateRentalRequestStatus] error:', err);
        return false;
    }
}
