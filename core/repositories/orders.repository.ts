// TODO: fix, avoid using 'any' type
/* eslint-disable @typescript-eslint/no-explicit-any */
import {createClient} from '@supabase/supabase-js';
import {ImageDataFile, Order, OrderStatus,} from '../types/orders.types';
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

    async verifyUser(userId: string, rolename: string){
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
            .eq('user_id', userId)
            .eq('role_id', role.id)
            .single();

        return !!data;
    }
    async activeOrders(userId: string) {
        const { count, error } = await this.supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
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
            .select('*')
            .eq('status', OrderStatus.AVAILABLE)
            .gt('expires_at', new Date().toISOString());

        if (filters.minAmount) {
            query = query.gte('fiat_amount', filters.minAmount);
        }

        if (filters.maxAmount) {
            query = query.lte('fiat_amount', filters.maxAmount);
        }

        const sortColumn = filters.sortBy === 'amount' ? 'fiat_amount'
            : filters.sortBy || 'created_at';
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
    async uploadDbImage( imageDataFile: ImageDataFile): Promise<{ data: any; error?: string }> {
        const { data, error } = await this.supabase
            .from("images")
            .insert({
                name: imageDataFile.name,
                extension: imageDataFile.extension,
                created_at: imageDataFile.createdAt || new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            return { data: null, error: error.message };
        }
        return { data };
    }

    async uploadImageToStorage(filename: string, fileBuffer: Uint8Array, contentType: string): Promise<string | null> {
        const { error } = await this.supabase.storage
            .from("kibobucket")
            .upload(filename, fileBuffer, { contentType, upsert: true });

        return error ? error.message : null;
    }
    async uploadQrImage(id: string, idQr: string, ) {
        const qrUrl = await this.getImageUrl(idQr);
        const {data, error} = await this.supabase
            .from('orders')
            .update({
                qr_image: idQr,
                qr_image_url: qrUrl
            })
            .eq('id', id)
            .select("*")
            .single();
        if (error) {
            throw new Error(`Failed to save qrId in orders: ${error.message}`);
        }
        return this.mapDbToOrder(data);

    }
    async getExtensionImage(imageId: string): Promise<string> {
        const { data, error } = await this.supabase
            .from("images")
            .select("extension")
            .eq("id", imageId)
            .single();

        if (error || !data) {
            throw new Error(`Failed to get extension image: ${error.message}`);
        }
        return data.extension;
    }

    async getImageUrl(imageId: string): Promise<string> {
        const ext = await this.getExtensionImage(imageId);
        const { data } = await this.supabase.storage.from("kibobucket").getPublicUrl(`order-${imageId}.${ext}`);
        return data.publicUrl;
    }

    async updateStatus(id: string, status: OrderStatus, updates?: Partial<{
        allyId: string;
        takenAt: string;
        completedAt: string;
        cancelledAt: string;
        confirmationProof: string;
        confirmationProofUrl: string;
        qrImage: string;
        bankTransactionId: string;
        txHash: string;
        expiresAt: string;
    }>): Promise<Order> {
        const updateData: any = {status};

        if (updates?.allyId) updateData.ally_id = updates.allyId;
        if (updates?.takenAt) updateData.taken_at = updates.takenAt;
        if (updates?.completedAt) updateData.completed_at = updates.completedAt;
        if (updates?.cancelledAt) updateData.cancelled_at = updates.cancelledAt;
        if (updates?.confirmationProof) updateData.confirmation_proof = updates.confirmationProof;
        if (updates?.confirmationProofUrl) updateData.confirmation_proof_url = updates.confirmationProofUrl;
        if (updates?.qrImage) updateData.qr_image = updates.qrImage;
        if (updates?.bankTransactionId) updateData.bank_transaction_id = updates.bankTransactionId;
        if (updates?.txHash) updateData.tx_hash = updates.txHash;
        if(updates?.expiresAt) updateData.expires_at = updates.expiresAt;

        const {data, error} = await this.supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select("*")
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
            qrImageUrl: dbOrder.qr_image_url,
            confirmationProof: dbOrder.confirmation_proof,
            confirmationProofUrl: dbOrder.confirmation_proof_url,
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
