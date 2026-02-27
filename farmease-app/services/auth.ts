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

// ────────────────────────────────────────────────────────────────────────────

// Send OTP to phone number
export const sendOtp = async (phone: string) => {
    // Dummy implementation: just return success
    return { user: { phone } };
};

// Verify OTP
export const verifyOtp = async (phone: string, token: string) => {
    if (token === '123456') {
        const dummyUser = {
            id: 'dummy-farmer-123',
            phone,
            name: 'Test Farmer',
            role: 'farmer' as UserRole,
            created_at: new Date().toISOString()
        };
        const session = {
            access_token: 'dummy-token',
            refresh_token: 'dummy-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: dummyUser
        };

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
    if (profile.id?.startsWith('dummy')) {
        const stored = await storage.getItem('dummy_profile');
        const currentProfile = stored ? JSON.parse(stored) : {};
        const newProfile = { ...currentProfile, ...profile };
        await storage.setItem('dummy_profile', JSON.stringify(newProfile));
        return newProfile as UserProfile;
    }

    const { data, error } = await supabase
        .from('users')
        .upsert(profile, { onConflict: 'id' })
        .select()
        .single();
    if (error) throw error;
    return data as UserProfile;
};

// Get user profile
export const getProfile = async (userId: string) => {
    if (userId.startsWith('dummy')) {
        const stored = await storage.getItem('dummy_profile');
        return stored ? JSON.parse(stored) as UserProfile : null;
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
