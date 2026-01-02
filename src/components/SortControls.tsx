
//  SortControls for sorting stocks by different fields
 

import React, { memo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { SortField, SortDirection } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface SortControlsProps {
  currentField: SortField;
  currentDirection: SortDirection;
  onSortFieldChange: (field: SortField) => void;
  onDirectionToggle: () => void;
}

interface SortOption {
  field: SortField;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { field: 'marketCap', label: 'Market Cap' },
  { field: 'price', label: 'Price' },
  { field: 'changePercent', label: 'Change %' },
  { field: 'volume', label: 'Volume' },
  { field: 'name', label: 'Name' },
];

function SortControlsComponent({
  currentField,
  currentDirection,
  onSortFieldChange,
  onDirectionToggle,
}: SortControlsProps) {
  const renderSortOption = useCallback(
    (option: SortOption) => {
      const isActive = currentField === option.field;

      return (
        <TouchableOpacity
          key={option.field}
          style={[styles.sortButton, isActive && styles.sortButtonActive]}
          onPress={() => onSortFieldChange(option.field)}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.sortButtonText, isActive && styles.sortButtonTextActive]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    },
    [currentField, onSortFieldChange]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Sort by:</Text>
        <TouchableOpacity
          style={styles.directionButton}
          onPress={onDirectionToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.directionText}>
            {currentDirection === 'desc' ? 'High to Low' : 'Low to High'}
          </Text>
          <IconButton
            icon={currentDirection === 'desc' ? 'arrow-down' : 'arrow-up'}
            size={16}
            iconColor={colors.primary}
            style={styles.directionIcon}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SORT_OPTIONS.map(renderSortOption)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  directionText: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  directionIcon: {
    margin: 0,
    marginLeft: -4,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sortButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export const SortControls = memo(SortControlsComponent);
