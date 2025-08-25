import { QuoteRequest, QuoteResponse } from '../../core/types/quote.types';
import {ApiResponse} from '../../core/types/generic.types';
import { ENDPOINTS } from '../../config/api';

class QuoteApiService {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL!;

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {

        // TODO: Update this request with standar urlization
        const url = `/api${endpoint}`;

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

    async getQuote(params: QuoteRequest): Promise<ApiResponse<QuoteResponse>> {
        const queryParams = new URLSearchParams({
            fiatAmount: params.fiatAmount.toString(),
            fiatCurrency: params.fiatCurrency,
            cryptoCurrency: params.cryptoCurrency,
            network: params.network,
        });

        const endpoint = `${ENDPOINTS.QUOTE}?${queryParams.toString()}`;

        return this.request<ApiResponse<QuoteResponse>>(endpoint, {
            method: 'GET',
        });
    }
}

export const quoteApiService = new QuoteApiService();