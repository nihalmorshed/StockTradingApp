// sliding Window Data Structure
 
import { StockDataPoint } from '../types';

export class SlidingWindow<T> {
  private data: T[] = [];
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

    // add a new item to the window; drops oldest item if window is full
  push(item: T): void {
    this.data.push(item);
    if (this.data.length > this.maxSize) {
      this.data.shift();
    }
  }

  
    // add multiple items to the window
   
  pushMany(items: T[]): void {
    items.forEach(item => this.push(item));
  }

  
  //  get all items in the window
   
  getAll(): T[] {
    return [...this.data];
  }

  
  //  get the most recent n items
  getRecent(n: number): T[] {
    return this.data.slice(-n);
  }

  getLatest(): T | undefined {
    return this.data[this.data.length - 1];
  }

  //  get current size
  size(): number {
    return this.data.length;
  }

  
  clear(): void {
    this.data = [];
  }

  isFull(): boolean {
    return this.data.length >= this.maxSize;
  }
}


//   sliding window for stock price history including helper methods for chart data extraction
export class StockPriceWindow extends SlidingWindow<StockDataPoint> {
  constructor(maxSize: number = 100) {
    super(maxSize);
  }

  
  getPrices(): number[] {
    return this.getAll().map(point => point.price);
  }

  getTimestamps(): number[] {
    return this.getAll().map(point => point.timestamp);
  }

  getLabels(count: number = 5): string[] {
    const all = this.getAll();
    if (all.length === 0) return [];

    const step = Math.max(1, Math.floor(all.length / count));
    const labels: string[] = [];

    for (let i = 0; i < all.length; i += step) {
      const date = new Date(all[i].timestamp);
      labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }

    return labels;
  }

  getPriceChange(): { change: number; changePercent: number } {
    const all = this.getAll();
    if (all.length < 2) {
      return { change: 0, changePercent: 0 };
    }

    const oldest = all[0].price;
    const newest = all[all.length - 1].price;
    const change = newest - oldest;
    const changePercent = (change / oldest) * 100;

    return { change, changePercent };
  }

  getPriceRange(): { min: number; max: number } {
    const prices = this.getPrices();
    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }
}
