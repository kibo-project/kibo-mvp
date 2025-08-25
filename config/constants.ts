export const API_ENDPOINTS = {
    BINANCE_P2P_SEARCH: "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
} as const;

export const QUOTE_CONFIG = {
    DEFAULT_PAGE: 1,
    DEFAULT_ROWS: 20,
    DEFAULT_TRADE_TYPE: "SELL",
    DEFAULT_PAY_TYPES: [],
} as const;

export const QUOTE_LIMITS = {
    MIN_FIAT_AMOUNT: 10,
    MAX_FIAT_AMOUNT: 10000,
} as const;