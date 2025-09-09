import { NextRequest } from "next/server";
import { UsersController } from "@/core/controllers/users.controller";

const controller = new UsersController();

export async function GET(request: NextRequest) {
  return controller.getUsers(request);
}
