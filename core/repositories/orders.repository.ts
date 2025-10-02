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
        qr_image: createOrderDto.qrImage,
        qr_image_url: createOrderDto.qrImageUrl,
        expires_at: createOrderDto.expiresAt,
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

    if (error || !data) {
      throw new Error(`Failed to find order: ${error}`);
    }

    return OrderMapper.dbToOrder(data);
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

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;

      const numericSearch = parseFloat(filters.search);

      if (!isNaN(numericSearch)) {
        query = query.or(`fiat_amount.eq.${numericSearch},` + `crypto_amount.eq.${numericSearch}`);
      } else {
        query = query.or(
          `status.ilike.${searchTerm},` + `fiat_currency.ilike.${searchTerm},` + `crypto_currency.ilike.${searchTerm}`
        );
      }
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

  async updateAvailableToCancelled(userId: string) {
    const { error } = await this.supabase
      .from("orders")
      .update({ status: OrderStatus.CANCELLED })
      .eq("user_id", userId)
      .eq("status", OrderStatus.AVAILABLE)
      .lt("expires_at", new Date().toISOString());

    if (error) {
      console.error(`Failed to update available to: ${error.message}`);
    }
  }

  async subscribeToChanges(filterCondition: string, callback: (data: any) => void): Promise<any> {
    console.log("RLS deshabilitado :", filterCondition);

    const match = filterCondition.match(/^(.+)=eq\.(.+)$/);
    if (!match) {
      throw new Error("Invalid filter condition format");
    }

    const [, field, value] = match;
    console.log(`filtro  - campo: ${field}, Valor: ${value}`);

    const channel = this.supabase
      .channel(`orders_${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload: any) => {
          console.log("recibido ", payload.eventType);

          let shouldTrigger = false;

          switch (payload.eventType) {
            case "INSERT":
              console.log("INSERT PAYLOAD", payload);
              shouldTrigger = this.matchesFilter(payload.new, field, value);
              break;
            case "UPDATE":
              const matchesNew = this.matchesFilter(payload.new, field, value);
              const matchesOld = this.matchesFilter(payload.old, field, value);
              shouldTrigger = matchesNew || matchesOld;
              break;
            case "DELETE":
              console.log("DELETE PAYLOAD", payload);

              shouldTrigger = this.matchesFilter(payload.old, field, value);
              break;
          }

          console.log(`filtro ${field}=${value} `, shouldTrigger);

          if (shouldTrigger) {
            try {
              callback({
                eventType: payload.eventType,
                old: payload.old ? OrderMapper.dbToOrder(payload.old) : null,
                new: payload.new ? OrderMapper.dbToOrder(payload.new) : null,
              });
            } catch (error) {
              console.error("error en callbac ", error);
            }
          }
        }
      )
      .subscribe(status => {
        console.log("Estado suscricion ", status);
      });

    return {
      channel,
      unsubscribe: () => this.supabase.removeChannel(channel),
    };
  }

  private matchesFilter(record: any, field: string, value: string): boolean {
    if (!record) return false;

    const recordValue = record[field]?.toString();
    const matches = recordValue === value;

    return matches;
  }
  async subscribeToOrderChangesById(orderId: string, callback: (data: any) => void): Promise<any> {
    console.log("Suscribiéndose a cambios para orden ID:", orderId);

    const channel = this.supabase
      .channel(`order_${orderId}_${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          console.log("Cambio recibido para orden", orderId, ":", payload.eventType);

          try {
            callback({
              eventType: payload.eventType,
              old: payload.old ? OrderMapper.dbToOrder(payload.old) : null,
              new: payload.new ? OrderMapper.dbToOrder(payload.new) : null,
            });
          } catch (error) {
            console.error("Error en callback para orden", orderId, ":", error);
          }
        }
      )
      .subscribe(status => {
        console.log("Estado de suscripción para orden", orderId, ":", status);
      });

    return {
      channel,
      unsubscribe: () => this.supabase.removeChannel(channel),
    };
  }

  async findAvailable(filters: AvailableOrdersFilters): Promise<{ orders: Order[]; total: number }> {
    let query = this.supabase
      .from("orders")
      .select("*", { count: "exact" })
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

    if (filters.offset !== undefined && filters.limit !== undefined) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    } else if (filters.limit !== undefined) {
      query = query.limit(filters.limit);
    }

    query = query.order("created_at", { ascending: false });
    const { data, error, count } = await query;
    if (error) {
      throw new Error(`Failed to fetch available orders: ${error.message}`);
    }

    return {
      orders: data.map(OrderMapper.dbToOrder),
      total: count || 0,
    };
  }
  async uploadDbImage(imageDataFile: ImageDataFile) {
    const { data, error } = await this.supabase
      .from("images")
      .insert({
        name: imageDataFile.name,
        extension: imageDataFile.extension,
        created_at: imageDataFile.createdAt || new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error("Failed to upload image:");
    }
    return { data };
  }

  async uploadImageToStorage(filename: string, fileBuffer: Uint8Array, contentType: string): Promise<string> {
    const bucket = this.supabase.storage.from(process.env.SUPABASE_BUCKET_NAME as string);

    const { error } = await bucket.upload(filename, fileBuffer, { contentType, upsert: true });
    if (error) throw new Error(error.message);

    const { data } = bucket.getPublicUrl(filename);
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
