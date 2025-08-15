import {createClient} from "@supabase/supabase-js";
import {GetQuoteDto} from '../dto/quote.dto';

export class QuoteRepository {
    private supabase;

    constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }

    async getQuote(getQuoteDto: GetQuoteDto): Promise<number> {

    }

}