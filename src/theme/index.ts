// dark theme for trading dashboard

import { MD3DarkTheme } from 'react-native-paper';

// Color scheme
export const colors = {

  background: '#0d1117',
  surface: '#161b22',
  surfaceVariant: '#21262d',
  card: '#1c2128',

  primary: '#58a6ff',
  primaryContainer: '#1f6feb',

  // status colors
  positive: '#3fb950',
  negative: '#f85149',
  neutral: '#8b949e',

  textPrimary: '#f0f6fc',
  textSecondary: '#8b949e',
  textMuted: '#484f58',

  border: '#30363d',
  borderLight: '#21262d',

  chartLine: '#58a6ff',
  chartGradientStart: 'rgba(88, 166, 255, 0.3)',
  chartGradientEnd: 'rgba(88, 166, 255, 0)',
  chartGrid: '#21262d',

  // accent colors
  accent: '#a371f7',
  warning: '#d29922',
  info: '#539bf5',
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryContainer,
    secondary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    error: colors.negative,
    onPrimary: colors.textPrimary,
    onSecondary: colors.textPrimary,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surfaceVariant,
      level3: colors.card,
      level4: colors.card,
      level5: colors.card,
    },
  },
};

// chart configuration for react-native-chart-kit
export const chartConfig = {
  backgroundColor: colors.surface,
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(88, 166, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '3',
    strokeWidth: '1',
    stroke: colors.primary,
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: colors.chartGrid,
    strokeWidth: 1,
  },
};

export const chartConfigPositive = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(63, 185, 80, ${opacity})`,
  propsForDots: {
    ...chartConfig.propsForDots,
    stroke: colors.positive,
  },
};

export const chartConfigNegative = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(248, 81, 73, ${opacity})`,
  propsForDots: {
    ...chartConfig.propsForDots,
    stroke: colors.negative,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
};
