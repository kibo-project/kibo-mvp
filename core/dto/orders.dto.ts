import { CryptoToken, Currency, Network, OrderStatus } from "../types/orders.types";

export interface GetOrdersDto {
  userId?: string;
  allyId?: string;
  status?: OrderStatus;
  search?: string;
  limit: number;
  offset: number;
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
export interface CreateOrderDto {
  status: OrderStatus;
  fiatAmount: number;
  cryptoAmount: number;
  fiatCurrency: Currency;
  cryptoCurrency: CryptoToken;
  network?: Network;
  confirmationProof?: string;
  qrImage?: string;
  qrImageUrl?: string;
  expiresAt?: string;
  userId: string;
  recipient: string;
  description: string;
  escrow_address?: string;
}
