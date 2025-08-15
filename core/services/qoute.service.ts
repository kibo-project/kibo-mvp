import {QuoteRepository} from '../repositories/quote.repository';
import {GetQuoteDto} from '../dto/quote.dto';


export class QuoteService {
    private quoteRepository: QuoteRepository;

    constructor() {
        this.quoteRepository = new QuoteRepository();
    }
    async getQuote(getQuoteDto: GetQuoteDto){
        const quote = await this.quoteRepository.getQuote(getQuoteDto);

        if (!quote) {
            throw new Error('Failed to get quote');
        }
        return quote;
    }


}