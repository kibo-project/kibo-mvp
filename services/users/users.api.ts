import { ENDPOINTS } from "@/config/api";
import { ApiResponse } from "@/core/types/generic.types";
import { UsersFiltersRequest, UsersListResponse } from "@/core/types/users.types";

class UsersApiService {
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

  async getUsers(filters: UsersFiltersRequest = {}): Promise<ApiResponse<UsersListResponse>> {
    const params = new URLSearchParams();

    if (filters.role) params.append("role", filters.role);
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.offset) params.append("offset", filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.USERS}${queryString ? `?${queryString}` : ""}`;

    return this.request<ApiResponse<UsersListResponse>>(endpoint);
  }
}

export const usersApiService = new UsersApiService();
