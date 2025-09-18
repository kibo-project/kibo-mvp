export enum ApplicationStatus {
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
  status: ApplicationStatus;
}

export interface AllyApplication {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface ApplicationsFiltersRequest {
  status?: ApplicationStatus;
  limit?: number;
  offset?: number;
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
export interface ApplicationsFiltersDto {
  status?: ApplicationStatus;
  limit: number;
  offset: number;
}
