import { ENDPOINTS } from '../../config/api';
import {ApiResponse} from '../../core/types/generic.types';
import {LoginResponse} from '../../core/types/auth.types';



class AuthApiService {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultHeaders: Record<string, string> = {};
        if (!(options.body instanceof FormData)) {
            defaultHeaders['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
            credentials: 'include', // Esto envía las cookies automáticamente
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log('API Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        return response.json();
    }
    async login(): Promise<ApiResponse<LoginResponse>> {
        console.log('ENDPOINTS.CONNECT:', ENDPOINTS.CONNECT); // En tu servicio
        return this.request<ApiResponse<LoginResponse>>(ENDPOINTS.CONNECT, {
            method: 'POST',
            // No body necesario - el token viene automáticamente en cookies
        });
    }

}

export const authApiService = new AuthApiService();