import { supabase } from './supabase';

// ── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
    product_id: string;
    seller_id: string;
    quantity: number;
    unit_price: number;
    product_name: string;
}

export interface Order {
    id: string;
    buyer_id: string;
    seller_id: string;
    product_id: string;
    quantity: number;
    total_price: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    delivery_address?: string;
    created_at: string;
    product?: {
        name: string;
        image_url?: string;
        unit: string;
    };
}

// ── API Functions ────────────────────────────────────────────────────────────

/**
 * Place an order for all items in the cart.
 * Creates one order row per cart item, decrements product stock,
 * and marks products as unavailable when stock reaches 0.
 */
export async function placeOrder(
    buyerId: string,
    items: OrderItem[],
    deliveryAddress?: string
): Promise<{ success: boolean; orderIds: string[]; error?: string }> {
    const orderIds: string[] = [];

    try {
        for (const item of items) {
            // 1. Fetch current product stock
            const { data: product, error: prodError } = await supabase
                .from('products')
                .select('quantity, is_available')
                .eq('id', item.product_id)
                .single();

            if (prodError || !product) {
                console.error('[placeOrder] product fetch error:', prodError);
                throw new Error(`Failed to fetch product ${item.product_name}`);
            }

            if (!product.is_available || product.quantity < item.quantity) {
                throw new Error(`Not enough stock for ${item.product_name}`);
            }

            // 2. Insert the order row
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    buyer_id: buyerId,
                    seller_id: item.seller_id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    total_price: item.unit_price * item.quantity,
                    status: 'pending',
                    delivery_address: deliveryAddress || null,
                })
                .select('id')
                .single();

            if (orderError) {
                console.error('[placeOrder] insert error:', orderError);
                throw orderError;
            }

            orderIds.push(order.id);

            // 3. Decrement stock and mark unavailable if zero
            const newQty = product.quantity - item.quantity;
            const updateData: Record<string, any> = { quantity: newQty };
            if (newQty <= 0) {
                updateData.is_available = false;
            }

            const { error: updateError } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', item.product_id);

            if (updateError) {
                console.error('[placeOrder] stock update error:', updateError);
                throw updateError;
            }
        }

        console.log('[placeOrder] success, orders:', orderIds);
        return { success: true, orderIds };
    } catch (err: any) {
        console.error('[placeOrder] fatal error:', err);
        return {
            success: false,
            orderIds,
            error: err?.message || 'Failed to place order',
        };
    }
}

/**
 * Fetch orders for a user (as buyer or seller).
 */
export async function fetchMyOrders(userId: string): Promise<Order[]> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id, buyer_id, seller_id, product_id, quantity,
                total_price, status, delivery_address, created_at,
                product:products!product_id ( name, image_url, unit )
            `)
            .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => {
            const product = Array.isArray(row.product) ? row.product[0] : row.product;
            return {
                ...row,
                product: product || undefined,
            };
        });
    } catch (err) {
        console.error('[fetchMyOrders] error:', err);
        return [];
    }
}

/**
 * Fetch total revenue for a farmer (sum of all their successful sales).
 */
export async function fetchFarmerRevenue(sellerId: string): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('total_price')
            .eq('seller_id', sellerId)
            // Revenue only counts if it's not cancelled
            .neq('status', 'cancelled');

        if (error) throw error;

        const total = (data || []).reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);
        return total;
    } catch (err) {
        console.error('[fetchFarmerRevenue] error:', err);
        return 0;
    }
}
