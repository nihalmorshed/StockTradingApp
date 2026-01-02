
//  StockList -> list of stocks using FlatList

import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View, ListRenderItem, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { Stock } from '../types';
import { StockCard } from './StockCard';
import { colors, spacing } from '../theme';

interface StockListProps {
  stocks: Stock[];
  onStockPress?: (stock: Stock) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  ListHeaderComponent?: React.ReactElement;
}

function StockListComponent({
  stocks,
  onStockPress,
  onRefresh,
  isRefreshing = false,
  ListHeaderComponent,
}: StockListProps) {
  const keyExtractor = useCallback((item: Stock) => item.symbol, []);

  const renderItem: ListRenderItem<Stock> = useCallback(
    ({ item }) => <StockCard stock={item} onPress={onStockPress} />,
    [onStockPress]
  );

  const ItemSeparator = useMemo(
    () => () => <View style={styles.separator} />,
    []
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No stocks found</Text>
        <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
      </View>
    ),
    []
  );

  const ListFooterComponent = useMemo(
    () => <View style={styles.footer} />,
    []
  );

  // optimized "getItemLayout" for fixed height items
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 88, // height of StockCard
      offset: 88 * index,
      index,
    }),
    []
  );

  return (
    <FlatList
      data={stocks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      getItemLayout={getItemLayout}
      style={styles.list}
      contentContainerStyle={stocks.length === 0 ? styles.emptyContent : undefined}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  separator: {
    height: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyContent: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  footer: {
    height: spacing.xl,
  },
});

export const StockList = memo(StockListComponent);
