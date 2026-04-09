import { supabase } from './supabase';
import { UserRole } from '../utils/constants';
import { Platform } from 'react-native';

export interface UserProfile {
    id: string;
    phone: string;
    name: string;
    role: UserRole;
    farm_location?: string;
    land_size?: number;
    crop_history?: string[];
    delivery_address?: string;
    avatar_url?: string;
    lat?: number;
    lng?: number;
    created_at: string;
}

// ─── Platform-aware storage ─────────────────────────────────────────────────
// AsyncStorage doesn't work on web; use localStorage there instead.

const storage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return AsyncStorage.getItem(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return AsyncStorage.setItem(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return AsyncStorage.removeItem(key);
    },
};

/**
 * Generate a deterministic UUID from a phone number so each phone
 * always gets the same dummy ID, but different phones get different IDs.
 * Format: dddddddd-dddd-4ddd-8ddd-dddddddddddd
 */
function phoneToDummyUUID(phone: string): string {
    // Strip non-digits and pad/truncate to 20 digits
    const digits = phone.replace(/\D/g, '').padEnd(20, '0').slice(0, 20);
    // Build a valid UUID v4 pattern using the phone digits
    return [
        'dd' + digits.slice(0, 6),       // 8 chars
        digits.slice(6, 10),             // 4 chars
        '4' + digits.slice(10, 13),      // 4 chars (version 4)
        '8' + digits.slice(13, 16),      // 4 chars (variant)
        digits.slice(16, 20) + '00000000', // 12 chars
    ].join('-');
}

const DUMMY_KEY = 'dummy_user_ids';

/** Check if an ID belongs to a dummy user (stored locally, not in Supabase) */
const isDummyUser = async (id?: string): Promise<boolean> => {
    if (!id) return false;
    const stored = await storage.getItem(DUMMY_KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    return ids.includes(id);
};

const addDummyId = async (id: string) => {
    const stored = await storage.getItem(DUMMY_KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    if (!ids.includes(id)) {
        ids.push(id);
        await storage.setItem(DUMMY_KEY, JSON.stringify(ids));
    }
};

// ────────────────────────────────────────────────────────────────────────────

// Send OTP to phone number
export const sendOtp = async (phone: string) => {
    // Dummy implementation: just return success
    return { user: { phone } };
};

/** Quick check: does this string look like a valid UUID? */
function isValidUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Verify OTP
export const verifyOtp = async (phone: string, token: string) => {
    if (token === '123456') {
        const dummyId = phoneToDummyUUID(phone);

        // Check if we already have a dummy session for this phone
        const existingSession = await storage.getItem('dummy_session');
        if (existingSession) {
            const parsed = JSON.parse(existingSession);
            // Only reuse if phone matches AND the stored ID is a valid UUID
            if (parsed.user?.phone === phone && isValidUUID(parsed.user?.id)) {
                // Migrate: ensure the ID matches the deterministic UUID
                if (parsed.user.id !== dummyId) {
                    parsed.user.id = dummyId;
                    await storage.setItem('dummy_session', JSON.stringify(parsed));
                }
                return { session: parsed, user: parsed.user };
            }
            // Old/invalid session — clear it so we regenerate below
            await storage.removeItem('dummy_session');
            await storage.removeItem('dummy_profile');
        }

        // 1. First, check if there's a local cached profile
        let existingProfile = null;
        const storedProfileMap = await storage.getItem('dummy_profile');
        if (storedProfileMap) {
            existingProfile = JSON.parse(storedProfileMap);
        }

        // 2. If no local cache, check Supabase (they might have registered on another device/cleared cache)
        if (!existingProfile?.role) {
            const { data } = await supabase.from('users').select('*').eq('id', dummyId).single();
            if (data) existingProfile = data;
        }

        const dummyUser = {
            id: dummyId,
            phone,
            ...existingProfile,
            created_at: existingProfile?.created_at || new Date().toISOString()
        } as unknown as UserProfile;

        const session = {
            access_token: 'dummy-token-' + dummyId,
            refresh_token: 'dummy-refresh-' + dummyId,
            expires_in: 3600,
            token_type: 'bearer',
            user: dummyUser
        };

        await addDummyId(dummyId);
        await storage.setItem('dummy_session', JSON.stringify(session));
        await storage.setItem('dummy_profile', JSON.stringify(dummyUser));

        return { session, user: dummyUser };
    }

    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw error;
    return data;
};

// Create or update user profile
export const upsertProfile = async (profile: Partial<UserProfile>) => {
    // Defensive: if id is missing, try to get it from the current session
    if (!profile.id) {
        const currentSession = await getSession();
        if (currentSession?.user?.id) {
            profile.id = currentSession.user.id;
        }
    }

    if (!profile.id) {
        throw new Error('Cannot upsert profile: no user ID available');
    }

    const dummy = await isDummyUser(profile.id);

    // Always save to local storage for dummy users (as cache/fallback)
    if (dummy) {
        const stored = await storage.getItem('dummy_profile');
        const currentProfile = stored ? JSON.parse(stored) : {};
        const newProfile = { ...currentProfile, ...profile };
        await storage.setItem('dummy_profile', JSON.stringify(newProfile));
    }

    // Always persist to Supabase users table (only if ID is a valid UUID)
    if (!isValidUUID(profile.id)) {
        console.warn('[upsertProfile] Skipping Supabase — invalid UUID:', profile.id);
        if (dummy) {
            const stored = await storage.getItem('dummy_profile');
            return stored ? (JSON.parse(stored) as UserProfile) : (profile as UserProfile);
        }
        throw new Error('Cannot upsert profile: ID is not a valid UUID');
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .upsert(profile, { onConflict: 'id' })
            .select()
            .single();
        if (error) throw error;
        return data as UserProfile;
    } catch (err) {
        console.warn('[upsertProfile] Supabase write failed, using local:', err);
        // If Supabase fails for dummy user, return the local copy
        if (dummy) {
            const stored = await storage.getItem('dummy_profile');
            return stored ? (JSON.parse(stored) as UserProfile) : (profile as UserProfile);
        }
        throw err;
    }
};

// Get user profile
export const getProfile = async (userId: string) => {
    if (await isDummyUser(userId)) {
        const stored = await storage.getItem('dummy_profile');
        return stored ? JSON.parse(stored) as UserProfile : null;
    }

    // Don't query Supabase with an invalid UUID (legacy dummy IDs)
    if (!isValidUUID(userId)) {
        return null;
    }

    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as UserProfile | null;
};

// Sign out
export const signOut = async () => {
    await storage.removeItem('dummy_session');
    await storage.removeItem('dummy_profile');
    try {
        await supabase.auth.signOut();
    } catch {
        // ignore signout errors on web
    }
};

// Get current session
export const getSession = async () => {
    try {
        const dummySessionStr = await storage.getItem('dummy_session');
        if (dummySessionStr) {
            return JSON.parse(dummySessionStr);
        }
        const { data, error } = await supabase.auth.getSession();
        if (error) return null;
        return data.session;
    } catch {
        return null;
    }
};
