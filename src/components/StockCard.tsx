
//  StockCard for showing individual stock information with mini chart


import React, { memo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Stock } from '../types';
import { StockMiniChart } from './StockMiniChart';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface StockCardProps {
  stock: Stock;
  onPress?: (stock: Stock) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatChange(change: number, changePercent: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
}

function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(2)}B`;
  }
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume.toString();
}

function StockCardComponent({ stock, onPress }: StockCardProps) {
  const isPositive = stock.changePercent >= 0;
  const changeColor = isPositive ? colors.positive : colors.negative;

  const handlePress = useCallback(() => {
    onPress?.(stock);
  }, [stock, onPress]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Surface style={styles.container} elevation={1}>
        <View style={styles.leftSection}>
          <View style={styles.symbolContainer}>
            <Text style={styles.symbol}>{stock.symbol}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {stock.name}
            </Text>
          </View>
        </View>

        <View style={styles.chartSection}>
          <StockMiniChart
            priceHistory={stock.priceHistory}
            isPositive={isPositive}
          />
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.price}>{formatPrice(stock.currentPrice)}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {formatChange(stock.change, stock.changePercent)}
          </Text>
          <Text style={styles.volume}>Vol: {formatVolume(stock.volume)}</Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  leftSection: {
    flex: 1,
    marginRight: spacing.sm,
  },
  symbolContainer: {
    flexDirection: 'column',
  },
  symbol: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  name: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    maxWidth: 120,
  },
  chartSection: {
    marginHorizontal: spacing.sm,
  },
  rightSection: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  change: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginTop: 2,
  },
  volume: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export const StockCard = memo(StockCardComponent);
