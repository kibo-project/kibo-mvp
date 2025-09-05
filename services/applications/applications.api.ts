import { ENDPOINTS } from "../../config/api";
import { ApplicationsFiltersRequest, ApplicationsListResponse } from "@/core/types/ally.applications.types";
import { ApiResponse } from "@/core/types/generic.types";

class ApplicationsApiService {
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
  async getApplications(filters: ApplicationsFiltersRequest = {}): Promise<ApiResponse<ApplicationsListResponse>> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.offset) params.append("offset", filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.APPLICATIONS}${queryString ? `?${queryString}` : ""}`;

    return this.request<ApiResponse<ApplicationsListResponse>>(endpoint);
  }
}
export const applicationsApiService = new ApplicationsApiService();
