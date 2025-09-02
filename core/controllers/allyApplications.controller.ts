import { NextRequest, NextResponse } from "next/server";
import { AllyApplication, AllyApplicationRequest } from "../types/ally.applications.types";
import { AllyApplicationsService } from "@/core/services/ally.applications.service";
import { ApiResponse } from "@/core/types/generic.types";

export class AllyApplicationsController {
  private allyApplicationsService: AllyApplicationsService;
  constructor() {
    this.allyApplicationsService = new AllyApplicationsService();
  }
  async applicationToAlly(request: NextRequest) {
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
      const { fullName, phone, address } = body;

      if (!fullName || !phone || !address) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "BAD_REQUEST",
              message: "fullname, phone and address are required",
            },
          },
          { status: 400 }
        );
      }
      const allyApplicationRequest: AllyApplicationRequest = {
        fullName,
        phone,
        address,
      };
      const solicitud = await this.allyApplicationsService.applicationToAlly(userId, allyApplicationRequest);
      const responseData: ApiResponse<AllyApplication> = {
        success: true,
        data: solicitud,
      };
      return Response.json(responseData, { status: 201 });
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
