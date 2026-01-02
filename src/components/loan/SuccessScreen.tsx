// loan application submission success screen

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Icon, Surface } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useLoan } from '../../store';
import { formatCurrency } from '../../utils/loanCalculations';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

interface SuccessScreenProps {
  onStartNew: () => void;
  onGoHome: () => void;
}

export function SuccessScreen({ onStartNew, onGoHome }: SuccessScreenProps) {
  const { application } = useLoan();
  const { loanTerms, calculations, submittedAt } = application;

  const iconScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    contentOpacity.value = withDelay(300, withSpring(1));
    buttonOpacity.value = withDelay(600, withSpring(1));
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const submissionDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const referenceNumber = submittedAt
    ? `LN-${submittedAt.toString().slice(-8).toUpperCase()}`
    : '';

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
        <View style={styles.iconBackground}>
          <Icon source="check-circle" size={80} color={colors.positive} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <Text style={styles.title}>Application Submitted!</Text>
        <Text style={styles.subtitle}>
          Your loan application has been successfully submitted for review.
        </Text>

        <Surface style={styles.summaryCard} elevation={1}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Reference Number</Text>
            <Text style={styles.referenceNumber}>{referenceNumber}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Loan Amount</Text>
            <Text style={styles.summaryValue}>{formatCurrency(loanTerms.loanAmount)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monthly Payment</Text>
            <Text style={styles.summaryValue}>
              {calculations ? formatCurrency(calculations.monthlyPayment) : '-'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Submitted</Text>
            <Text style={styles.summaryValue}>{submissionDate}</Text>
          </View>
        </Surface>

        <Surface style={styles.infoCard} elevation={0}>
          <Icon source="information" size={24} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <Text style={styles.infoText}>
              You'll receive an email notification with the final decision after our team review ur application.
            </Text>
          </View>
        </Surface>
      </Animated.View>

      <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
        <Button
          mode="contained"
          onPress={onGoHome}
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="home"
        >
          Go to Home
        </Button>

        <Button
          mode="outlined"
          onPress={onStartNew}
          style={styles.secondaryButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.secondaryButtonLabel}
          icon="plus"
        >
          New Application
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.positive + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  summaryCard: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  referenceNumber: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  infoCard: {
    width: '100%',
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.info + '15',
    gap: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.md,
    color: colors.info,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  primaryButton: {
    borderRadius: borderRadius.md,
  },
  secondaryButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.border,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  secondaryButtonLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
