import {QuoteRepository} from '../repositories/quote.repository';
import {QuoteRequest, QuoteResponse} from "@/core/types/quote.types";


export class QuoteService {
    private quoteRepository: QuoteRepository;

    constructor() {
        this.quoteRepository = new QuoteRepository();
    }

    async getQuote(quoteRequest: QuoteRequest) {
        if (quoteRequest.fiatAmount <= 0) {
            throw new Error('Fiat amount must be greater than 0');
        }
        if (quoteRequest.fiatAmount < 10) {
            throw new Error('Minimum fiat amount is 10');
        }
        if (quoteRequest.fiatAmount >10000) {
            throw new Error('Maximum fiat amount is 10000');
        }

        const bestRate = await this.quoteRepository.getQuote(quoteRequest);

        if (!bestRate) {
            throw new Error('Failed to get quote');
        }

        const usdtAmount = parseFloat((quoteRequest.fiatAmount / bestRate).toFixed(6));

        const quoteResponse: QuoteResponse = {
            fiatAmount: quoteRequest.fiatAmount,
            fiatCurrency: quoteRequest.fiatCurrency,
            cryptoAmount: usdtAmount,
            rate: bestRate,
        }
        return quoteResponse;
    }

}