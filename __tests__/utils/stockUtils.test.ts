// unit tests for stock utilities (sliding window, binary search, throttle)

import { SlidingWindow, StockPriceWindow } from '../../src/utils/slidingWindow';
import {
  binarySearchBySymbol,
  binarySearchByNamePrefix,
  searchStocks,
  findInsertionPoint,
} from '../../src/utils/binarySearch';
import { throttle, debounce, createThrottledUpdater } from '../../src/utils/throttle';
import { Stock, StockDataPoint } from '../../src/types/stock';

describe('SlidingWindow', () => {
  describe('basic operations', () => {
    it('pushes items and retrieves them', () => {
      const window = new SlidingWindow<number>(5);
      window.push(1);
      window.push(2);
      window.push(3);
      expect(window.getAll()).toEqual([1, 2, 3]);
    });

    it('drops oldest items when exceeding max size', () => {
      const window = new SlidingWindow<number>(3);
      window.push(1);
      window.push(2);
      window.push(3);
      window.push(4);
      expect(window.getAll()).toEqual([2, 3, 4]);
    });

    it('reports correct size', () => {
      const window = new SlidingWindow<number>(10);
      window.push(1);
      window.push(2);
      expect(window.size()).toBe(2);
    });

    it('gets latest item', () => {
      const window = new SlidingWindow<number>(5);
      window.push(1);
      window.push(2);
      window.push(3);
      expect(window.getLatest()).toBe(3);
    });

    it('gets recent n items', () => {
      const window = new SlidingWindow<number>(10);
      window.pushMany([1, 2, 3, 4, 5]);
      expect(window.getRecent(3)).toEqual([3, 4, 5]);
    });

    it('clears all items', () => {
      const window = new SlidingWindow<number>(5);
      window.pushMany([1, 2, 3]);
      window.clear();
      expect(window.size()).toBe(0);
      expect(window.getAll()).toEqual([]);
    });

    it('report if full', () => {
      const window = new SlidingWindow<number>(3);
      expect(window.isFull()).toBe(false);
      window.pushMany([1, 2, 3]);
      expect(window.isFull()).toBe(true);
    });
  });
});

describe('StockPriceWindow', () => {
  const createDataPoint = (price: number, timestamp: number): StockDataPoint => ({
    price,
    timestamp,
    volume: 1000000, // volume is required but not relevant for these testss
  });

  it('extracts prices', () => {
    const window = new StockPriceWindow(10);
    window.push(createDataPoint(100, 1000));
    window.push(createDataPoint(105, 2000));
    window.push(createDataPoint(103, 3000));
    expect(window.getPrices()).toEqual([100, 105, 103]);
  });

  it('extracts timestamps', () => {
    const window = new StockPriceWindow(10);
    window.push(createDataPoint(100, 1000));
    window.push(createDataPoint(105, 2000));
    expect(window.getTimestamps()).toEqual([1000, 2000]);
  });

  it('calculates price change', () => {
    const window = new StockPriceWindow(10);
    window.push(createDataPoint(100, 1000));
    window.push(createDataPoint(110, 2000));
    const { change, changePercent } = window.getPriceChange();
    expect(change).toBe(10);
    expect(changePercent).toBe(10);
  });

  it('gets the price range', () => {
    const window = new StockPriceWindow(10);
    window.push(createDataPoint(100, 1000));
    window.push(createDataPoint(120, 2000));
    window.push(createDataPoint(90, 3000));
    const { min, max } = window.getPriceRange();
    expect(min).toBe(90);
    expect(max).toBe(120);
  });
});

