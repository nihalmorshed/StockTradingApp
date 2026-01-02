import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Icon, Divider, Button } from 'react-native-paper';
import { useLoan } from '../../store';
import { formatCurrency, formatPercentage } from '../../utils/loanCalculations';
import {
  EMPLOYMENT_STATUS_LABELS,
  CREDIT_SCORE_LABELS,
  BANK_ACCOUNT_LABELS,
  LOAN_PURPOSE_LABELS,
} from '../../types/loan';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

interface ReviewSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  onEdit?: () => void;
}

function ReviewSection({ title, icon, children, onEdit }: ReviewSectionProps) {
  return (
    <Surface style={styles.section} elevation={1}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Icon source={icon} size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {onEdit && (
          <Button
            mode="text"
            compact
            onPress={onEdit}
            textColor={colors.primary}
          >
            Edit
          </Button>
        )}
      </View>
      <Divider style={styles.divider} />
      {children}
    </Surface>
  );
}

interface ReviewRowProps {
  label: string;
  value: string;
}

function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

interface ReviewAndSubmitProps {
  onEdit: (step: number) => void;
  onSubmit: () => void;
}

export function ReviewAndSubmit({ onEdit, onSubmit }: ReviewAndSubmitProps) {
  const { application } = useLoan();
  const { personalDetails, financialInfo, loanTerms, calculations } = application;

  const termLabel = (() => {
    const years = Math.floor(loanTerms.loanTerm / 12);
    const months = loanTerms.loanTerm % 12;
    if (years === 0) return `${months} months`;
    if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  })();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Review & Submit</Text>
      <Text style={styles.subtitle}>Please review your application before submitting</Text>

      {/* Personal Details */}
      <ReviewSection
        title="Personal Details"
        icon="account"
        onEdit={() => onEdit(1)}
      >
        <ReviewRow label="Full Name" value={`${personalDetails.firstName} ${personalDetails.lastName}`} />
        <ReviewRow label="Email" value={personalDetails.email} />
        <ReviewRow label="Phone" value={personalDetails.phone} />
        <ReviewRow label="Date of Birth" value={personalDetails.dateOfBirth} />
        <ReviewRow
          label="Address"
          value={`${personalDetails.address}, ${personalDetails.city}, ${personalDetails.state} ${personalDetails.zipCode}`}
        />
      </ReviewSection>

      <ReviewSection
        title="Financial Information"
        icon="cash"
        onEdit={() => onEdit(2)}
      >
        <ReviewRow label="Employment" value={EMPLOYMENT_STATUS_LABELS[financialInfo.employmentStatus]} />
        <ReviewRow label="Annual Income" value={formatCurrency(financialInfo.annualIncome)} />
        <ReviewRow label="Monthly Expenses" value={formatCurrency(financialInfo.monthlyExpenses)} />
        <ReviewRow label="Credit Score" value={CREDIT_SCORE_LABELS[financialInfo.creditScore]} />
        <ReviewRow label="Existing Debts" value={formatCurrency(financialInfo.existingDebts)} />
        <ReviewRow label="Bank Account" value={BANK_ACCOUNT_LABELS[financialInfo.bankAccountType]} />
      </ReviewSection>

      {/* Loan Terms */}
      <ReviewSection
        title="Loan Terms"
        icon="file-document"
        onEdit={() => onEdit(3)}
      >
        <ReviewRow label="Loan Amount" value={formatCurrency(loanTerms.loanAmount)} />
        <ReviewRow label="Loan Term" value={termLabel} />
        <ReviewRow label="Purpose" value={LOAN_PURPOSE_LABELS[loanTerms.loanPurpose]} />
        <ReviewRow label="Rate Type" value={loanTerms.interestRateType === 'fixed' ? 'Fixed' : 'Variable'} />
      </ReviewSection>

      {calculations && (
        <ReviewSection
          title="Loan Summary"
          icon="calculator"
          onEdit={() => onEdit(4)}
        >
          <ReviewRow label="Interest Rate" value={formatPercentage(calculations.effectiveInterestRate)} />
          <ReviewRow label="Monthly Payment" value={formatCurrency(calculations.monthlyPayment)} />
          <ReviewRow label="Total Interest" value={formatCurrency(calculations.totalInterest)} />
          <ReviewRow label="Total Payment" value={formatCurrency(calculations.totalPayment)} />
          <ReviewRow
            label="Debt-to-Income"
            value={`${(calculations.debtToIncomeRatio * 100).toFixed(1)}%`}
          />
        </ReviewSection>
      )}

      {calculations && (
        <Surface
          style={[
            styles.eligibilityBanner,
            {
              backgroundColor: calculations.isEligible
                ? colors.positive + '15'
                : colors.negative + '15',
            },
          ]}
          elevation={0}
        >
          <Icon
            source={calculations.isEligible ? 'check-decagram' : 'alert-decagram'}
            size={28}
            color={calculations.isEligible ? colors.positive : colors.negative}
          />
          <View style={styles.eligibilityContent}>
            <Text
              style={[
                styles.eligibilityTitle,
                { color: calculations.isEligible ? colors.positive : colors.negative },
              ]}
            >
              {calculations.isEligible ? 'Pre-Approved' : 'Not Pre-Approved'}
            </Text>
            <Text style={styles.eligibilitySubtitle}>
              {calculations.isEligible
                ? 'Your application meets our initial criteria'
                : 'Please review the eligibility requirements'}
            </Text>
          </View>
        </Surface>
      )}

      <Surface style={styles.termsCard} elevation={0}>
        <Icon source="information" size={20} color={colors.info} />
        <Text style={styles.termsText}>
          By submitting this application, you agree to our terms and conditions. Your information will be securely processed. This is a pre-approval and final approval is subject to verification.
        </Text>
      </Surface>

      <Button
        mode="contained"
        onPress={onSubmit}
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
        labelStyle={styles.submitButtonLabel}
        icon="send"
        disabled={!calculations?.isEligible}
      >
        Submit Application
      </Button>

      {!calculations?.isEligible && (
        <Text style={styles.disabledHint}>
          You must be pre-approved to submit the application
        </Text>
      )}

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
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  rowValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  eligibilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  eligibilityContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  eligibilityTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  eligibilitySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  termsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  termsText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  submitButton: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  submitButtonContent: {
    height: 56,
  },
  submitButtonLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  disabledHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  spacer: {
    height: spacing.xl * 2,
  },
});
