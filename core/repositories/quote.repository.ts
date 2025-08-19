import {createClient} from "@supabase/supabase-js";
import {QuoteRequest} from "@/core/types/quote.types";
/* eslint-disable @typescript-eslint/no-explicit-any */

export class QuoteRepository {
    private supabase;

    constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }

    async getQuote(quoteRequest: QuoteRequest): Promise<number> {
        const payload = {
            page: 1,
            rows: 20,
            payTypes: [],
            asset: quoteRequest.cryptoCurrency,
            fiat: quoteRequest.fiatCurrency,
            tradeType: "SELL",
            network: quoteRequest.network
        };

        const response = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
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