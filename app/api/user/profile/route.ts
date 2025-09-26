import { NextRequest } from "next/server";
import { UsersController } from "@/core/controllers/users.controller";

const controller = new UsersController();

export async function PATCH(request: NextRequest) {
  return controller.editProfile(request);
}
