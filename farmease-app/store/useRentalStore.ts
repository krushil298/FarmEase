import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RentalItem {
    id: string;
    name: string;
    image: string;
    price: number;
    unit: string;
    owner: string;
    distance: string;
    available: boolean;
    isUserListing?: boolean;
}

// Prebuilt equipment options users can pick from
export const EQUIPMENT_OPTIONS = [
    { name: 'Tractor', image: '🚜', suggestedPrice: 800 },
    { name: 'Seed Drill', image: '🌾', suggestedPrice: 300 },
    { name: 'Power Tiller', image: '⚙️', suggestedPrice: 500 },
    { name: 'Harvester Machine', image: '🏭', suggestedPrice: 2000 },
    { name: 'Sprayer Pump', image: '💧', suggestedPrice: 200 },
    { name: 'Rotavator', image: '🔧', suggestedPrice: 600 },
    { name: 'Plough', image: '🪵', suggestedPrice: 250 },
    { name: 'Water Pump', image: '🔵', suggestedPrice: 150 },
    { name: 'Thresher', image: '🌀', suggestedPrice: 700 },
    { name: 'Cultivator', image: '🛠️', suggestedPrice: 400 },
    { name: 'Trolley', image: '🛒', suggestedPrice: 350 },
    { name: 'Generator', image: '⚡', suggestedPrice: 500 },
];

const DEFAULT_RENTALS: RentalItem[] = [
    { id: '1', owner: 'Ramesh Patel', name: 'Mahindra Tractor 575 DI', image: '🚜', price: 800, unit: 'per day', distance: '1.2 km away', available: true },
    { id: '2', owner: 'Suresh Kumar', name: 'Heavy Duty Seed Drill', image: '🌾', price: 300, unit: 'per day', distance: '2.5 km away', available: true },
    { id: '3', owner: 'Amit Singh', name: 'Power Tiller', image: '⚙️', price: 500, unit: 'per day', distance: '3.0 km away', available: false },
    { id: '4', owner: 'Vikram Yadav', name: 'Harvester Machine', image: '🏭', price: 2000, unit: 'per day', distance: '5.1 km away', available: true },
    { id: '5', owner: 'Deepak Sharma', name: 'Sprayer Pump', image: '💧', price: 200, unit: 'per day', distance: '0.8 km away', available: true },
    { id: '6', owner: 'Mohan Das', name: 'Rotavator', image: '🔧', price: 600, unit: 'per day', distance: '4.2 km away', available: true },
];

const STORAGE_KEY = 'farmease_rentals';

interface RentalStore {
    items: RentalItem[];
    initialize: () => Promise<void>;
    addItem: (item: Omit<RentalItem, 'id'>) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    toggleAvailability: (id: string) => Promise<void>;
}

export const useRentalStore = create<RentalStore>((set, get) => ({
    items: DEFAULT_RENTALS,

    initialize: async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                const userItems: RentalItem[] = JSON.parse(saved);
                set({ items: [...DEFAULT_RENTALS, ...userItems] });
            }
        } catch {}
    },

    addItem: async (item) => {
        const newItem: RentalItem = {
            ...item,
            id: `user_${Date.now()}`,
        };
        const current = get().items;
        const updated = [newItem, ...current];
        set({ items: updated });

        // Persist only user listings
        try {
            const userItems = updated.filter(i => i.isUserListing);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userItems));
        } catch {}
    },

    removeItem: async (id) => {
        const updated = get().items.filter(i => i.id !== id);
        set({ items: updated });
        try {
            const userItems = updated.filter(i => i.isUserListing);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userItems));
        } catch {}
    },

    toggleAvailability: async (id) => {
        const updated = get().items.map(i =>
            i.id === id ? { ...i, available: !i.available } : i
        );
        set({ items: updated });
        try {
            const userItems = updated.filter(i => i.isUserListing);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userItems));
        } catch {}
    },
}));
