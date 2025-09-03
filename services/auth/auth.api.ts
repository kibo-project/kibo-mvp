import { ENDPOINTS } from "../../config/api";
import { ApiResponse } from "../../core/types/generic.types";
import { TakeOrderResponse } from "@/core/types/orders.types";
import { UserResponse } from "@/core/types/users.types";

class AuthApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {};
    if (!(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      credentials: "include",
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
  async login(): Promise<ApiResponse<UserResponse>> {
    return this.request<ApiResponse<UserResponse>>(ENDPOINTS.CONNECT, {
      method: "POST",
    });
  }

  async logout(): Promise<Response> {
    return this.request<Response>(ENDPOINTS.LOGOUT, {
      method: "POST",
    });
  }
  async changeRole(roleId: string): Promise<ApiResponse<UserResponse>> {
    return this.request<ApiResponse<UserResponse>>(ENDPOINTS.CHANGE_ROLE, {
      method: "PATCH",
      body: JSON.stringify({ roleId }),
    });
  }
}

export const authApiService = new AuthApiService();
