import { OrderResponse } from "@/core/types/orders.types";

export enum applicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface AllyApplicationRequest {
  fullName: string;
  phone: string;
  address: string;
}

export interface AllyApplicationDto {
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  status: applicationStatus;
}

export interface AllyApplication {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  status: applicationStatus;
  createdAt: Date;
  updatedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface ApplicationsFiltersRequest {
  status?: applicationStatus;
  limit: number;
  offset: number;
}

export interface ApplicationsListResponse {
  applications: AllyApplication[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
