import { NextRequest } from 'next/server';
import { AuthController } from '@/core/controllers/auth.controller';

const controller = new AuthController();

export async function POST(request: NextRequest) {
    return controller.login(request);
}
