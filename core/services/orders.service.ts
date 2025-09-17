import { CreateOrderDto, GetOrdersDto, TakeOrderDto, UploadProofDto } from "../dto/orders.dto";
import { OrdersRepository } from "../repositories/orders.repository";
import { UsersRepository } from "../repositories/users.repository";
import {
  AvailableOrdersFilters,
  AvailableOrdersResponse,
  CreateOrderRequest,
  GetOrdersResponse,
  ImageDataFile,
  Order,
  OrderResponse,
  OrderStatus,
  OrdersListResponse,
  UserRole,
} from "../types/orders.types";
import { OrderMapper } from "@/core/mappers/order.mapper";

export class OrdersService {
  private ordersRepository: OrdersRepository;
  private usersRepository: UsersRepository;

  constructor() {
    this.ordersRepository = new OrdersRepository();
    this.usersRepository = new UsersRepository();
  }

  async createOrder(createOrderRequest: CreateOrderRequest): Promise<Order> {
    const isValid = await this.usersRepository.verifyUser(createOrderRequest.userId!, "user");
    if (!isValid) {
      throw new Error("User or role are not valid");
    }
    const activeOrders = await this.ordersRepository.activeOrders(createOrderRequest.userId!);
    if (activeOrders > 3) {
      throw new Error("You have more than 3 orders available");
    }
    const { idImages, urlImage } = await this.uploadFile(createOrderRequest.qrImage!);

    const createOrderDto: CreateOrderDto = {
      status: OrderStatus.AVAILABLE,
      fiatAmount: createOrderRequest.fiatAmount,
      cryptoAmount: createOrderRequest.cryptoAmount,
      fiatCurrency: "BOB",
      cryptoCurrency: "USDT",
      userId: createOrderRequest.userId!,
      recipient: createOrderRequest.recipient,
      description: createOrderRequest.description,
      qrImage: idImages,
      qrImageUrl: urlImage,
      expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    };
    // 5. Post-creation tasks (logs, notifications)
    // await this.logOrderCreation(order);
    // await this.notifyOrderCreated(order);
    return await this.ordersRepository.create(createOrderDto);
  }

  async getOrdersByUser(
    getOrdersResponse: GetOrdersResponse,
    userId: string,
    roleActiveNow: string
  ): Promise<OrdersListResponse> {
    const activeRoleId = await this.usersRepository.getActiveRoleIdByUserId(userId);
    if (!activeRoleId) {
      throw new Error("User does not have an active role");
    }
    const roleNameActive = (await this.usersRepository.getRoleNameByRoleId(activeRoleId)) as UserRole;
    if (roleNameActive !== roleActiveNow) {
      throw new Error(
        `You must log in as ${roleNameActive} to access this resource. Currently logged in as ${roleActiveNow}`
      );
    }

    const limit = getOrdersResponse.limit ?? 10;
    const offset = getOrdersResponse.offset ?? 0;

    const getOrdersDto: GetOrdersDto = {
      status: getOrdersResponse.status,
      limit,
      offset,
    };

    if (roleNameActive === "user") {
      getOrdersDto.userId = userId;
    } else if (roleNameActive === "ally") {
      getOrdersDto.allyId = userId;
    }
    const { orders, total } = await this.ordersRepository.findMany(getOrdersDto);
    const ordersResponse = orders.map(OrderMapper.orderToOrderResponse);

    return {
      orders: ordersResponse,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getOrderById(orderId: string, userId: string): Promise<OrderResponse> {
    const order = await this.ordersRepository.findById(orderId);
    if (userId && !(await this.canUserAccessOrder(order!, userId))) {
      throw new Error("Access denied to this order");
    }
    return OrderMapper.orderToOrderResponse(order!);
  }

  async getAvailableOrders(filters: AvailableOrdersFilters, userId: string): Promise<AvailableOrdersResponse> {
    const isAlly = await this.usersRepository.verifyUser(userId, "ally");
    if (!isAlly) {
      throw new Error("Access denied for users are not allies");
    }
    const orders = await this.ordersRepository.findAvailable(filters);
    const ordersResponse = orders.map(OrderMapper.orderToOrderResponse);

    return {
      orders: ordersResponse,
      metadata: {
        totalAvailable: ordersResponse.length,
        avgWaitTime: this.calculateAverageWaitTime(), // este sirve?
        yourActiveOrders: ordersResponse.length,
        // verificar este atributo sirve? En este nivel deberiamos verificar
        // que si el Ally tiene ya otra orden en curso entonces no puede tomar la orden aniadir mas adelante
      },
    };
  }

  async takeOrder(takeOrderDto: TakeOrderDto, allyId: string): Promise<Order> {
    const isAlly = await this.usersRepository.verifyUser(allyId, "ally");
    if (!isAlly) {
      throw new Error("Access denied for users are not allies");
    }
    const order = await this.ordersRepository.findById(takeOrderDto.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== OrderStatus.AVAILABLE) {
      throw new Error("Order is not available for taking");
    }

    await this.validateAllyCanTakeOrder(order);

    return await this.ordersRepository.updateStatus(takeOrderDto.orderId, OrderStatus.TAKEN, {
      allyId,
      takenAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    // Post-take tasks
    // await this.notifyOrderTaken(updatedOrder);
  }

  async uploadProof(uploadProofDto: UploadProofDto, allyId: string): Promise<Order> {
    const order = await this.ordersRepository.findById(uploadProofDto.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== OrderStatus.TAKEN) {
      throw new Error("Order is not in taken status");
    }

    if (order.allyId !== allyId) {
      throw new Error("Only the assigned ally can upload proof");
    }

    const { idImages: confirmationProof, urlImage: confirmationProofUrl } = await this.uploadFile(
      uploadProofDto.proofFile
    );
    return await this.ordersRepository.updateStatus(uploadProofDto.orderId, OrderStatus.COMPLETED, {
      confirmationProof,
      confirmationProofUrl,
      bankTransactionId: uploadProofDto.bankTransactionId,
      completedAt: new Date().toISOString(),
    });

    // Post-completion tasks
    // await this.logOrderCompletion(updatedOrder);
    // await this.notifyOrderCompleted(updatedOrder);
  }

  private async canUserAccessOrder(order: Order, userId: string): Promise<boolean> {
    const isAdmin = await this.usersRepository.verifyUser(userId, "admin");
    return order.userId === userId || order.allyId === userId || isAdmin;
  }

  private calculateAverageWaitTime(): number {
    // This would be calculated from historical data
    return 300; // 5 minutes in seconds
  }

  private async validateAllyCanTakeOrder(order: Order): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(order.expiresAt);

    if (expiresAt <= now) {
      throw new Error("this order has expired");
    }

    // Add business validation logic:
    // - Check ally reputation
    // - Check active penalties
    // - Check country compatibility
    // - Check ally capacity
  }

  private async uploadFile(file: File) {
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new Error("File size exceeds 5MB limit");
    }
    const originalName = file.name;
    const extension = originalName.split(".").pop() || "";
    const filename = `order-.${originalName}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const imagePublicUrl = await this.ordersRepository.uploadImageToStorage(filename, fileBuffer, file.type);

    const imageDataFile: ImageDataFile = {
      name: originalName,
      extension: extension,
      createdAt: new Date().toISOString(),
    };

    const { data } = await this.ordersRepository.uploadDbImage(imageDataFile);

    return {
      idImages: data.id,
      urlImage: imagePublicUrl,
    };
  }
}
