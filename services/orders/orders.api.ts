import { ENDPOINTS } from "../../config/api";
import { ApiResponse } from "../../core/types/generic.types";
import {
  AvailableOrdersFilters,
  AvailableOrdersResponse,
  CancelOrderResponse,
  CreateOrderRequest,
  OrderDetailsResponse,
  OrderResponse,
  OrdersFilters,
  OrdersListResponse,
  TakeOrderResponse,
  UploadProofRequest,
} from "../../core/types/orders.types";

class OrdersApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {};
    if (!(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      credentials: "include", // Esto envía las cookies automáticamente
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("API Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async getOrders(filters: OrdersFilters = {}): Promise<ApiResponse<OrdersListResponse>> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.offset) params.append("offset", filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.ORDERS}${queryString ? `?${queryString}` : ""}`;

    return this.request<ApiResponse<OrdersListResponse>>(endpoint);
  }

  async getOrdersRealtime(
    filters: OrdersFilters = {},
    onData: (data: any) => void,
    onError?: (error: Error) => void
  ): Promise<() => void> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.offset) params.append("offset", filters.offset.toString());

    const queryString = params.toString();
    const url = `${this.baseUrl}/orders/realtime${queryString ? `?${queryString}` : ""}`;

    const eventSource = new EventSource(url, {
      withCredentials: true,
    });

    eventSource.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        onData(data);
      } catch (error) {
        onError?.(new Error("Failed to parse SSE data"));
      }
    };

    eventSource.onerror = error => {
      onError?.(new Error("SSE connection error"));
    };

    return () => eventSource.close();
  }

  async getOrderById(id: string): Promise<ApiResponse<OrderResponse>> {
    return this.request<ApiResponse<OrderResponse>>(ENDPOINTS.ORDER_BY_ID(id));
  }

  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> {
    const formData = new FormData();

    formData.append("fiatAmount", data.fiatAmount.toString());
    formData.append("cryptoAmount", data.cryptoAmount.toString());
    formData.append("recipient", data.recipient);
    formData.append("description", data.description);
    formData.append("qr", data.qrImage!);

    return this.request<ApiResponse<OrderResponse>>(ENDPOINTS.ORDERS, {
      method: "POST",
      body: formData,
    });
  }

  async cancelOrder(id: string): Promise<CancelOrderResponse> {
    return this.request<CancelOrderResponse>(ENDPOINTS.CANCEL_ORDER(id), {
      method: "POST",
    });
  }

  async getAvailableOrders(filters: AvailableOrdersFilters = {}): Promise<ApiResponse<AvailableOrdersResponse>> {
    const params = new URLSearchParams();

    if (filters.country) params.append("country", filters.country);
    if (filters.minAmount) params.append("minAmount", filters.minAmount.toString());
    if (filters.maxAmount) params.append("maxAmount", filters.maxAmount.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.AVAILABLE_ORDERS}${queryString ? `?${queryString}` : ""}`;

    return this.request<ApiResponse<AvailableOrdersResponse>>(endpoint);
  }

  async takeOrder(id: string): Promise<ApiResponse<OrderResponse>> {
    return this.request<ApiResponse<OrderResponse>>(ENDPOINTS.TAKE_ORDER(id), {
      method: "PATCH",
    });
  }

  async uploadProof(id: string, data: UploadProofRequest): Promise<ApiResponse<OrderResponse>> {
    const formData = new FormData();
    formData.append("proof", data.proof);

    if (data.bankTransactionId) {
      formData.append("bankTransactionId", data.bankTransactionId);
    }

    if (data.notes) {
      formData.append("notes", data.notes);
    }

    const response = await fetch(`${this.baseUrl}${ENDPOINTS.UPLOAD_PROOF(id)}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const ordersApiService = new OrdersApiService();
