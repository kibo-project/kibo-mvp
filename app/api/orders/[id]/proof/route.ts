import { NextRequest } from 'next/server';
import { OrdersController } from '@/core/controllers/orders.controller';

const controller = new OrdersController();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return controller.uploadProof(request, { params: { id } });
}
