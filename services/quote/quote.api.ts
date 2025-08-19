// Servicio real para obtener cotizaciones
import { QuoteParams, QuoteResponse } from '../../core/types/quote.types';

class QuoteApiService {
    private baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '/api';

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getQuote(params: QuoteParams): Promise<QuoteResponse> {
        // Construir query string con los parámetros
        const queryParams = new URLSearchParams({
            amountFiat: params.amountFiat.toString(),
            fiatCurrency: params.fiatCurrency,
            cryptoToken: params.cryptoToken,
            network: params.network,
        });

        const endpoint = `/quote?${queryParams.toString()}`;

        return this.request<QuoteResponse>(endpoint, {
            method: 'GET',
        });
    }
}

export const quoteApiService = new QuoteApiService();