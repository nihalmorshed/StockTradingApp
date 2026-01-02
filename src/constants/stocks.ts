
//  List of 15 popular stocks to track for the trading dashboard
 

export interface StockInfo {
  symbol: string;
  name: string;
  logoUrl?: string;
}

export const POPULAR_STOCKS: StockInfo[] = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'PG', name: 'Procter & Gamble Co.' },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'INTC', name: 'Intel Corporation' },
];

export const STOCK_SYMBOLS = POPULAR_STOCKS.map(s => s.symbol);

// Map for quick lookup
export const STOCK_INFO_MAP = new Map<string, StockInfo>(
  POPULAR_STOCKS.map(s => [s.symbol, s])
);

export const FINNHUB_API_KEY = 'd5bc5n9r01qj66bgnuc0d5bc5n9r01qj66bgnucg';

export const FINNHUB_WS_URL = 'wss://ws.finnhub.io';

export const UI_UPDATE_THROTTLE_MS = 250; // 4 updates per second
export const PRICE_HISTORY_MAX_POINTS = 100; // Sliding window size
