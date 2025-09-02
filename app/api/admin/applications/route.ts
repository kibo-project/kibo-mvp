import { NextRequest } from "next/server";
import { AllyApplicationsController } from "@/core/controllers/allyApplications.controller";

const controller = new AllyApplicationsController();

export async function GET(request: NextRequest) {
  return controller.getApplications(request);
}
