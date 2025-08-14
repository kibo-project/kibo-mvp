import { OrderStatus, Currency, CryptoToken, Network, UserRole } from '../types/orders.types';

export interface CreateOrderDto {
  quoteId: string;
  qrData: string;
  qrImageUrl?: string;
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
  id: string;
  status: OrderStatus;
  amountFiat: number;
  amountCrypto: number;
  fiatCurrency: Currency;
  cryptoToken: CryptoToken;
  network: Network;
  qrData: string;
  qrImageUrl?: string;
  expiresAt: string;
  userId: string;
}
