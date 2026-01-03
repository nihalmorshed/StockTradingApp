// global state management for stock data with throttled updates


import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { Stock, StockDataPoint, SortConfig, StockFilters, SortField } from '../types';
import { StockPriceWindow } from '../utils/slidingWindow';
import { searchStocks } from '../utils/binarySearch';
import { throttle } from '../utils/throttle';
import { stockWebSocketService, generateInitialStocks } from '../services/stockWebSocket';
import { UI_UPDATE_THROTTLE_MS, PRICE_HISTORY_MAX_POINTS } from '../constants/stocks';

interface StockState {
  stocks: Map<string, Stock>;
  priceWindows: Map<string, StockPriceWindow>;
  sortConfig: SortConfig;
  filters: StockFilters;
  isConnected: boolean;
  error: string | null;
  lastUpdate: number;
}

type StockAction =
  | { type: 'SET_STOCKS'; payload: Stock[] }
  | { type: 'UPDATE_STOCK_PRICE'; payload: { symbol: string; dataPoint: StockDataPoint } }
  | { type: 'BATCH_UPDATE_PRICES'; payload: Map<string, StockDataPoint> }
  | { type: 'SET_SORT_CONFIG'; payload: SortConfig }
  | { type: 'SET_FILTERS'; payload: Partial<StockFilters> }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

const initialState: StockState = {
  stocks: new Map(),
  priceWindows: new Map(),
  sortConfig: { field: 'marketCap', direction: 'desc' },
  filters: { searchQuery: '' },
  isConnected: false,
  error: null,
  lastUpdate: Date.now(),
};

