import {UserRole} from "@/core/types/orders.types";

export interface UserResponse {
    id: string;
    name?: string;
    walletAddress?: string;
    role?: UserRole;
    email?: string;
    country?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    phone?: string;
    availableBalance?: string;
    lastLoginAt?: Date;
    reputation?: number;
}

export interface User {
    id?: string;
    privyId?: string;
    name?: string;
    walletAddress?: string;
    role?: UserRole;
    email?: string;
    country?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    phone?: string;
    availableBalance?: string;
    lastLoginAt?: Date;
    reputation?: number;
    createdAt?: string;
    updatedAt?: string;
    ////Delete stating here
    verified?: boolean;
    successfulOrders?: number;
    lastActive?: string | Date;
}