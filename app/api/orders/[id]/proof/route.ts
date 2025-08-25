import { NextRequest } from 'next/server';
import { OrdersController } from '@/core/controllers/orders.controller';

const controller = new OrdersController();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return controller.uploadProof(request, params);
}
