//  StockMiniChart shows a chart for stock price history
 

import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { StockDataPoint } from '../types';
import { colors } from '../theme';

interface StockMiniChartProps {
  priceHistory: StockDataPoint[];
  isPositive: boolean;
  width?: number;
  height?: number;
}

const CHART_WIDTH = 80;
const CHART_HEIGHT = 40;

function StockMiniChartComponent({
  priceHistory,
  isPositive,
  width = CHART_WIDTH,
  height = CHART_HEIGHT,
}: StockMiniChartProps) {
  
  const chartData = useMemo(() => {
    const prices = priceHistory.slice(-20).map(p => p.price);

    // need at least 2 points for a chart
    if (prices.length < 2) {
      return { labels: [], datasets: [{ data: [0, 0] }] };
    }

    return {
      labels: [],
      datasets: [{ data: prices }],
    };
  }, [priceHistory]);

  const chartColor = isPositive ? colors.positive : colors.negative;

  if (priceHistory.length < 2) {
    return <View style={[styles.placeholder, { width, height }]} />;
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={width}
        height={height}
        chartConfig={{
          backgroundColor: 'transparent',
          backgroundGradientFrom: 'transparent',
          backgroundGradientTo: 'transparent',
          decimalPlaces: 0,
          color: () => chartColor,
          labelColor: () => 'transparent',
          propsForDots: { r: '0' },
          propsForBackgroundLines: { stroke: 'transparent' },
          strokeWidth: 1.5,
        }}
        bezier
        withDots={false}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={false}
        withVerticalLabels={false}
        withHorizontalLabels={false}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  chart: {
    paddingRight: 0,
    marginRight: -16,
  },
  placeholder: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
  },
});

export const StockMiniChart = memo(StockMiniChartComponent);
