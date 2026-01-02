// financial informtion form

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, HelperText, RadioButton } from 'react-native-paper';
import { useLoan } from '../../store';
import {
  formatCurrencyInput,
  parseCurrencyInput,
  getFieldError,
  hasFieldError,
} from '../../utils/loanValidation';
import {
  ValidationError,
  EmploymentStatus,
  CreditScoreRange,
  BankAccountType,
  EMPLOYMENT_STATUS_LABELS,
  CREDIT_SCORE_LABELS,
  BANK_ACCOUNT_LABELS,
} from '../../types/loan';
import { colors, spacing, fontSize } from '../../theme';

interface FinancialInfoFormProps {
  errors: ValidationError[];
  showErrors: boolean;
}

export function FinancialInfoForm({ errors, showErrors }: FinancialInfoFormProps) {
  const { application, updateFinancialInfo } = useLoan();
  const { financialInfo } = application;

  // local state for formatted input value
  const [incomeInput, setIncomeInput] = useState(
    financialInfo.annualIncome > 0 ? formatCurrencyInput(financialInfo.annualIncome.toString()) : ''
  );
  const [expensesInput, setExpensesInput] = useState(
    financialInfo.monthlyExpenses > 0 ? formatCurrencyInput(financialInfo.monthlyExpenses.toString()) : ''
  );
  const [debtsInput, setDebtsInput] = useState(
    financialInfo.existingDebts > 0 ? formatCurrencyInput(financialInfo.existingDebts.toString()) : ''
  );

  const getError = useCallback((field: string) => {
    if (!showErrors) return undefined;
    return getFieldError(errors, field);
  }, [errors, showErrors]);

  const hasError = useCallback((field: string) => {
    if (!showErrors) return false;
    return hasFieldError(errors, field);
  }, [errors, showErrors]);

  const handleIncomeChange = useCallback((text: string) => {
    const formatted = formatCurrencyInput(text);
    setIncomeInput(formatted);
    updateFinancialInfo({ annualIncome: parseCurrencyInput(text) });
  }, [updateFinancialInfo]);

  const handleExpensesChange = useCallback((text: string) => {
    const formatted = formatCurrencyInput(text);
    setExpensesInput(formatted);
    updateFinancialInfo({ monthlyExpenses: parseCurrencyInput(text) });
  }, [updateFinancialInfo]);

  const handleDebtsChange = useCallback((text: string) => {
    const formatted = formatCurrencyInput(text);
    setDebtsInput(formatted);
    updateFinancialInfo({ existingDebts: parseCurrencyInput(text) });
  }, [updateFinancialInfo]);


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Financial Information</Text>
      <Text style={styles.subtitle}>Help us understand your financial situation</Text>

      <Text style={styles.sectionLabel}>Employment Status</Text>
      <RadioButton.Group
        onValueChange={(value) => updateFinancialInfo({ employmentStatus: value as EmploymentStatus })}
        value={financialInfo.employmentStatus}
      >
        {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([value, label]) => (
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
      {hasError('employmentStatus') && (
        <HelperText type="error" visible>{getError('employmentStatus')}</HelperText>
      )}

      <TextInput
        label="Annual Income (before taxes)"
        value={incomeInput}
        onChangeText={handleIncomeChange}
        mode="outlined"
        keyboardType="numeric"
        error={hasError('annualIncome')}
        style={styles.input}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        textColor={colors.textPrimary}
        left={<TextInput.Affix text="$" />}
      />
      {hasError('annualIncome') && (
        <HelperText type="error" visible>{getError('annualIncome')}</HelperText>
      )}

      <TextInput
        label="Monthly Expenses"
        value={expensesInput}
        onChangeText={handleExpensesChange}
        mode="outlined"
        keyboardType="numeric"
        error={hasError('monthlyExpenses')}
        style={styles.input}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        textColor={colors.textPrimary}
        left={<TextInput.Affix text="$" />}
      />
      {hasError('monthlyExpenses') && (
        <HelperText type="error" visible>{getError('monthlyExpenses')}</HelperText>
      )}

      {/* Credit Score Range */}
      <Text style={styles.sectionLabel}>Credit Score Range</Text>
      <RadioButton.Group
        onValueChange={(value) => updateFinancialInfo({ creditScore: value as CreditScoreRange })}
        value={financialInfo.creditScore}
      >
        {Object.entries(CREDIT_SCORE_LABELS).map(([value, label]) => (
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
      {hasError('creditScore') && (
        <HelperText type="error" visible>{getError('creditScore')}</HelperText>
      )}

      <TextInput
        label="Total Existing Debts (annual payments)"
        value={debtsInput}
        onChangeText={handleDebtsChange}
        mode="outlined"
        keyboardType="numeric"
        error={hasError('existingDebts')}
        style={styles.input}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        textColor={colors.textPrimary}
        left={<TextInput.Affix text="$" />}
      />
      {hasError('existingDebts') && (
        <HelperText type="error" visible>{getError('existingDebts')}</HelperText>
      )}

      {/* Bank Account Type */}
      <Text style={styles.sectionLabel}>Bank Account Type</Text>
      <RadioButton.Group
        onValueChange={(value) => updateFinancialInfo({ bankAccountType: value as BankAccountType })}
        value={financialInfo.bankAccountType}
      >
        {Object.entries(BANK_ACCOUNT_LABELS).map(([value, label]) => (
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
      {hasError('bankAccountType') && (
        <HelperText type="error" visible>{getError('bankAccountType')}</HelperText>
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
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  radioItem: {
    paddingVertical: spacing.xs,
  },
  radioLabel: {
    color: colors.textPrimary,
  },
  spacer: {
    height: spacing.xl * 2,
  },
});
