import { NextRequest, NextResponse } from "next/server";
import { UsersService } from "@/core/services/users.service";
import { ApiResponse } from "@/core/types/generic.types";
import { UserRole } from "@/core/types/orders.types";
import { UsersFiltersDto, UsersFiltersRequest, UsersListResponse } from "@/core/types/users.types";

export class UsersController {
  private usersService: UsersService;
  constructor() {
    this.usersService = new UsersService();
  }

  async getUsers(request: NextRequest) {
    try {
      const userId = request.headers.get("x-user-id");
      const roleActiveNow = request.headers.get("x-user-role") as UserRole;

      if (!userId || !roleActiveNow) {
        return Response.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Admin authentication required",
            },
          },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(request.url);
      const usersFilters: UsersFiltersRequest = {
        role: searchParams.get("role") as UserRole | undefined,
        limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10,
        offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0,
      };
      const usersFiltersDto: UsersFiltersDto = {
        role: usersFilters.role,
        limit: usersFilters.limit!,
        offset: usersFilters.offset!,
      };
      const result: UsersListResponse = await this.usersService.getUsers(usersFiltersDto, userId, roleActiveNow);
      const response: ApiResponse<UsersListResponse> = {
        success: true,
        data: result,
      };
      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  private handleError(error: any): NextResponse {
    console.error("User Controller Error:", error);

    const statusCode = this.getStatusCodeFromError(error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || "INTERNAL_ERROR",
          message: error.message || "An unexpected error occurred",
          details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
      },
      { status: statusCode }
    );
  }

  private getStatusCodeFromError(error: any): number {
    if (error.message.includes("not found")) return 404;
    if (error.message.includes("Authentication required")) return 401;
    if (error.message.includes("Access denied")) return 403;
    if (error.message.includes("Invalid") || error.message.includes("required")) return 400;
    return 500;
  }
}
