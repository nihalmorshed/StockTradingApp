//  WebSocket connection status

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface ConnectionStatusProps {
  isConnected: boolean;
}

function ConnectionStatusComponent({ isConnected }: ConnectionStatusProps) {
  const statusColor = isConnected ? colors.positive : colors.negative;
  const statusText = isConnected ? 'Live' : 'Disconnected';

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: statusColor }]} />
      <Text style={styles.text}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.full,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});

export const ConnectionStatus = memo(ConnectionStatusComponent);
