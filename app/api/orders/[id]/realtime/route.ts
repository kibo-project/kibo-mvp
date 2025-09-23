import { NextRequest } from "next/server";
import { OrdersController } from "@/core/controllers/orders.controller";

const controller = new OrdersController();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return controller.getOrderByIdRealtime(request, params);
}
