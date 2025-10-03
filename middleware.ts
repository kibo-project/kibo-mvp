import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractTokenFromCookie, verifyToken } from "./utils/auth/jwt";

export async function middleware(request: NextRequest) {
  try {
    const token = extractTokenFromCookie(request);
    if (!token) {
      return Response.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication token is required",
          },
        },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId);
    response.headers.set("x-user-role", payload.role);

    return response;
  } catch (error) {
    const err = error as Error;
    if (err.message.includes("expired")) {
      return Response.json(
        {
          success: false,
          error: {
            code: "TOKEN_EXPIRED",
            message: "Token expired, please refresh",
          },
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid token",
        },
      },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/auth/profile", "/api/orders/:path*", "/api/auth/shift", "/api/admin/:path*", "/api/user/:path*"],
};
