/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { OrdersService } from '../services/orders.service';
import { OrderMapper } from "../mappers/order.mapper";

import { 
  TakeOrderDto,
  UploadProofDto
} from '../dto/orders.dto';
import { ApiResponse } from '../types/generic.types';
import {
  CreateOrderRequest,
  AvailableOrdersFilters,
  TakeOrderResponse,
  GetOrdersResponse, OrderStatus, OrdersListResponse,
} from "../types/orders.types";

export class OrdersController {
  private ordersService: OrdersService;

  constructor() {
    this.ordersService = new OrdersService();
  }

  async createOrder(request: NextRequest): Promise<Response> {
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
      const userId = "692b1378-67a6-48cc-8c88-e96a33b50617";

      const formData = await request.formData();

      const fiatAmount = Number(formData.get('fiatAmount'));
      const cryptoAmount = Number(formData.get('cryptoAmount'));
      const recipient = formData.get('recipient') as string;
      const description = formData.get('description') as string;
      const qrImage = formData.get('qr') as File;

      const missingFields: string[] = [];

      if (!userId) missingFields.push('userId');
      if (!fiatAmount || isNaN(fiatAmount)) missingFields.push('fiatAmount');
      if (!cryptoAmount || isNaN(cryptoAmount)) missingFields.push('cryptoAmount');
      if (!recipient) missingFields.push('recipient');
      if (!description) missingFields.push('description');
      if (!qrImage) missingFields.push('qr');

      if (missingFields.length > 0) {
        return Response.json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: `Missing required fields: ${missingFields.join(', ')}`,
          }
        }, { status: 400 });
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
        data: orderResponse
      };

      return Response.json(response, { status: 201 });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getOrders(request: NextRequest): Promise<Response> {
    try {
      const userId = request.headers.get("x-user-id");
      
      if (!userId) {
        return Response.json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          }
        }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const statusParam = searchParams.get('status');

      const filters: GetOrdersResponse = {
        status: this.isValidOrderStatus(statusParam) ? statusParam : undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
      };
      const result: OrdersListResponse = await this.ordersService.getOrdersByUser(filters, userId);
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
      const userId = request.headers.get("x-user-id");
      if (!userId) {
        return Response.json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          }
        }, { status: 401 });
      }
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
      const sortByParam = searchParams.get('sortBy');

      const filters: AvailableOrdersFilters = {
        country: searchParams.get('country') || undefined,
        minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
        maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
        sortBy: this.isValidSortBy(sortByParam) ? sortByParam : undefined,
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

  async takeOrder(request: NextRequest, params: Promise<{ id: string }>): Promise<Response> {
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

      const resolvedParams = await params;
      const orderId = resolvedParams.id;
      const allyId = "22387eb8-23cf-4b13-9968-0d7f44f42fea"

      const takeOrderDto: TakeOrderDto = {
        orderId: orderId,
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

  async uploadProof(request: NextRequest,  params: Promise<{ id: string }>): Promise<Response> {
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
      const resolvedParams = await params;
      const orderId = resolvedParams.id;
      const allyId = "22387eb8-23cf-4b13-9968-0d7f44f42fea"
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
        orderId: orderId,
        proofFile,
        bankTransactionId: bankTransactionId || undefined,
        notes: notes || undefined
      };

      const order = await this.ordersService.uploadProof(uploadProofDto, allyId);
      const orderResponse = OrderMapper.orderToOrderResponse(order);


      const response: ApiResponse<typeof orderResponse> = {
        success: true,
        data: orderResponse
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
  private isValidSortBy(sortBy: string | null): sortBy is 'createdAt' | 'expiresAt' | 'amount' {
    if (!sortBy) return false;
    return ['createdAt', 'expiresAt', 'amount'].includes(sortBy);
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
