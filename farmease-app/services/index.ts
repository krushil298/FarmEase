/**
 * Services barrel export
 * 
 * Provides a single import point for all service modules:
 *   import { supabase, sendChatMessage, fetchProducts } from '@services';
 */

// Database
export { supabase } from './supabase';

// Authentication
export { sendOtp, verifyOtp, upsertProfile, getProfile, signOut, getSession } from './auth';
export type { UserProfile } from './auth';

// AI Chat
export { sendChatMessage, speakText, transcribeAudio, checkHealth } from './chatApi';
export type { ChatMessage, ChatResponse } from './chatApi';

// Disease Detection (ML)
export { detectDisease } from './ml';
export type { DiseasePrediction } from './ml';

// Crop Recommendation
export { recommendCrops } from './cropRecommendation';

// Fertilizer Advisory
export { recommendFertilizer } from './fertilizerRecommendation';

// Marketplace
export { fetchProducts, fetchProductById, createProduct, updateProduct, deleteProduct, fetchMyProducts, uploadProductImage } from './marketplace';
export type { Product, CreateProductInput, ProductFilters } from './marketplace';

// Orders
export { placeOrder, fetchMyOrders, fetchSellerOrders, updateOrderStatus, fetchFarmerRevenue } from './orders';

// Equipment Rentals
export { fetchRentals, fetchRentalById, createRental, fetchMyRentals, createRentalRequest, fetchRentalRequests, updateRentalRequestStatus, fetchMyRentalRequests } from './rentals';

// Location
export { getCurrentLocation, reverseGeocode } from './location';
export type { LocationCoords } from './location';

// Translation
export { translateText, translateBatch } from './translate';

// Government Schemes
export { fetchSchemes } from './schemes';

// Notifications
export { registerForPushNotifications, scheduleLocalNotification } from './notifications';
