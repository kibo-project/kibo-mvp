import { NextRequest } from "next/server";
import { AllyApplicationsController } from "@/core/controllers/allyApplications.controller";

const controller = new AllyApplicationsController();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return controller.approveApplicationById(request, params);
}
