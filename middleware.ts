import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { extractTokenFromCookie, verifyToken } from "./utils/auth/jwt";

export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  try {
    const token = extractTokenFromCookie(request);
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyToken(token);

    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId);
    response.headers.set("x-user-email", payload.email);
    return response;

  } catch (error) {
    console.error("Invalid token", error);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("authToken", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });
    return response;
  }
}

export const config = {
  matcher: [
    "/api/supabase/controller/order/:path*"
  ],
};