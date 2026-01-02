//  binary Search O(log n) algorithm for Stock Lookup

import { Stock } from '../types';

/**
 * Binary search to find a stock by symbol in a sorted array
 * @param stocks - Array of stocks sorted by symbol
 * @param symbol - Symbol to search for
 * @returns The stock if found, undefined otherwise
 */
export function binarySearchBySymbol(stocks: Stock[], symbol: string): Stock | undefined {
  let left = 0;
  let right = stocks.length - 1;
  const targetSymbol = symbol.toUpperCase();

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midSymbol = stocks[mid].symbol.toUpperCase();

    if (midSymbol === targetSymbol) {
      return stocks[mid];
    } else if (midSymbol < targetSymbol) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return undefined;
}

/**
 * Binary search to find stocks by name prefix
 * Returns all stocks whose name starts with the given prefix
 * @param stocks - Array of stocks sorted by name
 * @param prefix - Name prefix to search for
 * @returns Array of matching stocks
 */
export function binarySearchByNamePrefix(stocks: Stock[], prefix: string): Stock[] {
  if (!prefix || stocks.length === 0) {
    return stocks;
  }

  const normalizedPrefix = prefix.toLowerCase();

  // finds the first stock that starts with the prefix
  let left = 0;
  let right = stocks.length - 1;
  let firstMatch = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midName = stocks[mid].name.toLowerCase();

    if (midName.startsWith(normalizedPrefix)) {
      firstMatch = mid;
      right = mid - 1; // continue searching left for the first match
    } else if (midName < normalizedPrefix) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  if (firstMatch === -1) {
    return [];
  }

  // collect all matches starting from firstMatch
  const results: Stock[] = [];
  for (let i = firstMatch; i < stocks.length; i++) {
    if (stocks[i].name.toLowerCase().startsWith(normalizedPrefix)) {
      results.push(stocks[i]);
    } else {
      break;
    }
  }

  return results;
}

/**
 * Find insertion point for maintaining sorted order
 * @param stocks - Sorted array of stocks
 * @param stock - Stock to insert
 * @param sortBy - Field to sort by
 * @returns Index where the stock should be inserted
 */
export function findInsertionPoint(
  stocks: Stock[],
  stock: Stock,
  sortBy: 'symbol' | 'name' | 'price' = 'symbol'
): number {
  let left = 0;
  let right = stocks.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    let comparison: number;

    switch (sortBy) {
      case 'symbol':
        comparison = stock.symbol.localeCompare(stocks[mid].symbol);
        break;
      case 'name':
        comparison = stock.name.localeCompare(stocks[mid].name);
        break;
      case 'price':
        comparison = stock.currentPrice - stocks[mid].currentPrice;
        break;
      default:
        comparison = stock.symbol.localeCompare(stocks[mid].symbol);
    }

    if (comparison < 0) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return left;
}


export function searchStocks(stocks: Stock[], query: string): Stock[] {
  if (!query || query.trim() === '') {
    return stocks;
  }

  const normalizedQuery = query.toLowerCase().trim();

  // sort stocks by name for binary search
  const sortedByName = [...stocks].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
  // try prefix match using binary search
  const prefixMatches = binarySearchByNamePrefix(sortedByName, normalizedQuery);

  // also search by symbol (exact and prefix)
  const symbolMatches = stocks.filter(stock =>
    stock.symbol.toLowerCase().startsWith(normalizedQuery)
  );

  // Combine results, removing duplicates
  const seen = new Set<string>();
  const results: Stock[] = [];

  // add symbol matches first (higher priority)
  for (const stock of symbolMatches) {
    if (!seen.has(stock.symbol)) {
      seen.add(stock.symbol);
      results.push(stock);
    }
  }

  // add name matches
  for (const stock of prefixMatches) {
    if (!seen.has(stock.symbol)) {
      seen.add(stock.symbol);
      results.push(stock);
    }
  }

  // if no prefix matches, try contains match
  if (results.length === 0) {
    return stocks.filter(stock =>
      stock.name.toLowerCase().includes(normalizedQuery) ||
      stock.symbol.toLowerCase().includes(normalizedQuery)
    );
  }

  return results;
}
