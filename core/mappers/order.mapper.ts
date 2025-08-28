/* eslint-disable @typescript-eslint/no-explicit-any */
import { Order, OrderResponse } from "../../core/types/orders.types";

export class OrderMapper {
  static dbToOrder(dbOrder: any): Order {
    return {
      id: dbOrder.id,
      status: dbOrder.status,
      fiatAmount: dbOrder.fiat_amount,
      cryptoAmount: dbOrder.crypto_amount,
      fiatCurrency: dbOrder.fiat_currency,
      cryptoCurrency: dbOrder.crypto_currency,
      network: dbOrder.network,
      qrData: dbOrder.qr_data,
      qrImage: dbOrder.qr_image,
      qrImageUrl: dbOrder.qr_image_url,
      confirmationProof: dbOrder.confirmation_proof,
      confirmationProofUrl: dbOrder.confirmation_proof_url,
      createdAt: dbOrder.created_at,
      takenAt: dbOrder.taken_at,
      completedAt: dbOrder.completed_at,
      cancelledAt: dbOrder.cancelled_at,
      expiresAt: dbOrder.expires_at,
      recipient: dbOrder.recipient,
      description: dbOrder.description,
      escrowTxHash: dbOrder.escrow_tx_hash,
      txHash: dbOrder.tx_hash,
      bankTransactionId: dbOrder.bank_transaction_id,
      userId: dbOrder.user_id,
      allyId: dbOrder.ally_id,
    };
  }
  static orderToOrderResponse(order: Order): OrderResponse {
    return {
      id: order.id,
      status: order.status,
      fiatAmount: order.fiatAmount,
      cryptoAmount: order.cryptoAmount,
      fiatCurrency: order.fiatCurrency,
      cryptoCurrency: order.cryptoCurrency,
      network: order.network,
      escrowAddress: order.escrowAddress,
      qrImage: order.qrImage,
      qrImageUrl: order.qrImageUrl,
      confirmationProof: order.confirmationProof,
      confirmationProofUrl: order.confirmationProofUrl,
      description: order.description,
      recipient: order.recipient,
      createdAt: order.createdAt,
      takenAt: order.takenAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,
      expiresAt: order.expiresAt,
      txHash: order.txHash,
    };
  }
}