function stockReducer(state: StockState, action: StockAction): StockState {
  switch (action.type) {
    case 'SET_STOCKS': {
      const stocks = new Map<string, Stock>();
      const priceWindows = new Map<string, StockPriceWindow>();

      action.payload.forEach(stock => {
        stocks.set(stock.symbol, stock);

        // Create price window and populate with existing history if available
        const window = new StockPriceWindow(PRICE_HISTORY_MAX_POINTS);
        if (stock.priceHistory && stock.priceHistory.length > 0) {
          window.pushMany(stock.priceHistory);
        }
        priceWindows.set(stock.symbol, window);
      });

      return { ...state, stocks, priceWindows, lastUpdate: Date.now() };
    }

    case 'UPDATE_STOCK_PRICE': {
      const { symbol, dataPoint } = action.payload;
      const stock = state.stocks.get(symbol);
      const priceWindow = state.priceWindows.get(symbol);

      if (!stock || !priceWindow) return state;

      priceWindow.push(dataPoint);

      const previousPrice = stock.currentPrice;
      const change = dataPoint.price - previousPrice;
      const changePercent = (change / previousPrice) * 100;

      const updatedStock: Stock = {
        ...stock,
        currentPrice: dataPoint.price,
        previousPrice,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: stock.volume + dataPoint.volume,
        high24h: Math.max(stock.high24h, dataPoint.price),
        low24h: Math.min(stock.low24h, dataPoint.price),
        priceHistory: priceWindow.getAll(),
      };

      const newStocks = new Map(state.stocks);
      newStocks.set(symbol, updatedStock);

      return { ...state, stocks: newStocks, lastUpdate: Date.now() };
    }

    case 'BATCH_UPDATE_PRICES': {
      const newStocks = new Map(state.stocks);

      action.payload.forEach((dataPoint, symbol) => {
        const stock = state.stocks.get(symbol);
        const priceWindow = state.priceWindows.get(symbol);

        if (stock && priceWindow) {
          priceWindow.push(dataPoint);

          const previousPrice = stock.currentPrice;
          const change = dataPoint.price - previousPrice;
          const changePercent = (change / previousPrice) * 100;

          newStocks.set(symbol, {
            ...stock,
            currentPrice: dataPoint.price,
            previousPrice,
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: stock.volume + dataPoint.volume,
            high24h: Math.max(stock.high24h, dataPoint.price),
            low24h: Math.min(stock.low24h, dataPoint.price),
            priceHistory: priceWindow.getAll(),
          });
        }
      });

      return { ...state, stocks: newStocks, lastUpdate: Date.now() };
    }

    case 'SET_SORT_CONFIG':
      return { ...state, sortConfig: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

interface StockContextValue {
  stocks: Stock[];
  filteredStocks: Stock[];
  sortConfig: SortConfig;
  filters: StockFilters;
  isConnected: boolean;
  error: string | null;
  lastUpdate: number;
  getStock: (symbol: string) => Stock | undefined;
  getPriceHistory: (symbol: string) => StockDataPoint[];
  setSortConfig: (config: SortConfig) => void;
  setFilters: (filters: Partial<StockFilters>) => void;
  toggleSortDirection: () => void;
  setSortField: (field: SortField) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

const StockContext = createContext<StockContextValue | null>(null);

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(stockReducer, initialState);
  const pendingUpdates = useRef<Map<string, StockDataPoint>>(new Map());

  const flushUpdates = useCallback(() => {
    if (pendingUpdates.current.size > 0) {
      dispatch({ type: 'BATCH_UPDATE_PRICES', payload: new Map(pendingUpdates.current) });
      pendingUpdates.current.clear();
    }
  }, []);

  const throttledFlush = useMemo(
    () => throttle(flushUpdates, UI_UPDATE_THROTTLE_MS),
    [flushUpdates]
  );

  const handleStockUpdate = useCallback(
    (symbol: string, dataPoint: StockDataPoint) => {
      pendingUpdates.current.set(symbol, dataPoint);
      throttledFlush();
    },
    [throttledFlush]
  );

  const handleConnectionChange = useCallback((connected: boolean) => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: connected });
  }, []);

  const handleError = useCallback((error: Error) => {
    dispatch({ type: 'SET_ERROR', payload: error.message });
  }, []);

  useEffect(() => {
    const initialStocks = generateInitialStocks();
    dispatch({ type: 'SET_STOCKS', payload: initialStocks });

    stockWebSocketService.setCallbacks(
      handleStockUpdate,
      handleConnectionChange,
      handleError
    );

    stockWebSocketService.connect();

    // If no real data after 5 seconds, start simulation mode (market probably closed)
    const simulationFallbackTimer = setTimeout(() => {
      if (!stockWebSocketService.isInSimulationMode()) {
        console.log('No market data received - starting simulation mode for demo');
        stockWebSocketService.startSimulation();
      }
    }, 5000);

    return () => {
      clearTimeout(simulationFallbackTimer);
      stockWebSocketService.stopSimulation();
      stockWebSocketService.disconnect();
    };
  }, [handleStockUpdate, handleConnectionChange, handleError]);

  const sortStocks = useCallback(
    (stocks: Stock[], config: SortConfig): Stock[] => {
      return [...stocks].sort((a, b) => {
        let comparison = 0;

        switch (config.field) {
          case 'price':
            comparison = a.currentPrice - b.currentPrice;
            break;
          case 'changePercent':
            comparison = a.changePercent - b.changePercent;
            break;
          case 'volume':
            comparison = a.volume - b.volume;
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'marketCap':
            comparison = a.marketCap - b.marketCap;
            break;
          default:
            comparison = 0;
        }

        return config.direction === 'asc' ? comparison : -comparison;
      });
    },
    []
  );

  const stocks = useMemo(() => Array.from(state.stocks.values()), [state.stocks]);

  const filteredStocks = useMemo(() => {
    let result = stocks;

    if (state.filters.searchQuery) {
      result = searchStocks(result, state.filters.searchQuery);
    }

    if (state.filters.minPrice !== undefined) {
      result = result.filter(s => s.currentPrice >= state.filters.minPrice!);
    }
    if (state.filters.maxPrice !== undefined) {
      result = result.filter(s => s.currentPrice <= state.filters.maxPrice!);
    }

    if (state.filters.minChangePercent !== undefined) {
      result = result.filter(s => s.changePercent >= state.filters.minChangePercent!);
    }
    if (state.filters.maxChangePercent !== undefined) {
      result = result.filter(s => s.changePercent <= state.filters.maxChangePercent!);
    }

    if (state.filters.minMarketCap !== undefined) {
      result = result.filter(s => s.marketCap >= state.filters.minMarketCap!);
    }
    if (state.filters.maxMarketCap !== undefined) {
      result = result.filter(s => s.marketCap <= state.filters.maxMarketCap!);
    }

    return sortStocks(result, state.sortConfig);
  }, [stocks, state.filters, state.sortConfig, sortStocks]);

  const getStock = useCallback(
    (symbol: string) => state.stocks.get(symbol),
    [state.stocks]
  );

  const getPriceHistory = useCallback(
    (symbol: string) => state.priceWindows.get(symbol)?.getAll() || [],
    [state.priceWindows]
  );

  const setSortConfig = useCallback((config: SortConfig) => {
    dispatch({ type: 'SET_SORT_CONFIG', payload: config });
  }, []);

  const setFilters = useCallback((filters: Partial<StockFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const toggleSortDirection = useCallback(() => {
    dispatch({
      type: 'SET_SORT_CONFIG',
      payload: {
        ...state.sortConfig,
        direction: state.sortConfig.direction === 'asc' ? 'desc' : 'asc',
      },
    });
  }, [state.sortConfig]);

  const setSortField = useCallback(
    (field: SortField) => {
      dispatch({
        type: 'SET_SORT_CONFIG',
        payload: { field, direction: state.sortConfig.direction },
      });
    },
    [state.sortConfig.direction]
  );

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_FILTERS', payload: { searchQuery: query } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: StockContextValue = {
    stocks,
    filteredStocks,
    sortConfig: state.sortConfig,
    filters: state.filters,
    isConnected: state.isConnected,
    error: state.error,
    lastUpdate: state.lastUpdate,
    getStock,
    getPriceHistory,
    setSortConfig,
    setFilters,
    toggleSortDirection,
    setSortField,
    setSearchQuery,
    clearError,
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStocks(): StockContextValue {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStocks must be used within a StockProvider');
  }
  return context;
}
