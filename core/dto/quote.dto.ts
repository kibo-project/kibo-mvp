import { Currency, CryptoToken, Network } from '../types/orders.types';

export interface GetQuoteDto {
    fiatAmount: number;
    fiatCurrency: Currency;
    cryptoCurrency: CryptoToken;
    network: Network;

}
