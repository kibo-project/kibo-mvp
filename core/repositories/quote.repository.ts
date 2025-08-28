/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_ENDPOINTS, QUOTE_CONFIG } from "../../config/constants";
import { QuoteRequest } from "@/core/types/quote.types";
import { createClient } from "@supabase/supabase-js";

export class QuoteRepository {
  private supabase;

  constructor() {
    this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }

  async getQuote(quoteRequest: QuoteRequest): Promise<number> {
    const payload = {
      page: QUOTE_CONFIG.DEFAULT_PAGE,
      rows: QUOTE_CONFIG.DEFAULT_ROWS,
      payTypes: [],
      asset: quoteRequest.cryptoCurrency,
      fiat: quoteRequest.fiatCurrency,
      tradeType: QUOTE_CONFIG.DEFAULT_TRADE_TYPE,
      network: quoteRequest.network,
    };

    const response = await fetch(API_ENDPOINTS.BINANCE_P2P_SEARCH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      throw new Error("No quotes available");
    }

    const rates = result.data.map((item: any) => parseFloat(item.adv.price));
    const bestRate = Math.min(...rates);

    return bestRate;
  }
}
