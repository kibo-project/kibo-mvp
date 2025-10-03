import { ENDPOINTS } from "@/config/api";
import { ApiResponse } from "@/core/types/generic.types";
import { QuoteRequest, QuoteResponse } from "@/core/types/quote.types";
import { BaseApiService } from "@/services/base.api.service";

class QuoteApiService extends BaseApiService {
  async getQuote(params: QuoteRequest): Promise<ApiResponse<QuoteResponse>> {
    const queryParams = new URLSearchParams({
      fiatAmount: params.fiatAmount.toString(),
      fiatCurrency: params.fiatCurrency,
      cryptoCurrency: params.cryptoCurrency,
      network: params.network,
    });

    const endpoint = `${ENDPOINTS.QUOTE}?${queryParams.toString()}`;

    return this.request<ApiResponse<QuoteResponse>>(endpoint, {
      method: "GET",
    });
  }
}

export const quoteApiService = new QuoteApiService();
