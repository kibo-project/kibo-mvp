import { NextRequest } from "next/server";
import { AllyApplicationsController } from "@/core/controllers/allyApplications.controller";

const controller = new AllyApplicationsController();

export async function POST(request: NextRequest) {
  return controller.applicationToAlly(request);
}
