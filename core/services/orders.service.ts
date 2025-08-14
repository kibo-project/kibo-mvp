import { OrdersRepository } from '../repositories/orders.repository';
import { 
  CreateOrderDto,
  GetOrdersDto,
  GetAvailableOrdersDto,
  TakeOrderDto,
  UploadProofDto,
  CreateOrderData
} from '../dto/orders.dto';

import {
  Order, 
  OrderStatus, 
  Quote,
} from '../types/orders.types'

export class OrdersService {
  private ordersRepository: OrdersRepository;

  constructor() {
    this.ordersRepository = new OrdersRepository();
  }

  async createOrder(orderDto: CreateOrderDto, userId: string): Promise<Order> {
    // 1. Validate quote (this would call quote service)
    const quote = await this.validateQuote(orderDto.quoteId);
    
    if (!quote) {
      throw new Error('Invalid or expired quote');
    }

    // 2. Validate user exists
    // const user = await this.getUserById(userId);
    // if (!user) {
    //   throw new Error('User not found');
    // }

    // 3. Apply business rules
    const orderData = this.buildOrderFromQuote(quote, orderDto, userId);

    // 4. Create order
    const order = await this.ordersRepository.create(orderData);

    // 5. Post-creation tasks (logs, notifications)
    // await this.logOrderCreation(order);
    // await this.notifyOrderCreated(order);

    return order;
  }

  async getOrdersByUser(filters: GetOrdersDto, user_id: string): Promise<{
    orders: Order[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const { orders, total } = await this.ordersRepository.findMany(filters, user_id);
    
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    
    return {
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  async getOrderById(orderId: string, userId?: string): Promise<Order | null> {
    const order = await this.ordersRepository.findById(orderId);
    
    if (!order) {
      return null;
    }

    // Verify access permissions
    if (userId && !this.canUserAccessOrder(order, userId)) {
      throw new Error('Access denied to this order');
    }

    // Add dynamic fields
    return this.enrichOrderWithDynamicData(order);
  }

  async getAvailableOrders(filters: GetAvailableOrdersDto): Promise<{
    orders: Order[];
    metadata: {
      totalAvailable: number;
      avgWaitTime: number;
      yourActiveOrders: number;
    };
  }> {
    const orders = await this.ordersRepository.findAvailable(filters);
    
    // Calculate metadata
    const enrichedOrders = orders.map(order => this.enrichOrderWithDynamicData(order));
    
    const metadata = {
      totalAvailable: orders.length,
      avgWaitTime: this.calculateAverageWaitTime(),
      yourActiveOrders: 0 // This would be calculated based on current ally
    };

    return {
      orders: enrichedOrders,
      metadata
    };
  }

  async takeOrder(takeOrderDto: TakeOrderDto, allyId: string): Promise<Order> {
    const order = await this.ordersRepository.findById(takeOrderDto.orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.AVAILABLE) {
      throw new Error('Order is not available for taking');
    }

    // Validate ally can take this order
    await this.validateAllyCanTakeOrder(order, allyId);

    // Update order status
    const updatedOrder = await this.ordersRepository.updateStatus(
      takeOrderDto.orderId, 
      OrderStatus.TAKEN,
      {
        allyId,
        takenAt: new Date().toISOString()
      }
    );

    // Post-take tasks
    // await this.notifyOrderTaken(updatedOrder);
    
    return updatedOrder;
  }

  async uploadProof(proofDto: UploadProofDto, allyId: string): Promise<Order> {
    const order = await this.ordersRepository.findById(proofDto.orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.TAKEN) {
      throw new Error('Order is not in taken status');
    }

    if (order.ally?.id !== allyId) {
      throw new Error('Only the assigned ally can upload proof');
    }

    // Upload proof file to Supabase Storage
    const proofUrl = await this.uploadProofFile(proofDto.proofFile);

    // Update order with proof
    const updatedOrder = await this.ordersRepository.updateStatus(
      proofDto.orderId,
      OrderStatus.COMPLETED,
      {
        proofUrl,
        bankTransactionId: proofDto.bankTransactionId,
        completedAt: new Date().toISOString(),
        releaseTxHash: await this.releaseEscrow(order)
      }
    );

    // Post-completion tasks
    // await this.logOrderCompletion(updatedOrder);
    // await this.notifyOrderCompleted(updatedOrder);
    
    return updatedOrder;
  }

  // Private business logic methods
  private async validateQuote(quoteId: string): Promise<Quote | null> {
    // This would integrate with your quote service
    // For now, simulate validation
    return {
      id: quoteId,
      amountFiat: 100,
      amountCrypto: 100,
      fiatCurrency: 'BOB',
      cryptoToken: 'USDT',
      network: 'mantle',
      rate: 1,
      networkFee: 1,
      kiboFee: 2,
      totalAmount: 103,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      escrowAddress: '0x123...',
      rateSource: 'coingecko',
      rateTimestamp: new Date().toISOString()
    };
  }

  private buildOrderFromQuote(quote: Quote, orderDto: CreateOrderDto, userId: string): CreateOrderData {
    return {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: OrderStatus.PENDING_PAYMENT,
      amountFiat: quote.amountFiat,
      amountCrypto: quote.amountCrypto,
      fiatCurrency: 'BOB', // This should come from quote
      cryptoToken: 'USDT', // This should come from quote
      network: 'mantle', // This should come from quote
      qrData: orderDto.qrData,
      qrImageUrl: orderDto.qrImageUrl,
      expiresAt: quote.expiresAt,
      userId
    };
  }

  private enrichOrderWithDynamicData(order: Order): Order {
    const now = new Date();
    const expiresAt = new Date(order.expiresAt);
    
    return {
      ...order,
      secondsRemaining: Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
    };
  }

  private canUserAccessOrder(order: Order, userId: string): boolean {
    return order.user?.id === userId || order.ally?.id === userId;
  }

  private calculateAverageWaitTime(): number {
    // This would be calculated from historical data
    return 300; // 5 minutes in seconds
  }

  private async validateAllyCanTakeOrder(order: Order, allyId: string): Promise<void> {
    // Add business validation logic:
    // - Check ally reputation
    // - Check active penalties
    // - Check country compatibility
    // - Check ally capacity
  }

  private async setupOrderEscrow(order: Order): Promise<void> {
    // Setup blockchain escrow
  }

  private async releaseEscrow(order: Order): Promise<string> {
    // Release escrow funds
    return `0xtx_hash_${Date.now()}`;
  }

  private async uploadProofFile(file: File): Promise<string> {
    // Upload to storage service (Supabase Storage, S3, etc.)
    return `https://storage.example.com/proofs/${Date.now()}_${file.name}`;
  }

  private async notifyOrderCreated(order: Order): Promise<void> {
    // Send notifications
  }

  private async notifyOrderTaken(order: Order): Promise<void> {
    // Send notifications
  }

  private async notifyOrderCompleted(order: Order): Promise<void> {
    // Send notifications
  }
}
