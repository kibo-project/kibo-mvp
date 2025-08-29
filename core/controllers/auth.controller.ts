import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "../../utils/auth/jwt";
import { AuthService } from "../services/auth.service";
import { ApiResponse } from "../types/generic.types";
import { UserResponse } from "../types/users.types";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(request: NextRequest): Promise<NextResponse> {
    try {
      const token = request.cookies.get("privy-token")?.value;

      if (!token || token.trim() === "") {
        return NextResponse.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "No authentication token found" },
          },
          { status: 401 }
        );
      }

      const result = await this.authService.login(token);
      const responseData: ApiResponse<UserResponse> = {
        success: true,
        data: result.userResponse,
      };

      const response = NextResponse.json(responseData);
      return setAuthCookie(response, result.token);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(request: NextRequest): Promise<void> {}

  async changeUser(request: NextRequest): Promise<Response> {
    try {
      const userId = request.headers.get("x-user-id");
      if (!userId) {
        return Response.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "User authentication required",
            },
          },
          { status: 401 }
        );
      }
      const body = await request.json();
      const { roleId } = body;

      if (!roleId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "BAD_REQUEST",
              message: "roleId is required",
            },
          },
          { status: 400 }
        );
      }
      const updatedUser = await this.authService.changeUserRole(userId, roleId);
      const responseData: ApiResponse<UserResponse> = {
        success: true,
        data: updatedUser.userResponse,
      };

      const response = NextResponse.json(responseData);
      return setAuthCookie(response, updatedUser.token);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async profile(request: NextRequest): Promise<Response> {
    try {
      const userId = request.headers.get("x-user-id");
      if (!userId) {
        return Response.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "User authentication required",
            },
          },
          { status: 401 }
        );
      }

      const userProfile = await this.authService.getProfile(userId);

      if (!userProfile) {
        return Response.json(
          {
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: "Order not found",
            },
          },
          { status: 404 }
        );
      }

      const response: ApiResponse<typeof userProfile> = {
        success: true,
        data: userProfile,
      };

      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): NextResponse {
    console.error("Auth Controller Error:", error);

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
