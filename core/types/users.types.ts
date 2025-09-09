import { UserRole } from "@/core/types/orders.types";

export interface UserResponse {
  id: string;
  name?: string;
  walletAddress?: string;
  privyId?: string;
  role?: UserRole;
  email?: string;
  country?: string;
  bankName?: string;
  activeRoleId?: string;
  activeRoleName?: UserRole;
  roleNames?: UserRole[];
  roleIds?: string[];
  roles?: Role[];
  howRoles?: number;
  accountNumber?: string;
  accountHolder?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  availableBalance?: string;
  lastLoginAt?: Date;
  reputation?: number;
}

export interface User {
  id?: string;
  privyId?: string;
  name?: string;
  role?: UserRole;
  walletAddress?: string;
  email?: string;
  country?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  phone?: string;
  availableBalance?: string;
  activeRoleId?: string;
  lastLoginAt?: Date;
  reputation?: number;
  createdAt?: string;
  updatedAt?: string;
  ////Delete stating here
  verified?: boolean;
  successfulOrders?: number;
  lastActive?: string | Date;
}

export interface Role {
  roleId: string;
  name: UserRole;
}

export interface UsersFiltersRequest {
  role?: UserRole;
  limit?: number;
  offset?: number;
}

export interface UsersFiltersDto {
  role?: UserRole;
  limit: number;
  offset: number;
}
export interface UsersListResponse {
  users: UserResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
