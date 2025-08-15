// app/api/orders/[id]/take/route.ts
import { NextRequest } from 'next/server';
import { OrdersController } from '@/core/controllers/orders.controller';

const controller = new OrdersController();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return controller.takeOrder(request, { params: { id } });
}
