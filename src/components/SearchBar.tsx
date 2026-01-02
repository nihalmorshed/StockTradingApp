
  // SearchBar for filtering stocks
 

import React, { memo, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { debounce } from '../utils/throttle';
import { colors, spacing, borderRadius } from '../theme';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

function SearchBarComponent({ onSearch, placeholder = 'Search stocks...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  // debounce search to stop excesive filtering
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      onSearch(text);
    }, 300),
    [onSearch]
  );

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={handleChangeText}
        value={query}
        style={styles.searchbar}
        inputStyle={styles.input}
        iconColor={colors.textSecondary}
        placeholderTextColor={colors.textMuted}
        onClearIconPress={handleClear}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchbar: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
    elevation: 0,
  },
  input: {
    color: colors.textPrimary,
  },
});

export const SearchBar = memo(SearchBarComponent);
