import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify, decodeJwt } from 'jose';


export interface CustomJWTPayload {
    privyId: string;
    email: string;
    wallet: string;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h" ;

export const generateToken = async (userId: string, wallet: string): Promise<string> => {
    const payload = {
        userId,
        wallet,
    };

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .setIssuer("tu-app-nextjs")
        .setAudience("tu-app-users")
        .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<CustomJWTPayload> => {
    try {
        decodeJwt(token);
        const { payload } = await jwtVerify(token, JWT_SECRET, {
            issuer: "tu-app-nextjs",
            audience: "tu-app-users",
        });
        return payload as unknown as CustomJWTPayload;
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
        secure: process.env.NODE_ENV === "production",// cambiara a true cuando estemos en produccion
        sameSite: "strict",
        maxAge: Number(process.env.AUTH_COOKIE_MAX_AGE),
        path: "/",
    });
    return response;
};