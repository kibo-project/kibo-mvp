import { CryptoToken, Currency, Network } from "../types/orders.types";

export interface QuoteRequest {
  fiatAmount: number;
  fiatCurrency: Currency;
  cryptoCurrency: CryptoToken;
  network: Network;
}

export interface QuoteResponse {
  fiatAmount: number;
  fiatCurrency: Currency;
  cryptoAmount: number;
  rate: number;
}
