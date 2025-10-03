import { ENDPOINTS } from "@/config/api";
import { ApiResponse } from "@/core/types/generic.types";
import { UserResponse } from "@/core/types/users.types";
import { BaseApiService } from "@/services/base.api.service";

class AuthApiService extends BaseApiService {
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
