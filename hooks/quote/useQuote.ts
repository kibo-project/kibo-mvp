import { QuoteRequest } from "../../core/types/quote.types";
import { quoteService } from "../../services/quote";
import { QUOTE_LIMITS } from "@/config/constants";
import { useQuery } from "@tanstack/react-query";

export const useQuote = (params: QuoteRequest, options: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: ["quote", params.fiatAmount, params.fiatCurrency, params.cryptoCurrency, params.network],
    queryFn: async () => quoteService.getQuote(params),
    enabled:
      options.enabled !== false &&
      params.fiatAmount >= QUOTE_LIMITS.MIN_FIAT_AMOUNT &&
      params.fiatAmount <= QUOTE_LIMITS.MAX_FIAT_AMOUNT,
    staleTime: 0,
    gcTime: 60000,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
