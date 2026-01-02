// Shows stock information with full-size chart

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useLocalSearchParams, Stack } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { useStocks } from '../../src/store';
import { ConnectionStatus } from '../../src/components';
import { colors, spacing, borderRadius, fontSize, chartConfigPositive, chartConfigNegative } from '../../src/theme';

const screenWidth = Dimensions.get('window').width;

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toLocaleString()}`;
}

function formatVolume(volume: number): string {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
  return volume.toString();
}

interface StatItemProps {
  label: string;
  value: string;
  valueColor?: string;
}

function StatItem({ label, value, valueColor }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const { getStock, getPriceHistory, isConnected } = useStocks();

  const stock = getStock(symbol || '');
  const priceHistory = getPriceHistory(symbol || '');

  const chartData = useMemo(() => {
    const prices = priceHistory.slice(-50).map(p => p.price);

    if (prices.length < 2) {
      return { labels: [], datasets: [{ data: [0, 0] }] };
    }

    // produce time labels
    const labelCount = 5;
    const step = Math.max(1, Math.floor(prices.length / labelCount));
    const labels: string[] = [];
    const recentHistory = priceHistory.slice(-50);

    for (let i = 0; i < recentHistory.length; i += step) {
      const date = new Date(recentHistory[i].timestamp);
      labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }

    return {
      labels,
      datasets: [{ data: prices }],
    };
  }, [priceHistory]);

  if (!stock) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: symbol || 'Stock' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Stock not found</Text>
        </View>
      </View>
    );
  }

  const isPositive = stock.changePercent >= 0;
  const changeColor = isPositive ? colors.positive : colors.negative;
  const selectedChartConfig = isPositive ? chartConfigPositive : chartConfigNegative;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: stock.symbol }} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.symbol}>{stock.symbol}</Text>
            <Text style={styles.name}>{stock.name}</Text>
          </View>
          <ConnectionStatus isConnected={isConnected} />
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(stock.currentPrice)}</Text>
          <View style={styles.changeContainer}>
            <Text style={[styles.change, { color: changeColor }]}>
              {isPositive ? '+' : ''}{stock.change.toFixed(2)}
            </Text>
            <Text style={[styles.changePercent, { color: changeColor }]}>
              ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>

      <Surface style={styles.chartContainer} elevation={1}>
        <Text style={styles.chartTitle}>Price History (Last 50 updates)</Text>
        {priceHistory.length >= 2 ? (
          <LineChart
            data={chartData}
            width={screenWidth - spacing.md * 4}
            height={220}
            chartConfig={selectedChartConfig}
            bezier
            style={styles.chart}
            withDots={false}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            fromZero={false}
          />
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>
              Waiting for price data...
            </Text>
          </View>
        )}
      </Surface>

      <Surface style={styles.statsContainer} elevation={1}>
        <Text style={styles.statsTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <StatItem label="Market Cap" value={formatMarketCap(stock.marketCap)} />
          <StatItem label="Volume" value={formatVolume(stock.volume)} />
          <StatItem label="24h High" value={formatPrice(stock.high24h)} valueColor={colors.positive} />
          <StatItem label="24h Low" value={formatPrice(stock.low24h)} valueColor={colors.negative} />
          <StatItem label="Open" value={formatPrice(stock.previousPrice)} />
          <StatItem
            label="Change"
            value={`${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%`}
            valueColor={changeColor}
          />
        </View>
      </Surface>

      <Surface style={styles.infoContainer} elevation={1}>
        <Text style={styles.infoTitle}>Real-time Data</Text>
        <Text style={styles.infoText}>
          Displaying {priceHistory.length} of 100 data points
        </Text>
        <Text style={styles.infoSubtext}>
          Data is updated in real-time via WebSocket connection
        </Text>
      </Surface>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  symbol: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  name: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  priceContainer: {
    marginTop: spacing.lg,
  },
  price: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  change: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  changePercent: {
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  chartContainer: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  chartTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.md,
    marginLeft: -spacing.md,
  },
  chartPlaceholder: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  statsContainer: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  statsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    paddingVertical: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoContainer: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  infoSubtext: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  footer: {
    height: spacing.xl,
  },
});
