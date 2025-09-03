import { NextRequest, NextResponse } from "next/server";
import {
  AllyApplication,
  AllyApplicationRequest,
  ApplicationsFiltersRequest,
  ApplicationsListResponse,
  applicationStatus,
} from "../types/ally.applications.types";
import { AllyApplicationsService } from "@/core/services/ally.applications.service";
import { ApiResponse } from "@/core/types/generic.types";
import { UserRole } from "@/core/types/orders.types";

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

  async getApplications(request: NextRequest) {
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
      const applicationsFilters: ApplicationsFiltersRequest = {
        status: searchParams.get("status") as applicationStatus | undefined,
        limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10,
        offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0,
      };
      const result: ApplicationsListResponse = await this.allyApplicationsService.getApplications(
        applicationsFilters,
        userId,
        roleActiveNow
      );
      const response: ApiResponse<ApplicationsListResponse> = {
        success: true,
        data: result,
      };
      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async approveApplicationById(request: NextRequest, params: Promise<{ id: string }>) {
    try {
      const { userId, roleActiveNow, applicationId } = await this.validateRequest(request, params);
      const application = await this.allyApplicationsService.approveApplication(userId, roleActiveNow, applicationId);
      const response: ApiResponse<AllyApplication> = {
        success: true,
        data: application,
      };
      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async rejectApplicationById(request: NextRequest, params: Promise<{ id: string }>) {
    try {
      const { userId, roleActiveNow, applicationId } = await this.validateRequest(request, params);
      const { reason } = await request.json();
      const application = await this.allyApplicationsService.rejectApplication(
        userId,
        roleActiveNow,
        applicationId,
        reason
      );
      const response: ApiResponse<AllyApplication> = {
        success: true,
        data: application,
      };
      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  private async validateRequest(
    request: NextRequest,
    params: Promise<{ id: string }>
  ): Promise<{ userId: string; roleActiveNow: UserRole; applicationId: string }> {
    const userId = request.headers.get("x-user-id");
    const roleActiveNow = request.headers.get("x-user-role") as UserRole;

    if (!userId || !roleActiveNow) {
      throw new Error("UNAUTHORIZED");
    }

    const resolvedParams = await params;
    const applicationId = resolvedParams.id;

    if (!applicationId) {
      throw new Error("APPLICATION_ID_NOT_FOUND");
    }

    return { userId, roleActiveNow: roleActiveNow, applicationId };
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
