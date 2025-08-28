import { QUOTE_LIMITS } from "../../config/constants";
import { QuoteRepository } from "../repositories/quote.repository";
import { QuoteRequest, QuoteResponse } from "@/core/types/quote.types";

export class QuoteService {
  private quoteRepository: QuoteRepository;

  constructor() {
    this.quoteRepository = new QuoteRepository();
  }

  async getQuote(quoteRequest: QuoteRequest) {
    if (quoteRequest.fiatAmount < QUOTE_LIMITS.MIN_FIAT_AMOUNT) {
      throw new Error(`Minimum fiat amount is ${QUOTE_LIMITS.MIN_FIAT_AMOUNT}`);
    }
    if (quoteRequest.fiatAmount > QUOTE_LIMITS.MAX_FIAT_AMOUNT) {
      throw new Error(`Maximum fiat amount is ${QUOTE_LIMITS.MAX_FIAT_AMOUNT}`);
    }

    const bestRate = await this.quoteRepository.getQuote(quoteRequest);

    if (!bestRate) {
      throw new Error("Failed to get quote");
    }

    const usdtAmount = parseFloat((quoteRequest.fiatAmount / bestRate).toFixed(6));

    const quoteResponse: QuoteResponse = {
      fiatAmount: quoteRequest.fiatAmount,
      fiatCurrency: quoteRequest.fiatCurrency,
      cryptoAmount: usdtAmount,
      rate: bestRate,
    };
    return quoteResponse;
  }
}
