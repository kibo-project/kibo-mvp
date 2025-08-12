import {
  Order,
  OrdersListResponse,
  OrderDetailsResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  AvailableOrdersResponse,
  TakeOrderResponse,
  CancelOrderResponse,
  UploadProofRequest,
  UploadProofResponse,
  OrdersFilters,
  AvailableOrdersFilters,
  OrderStatus
} from './types';
import {
  mockOrders,
  mockDelay,
  generateMockId,
  calculateSecondsRemaining,
  mockQuotes,
  generateTimeline,
  mockUsers
} from './mock-data';

class OrdersMockService {
  private orders: Order[] = [...mockOrders];

  // Simula GET /api/orders
  async getOrders(filters: OrdersFilters = {}): Promise<OrdersListResponse> {
    await mockDelay();

    const { status, limit = 20, offset = 0 } = filters;

    let filteredOrders = this.orders.filter(order => {
      if (status && order.status !== status) return false;
      return true;
    });

    // Actualizar secondsRemaining para órdenes activas
    filteredOrders = filteredOrders.map(order => ({
      ...order,
      secondsRemaining: [OrderStatus.PENDING_PAYMENT, 'AVAILABLE', 'TAKEN'].includes(order.status)
        ? calculateSecondsRemaining(order.expiresAt)
        : undefined
    }));

    // Ordenar por fecha (más recientes primero)
    filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    return {
      success: true,
      orders: paginatedOrders,
      pagination: {
        total: filteredOrders.length,
        limit,
        offset,
        hasMore: offset + limit < filteredOrders.length
      }
    };
  }

  // Simula GET /api/orders/:id
  async getOrderById(id: string): Promise<OrderDetailsResponse> {
    await mockDelay();

    const order = this.orders.find(o => o.id === id);

    if (!order) {
      throw new Error('Order not found');
    }

    // Actualizar secondsRemaining si está activa
    const updatedOrder = {
      ...order,
      secondsRemaining: [OrderStatus.PENDING_PAYMENT, 'AVAILABLE', 'TAKEN'].includes(order.status)
        ? calculateSecondsRemaining(order.expiresAt)
        : undefined
    };

    return {
      success: true,
      order: updatedOrder
    };
  }

  // Simula POST /api/orders
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    await mockDelay();

    // Validar que el quote existe y no ha expirado
    const quote = mockQuotes.find(q => q.id === data.quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (new Date(quote.expiresAt) < new Date()) {
      throw new Error('Quote has expired');
    }

    const newOrder: Order = {
      id: generateMockId('order'),
      status: OrderStatus.PENDING_PAYMENT,
      amountFiat: quote.amountFiat,
      amountCrypto: quote.amountCrypto,
      fiatCurrency: 'BOB',
      cryptoToken: 'USDT',
      network: 'mantle',
      escrowAddress: quote.escrowAddress,
      qrImageUrl: data.qrImageUrl || `https://via.placeholder.com/300x300/0066cc/ffffff?text=QR+${Date.now()}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 minutos
      user: mockUsers[0],
      timeline: generateTimeline(OrderStatus.PENDING_PAYMENT, new Date().toISOString())
    };

    this.orders.unshift(newOrder);

    return {
      success: true,
      order: newOrder
    };
  }

  // Simula POST /api/orders/:id/cancel
  async cancelOrder(id: string): Promise<CancelOrderResponse> {
    await mockDelay();

    const orderIndex = this.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    const order = this.orders[orderIndex];

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new Error('Cannot cancel order - order already progressed beyond PENDING_PAYMENT');
    }

    const cancelledOrder = {
      ...order,
      status: 'CANCELLED' as OrderStatus,
      cancelledAt: new Date().toISOString(),
      timeline: [
        ...order.timeline || [],
        { status: 'CANCELLED' as OrderStatus, timestamp: new Date().toISOString() }
      ]
    };

    this.orders[orderIndex] = cancelledOrder;

    return {
      success: true,
      order: {
        id: cancelledOrder.id,
        status: cancelledOrder.status,
        cancelledAt: cancelledOrder.cancelledAt
      },
      message: 'Order cancelled successfully'
    };
  }

  // Simula GET /api/orders/available
  async getAvailableOrders(filters: AvailableOrdersFilters = {}): Promise<AvailableOrdersResponse> {
    await mockDelay();

    const { country = 'BO', minAmount, maxAmount, sortBy = 'expiresAt', limit = 50 } = filters;

    let availableOrders = this.orders.filter(order => {
      if (order.status !== 'AVAILABLE') return false;
      if (order.userCountry && order.userCountry !== country) return false;
      if (minAmount && order.amountFiat < minAmount) return false;
      if (maxAmount && order.amountFiat > maxAmount) return false;

      // No mostrar órdenes expiradas
      if (new Date(order.expiresAt) < new Date()) return false;

      return true;
    });

    // Actualizar secondsRemaining
    availableOrders = availableOrders.map(order => ({
      ...order,
      secondsRemaining: calculateSecondsRemaining(order.expiresAt)
    }));

    // Ordenamiento
    availableOrders.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amountFiat - a.amountFiat;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'expiresAt':
        default:
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      }
    });

    const paginatedOrders = availableOrders.slice(0, limit);

    return {
      success: true,
      orders: paginatedOrders,
      metadata: {
        totalAvailable: availableOrders.length,
        avgWaitTime: 245, // segundos promedio
        yourActiveOrders: 0
      }
    };
  }

  // Simula POST /api/orders/:id/take
  async takeOrder(id: string): Promise<TakeOrderResponse> {
    await mockDelay();

    const orderIndex = this.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    const order = this.orders[orderIndex];

    if (order.status !== 'AVAILABLE') {
      throw new Error('Order is not available for taking');
    }

    if (new Date(order.expiresAt) < new Date()) {
      throw new Error('Order has expired');
    }

    const takenOrder = {
      ...order,
      status: 'TAKEN' as OrderStatus,
      takenAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min para completar
      ally: mockUsers[1], // Ally que toma la orden
      qrData: 'BANCO_UNION|123456789|REF_KBO025',
      qrImageUrl: order.qrImageUrl || `https://via.placeholder.com/300x300/cc6600/ffffff?text=Taken+${Date.now()}`,
      timeline: [
        ...order.timeline || [],
        { status: 'TAKEN' as OrderStatus, timestamp: new Date().toISOString() }
      ],
      bankingDetails: {
        bank: 'Banco Unión',
        accountNumber: '123456789',
        beneficiary: 'Juan Pérez',
        reference: `KBO${Math.floor(Math.random() * 1000)}`,
        exactAmount: `${order.amountFiat.toFixed(2)} BOB`
      }
    };

    this.orders[orderIndex] = takenOrder;

    return {
      success: true,
      order: takenOrder
    };
  }

