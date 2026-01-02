// loan terms form

import React, { useCallback, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, HelperText, RadioButton, SegmentedButtons } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useLoan } from '../../store';
import {
  formatCurrencyInput,
  parseCurrencyInput,
  getFieldError,
  hasFieldError,
} from '../../utils/loanValidation';
import {
  ValidationError,
  LoanPurpose,
  InterestRateType,
  LOAN_PURPOSE_LABELS,
  LOAN_LIMITS,
} from '../../types/loan';
import { colors, spacing, fontSize } from '../../theme';

interface LoanTermsFormProps {
  errors: ValidationError[];
  showErrors: boolean;
}

const TERM_OPTIONS = [
  { value: 12, label: '1 year' },
  { value: 24, label: '2 years' },
  { value: 36, label: '3 years' },
  { value: 48, label: '4 years' },
  { value: 60, label: '5 years' },
  { value: 84, label: '7 years' },
  { value: 120, label: '10 years' },
  { value: 180, label: '15 years' },
  { value: 240, label: '20 years' },
  { value: 360, label: '30 years' },
];

export function LoanTermsForm({ errors, showErrors }: LoanTermsFormProps) {
  const { application, updateLoanTerms } = useLoan();
  const { loanTerms } = application;

  const [amountInput, setAmountInput] = useState(
    loanTerms.loanAmount > 0 ? formatCurrencyInput(loanTerms.loanAmount.toString()) : ''
  );

  const getError = useCallback((field: string) => {
    if (!showErrors) return undefined;
    return getFieldError(errors, field);
  }, [errors, showErrors]);

  const hasError = useCallback((field: string) => {
    if (!showErrors) return false;
    return hasFieldError(errors, field);
  }, [errors, showErrors]);

  const handleAmountChange = useCallback((text: string) => {
    const formatted = formatCurrencyInput(text);
    setAmountInput(formatted);
    updateLoanTerms({ loanAmount: parseCurrencyInput(text) });
  }, [updateLoanTerms]);

  const handleSliderChange = useCallback((value: number) => {
    const roundedValue = Math.round(value / 1000) * 1000;
    setAmountInput(formatCurrencyInput(roundedValue.toString()));
    updateLoanTerms({ loanAmount: roundedValue });
  }, [updateLoanTerms]);

  const termLabel = useMemo(() => {
    const years = Math.floor(loanTerms.loanTerm / 12);
    const months = loanTerms.loanTerm % 12;
    if (years === 0) return `${months} months`;
    if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  }, [loanTerms.loanTerm]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Loan Terms</Text>
      <Text style={styles.subtitle}>Select your desired loan amount and terms</Text>

      <Text style={styles.sectionLabel}>Loan Amount</Text>
      <TextInput
        label="Amount"
        value={amountInput}
        onChangeText={handleAmountChange}
        mode="outlined"
        keyboardType="numeric"
        error={hasError('loanAmount')}
        style={styles.input}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        textColor={colors.textPrimary}
        left={<TextInput.Affix text="$" />}
      />
      {hasError('loanAmount') && (
        <HelperText type="error" visible>{getError('loanAmount')}</HelperText>
      )}

      <Slider
        style={styles.slider}
        minimumValue={LOAN_LIMITS.minAmount}
        maximumValue={LOAN_LIMITS.maxAmount}
        value={loanTerms.loanAmount}
        onValueChange={handleSliderChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        step={1000}
      />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>${LOAN_LIMITS.minAmount.toLocaleString()}</Text>
        <Text style={styles.sliderLabel}>${LOAN_LIMITS.maxAmount.toLocaleString()}</Text>
      </View>

      <Text style={styles.sectionLabel}>Loan Term: {termLabel}</Text>
      <Slider
        style={styles.slider}
        minimumValue={LOAN_LIMITS.minTerm}
        maximumValue={LOAN_LIMITS.maxTerm}
        value={loanTerms.loanTerm}
        onValueChange={(value) => {
          // select the nearest standard term
          const nearest = TERM_OPTIONS.reduce((prev, curr) =>
            Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
          );
          updateLoanTerms({ loanTerm: nearest.value });
        }}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        step={6}
      />
      <View style={styles.termButtons}>
        {TERM_OPTIONS.slice(0, 5).map((option) => (
          <View
            key={option.value}
            style={[
              styles.termButton,
              loanTerms.loanTerm === option.value && styles.termButtonActive,
            ]}
          >
            <Text
              style={[
                styles.termButtonText,
                loanTerms.loanTerm === option.value && styles.termButtonTextActive,
              ]}
              onPress={() => updateLoanTerms({ loanTerm: option.value })}
            >
              {option.label}
            </Text>
          </View>
        ))}
      </View>
      {hasError('loanTerm') && (
        <HelperText type="error" visible>{getError('loanTerm')}</HelperText>
      )}

      <Text style={styles.sectionLabel}>Loan Purpose</Text>
      <RadioButton.Group
        onValueChange={(value) => updateLoanTerms({ loanPurpose: value as LoanPurpose })}
        value={loanTerms.loanPurpose}
      >
        {Object.entries(LOAN_PURPOSE_LABELS).map(([value, label]) => (
          <RadioButton.Item
            key={value}
            label={label}
            value={value}
            style={styles.radioItem}
            labelStyle={styles.radioLabel}
            color={colors.primary}
            uncheckedColor={colors.textMuted}
          />
        ))}
      </RadioButton.Group>
      {hasError('loanPurpose') && (
        <HelperText type="error" visible>{getError('loanPurpose')}</HelperText>
      )}

      <Text style={styles.sectionLabel}>Interest Rate Type</Text>
      <SegmentedButtons
        value={loanTerms.interestRateType}
        onValueChange={(value) => updateLoanTerms({ interestRateType: value as InterestRateType })}
        buttons={[
          {
            value: 'fixed',
            label: 'Fixed Rate',
            icon: 'lock',
          },
          {
            value: 'variable',
            label: 'Variable Rate',
            icon: 'chart-line-variant',
          },
        ]}
        style={styles.segmentedButtons}
      />
      <Text style={styles.rateHint}>
        {loanTerms.interestRateType === 'fixed'
          ? 'Fixed rate stays the same throughout the loan term'
          : 'Variable rate may change based on market conditions'}
      </Text>
      {hasError('interestRateType') && (
        <HelperText type="error" visible>{getError('interestRateType')}</HelperText>
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
  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: spacing.sm,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  termButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  termButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  termButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  termButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  radioItem: {
    paddingVertical: spacing.xs,
  },
  radioLabel: {
    color: colors.textPrimary,
  },
  segmentedButtons: {
    marginTop: spacing.sm,
  },
  rateHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  spacer: {
    height: spacing.xl * 2,
  },
});
