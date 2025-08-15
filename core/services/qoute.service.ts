import {QuoteRepository} from '../repositories/quote.repository';
import {GetQuoteDto} from '../dto/quote.dto';


export class QuoteService {
    private quoteRepository: QuoteRepository;

    constructor() {
        this.quoteRepository = new QuoteRepository();
    }

    async getQuote(getQuoteDto: GetQuoteDto) {
        if (getQuoteDto.fiatAmount <= 0) {
            throw new Error('Fiat amount must be greater than 0');
        }
        if (getQuoteDto.fiatAmount < 10) {
            throw new Error('Minimum fiat amount is 10');
        }
        if (getQuoteDto.fiatAmount >10000) {
            throw new Error('Maximum fiat amount is 10000');
        }

        const bestRate = await this.quoteRepository.getQuote(getQuoteDto);

        if (!bestRate) {
            throw new Error('Failed to get quote');
        }

        const usdtAmount = parseFloat((getQuoteDto.fiatAmount / bestRate).toFixed(6));

        return {
            fiatAmount: getQuoteDto.fiatAmount,
            fiatCurrency: getQuoteDto.fiatCurrency,
            usdtAmount,
            rate: bestRate,
        };
    }

}