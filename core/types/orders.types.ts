export enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  AVAILABLE = "AVAILABLE",
  TAKEN = "TAKEN",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export type Currency = "BOB" | "USD";
export type CryptoToken = "USDT" | "USDC";
export type Network = "mantle" | "ethereum" | "polygon";
export type UserRole = "user" | "ally" | "admin";

// Interfaces principales

export interface ImageDataFile {
  name: string;
  extension: string;
  createdAt?: string;
}

export interface AllyStats {
  totalEarned: number;
  avgCompletionTime: number;
  activePenalties: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  fiatAmount: number;
  cryptoAmount: number;
  fiatCurrency: Currency;
  cryptoCurrency: CryptoToken;
  network?: Network;
  escrowAddress?: string;
  qrData?: string;
  qrImage?: string;
  qrImageUrl?: string;
  confirmationProof?: string;
  confirmationProofUrl?: string;
  createdAt: string;
  takenAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  expiresAt: string;
  description?: string;
  recipient?: string;
  secondsRemaining?: number;
  escrowTxHash?: string;
  txHash?: string;
  userId?: string;
  allyId?: string;
  bankTransactionId?: string;
  timeline?: TimelineEvent[];
  bankingDetails?: BankingDetails;
  estimatedGain?: number;
  userCountry?: string;
  bankingInfo?: {
    bank: string;
    reference: string;
  };
}

export interface BankingDetails {
  bank: string;
  accountNumber: string;
  beneficiary: string;
  reference: string;
  exactAmount: string;
}

export interface TimelineEvent {
  status: OrderStatus;
  timestamp: string;
}

export interface Quote {
  id: string;
  amountFiat: number;
  amountCrypto: number;
  fiatCurrency: Currency;
  cryptoToken: CryptoToken;
  rate: number;
  network: Network;
  networkFee: number;
  kiboFee: number;
  totalAmount: number;
  expiresAt: string;
  escrowAddress: string;
  rateSource: string;
  rateTimestamp: string;
}

// Request/Response types
export interface CreateOrderRequest {
  userId?: string;
  fiatAmount: number;
  cryptoAmount: number;
  recipient: string;
  description: string;
  qrImage?: File;
}

export interface OrderResponse {
  id: string;
  userId?: string;
  status: OrderStatus;
  fiatAmount: number;
  cryptoAmount: number;
  fiatCurrency: Currency;
  cryptoCurrency: CryptoToken;
  network?: Network;
  escrowAddress?: string;
  qrImage?: string;
  qrImageUrl?: string;
  confirmationProof?: string;
  confirmationProofUrl?: string;
  description?: string;
  recipient?: string;
  createdAt: string;
  takenAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  expiresAt: string;
  txHash?: string;
}

export interface OrdersListResponse {
  orders: OrderResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface OrderDetailsResponse {
  success: boolean;
  order: Order;
}

export interface AvailableOrdersResponse {
  orders: OrderResponse[];
  metadata: {
    avgWaitTime: number;
    yourActiveOrders: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
export interface GetOrdersResponse {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}

export interface TakeOrderResponse {
  order: Order;
}

export interface CancelOrderResponse {
  success: boolean;
  order: Partial<Order>;
  message: string;
}

export interface UploadProofRequest {
  proof: File;
  bankTransactionId?: string;
  notes?: string;
}

export interface UploadProofResponse {
  success: boolean;
  order: Order;
  payment: {
    amountReleased: number;
    recipientWallet: string;
    networkFee: number;
  };
  message: string;
}

// Filter types para hooks
export interface OrdersFilters {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}

export interface AvailableOrdersFilters {
  country?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "createdAt" | "expiresAt" | "amount";
  limit?: number;
  offset?: number;
}

// Error types
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
