// TODO: fix, avoid using 'any' type
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { OrdersService } from '../services/orders.service';
import { OrderMapper } from "../mappers/order.mapper";

import { 
  GetOrdersDto,
  TakeOrderDto,
  UploadProofDto
} from '../dto/orders.dto';
import { ApiResponse } from '../types/generic.types';
import { CreateOrderRequest, AvailableOrdersFilters, TakeOrderResponse} from "../types/orders.types";

export class OrdersController {
  private ordersService: OrdersService;

  constructor() {
    this.ordersService = new OrdersService();
  }

  async createOrder(request: NextRequest): Promise<Response> {
    try {
      const userIdParam = request.headers.get("x-user-id");
      if (!userIdParam) {
        return Response.json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          }
        }, { status: 401 });
      }
      const formData = await request.formData();

      const userId = userIdParam;
      const fiatAmount = Number(formData.get('fiatAmount'));
      const cryptoAmount = Number(formData.get('cryptoAmount'));
      const recipient = formData.get('recipient') as string;
      const description = formData.get('description') as string;
      const qrImage = formData.get('qr') as File;

      const createOrderRequest: CreateOrderRequest = {
        userId,
        fiatAmount,
        cryptoAmount,
        recipient,
        description,
        qrImage,
      };

      if (!userId || !fiatAmount || !cryptoAmount || !description || !recipient || !qrImage) {
        return Response.json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'all fields are required'
          }
        }, { status: 400 });
      }

      const order = await this.ordersService.createOrder(createOrderRequest);
      const orderResponse = OrderMapper.orderToOrderResponse(order);
      const response: ApiResponse<typeof orderResponse> = {
        success: true,
        data: orderResponse
      };

      return Response.json(response, { status: 201 });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getOrders(request: NextRequest, params: Promise<{ id: string }>): Promise<Response> {
    try {
      const resolvedParams = await params;
      const userId = resolvedParams.id;
      const { searchParams } = new URL(request.url);

      const filters: GetOrdersDto = {
        status: searchParams.get('status') as any,
        role: searchParams.get('role') as any,// Eber comment Si es posible evitar usar "role " como filtro, si no hay de otra evitar uso de any y cambiarlo a su respectivo enum
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
      };
      const result = await this.ordersService.getOrdersByUser(filters, userId);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result
      };
      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getOrderById(request: NextRequest, params: Promise<{ id: string }>): Promise<Response> {
    try {
      const resolvedParams = await params;
      const orderId = resolvedParams.id;
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId') as any;
      const order = await this.ordersService.getOrderById(orderId, userId);

      if (!order) {
        return Response.json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found'
          }
        }, { status: 404 });
      }

      const response: ApiResponse<typeof order> = {
        success: true,
        data: order
      };

      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAvailableOrders(request: NextRequest): Promise<Response> {
    try {
     /* const userId = request.headers.get("x-user-id");
      if (!userId) {
        return Response.json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          }
        }, { status: 401 });
      }*/
      const userId = "22387eb8-23cf-4b13-9968-0d7f44f42fea"
      const { searchParams } = new URL(request.url);
      const filters: AvailableOrdersFilters = {
        country: searchParams.get('country') || undefined,
        minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
        maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
        sortBy: searchParams.get('sortBy') as any,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
      };

      const result = await this.ordersService.getAvailableOrders(filters,userId);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result
      };

      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async takeOrder(request: NextRequest, { params }: { params: { id: string } }): Promise<Response> {
    try {
      /* const userId = request.headers.get("x-user-id");
      if (!userId) {
        return Response.json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          }
        }, { status: 401 });
      }*/
      const allyId = "22387eb8-23cf-4b13-9968-0d7f44f42fea"

      const takeOrderDto: TakeOrderDto = {
        orderId: params.id
      };

      const order = await this.ordersService.takeOrder(takeOrderDto, allyId);
      const takeOrderResponse: TakeOrderResponse = {
        order
      }

      const response: ApiResponse<typeof takeOrderResponse> = {
        success: true,
        data: takeOrderResponse
      };

      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async uploadProof(request: NextRequest, { params }: { params: { id: string } }): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const allyId = searchParams.get('userId') as any;
      const formData = await request.formData();

      const proofFile = formData.get('proof') as File;
      const bankTransactionId = formData.get('bankTransactionId') as string;
      const notes = formData.get('notes') as string;

      if (!proofFile) {
        return Response.json({
          success: false,
          error: {
            code: 'MISSING_PROOF',
            message: 'Proof file is required'
          }
        }, { status: 400 });
      }

      const uploadProofDto: UploadProofDto = {
        orderId: params.id,
        proofFile,
        bankTransactionId: bankTransactionId || undefined,
        notes: notes || undefined
      };

      const order = await this.ordersService.uploadProof(uploadProofDto, allyId);

      const response: ApiResponse<typeof order> = {
        success: true,
        data: order
      };

      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): Response {
    console.error('Orders Controller Error:', error);

    const statusCode = this.getStatusCodeFromError(error);
    
    return Response.json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: statusCode });
  }

  private getStatusCodeFromError(error: any): number {
    if (error.message.includes('not found')) return 404;
    if (error.message.includes('Authentication required')) return 401;
    if (error.message.includes('Access denied')) return 403;
    if (error.message.includes('Invalid') || error.message.includes('required')) return 400;
    return 500;
  }
}
