
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Icon, Divider, ProgressBar } from 'react-native-paper';
import { useLoan } from '../../store';
import { formatCurrency, formatPercentage } from '../../utils/loanCalculations';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

interface CalculationCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color?: string;
}

function CalculationCard({ title, value, subtitle, icon, color = colors.primary }: CalculationCardProps) {
  return (
    <Surface style={styles.card} elevation={1}>
      <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
        <Icon source={icon} size={24} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      </View>
    </Surface>
  );
}

interface EligibilityItemProps {
  message: string;
  isPositive: boolean;
}

function EligibilityItem({ message, isPositive }: EligibilityItemProps) {
  return (
    <View style={styles.eligibilityItem}>
      <Icon
        source={isPositive ? 'check-circle' : 'alert-circle'}
        size={20}
        color={isPositive ? colors.positive : colors.negative}
      />
      <Text style={styles.eligibilityText}>{message}</Text>
    </View>
  );
}

export function LoanCalculationsDisplay() {
  const { application, recalculateLoan } = useLoan();
  const { calculations, loanTerms } = application;

  useEffect(() => {
    recalculateLoan();
  }, [recalculateLoan]);

  const termLabel = useMemo(() => {
    const years = Math.floor(loanTerms.loanTerm / 12);
    const months = loanTerms.loanTerm % 12;
    if (years === 0) return `${months} months`;
    if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  }, [loanTerms.loanTerm]);

  if (!calculations) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Calculating loan details...</Text>
      </View>
    );
  }

  const dtiProgress = Math.min(calculations.debtToIncomeRatio, 1);
  const dtiColor = calculations.debtToIncomeRatio <= 0.36
    ? colors.positive
    : calculations.debtToIncomeRatio <= 0.43
    ? colors.warning
    : colors.negative;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Loan Calculations</Text>
      <Text style={styles.subtitle}>Review your estimated loan details</Text>

      <Surface
        style={[
          styles.eligibilityBanner,
          { backgroundColor: calculations.isEligible ? colors.positive + '15' : colors.negative + '15' },
        ]}
        elevation={0}
      >
        <Icon
          source={calculations.isEligible ? 'check-decagram' : 'alert-decagram'}
          size={32}
          color={calculations.isEligible ? colors.positive : colors.negative}
        />
        <View style={styles.eligibilityBannerContent}>
          <Text
            style={[
              styles.eligibilityBannerTitle,
              { color: calculations.isEligible ? colors.positive : colors.negative },
            ]}
          >
            {calculations.isEligible ? 'You Qualify!' : 'Not Eligible'}
          </Text>
          <Text style={styles.eligibilityBannerSubtitle}>
            {calculations.isEligible
              ? 'Based on your financial profile'
              : 'Review the reasons below'}
          </Text>
        </View>
      </Surface>

      <View style={styles.cardsGrid}>
        <CalculationCard
          title="Monthly Payment"
          value={formatCurrency(calculations.monthlyPayment)}
          subtitle={`for ${termLabel}`}
          icon="calendar-month"
          color={colors.primary}
        />
        <CalculationCard
          title="Interest Rate"
          value={formatPercentage(calculations.effectiveInterestRate)}
          subtitle={loanTerms.interestRateType === 'fixed' ? 'Fixed APR' : 'Variable APR'}
          icon="percent"
          color={colors.info}
        />
        <CalculationCard
          title="Total Interest"
          value={formatCurrency(calculations.totalInterest)}
          subtitle="Over loan term"
          icon="cash-multiple"
          color={colors.warning}
        />
        <CalculationCard
          title="Total Payment"
          value={formatCurrency(calculations.totalPayment)}
          subtitle="Principal + Interest"
          icon="bank"
          color={colors.positive}
        />
      </View>

      <Surface style={styles.summaryCard} elevation={1}>
        <Text style={styles.sectionTitle}>Loan Summary</Text>
        <Divider style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Loan Amount</Text>
          <Text style={styles.summaryValue}>{formatCurrency(loanTerms.loanAmount)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Loan Term</Text>
          <Text style={styles.summaryValue}>{termLabel}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Interest Rate</Text>
          <Text style={styles.summaryValue}>{formatPercentage(calculations.effectiveInterestRate)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Rate Type</Text>
          <Text style={styles.summaryValue}>
            {loanTerms.interestRateType === 'fixed' ? 'Fixed' : 'Variable'}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelBold}>Monthly Payment</Text>
          <Text style={styles.summaryValueBold}>{formatCurrency(calculations.monthlyPayment)}</Text>
        </View>
      </Surface>

      <Surface style={styles.dtiCard} elevation={1}>
        <Text style={styles.sectionTitle}>Debt-to-Income Ratio</Text>
        <View style={styles.dtiHeader}>
          <Text style={[styles.dtiValue, { color: dtiColor }]}>
            {(calculations.debtToIncomeRatio * 100).toFixed(1)}%
          </Text>
          <Text style={styles.dtiLimit}>
            Max: 43%
          </Text>
        </View>
        <ProgressBar
          progress={dtiProgress}
          color={dtiColor}
          style={styles.dtiProgress}
        />
        <Text style={styles.dtiDescription}>
          {calculations.debtToIncomeRatio <= 0.36
            ? 'Your DTI is in a healthy range'
            : calculations.debtToIncomeRatio <= 0.43
            ? 'Your DTI is acceptable but near the limit'
            : 'Your DTI exceeds the recommended maximum'}
        </Text>
      </Surface>

      <Surface style={styles.eligibilityCard} elevation={1}>
        <Text style={styles.sectionTitle}>
          {calculations.isEligible ? 'Eligibility Factors' : 'Ineligibility Reasons'}
        </Text>
        {calculations.eligibilityReasons.map((reason, index) => (
          <EligibilityItem
            key={index}
            message={reason}
            isPositive={calculations.isEligible || reason.includes('qualif') || reason.includes('healthy') || reason.includes('strength')}
          />
        ))}
      </Surface>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  loading: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  eligibilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  eligibilityBannerContent: {
    marginLeft: spacing.md,
  },
  eligibilityBannerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  eligibilityBannerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    width: '48%',
    flexGrow: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  summaryCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  summaryLabelBold: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  summaryValueBold: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: '700',
  },
  dtiCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  dtiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  dtiValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  dtiLimit: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  dtiProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  dtiDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  eligibilityCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  eligibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  eligibilityText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  spacer: {
    height: spacing.xl * 2,
  },
});
