/* eslint-disable @typescript-eslint/no-explicit-any */
import {NextRequest, NextResponse} from 'next/server';
import {AuthService} from '../services/auth.service';
import {AuthUserDto} from '../dto/auth.dto';
import {ApiResponse} from '../types/generic.types';
import { setAuthCookie } from "../../utils/auth/jwt";
import {User} from '../types/orders.types';


export class AuthController {
    private authService : AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async login(request: NextRequest): Promise<NextResponse> {
        try {
            const authHeader = request.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return NextResponse.json({
                    success: false,
                    error: { code: "UNAUTHORIZED", message: "Authorization token is required" },
                }, { status: 401 });
            }

            const token = authHeader.replace("Bearer ", "");
            const body = await request.json();
            if(!body.privyId || !body.email || !body.password || !body.wallet || !body.name || !token) {
                return NextResponse.json({
                    success: false,
                    error: {
                        code: 'MISSING_FIELDS',
                        message: 'privyId, email, password, wallet, name and token are required'
                    }
                }, { status: 400 });
            }
            const authUserDto: AuthUserDto = {
                privyId: body.privyId,
                email: body.email,
                wallet: body.wallet,
                token,
                name: body.name,
            };

            const result = await this.authService.login(authUserDto);
            const responseData: ApiResponse<User> = {
                success: true,
                data: result.user
            };

            const response = NextResponse.json(responseData);
            return setAuthCookie(response, result.token);
        } catch (error) {
            return this.handleError(error);
        }
    }

    private handleError(error: any): NextResponse {
        console.error('Auth Controller Error:', error);

        const statusCode = this.getStatusCodeFromError(error);

        return NextResponse.json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'An unexpected error occurred',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        }, { status: statusCode });
    }

    private getStatusCodeFromError(error: any): number {
        if (error.message.includes('not found')) return 404;
        if (error.message.includes('Authentication required')) return 401;
        if (error.message.includes('Access denied')) return 403;
        if (error.message.includes('Invalid') || error.message.includes('required')) return 400;
        return 500;
    }
}