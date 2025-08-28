// TODO: fix, avoid using 'any' type

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateOrderDto, GetOrdersDto } from "../dto/orders.dto";
import { OrderMapper } from "../mappers/order.mapper";
import { AvailableOrdersFilters, ImageDataFile, Order, OrderStatus } from "../types/orders.types";
import { createClient } from "@supabase/supabase-js";

export class OrdersRepository {
  private supabase;

  constructor() {
    this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { data, error } = await this.supabase
      .from("orders")
      .insert({
        status: createOrderDto.status,
        fiat_amount: createOrderDto.fiatAmount,
        crypto_amount: createOrderDto.cryptoAmount,
        fiat_currency: createOrderDto.fiatCurrency,
        crypto_currency: createOrderDto.cryptoCurrency,
        user_id: createOrderDto.userId,
        recipient: createOrderDto.recipient,
        description: createOrderDto.description,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
    return OrderMapper.dbToOrder(data);
  }

  async findById(id: string): Promise<Order | null> {
    const { data, error } = await this.supabase.from("orders").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find order: ${error.message}`);
    }

    return OrderMapper.dbToOrder(data);
  }

  async verifyUser(userId: string, rolename: string) {
    const { data: roles, error: roleError } = await this.supabase
      .from("roles")
      .select("*")
      .eq("name", rolename)
      .limit(1);

    if (roleError || !roles || roles.length === 0) {
      console.log(`Role '${rolename}' not found`);
      return false;
    }
    const role = roles[0];

    const { data: userRole, error: userRoleError } = await this.supabase
      .from("users_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role_id", role.id)
      .limit(1);

    if (!userRole || userRole.length === 0 || userRoleError) {
      console.log(`User ${userId} doesn't have role ${rolename}, checking if user exists`);
      return false;
    }

    return true;
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

  async findMany(filters: GetOrdersDto): Promise<{ orders: Order[]; total: number }> {
    let query = this.supabase.from("orders").select("*", { count: "exact" });

    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }

    if (filters.allyId) {
      query = query.eq("ally_id", filters.allyId);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.offset !== undefined && filters.limit !== undefined) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    } else if (filters.limit !== undefined) {
      query = query.limit(filters.limit);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return {
      orders: data.map(OrderMapper.dbToOrder),
      total: count || 0,
    };
  }

  async findAvailable(filters: AvailableOrdersFilters): Promise<Order[]> {
    let query = this.supabase
      .from("orders")
      .select("*")
      .eq("status", OrderStatus.AVAILABLE)
      .gt("expires_at", new Date().toISOString());

    if (filters.minAmount) {
      query = query.gte("fiat_amount", filters.minAmount);
    }

    if (filters.maxAmount) {
      query = query.lte("fiat_amount", filters.maxAmount);
    }

    const sortColumn = filters.sortBy === "amount" ? "fiat_amount" : filters.sortBy || "created_at";
    query = query.order(sortColumn, { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch available orders: ${error.message}`);
    }

    return data.map(OrderMapper.dbToOrder);
  }
  async uploadDbImage(imageDataFile: ImageDataFile): Promise<{ data: any; error?: string }> {
    const { data, error } = await this.supabase
      .from("images")
      .insert({
        name: imageDataFile.name,
        extension: imageDataFile.extension,
        created_at: imageDataFile.createdAt || new Date().toISOString(),
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
      .from(process.env.SUPABASE_BUCKET_NAME as string)
      .upload(filename, fileBuffer, { contentType, upsert: true });

    return error ? error.message : null;
  }
  async uploadQrImage(id: string, idQr: string) {
    const qrUrl = await this.getImageUrl(idQr);
    const { data, error } = await this.supabase
      .from("orders")
      .update({
        qr_image: idQr,
        qr_image_url: qrUrl,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      throw new Error(`Failed to save qrId in orders: ${error.message}`);
    }
    return OrderMapper.dbToOrder(data);
  }
  async getExtensionImage(imageId: string): Promise<string> {
    const { data, error } = await this.supabase.from("images").select("extension").eq("id", imageId).single();

    if (error || !data) {
      throw new Error(`Failed to get extension image: ${error.message}`);
    }
    return data.extension;
  }

  async getImageUrl(imageId: string): Promise<string> {
    const ext = await this.getExtensionImage(imageId);
    const { data } = this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME as string)
      .getPublicUrl(`order-${imageId}.${ext}`);
    return data.publicUrl;
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    updates?: Partial<{
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
    }>
  ): Promise<Order> {
    const updateData: any = { status };

    if (updates?.allyId) updateData.ally_id = updates.allyId;
    if (updates?.takenAt) updateData.taken_at = updates.takenAt;
    if (updates?.completedAt) updateData.completed_at = updates.completedAt;
    if (updates?.cancelledAt) updateData.cancelled_at = updates.cancelledAt;
    if (updates?.confirmationProof) updateData.confirmation_proof = updates.confirmationProof;
    if (updates?.confirmationProofUrl) updateData.confirmation_proof_url = updates.confirmationProofUrl;
    if (updates?.qrImage) updateData.qr_image = updates.qrImage;
    if (updates?.bankTransactionId) updateData.bank_transaction_id = updates.bankTransactionId;
    if (updates?.txHash) updateData.tx_hash = updates.txHash;
    if (updates?.expiresAt) updateData.expires_at = updates.expiresAt;

    const { data, error } = await this.supabase.from("orders").update(updateData).eq("id", id).select("*").single();

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    return OrderMapper.dbToOrder(data);
  }
}
