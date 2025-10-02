import { NextRequest } from "next/server";
import { TakeOrderDto, UploadProofDto } from "../dto/orders.dto";
import { OrderMapper } from "../mappers/order.mapper";
import { OrdersService } from "../services/orders.service";
import { ApiResponse } from "../types/generic.types";
import {
  AvailableOrdersFilters,
  CreateOrderRequest,
  GetOrdersResponse,
  OrderResponse,
  OrderStatus,
  OrdersFilters,
  OrdersListResponse,
} from "../types/orders.types";

export class OrdersController {
  private ordersService: OrdersService;

  constructor() {
    this.ordersService = new OrdersService();
  }

  async createOrder(request: NextRequest): Promise<Response> {
    try {
      const userId = request.headers.get("x-user-id");
      if (!userId) {
        return Response.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "User authentication required",
            },
          },
          { status: 401 }
        );
      }

      const formData = await request.formData();

      const fiatAmount = Number(formData.get("fiatAmount"));
      const cryptoAmount = Number(formData.get("cryptoAmount"));
      const recipient = formData.get("recipient") as string;
      const description = formData.get("description") as string;
      const qrImage = formData.get("qr") as File;

      const missingFields: string[] = [];

      if (!userId) missingFields.push("userId");
      if (!fiatAmount || isNaN(fiatAmount)) missingFields.push("fiatAmount");
      if (!cryptoAmount || isNaN(cryptoAmount)) missingFields.push("cryptoAmount");
      if (!recipient) missingFields.push("recipient");
      if (!description) missingFields.push("description");
      if (!qrImage) missingFields.push("qr");

      if (missingFields.length > 0) {
        return Response.json(
          {
            success: false,
            error: {
              code: "MISSING_FIELDS",
              message: `Missing required fields: ${missingFields.join(", ")}`,
            },
          },
          { status: 400 }
        );
      }

      const createOrderRequest: CreateOrderRequest = {
        userId,
        fiatAmount,
        cryptoAmount,
        recipient,
        description,
        qrImage,
      };

      const order = await this.ordersService.createOrder(createOrderRequest);
      const orderResponse = OrderMapper.orderToOrderResponse(order);
      const response: ApiResponse<typeof orderResponse> = {
        success: true,
        data: orderResponse,
      };

      return Response.json(response, { status: 201 });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getOrders(request: NextRequest): Promise<Response> {
    try {
      const userId = request.headers.get("x-user-id");
      const roleActiveNow = request.headers.get("x-user-role");

      if (!userId || !roleActiveNow) {
        return Response.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "User authentication required",
            },
          },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(request.url);
      const statusParam = searchParams.get("status");

      const filters: OrdersFilters = {
        status: this.isValidOrderStatus(statusParam) ? statusParam : undefined,
        search: searchParams.get("search") ?? undefined,
        limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
        offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
      };
      const result: OrdersListResponse = await this.ordersService.getOrdersByUser(filters, userId, roleActiveNow);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getOrdersRealtime(request: NextRequest): Promise<Response> {
    try {
      const userId = request.headers.get("x-user-id");
      const roleActiveNow = request.headers.get("x-user-role");

      if (!userId || !roleActiveNow) {
        return Response.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "User authentication required",
            },
          },
          { status: 401 }
        );
      }
      let subscription: any = null;

      const stream = new ReadableStream({
        start: async controller => {
          try {
            await this.sendInitialData(controller, userId, roleActiveNow, request);

            subscription = await this.setupRealtimeSubscription(controller, userId, roleActiveNow);
          } catch (error) {
            controller.error(error);
          }
        },
        cancel: () => {
          if (subscription) {
            subscription.unsubscribe();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Cache-Control",
        },
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async sendInitialData(
    controller: ReadableStreamDefaultController,
    userId: string,
    roleActiveNow: string,
    request: NextRequest
  ) {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    const filters: GetOrdersResponse = {
      status: this.isValidOrderStatus(statusParam) ? statusParam : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
    };

    const result = await this.ordersService.getOrdersByUser(filters, userId, roleActiveNow);

    const message = `data: ${JSON.stringify({
      type: "initial_data",
      payload: result,
    })}\n\n`;

    controller.enqueue(new TextEncoder().encode(message));
  }

  private async setupRealtimeSubscription(
    controller: ReadableStreamDefaultController,
    userId: string,
    roleActiveNow: string
  ): Promise<any> {
    const subscription = await this.ordersService.subscribeToOrderChanges(userId, roleActiveNow, data => {
      try {
        // Verificar si el controller está cerrado antes de escribir
        if (controller.desiredSize === null) {
          console.log("Controller is closed, skipping message");
          return;
        }

        const message = `data: ${JSON.stringify({
          type: "update",
          payload: data,
        })}\n\n`;

        console.log("CONTROOLLER SI LLEGA UPDATE", message);
        controller.enqueue(new TextEncoder().encode(message));
      } catch (error) {
        console.error("Error sending SSE message:", error);
      }
    });

    return subscription;
  }
  async getOrderById(request: NextRequest, params: Promise<{ id: string }>): Promise<Response> {
    try {
      const resolvedParams = await params;
      const orderId = resolvedParams.id;
      const userId = request.headers.get("x-user-id");
      if (!userId) {
        return Response.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "User authentication required",
            },
          },
          { status: 401 }
        );
      }
      const order = await this.ordersService.getOrderById(orderId, userId);
      const response: ApiResponse<OrderResponse> = {
        success: true,
        data: order,
      };

      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getOrderByIdRealtime(request: NextRequest, params: Promise<{ id: string }>): Promise<Response> {
    try {
      const resolvedParams = await params;
      const orderId = resolvedParams.id;
      const userId = request.headers.get("x-user-id");
      if (!userId) {
        return Response.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "User authentication required",
            },
          },
          { status: 401 }
        );
      }
      let subscription: any = null;

      const stream = new ReadableStream({
        start: async controller => {
          try {
            await this.sendInitialOrder(controller, userId, orderId);

            subscription = await this.setupRealtimeOrder(controller, userId, orderId);
          } catch (error) {
            controller.error(error);
          }
        },
        cancel: () => {
          if (subscription) {
            subscription.unsubscribe();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Cache-Control",
        },
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async sendInitialOrder(controller: ReadableStreamDefaultController, userId: string, orderId: string) {
    const order = await this.ordersService.getOrderById(orderId, userId);
    const message = `data: ${JSON.stringify({
      type: "initial_data",
      payload: order,
    })}\n\n`;

    controller.enqueue(new TextEncoder().encode(message));
  }
  private async setupRealtimeOrder(
    controller: ReadableStreamDefaultController,
    userId: string,
    orderId: string
  ): Promise<any> {
    const subscription = await this.ordersService.subscribeToOrderChangesById(userId, orderId, data => {
      try {
        if (controller.desiredSize === null) {
          console.log("Controller is closed, skipping message for order", orderId);
          return;
        }

        const message = `data: ${JSON.stringify({
          type: "update",
          payload: data,
        })}\n\n`;

        console.log("CONTROLLER SI LLEGA UPDATE", message);
        controller.enqueue(new TextEncoder().encode(message));
      } catch (error) {
        console.error("Error sending SSE message for order", orderId, ":", error);
      }
    });

    return subscription;
  }

  async getAvailableOrders(request: NextRequest): Promise<Response> {
    try {
      const userId = request.headers.get("x-user-id");
      if (!userId) {
        return Response.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "User authentication required",
            },
          },
          { status: 401 }
        );
      }
      const { searchParams } = new URL(request.url);
      const sortByParam = searchParams.get("sortBy");

      const filters: AvailableOrdersFilters = {
        country: searchParams.get("country") || undefined,
        minAmount: searchParams.get("minAmount") ? parseFloat(searchParams.get("minAmount")!) : undefined,
        maxAmount: searchParams.get("maxAmount") ? parseFloat(searchParams.get("maxAmount")!) : undefined,
        sortBy: this.isValidSortBy(sortByParam) ? sortByParam : undefined,
        limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
        offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
      };

      const result = await this.ordersService.getAvailableOrders(filters, userId);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };

      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async takeOrder(request: NextRequest, params: Promise<{ id: string }>): Promise<Response> {
    try {
      const userId = request.headers.get("x-user-id");
      if (!userId) {
        return Response.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "User authentication required",
            },
          },
          { status: 401 }
        );
      }

      const resolvedParams = await params;
      const orderId = resolvedParams.id;

      const takeOrderDto: TakeOrderDto = {
        orderId: orderId,
      };

      const takeOrder = await this.ordersService.takeOrder(takeOrderDto, userId);
      const takeOrderResponse = OrderMapper.orderToOrderResponse(takeOrder);

      const response: ApiResponse<OrderResponse> = {
        success: true,
        data: takeOrderResponse,
      };

      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async uploadProof(request: NextRequest, params: Promise<{ id: string }>): Promise<Response> {
    try {
      const userId = request.headers.get("x-user-id");
      if (!userId) {
        return Response.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "User authentication required",
            },
          },
          { status: 401 }
        );
      }
      const resolvedParams = await params;
      const orderId = resolvedParams.id;
      const formData = await request.formData();

      const proofFile = formData.get("proof") as File;
      const bankTransactionId = formData.get("bankTransactionId") as string;
      const notes = formData.get("notes") as string;

      if (!proofFile) {
        return Response.json(
          {
            success: false,
            error: {
              code: "MISSING_PROOF",
              message: "Proof file is required",
            },
          },
          { status: 400 }
        );
      }

      const uploadProofDto: UploadProofDto = {
        orderId: orderId,
        proofFile,
        bankTransactionId: bankTransactionId || undefined,
        notes: notes || undefined,
      };

      const order = await this.ordersService.uploadProof(uploadProofDto, userId);
      const orderResponse = OrderMapper.orderToOrderResponse(order);

      const response: ApiResponse<typeof orderResponse> = {
        success: true,
        data: orderResponse,
      };

      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private isValidOrderStatus(status: string | null): status is OrderStatus {
    if (!status) return false;
    return Object.values(OrderStatus).includes(status as OrderStatus);
  }
  private isValidSortBy(sortBy: string | null): sortBy is "createdAt" | "expiresAt" | "amount" {
    if (!sortBy) return false;
    return ["createdAt", "expiresAt", "amount"].includes(sortBy);
  }

  private handleError(error: any): Response {
    console.error("Orders Controller Error:", error);

    const statusCode = this.getStatusCodeFromError(error);

    return Response.json(
      {
        success: false,
        error: {
          code: error.code || "INTERNAL_ERROR",
          message: error.message || "An unexpected error occurred",
          details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
      },
      { status: statusCode }
    );
  }

  private getStatusCodeFromError(error: any): number {
    if (error.message.includes("not found")) return 404;
    if (error.message.includes("Authentication required")) return 401;
    if (error.message.includes("Access denied")) return 403;
    if (error.message.includes("Invalid") || error.message.includes("required")) return 400;
    return 500;
  }
}
