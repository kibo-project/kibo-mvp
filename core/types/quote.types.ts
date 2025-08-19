import { Currency, CryptoToken, Network } from '../types/orders.types';

export interface quoteRequest {
    fiatAmount: number;
    fiatCurrency: Currency;
    cryptoCurrency: CryptoToken;
    network: Network;
}


export interface quoteResponse {
    fiatAmount: number;
    fiatCurrency: Currency;
    cryptoCurrency: CryptoToken;
    network: Network;

}