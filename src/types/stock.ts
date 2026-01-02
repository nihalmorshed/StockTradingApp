
//  stock data types 
 

//stock data point for price history
export interface StockDataPoint {
  timestamp: number;
  price: number;
  volume: number;
}

// stock information
export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  logoUrl?: string;
  priceHistory: StockDataPoint[];
}

// webSocket message types
export interface StockUpdateMessage {
  type: 'STOCK_UPDATE';
  data: {
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
  };
}

export interface StockBatchMessage {
  type: 'STOCK_BATCH';
  data: Stock[];
}

export type WebSocketMessage = StockUpdateMessage | StockBatchMessage;

export type SortField = 'price' | 'changePercent' | 'volume' | 'name' | 'marketCap';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface StockFilters {
  searchQuery: string;
  minPrice?: number;
  maxPrice?: number;
  minChangePercent?: number;
  maxChangePercent?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
}

export interface PortfolioItem {
  stock: Stock;
  quantity: number;
  avgBuyPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Portfolio {
  items: PortfolioItem[];
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  lastUpdated: number;
}
