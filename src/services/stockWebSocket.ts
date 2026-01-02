
//  webSocket service for connecting to Finnhub WebSocket API for real-time stock data

import { Stock, StockDataPoint } from '../types';
import { POPULAR_STOCKS, FINNHUB_WS_URL, FINNHUB_API_KEY } from '../constants/stocks';

export type StockUpdateCallback = (symbol: string, data: StockDataPoint) => void;
export type ConnectionStatusCallback = (connected: boolean) => void;
export type ErrorCallback = (error: Error) => void;

interface FinnhubTrade {
  s: string;  // Symbol
  p: number;  // Price
  t: number;  // Timestamp (ms)
  v: number;  // Volume
}

interface FinnhubMessage {
  type: string;
  data?: FinnhubTrade[];
}

class StockWebSocketService {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  private onUpdate: StockUpdateCallback | null = null;
  private onConnectionChange: ConnectionStatusCallback | null = null;
  private onError: ErrorCallback | null = null;

  setCallbacks(
    onUpdate: StockUpdateCallback,
    onConnectionChange: ConnectionStatusCallback,
    onError: ErrorCallback
  ): void {
    this.onUpdate = onUpdate;
    this.onConnectionChange = onConnectionChange;
    this.onError = onError;
  }

  //  connect to Finnhub WebSocket
  
  connect(): void {
    try {
      const url = `${FINNHUB_WS_URL}?token=${FINNHUB_API_KEY}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected to Finnhub');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.onConnectionChange?.(true);

        // subscribe to all stocks
        POPULAR_STOCKS.forEach(stock => {
          this.subscribe(stock.symbol);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: FinnhubMessage = JSON.parse(event.data);
          if (message.type === 'trade' && message.data) {
            message.data.forEach(trade => {
              const dataPoint: StockDataPoint = {
                timestamp: trade.t,
                price: trade.p,
                volume: trade.v,
              };
              this.onUpdate?.(trade.s, dataPoint);
            });
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError?.(new Error('WebSocket connection error'));
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.onConnectionChange?.(false);
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.onError?.(error as Error);
    }
  }

  
    // subscribe to a stock symbol
  
  private subscribe(symbol: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }



  // unsubscribe from a stock symbol
  private unsubscribe(symbol: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.log('Max reconnect attempts reached');
      this.onError?.(new Error('Failed to connect after multiple attempts'));
    }
  }

  
  disconnect(): void {
    if (this.ws) {
      POPULAR_STOCKS.forEach(stock => {
        this.unsubscribe(stock.symbol);
      });

      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.onConnectionChange?.(false);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const stockWebSocketService = new StockWebSocketService();

export function generateInitialStocks(): Stock[] {
  const basePrices: Record<string, number> = {
    'AAPL': 178.50,
    'GOOGL': 141.25,
    'MSFT': 378.90,
    'AMZN': 178.35,
    'META': 505.75,
    'TSLA': 248.50,
    'NVDA': 875.30,
    'JPM': 198.45,
    'V': 279.80,
    'JNJ': 156.20,
    'WMT': 165.30,
    'PG': 158.90,
    'DIS': 112.45,
    'NFLX': 628.50,
    'INTC': 45.30,
  };

  const marketCaps: Record<string, number> = {
    'AAPL': 2800000000000,
    'GOOGL': 1800000000000,
    'MSFT': 2900000000000,
    'AMZN': 1850000000000,
    'META': 1300000000000,
    'TSLA': 790000000000,
    'NVDA': 2200000000000,
    'JPM': 580000000000,
    'V': 560000000000,
    'JNJ': 380000000000,
    'WMT': 450000000000,
    'PG': 380000000000,
    'DIS': 205000000000,
    'NFLX': 280000000000,
    'INTC': 195000000000,
  };

  return POPULAR_STOCKS.map(stockInfo => {
    const price = basePrices[stockInfo.symbol] || 100;

    return {
      symbol: stockInfo.symbol,
      name: stockInfo.name,
      currentPrice: price,
      previousPrice: price,
      change: 0,
      changePercent: 0,
      volume: 0,
      marketCap: marketCaps[stockInfo.symbol] || 100000000000,
      high24h: price,
      low24h: price,
      logoUrl: stockInfo.logoUrl,
      priceHistory: [],
    };
  });
}
