import { ENDPOINTS } from "@/config/api";
import {
  AllyApplication,
  ApplicationsFiltersRequest,
  ApplicationsListResponse,
} from "@/core/types/ally.applications.types";
import { ApiResponse } from "@/core/types/generic.types";
import { OrderDetailsResponse } from "@/core/types/orders.types";
import { BaseApiService } from "@/services/base.api.service";

class ApplicationsApiService extends BaseApiService {
  async getApplication(): Promise<ApiResponse<AllyApplication>> {
    return this.request<OrderDetailsResponse>(ENDPOINTS.USER_APPLICATION);
  }
  async getApplications(filters: ApplicationsFiltersRequest = {}): Promise<ApiResponse<ApplicationsListResponse>> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.offset) params.append("offset", filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.APPLICATIONS}${queryString ? `?${queryString}` : ""}`;

    return this.request<ApiResponse<ApplicationsListResponse>>(endpoint);
  }
  async approveApplication(id: string): Promise<ApiResponse<AllyApplication>> {
    return this.request<ApiResponse<AllyApplication>>(ENDPOINTS.APPROVE_APPLICATION(id), {
      method: "POST",
    });
  }
  async rejectApplication(applicationId: string, reason: string): Promise<ApiResponse<AllyApplication>> {
    return this.request<ApiResponse<AllyApplication>>(ENDPOINTS.REJECT_APPLICATION(applicationId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
  }
}
export const applicationsApiService = new ApplicationsApiService();
