import { create } from 'zustand';
import { Platform } from 'react-native';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'mr' | 'bn' | 'gu' | 'pa' | 'ml' | 'or';

interface LanguageState {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
}

// Platform-aware storage: localStorage on web, AsyncStorage on native
const platformStorage =
    Platform.OS === 'web'
        ? {
            getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
            setItem: (key: string, value: string) => { localStorage.setItem(key, value); return Promise.resolve(); },
            removeItem: (key: string) => { localStorage.removeItem(key); return Promise.resolve(); },
        }
        : {
            getItem: async (key: string) => {
                const AS = (await import('@react-native-async-storage/async-storage')).default;
                return AS.getItem(key);
            },
            setItem: async (key: string, value: string) => {
                const AS = (await import('@react-native-async-storage/async-storage')).default;
                return AS.setItem(key, value);
            },
            removeItem: async (key: string) => {
                const AS = (await import('@react-native-async-storage/async-storage')).default;
                return AS.removeItem(key);
            },
        };

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'en',
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'farmease-language',
            storage: createJSONStorage(() => platformStorage),
        }
    )
);
