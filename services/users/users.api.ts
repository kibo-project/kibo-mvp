import { ENDPOINTS } from "@/config/api";
import { AllyApplication, AllyApplicationRequest } from "@/core/types/ally.applications.types";
import { ApiResponse } from "@/core/types/generic.types";
import { UserProfileRequest, UserResponse, UsersFiltersRequest, UsersListResponse } from "@/core/types/users.types";
import { BaseApiService } from "@/services/base.api.service";

class UsersApiService extends BaseApiService {
  async getUsers(filters: UsersFiltersRequest = {}): Promise<ApiResponse<UsersListResponse>> {
    const params = new URLSearchParams();

    if (filters.role) params.append("role", filters.role);
    if (filters.search) params.append("search", filters.search);
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.offset) params.append("offset", filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.USERS}${queryString ? `?${queryString}` : ""}`;

    return this.request<ApiResponse<UsersListResponse>>(endpoint);
  }

  async createApplication(application: AllyApplicationRequest): Promise<ApiResponse<AllyApplication>> {
    return this.request<ApiResponse<AllyApplication>>(ENDPOINTS.USER_APPLICATION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application),
    });
  }

  async getProfile(): Promise<ApiResponse<UserResponse>> {
    return this.request<ApiResponse<UserResponse>>(ENDPOINTS.PROFILE);
  }
  async editProfile(profile: UserProfileRequest): Promise<ApiResponse<UserResponse>> {
    return this.request<ApiResponse<UserResponse>>(ENDPOINTS.USER_EDIT_PROFILE, {
      method: "PATCH",
      body: JSON.stringify(profile),
    });
  }
}

export const usersApiService = new UsersApiService();
