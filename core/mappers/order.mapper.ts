import { Order, OrderResponse } from "../../core/types/orders.types";

export class OrderMapper {
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
            qrImageUrl: order.qrImageUrl,
            confirmationProofUrl: order.confirmationProofUrl,
            createdAt: order.createdAt,
            takenAt: order.takenAt,
            completedAt: order.completedAt,
            cancelledAt: order.cancelledAt,
            expiresAt: order.expiresAt,
            txHash: order.txHash,
        };
    }
}