describe('Binary Search', () => {
  const createStock = (symbol: string, name: string, price: number): Stock => ({
    symbol,
    name,
    currentPrice: price,
    previousPrice: price,
    change: 0,
    changePercent: 0,
    volume: 1000000,
    marketCap: 1000000000,
    high24h: price + 5,
    low24h: price - 5,
    priceHistory: [], // not relevant for these tests
  });

  const sortedStocks: Stock[] = [
    createStock('AAPL', 'Apple Inc', 150),
    createStock('AMZN', 'Amazon.com', 130),
    createStock('GOOGL', 'Alphabet Inc', 140),
    createStock('MSFT', 'Microsoft', 380),
    createStock('TSLA', 'Tesla Inc', 250),
  ];

  describe('binarySearchBySymbol', () => {
    it('finds stock by symbol', () => {
      const result = binarySearchBySymbol(sortedStocks, 'GOOGL');
      expect(result?.symbol).toBe('GOOGL');
    });

    it('returns undefined for non-existent symbol', () => {
      const result = binarySearchBySymbol(sortedStocks, 'NFLX');
      expect(result).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      const result = binarySearchBySymbol(sortedStocks, 'googl');
      expect(result?.symbol).toBe('GOOGL');
    });

    it('handles empty array', () => {
      const result = binarySearchBySymbol([], 'AAPL');
      expect(result).toBeUndefined();
    });
  });

  describe('binarySearchByNamePrefix', () => {
    const stocksSortedByName: Stock[] = [
      createStock('GOOGL', 'Alphabet Inc', 140),
      createStock('AMZN', 'Amazon.com', 130),
      createStock('AAPL', 'Apple Inc', 150),
      createStock('MSFT', 'Microsoft', 380),
      createStock('TSLA', 'Tesla Inc', 250),
    ];

    it('finds stocks by name prefix', () => {
      const results = binarySearchByNamePrefix(stocksSortedByName, 'A');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(s => s.name.toLowerCase().startsWith('a'))).toBe(true);
    });

    it('returns all stocks for empty prefix', () => {
      const results = binarySearchByNamePrefix(stocksSortedByName, '');
      expect(results).toEqual(stocksSortedByName);
    });

    it('returns empty array for no matches', () => {
      const results = binarySearchByNamePrefix(stocksSortedByName, 'XYZ');
      expect(results).toEqual([]);
    });
  });

  describe('searchStocks', () => {
    it('searches by symbol prefix', () => {
      const results = searchStocks(sortedStocks, 'AA');
      expect(results.some(s => s.symbol === 'AAPL')).toBe(true);
    });

    it('searches by name', () => {
      const results = searchStocks(sortedStocks, 'Apple');
      expect(results.some(s => s.name === 'Apple Inc')).toBe(true);
    });

    it('returns all stocks for empty query', () => {
      const results = searchStocks(sortedStocks, '');
      expect(results).toEqual(sortedStocks);
    });

    it('should be case-insensitive', () => {
      const results = searchStocks(sortedStocks, 'apple');
      expect(results.some(s => s.symbol === 'AAPL')).toBe(true);
    });
  });

  describe('findInsertionPoint', () => {
    it('finds correct insertion point by symbol', () => {
      const newStock = createStock('META', 'Meta Platforms', 300);
      const index = findInsertionPoint(sortedStocks, newStock, 'symbol');
      expect(index).toBe(3); // Between GOOGL and MSFT
    });

    it('finds correct insertion point by price', () => {
      const stocksByPrice = [...sortedStocks].sort((a, b) => a.currentPrice - b.currentPrice);
      const newStock = createStock('TEST', 'Test', 200);
      const index = findInsertionPoint(stocksByPrice, newStock, 'price');
      expect(stocksByPrice[index - 1]?.currentPrice || 0).toBeLessThanOrEqual(200);
    });
  });
});

describe('Throttle and Debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('throttle', () => {
    it('calls function immediately on first call', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not call function again within throttle period', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);
      throttled();
      throttled();
      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('calls function with latest args after throttle period', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);
      throttled('first');
      throttled('second');
      throttled('third');
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenLastCalledWith('third');
    });
  });

  describe('debounce', () => {
    it('should not call function until wait period passes', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      debounced();
      expect(fn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('resets timer on subsequent calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      debounced();
      jest.advanceTimersByTime(50);
      debounced();
      jest.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('createThrottledUpdater', () => {
    it('batch updates within throttle window', () => {
      const updateFn = jest.fn();
      const updater = createThrottledUpdater(updateFn, 100);

      updater('key1', 'value1');
      updater('key2', 'value2');
      updater('key1', 'value1-updated');

      expect(updateFn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(100);

      expect(updateFn).toHaveBeenCalledTimes(1);
      const updates = updateFn.mock.calls[0][0];
      expect(updates.get('key1')).toBe('value1-updated');
      expect(updates.get('key2')).toBe('value2');
    });
  });
});