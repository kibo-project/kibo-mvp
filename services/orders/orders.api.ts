// Servicios reales (para cuando tu compañero termine la API)
import {
  OrdersListResponse,
  OrderDetailsResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  AvailableOrdersResponse,
  TakeOrderResponse,
  CancelOrderResponse,
  UploadProofRequest,
  UploadProofResponse,
  OrdersFilters,
  AvailableOrdersFilters
} from './types';
import { ENDPOINTS } from '../../config/api';

class OrdersApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getOrders(filters: OrdersFilters = {}): Promise<OrdersListResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.ORDERS}${queryString ? `?${queryString}` : ''}`;

    return this.request<OrdersListResponse>(endpoint);
  }

  async getOrderById(id: string): Promise<OrderDetailsResponse> {
    return this.request<OrderDetailsResponse>(ENDPOINTS.ORDER_BY_ID(id));
  }

  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    return this.request<CreateOrderResponse>(ENDPOINTS.ORDERS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelOrder(id: string): Promise<CancelOrderResponse> {
    return this.request<CancelOrderResponse>(ENDPOINTS.CANCEL_ORDER(id), {
      method: 'POST',
    });
  }

  async getAvailableOrders(filters: AvailableOrdersFilters = {}): Promise<AvailableOrdersResponse> {
    const params = new URLSearchParams();

    if (filters.country) params.append('country', filters.country);
    if (filters.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.AVAILABLE_ORDERS}${queryString ? `?${queryString}` : ''}`;

    return this.request<AvailableOrdersResponse>(endpoint);
  }

  async takeOrder(id: string): Promise<TakeOrderResponse> {
    return this.request<TakeOrderResponse>(ENDPOINTS.TAKE_ORDER(id), {
      method: 'POST',
    });
  }

  async uploadProof(id: string, data: UploadProofRequest): Promise<UploadProofResponse> {
    const formData = new FormData();
    formData.append('proof', data.proof);

    if (data.bankTransactionId) {
      formData.append('bankTransactionId', data.bankTransactionId);
    }

    if (data.notes) {
      formData.append('notes', data.notes);
    }

    const response = await fetch(`${this.baseUrl}${ENDPOINTS.UPLOAD_PROOF(id)}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const ordersApiService = new OrdersApiService();