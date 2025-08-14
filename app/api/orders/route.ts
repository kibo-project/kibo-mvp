import { NextRequest } from 'next/server';
import { OrdersController } from '@/core/controllers/orders.controller';

const controller = new OrdersController();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return controller.getOrders(request, params);
}

export async function POST(request: NextRequest) {
  return controller.createOrder(request);
}
