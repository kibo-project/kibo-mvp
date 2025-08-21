import {OrdersRepository} from '../repositories/orders.repository';
import {
  CreateOrderDto,
  GetOrdersDto,
  TakeOrderDto,
  UploadProofDto
} from '../dto/orders.dto';

import {Order, OrderStatus, Quote, ImageDataFile, AvailableOrdersFilters, AvailableOrdersResponse, CreateOrderRequest} from '../types/orders.types'


export class OrdersService {
  private ordersRepository: OrdersRepository;

  constructor() {
    this.ordersRepository = new OrdersRepository();
  }

  async createOrder(createOrderRequest: CreateOrderRequest): Promise<Order> {
     const isValid = await this.ordersRepository.verifyUser(createOrderRequest.userId!,"user");
     if (!isValid) {
       throw new Error('User or role are not valid');
     }
     const activeOrders = await this.ordersRepository.activeOrders(createOrderRequest.userId!);
     if (activeOrders>3) {
       throw new Error('You have more than 3 orders available');
     }
     const createOrderDto: CreateOrderDto = {
       status: OrderStatus.PENDING_PAYMENT,
       fiatAmount: createOrderRequest.fiatAmount,
       cryptoAmount: createOrderRequest.cryptoAmount,
       fiatCurrency: 'BOB',
       cryptoCurrency: 'USDT',
       userId: createOrderRequest.userId!,
       recipient: createOrderRequest.recipient,
       description: createOrderRequest.description,
     };
     const order = await this.ordersRepository.create(createOrderDto);
     const qrId = await this.uploadFile(createOrderRequest.qrImage!);
    const updatedOrder = await this.ordersRepository.uploadQrImage(order.id, qrId);// tipo Order

    // 5. Post-creation tasks (logs, notifications)
    // await this.logOrderCreation(order);
    // await this.notifyOrderCreated(order);

    return updatedOrder;
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

  async getOrderById(orderId: string, userId: string): Promise<Order | null> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      return null;
    }
    if (userId && ! await this.canUserAccessOrder(order, userId)) {
      throw new Error('Access denied to this order');
    }
    return this.enrichOrderWithDynamicData(order);
  }

  async getAvailableOrders(filters: AvailableOrdersFilters, userId:string): Promise<AvailableOrdersResponse> {
    const isAlly = await this.ordersRepository.verifyUser(userId, "ally");
    if (!isAlly) {
      throw new Error('Access denied for users are not allies');
    }
    const orders = await this.ordersRepository.findAvailable(filters);
    const availableOrdersResponse: AvailableOrdersResponse = {
      orders: orders ,
      metadata: {
        totalAvailable: orders.length,
        avgWaitTime: this.calculateAverageWaitTime(), // este sirve?
        yourActiveOrders: 0,// verificar este atributo sirve?
      }
    }

    return availableOrdersResponse;
  }

  async takeOrder(takeOrderDto: TakeOrderDto, allyId: string): Promise<Order> {
    const isAlly = await this.ordersRepository.verifyUser(allyId, "ally");
    if (!isAlly) {
      throw new Error('Access denied for users are not allies');
    }
    const order = await this.ordersRepository.findById(takeOrderDto.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.AVAILABLE) {
      throw new Error('Order is not available for taking');
    }

    await this.validateAllyCanTakeOrder(order, allyId);

    const updatedOrder = await this.ordersRepository.updateStatus(
      takeOrderDto.orderId, 
      OrderStatus.TAKEN,
      {
        allyId,
        takenAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }
    );

    // Post-take tasks
    // await this.notifyOrderTaken(updatedOrder);
    
    return updatedOrder;
  }

  async uploadProof(uploadProofDto: UploadProofDto, allyId: string): Promise<Order> {
    const order = await this.ordersRepository.findById(uploadProofDto.orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.TAKEN) {
      throw new Error('Order is not in taken status');
    }

    if (order.allyId !== allyId) {
      throw new Error('Only the assigned ally can upload proof');
    }

    const confirmationProof = await this.uploadFile(uploadProofDto.proofFile);
    const confirmationProofUrl = await this.ordersRepository.getImageUrl(confirmationProof);
    const updatedOrder = await this.ordersRepository.updateStatus(
      uploadProofDto.orderId,
      OrderStatus.COMPLETED,
      {
        confirmationProof,
        confirmationProofUrl,
        bankTransactionId: uploadProofDto.bankTransactionId,
        completedAt: new Date().toISOString(),
        txHash: await this.releaseEscrow(order)
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

  private enrichOrderWithDynamicData(order: Order): Order {
    const now = new Date();
    const expiresAt = new Date(order.expiresAt);
    
    return {
      ...order,
      secondsRemaining: Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
    };
  }

  private async canUserAccessOrder(order: Order, userId: string): Promise<boolean> {
    const isAdmin = await this.ordersRepository.verifyUser(userId, "admin");
    return order.userId === userId || order.allyId === userId || isAdmin;
  }

  private calculateAverageWaitTime(): number {
    // This would be calculated from historical data
    return 300; // 5 minutes in seconds
  }

  private async validateAllyCanTakeOrder(order: Order, allyId: string): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(order.expiresAt);

    if (expiresAt <= now) {
      throw new Error('this order has expired');
    }

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

  private async uploadFile(file: File): Promise<string> {
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new Error('File size exceeds 5MB limit');
    }
    const originalName = file.name;
    const extension = originalName.split(".").pop() || "";
    const imageDataFile: ImageDataFile = {
      name: originalName,
      extension: extension,
      createdAt: new Date().toISOString()
    }
    const { data, error } = await this.ordersRepository.uploadDbImage(imageDataFile);

    if (error || !data) {
      throw new Error(error || "Error saving image");
    }

    const filename = `order-${data.id}.${extension}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const uploadError = await this.ordersRepository.uploadImageToStorage(filename, fileBuffer, file.type);

    if (uploadError) {
      throw new Error(uploadError);
    }

    return data.id;
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
