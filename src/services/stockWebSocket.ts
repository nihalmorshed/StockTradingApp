
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
  private simulationInterval: NodeJS.Timeout | null = null;
  private isSimulating: boolean = false;
  private stockPrices: Map<string, number> = new Map();

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

  // Start simulation mode for demo purposes (when market is closed)
  startSimulation(): void {
    if (this.isSimulating) return;

    console.log('Starting price simulation mode for demo');
    this.isSimulating = true;
    this.onConnectionChange?.(true);

    // Initialize prices from POPULAR_STOCKS
    const basePrices: Record<string, number> = {
      'AAPL': 178.50, 'GOOGL': 141.25, 'MSFT': 378.90, 'AMZN': 178.35,
      'META': 505.75, 'TSLA': 248.50, 'NVDA': 875.30, 'JPM': 198.45,
      'V': 279.80, 'JNJ': 156.20, 'WMT': 165.30, 'PG': 158.90,
      'DIS': 112.45, 'NFLX': 628.50, 'INTC': 45.30,
    };

    POPULAR_STOCKS.forEach(stock => {
      this.stockPrices.set(stock.symbol, basePrices[stock.symbol] || 100);
    });

    // Generate random price updates every 500-1500ms
    this.simulationInterval = setInterval(() => {
      // Pick 1-3 random stocks to update
      const numUpdates = Math.floor(Math.random() * 3) + 1;
      const symbols = Array.from(this.stockPrices.keys());

      for (let i = 0; i < numUpdates; i++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const currentPrice = this.stockPrices.get(symbol) || 100;

        // Random price change: -1% to +1%
        const changePercent = (Math.random() - 0.5) * 0.02;
        const newPrice = parseFloat((currentPrice * (1 + changePercent)).toFixed(2));

        this.stockPrices.set(symbol, newPrice);

        const dataPoint: StockDataPoint = {
          timestamp: Date.now(),
          price: newPrice,
          volume: Math.floor(Math.random() * 50000) + 5000,
        };

        this.onUpdate?.(symbol, dataPoint);
      }
    }, 800 + Math.random() * 700); // Random interval 800-1500ms
  }

  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isSimulating = false;
    console.log('Simulation mode stopped');
  }

  isInSimulationMode(): boolean {
    return this.isSimulating;
  }
}

export const stockWebSocketService = new StockWebSocketService();

// Generate simulated price history for demo purposes
function generatePriceHistory(basePrice: number, points: number = 50): StockDataPoint[] {
  const history: StockDataPoint[] = [];
  const now = Date.now();
  let price = basePrice;

  for (let i = points; i > 0; i--) {
    // Random walk: price changes by -2% to +2%
    const change = (Math.random() - 0.5) * 0.04 * price;
    price = Math.max(price + change, 1); // Ensure price stays positive

    history.push({
      timestamp: now - (i * 5000), // 5 seconds apart
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 100000) + 10000,
    });
  }

  return history;
}

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
    const basePrice = basePrices[stockInfo.symbol] || 100;
    const priceHistory = generatePriceHistory(basePrice, 50);

    // Get current price from the last history point
    const currentPrice = priceHistory.length > 0
      ? priceHistory[priceHistory.length - 1].price
      : basePrice;

    // Calculate change from first to last price in history
    const firstPrice = priceHistory.length > 0 ? priceHistory[0].price : basePrice;
    const change = parseFloat((currentPrice - firstPrice).toFixed(2));
    const changePercent = parseFloat(((change / firstPrice) * 100).toFixed(2));

    // Calculate high/low from price history
    const prices = priceHistory.map(p => p.price);
    const high24h = prices.length > 0 ? Math.max(...prices) : basePrice;
    const low24h = prices.length > 0 ? Math.min(...prices) : basePrice;

    // Calculate total volume from history
    const totalVolume = priceHistory.reduce((sum, p) => sum + p.volume, 0);

    return {
      symbol: stockInfo.symbol,
      name: stockInfo.name,
      currentPrice: currentPrice,
      previousPrice: firstPrice,
      change: change,
      changePercent: changePercent,
      volume: totalVolume,
      marketCap: marketCaps[stockInfo.symbol] || 100000000000,
      high24h: high24h,
      low24h: low24h,
      logoUrl: stockInfo.logoUrl,
      priceHistory: priceHistory,
    };
  });
}
