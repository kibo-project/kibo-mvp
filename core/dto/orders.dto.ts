import { OrderStatus, Currency, CryptoToken, Network, UserRole } from '../types/orders.types';

export interface CreateOrderDto {
  userId: string;
  fiatAmount: number;
  cryptoAmount: number;
  qrData?: string;
  recipient: string;
  description: string;
}

export interface GetOrdersDto {
  status?: OrderStatus;
  role: UserRole;
  limit?: number;
  offset?: number;
}
export interface GetOrderByIdDto {
  orderId: string;
}

export interface GetAvailableOrdersDto {
  country?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'expiresAt' | 'amount';
  limit?: number;
}

export interface TakeOrderDto {
  orderId: string;
}

export interface UploadProofDto {
  orderId: string;
  proofFile: File;
  bankTransactionId?: string;
  notes?: string;
}

// Internal DTOs for repository layer
export interface CreateOrderData {
  status: OrderStatus;
  fiatAmount: number;
  cryptoAmount: number;
  fiatCurrency: Currency;
  cryptoCurrency: CryptoToken;
  network?: Network;
  confirmationProof?: string;
  qrImage?: string;
  expiresAt?: string;
  userId: string;
  recipient: string;
  description: string;
  escrow_address?: string;
}
