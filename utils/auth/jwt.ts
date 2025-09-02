import { NextRequest, NextResponse } from "next/server";
import { JWTPayload, SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
const ISSUER = process.env.ISSUER!;
const AUDIENCE = process.env.AUDIENCE!;

export interface CustomJWTPayload extends JWTPayload {
  userId: string;
  role: string;
  privyId: string;
}

export const generateToken = async (userId: string, privyId: string, role: string): Promise<string> => {
  const payload = {
    userId,
    privyId,
    role,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<CustomJWTPayload> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    return payload as CustomJWTPayload;
  } catch (error) {
    const err = error as Error;
    if (err.message.includes("expired") || err.message.includes("exp")) {
      throw new Error("expired token");
    }
    throw new Error("Invalid token");
  }
};

export const extractTokenFromCookie = (req: NextRequest): string | null => {
  const cookieToken = req.cookies.get("authToken")?.value;
  if (!cookieToken) {
    throw new Error("token not found");
  }
  return cookieToken;
};

export const setAuthCookie = (response: NextResponse, token: string): NextResponse => {
  response.cookies.set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: Number(process.env.AUTH_COOKIE_MAX_AGE),
    path: "/",
  });
  return response;
};

export const clearAuthCookie = (response: NextResponse): NextResponse => {
  response.cookies.set("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
  return response;
};
