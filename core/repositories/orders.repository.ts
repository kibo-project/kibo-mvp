// TODO: fix, avoid using 'any' type
/* eslint-disable @typescript-eslint/no-explicit-any */
import {createClient} from '@supabase/supabase-js';
import {Order, OrderStatus,} from '../types/orders.types';
import {CreateOrderData, GetAvailableOrdersDto, GetOrdersDto} from '../dto/orders.dto';

export class OrdersRepository {
    private supabase;

    constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }

    async create(orderData: CreateOrderData): Promise<Order> {
        const {data, error} = await this.supabase
            .from('orders')
            .insert({
                status: orderData.status,
                fiat_amount: orderData.fiatAmount,
                crypto_amount: orderData.cryptoAmount,
                fiat_currency: orderData.fiatCurrency,
                crypto_currency: orderData.cryptoCurrency,
                user_id: orderData.userId,
                recipient: orderData.recipient,
                description: orderData.description,
                created_at: new Date().toISOString(),
            })
            .select("*")
            .single();

        if (error) {
            throw new Error(`Failed to create order: ${error.message}`);
        }

        return this.mapDbToOrder(data);
    }

    async findById(id: string): Promise<Order | null> {
        const {data, error} = await this.supabase
            .from('orders')
            .select("*")
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to find order: ${error.message}`);
        }

        return this.mapDbToOrder(data);
    }

    async verifyUser(user_id: string, rolename: string){
        const {data: role, error} = await this.supabase
            .from('roles')
            .select("*")
            .eq("name", rolename)
            .single()
        if (error) {
            return false;
        }
        const {data} = await this.supabase
            .from('users_roles')
            .select('*')
            .eq('user_id', user_id)
            .eq('role_id', role.id)
            .single();

        return !!data;
    }
    async activeOrders(user_id: string) {
        const { count, error } = await this.supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user_id)
            .eq("status", "AVAILABLE");

        if (error) throw new Error(error.message);

        return count ?? 0;
    }


    async findMany(filters: GetOrdersDto, user_id?: string): Promise<{
        orders: Order[];
        total: number;
    }> {

        let query = this.supabase
            .from('orders')
            .select("*", {count: 'exact'});

        if (user_id) {
            const exists = await this.verifyUser(user_id, filters.role);
            if (!exists) {
                throw new Error('User not found or role mismatch');
            }
            if (filters.role === "user") {
                query = query.eq('user_id', user_id);
            } else if (filters.role === "ally") {
                query = query.eq('ally_id', user_id);
            }
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        if (filters.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        }

        query = query.order('created_at', {ascending: false});

        const {data, error, count} = await query;

        if (error) {
            throw new Error(`Failed to fetch orders: ${error.message}`);
        }

        return {
            orders: data.map(this.mapDbToOrder),
            total: count || 0
        };
    }

    async findAvailable(filters: GetAvailableOrdersDto): Promise<Order[]> {
        let query = this.supabase
            .from('orders')
            .select(`
        *,
        user:users!orders_user_id_fkey(id, wallet_address, role, country, verified, successful_orders, reputation)
      `)
            .eq('status', OrderStatus.AVAILABLE)
            .gt('expires_at', new Date().toISOString());

        if (filters.country) {
            // Filter by user's country through join
            query = query.eq('user.country', filters.country);
        }

        if (filters.minAmount) {
            query = query.gte('amount_fiat', filters.minAmount);
        }

        if (filters.maxAmount) {
            query = query.lte('amount_fiat', filters.maxAmount);
        }

        const sortColumn = filters.sortBy === 'amount' ? 'amount_fiat' : filters.sortBy || 'created_at';
        query = query.order(sortColumn, {ascending: false});

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const {data, error} = await query;

        if (error) {
            throw new Error(`Failed to fetch available orders: ${error.message}`);
        }

        return data.map(this.mapDbToOrder);
    }

    async updateStatus(id: string, status: OrderStatus, updates?: Partial<{
        allyId: string;
        takenAt: string;
        completedAt: string;
        cancelledAt: string;
        proofUrl: string;
        bankTransactionId: string;
        releaseTxHash: string;
    }>): Promise<Order> {
        const updateData: any = {status};

        if (updates?.allyId) updateData.ally_id = updates.allyId;
        if (updates?.takenAt) updateData.taken_at = updates.takenAt;
        if (updates?.completedAt) updateData.completed_at = updates.completedAt;
        if (updates?.cancelledAt) updateData.cancelled_at = updates.cancelledAt;
        if (updates?.proofUrl) updateData.proof_url = updates.proofUrl;
        if (updates?.bankTransactionId) updateData.bank_transaction_id = updates.bankTransactionId;
        if (updates?.releaseTxHash) updateData.release_tx_hash = updates.releaseTxHash;

        const {data, error} = await this.supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select(`
        *,
        user:users!orders_user_id_fkey(id, wallet_address, role, country, verified),
        ally:users!orders_ally_id_fkey(id, wallet_address, role, country, verified)
      `)
            .single();

        if (error) {
            throw new Error(`Failed to update order status: ${error.message}`);
        }

        return this.mapDbToOrder(data);
    }

    private mapDbToOrder(dbOrder: any): Order {
        return {
            id: dbOrder.id,
            status: dbOrder.status,
            fiatAmount: dbOrder.fiat_amount,
            cryptoAmount: dbOrder.crypto_amount,
            fiatCurrency: dbOrder.fiat_currency,
            cryptoCurrency: dbOrder.crypto_currency,
            network: dbOrder.network,
            qrData: dbOrder.qr_data,
            qrImage: dbOrder.qr_image,
            confirmationProof: dbOrder.confirmation_proof,
            createdAt: dbOrder.created_at,
            takenAt: dbOrder.taken_at,
            completedAt: dbOrder.completed_at,
            cancelledAt: dbOrder.cancelled_at,
            expiresAt: dbOrder.expires_at,
            escrowTxHash: dbOrder.escrow_tx_hash,
            txHash: dbOrder.tx_hash,
            bankTransactionId: dbOrder.bank_transaction_id,
            userId: dbOrder.user_id,
            allyId: dbOrder.ally_id
        };
    }
}
