import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Stock } from '../src/types';
import { useStocks } from '../src/store';
import {
  StockList,
  SearchBar,
  SortControls,
  ConnectionStatus,
} from '../src/components';
import { colors, spacing } from '../src/theme';

export default function StockFeedScreen() {
  const router = useRouter();
  const {
    filteredStocks,
    sortConfig,
    isConnected,
    setSearchQuery,
    setSortField,
    toggleSortDirection,
  } = useStocks();

  const handleStockPress = useCallback(
    (stock: Stock) => {
      router.push(`/stock/${stock.symbol}`);
    },
    [router]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <ConnectionStatus isConnected={isConnected} />
        </View>
        <SearchBar onSearch={setSearchQuery} />
        <SortControls
          currentField={sortConfig.field}
          currentDirection={sortConfig.direction}
          onSortFieldChange={setSortField}
          onDirectionToggle={toggleSortDirection}
        />
      </View>
    ),
    [isConnected, sortConfig, setSearchQuery, setSortField, toggleSortDirection]
  );

  return (
    <View style={styles.container}>
      <StockList
        stocks={filteredStocks}
        onStockPress={handleStockPress}
        ListHeaderComponent={ListHeaderComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
});
