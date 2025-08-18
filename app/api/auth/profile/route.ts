import { NextRequest } from 'next/server';
import { AuthController } from '@/core/controllers/auth.controller';

const controller = new AuthController();

export async function GET(request: NextRequest) {
    return controller.profile(request);
}