  // Simula POST /api/orders/:id/proof
  async uploadProof(id: string, data: UploadProofRequest): Promise<UploadProofResponse> {
    await mockDelay(1200); // Simula upload más lento

    const orderIndex = this.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    const order = this.orders[orderIndex];

    if (order.status !== 'TAKEN') {
      throw new Error('Order must be in TAKEN status to upload proof');
    }

    // Simular upload de archivo
    const mockProofUrl = `https://via.placeholder.com/400x600/00cc66/ffffff?text=Proof+${Date.now()}`;

    const completedOrder = {
      ...order,
      status: 'COMPLETED' as OrderStatus,
      completedAt: new Date().toISOString(),
      proofUrl: mockProofUrl,
      bankTransactionId: data.bankTransactionId || `TXN${Date.now()}`,
      releaseTxHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      timeline: [
        ...order.timeline || [],
        { status: 'COMPLETED' as OrderStatus, timestamp: new Date().toISOString() }
      ]
    };

    this.orders[orderIndex] = completedOrder;

    return {
      success: true,
      order: completedOrder,
      payment: {
        amountReleased: order.amountCrypto,
        recipientWallet: order.ally?.walletAddress || '',
        networkFee: 0.008
      },
      message: `Payment proof uploaded and approved. ${order.amountCrypto} USDT released to your wallet.`
    };
  }

  // Método para simular cambios en tiempo real (opcional)
  simulateOrderUpdates() {
    setInterval(() => {
      // Actualizar secondsRemaining de órdenes activas
      this.orders = this.orders.map(order => {
        if ([OrderStatus.PENDING_PAYMENT, 'AVAILABLE', 'TAKEN'].includes(order.status)) {
          const secondsRemaining = calculateSecondsRemaining(order.expiresAt);

          // Simular expiración automática
          if (secondsRemaining <= 0) {
            let newStatus: OrderStatus;
            switch (order.status) {
              case OrderStatus.PENDING_PAYMENT:
                newStatus = OrderStatus.CANCELLED;
                break;
              case 'AVAILABLE':
                newStatus = OrderStatus.CANCELLED;
                break;
              case 'TAKEN':
                newStatus = OrderStatus.REFUNDED;
                break;
              default:
                newStatus = order.status;
            }

            return {
              ...order,
              status: newStatus,
              secondsRemaining: 0,
              timeline: [
                ...order.timeline || [],
                { status: newStatus, timestamp: new Date().toISOString() }
              ]
            };
          }

          return {
            ...order,
            secondsRemaining
          };
        }
        return order;
      });
    }, 1000); // Actualizar cada segundo
  }
}

export const ordersMockService = new OrdersMockService();

// Iniciar simulación de updates en tiempo real
if (typeof window !== 'undefined') {
  ordersMockService.simulateOrderUpdates();
}