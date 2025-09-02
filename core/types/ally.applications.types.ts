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
