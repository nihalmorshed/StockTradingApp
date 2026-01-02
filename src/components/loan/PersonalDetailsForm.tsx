
import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import { useLoan } from '../../store';
import { formatPhoneNumber, getFieldError, hasFieldError } from '../../utils/loanValidation';
import { ValidationError } from '../../types/loan';
import { colors, spacing, fontSize } from '../../theme';


interface PersonalDetailsFormProps {
  errors: ValidationError[];
  showErrors: boolean;
}

export function PersonalDetailsForm({ errors, showErrors }: PersonalDetailsFormProps) {
  const { application, updatePersonalDetails } = useLoan();
  const { personalDetails } = application;

  const handlePhoneChange = useCallback((value: string) => {
    updatePersonalDetails({ phone: formatPhoneNumber(value) });
  }, [updatePersonalDetails]);

  const getError = useCallback((field: string) => {
    if (!showErrors) return undefined;
    return getFieldError(errors, field);
  }, [errors, showErrors]);

  const hasError = useCallback((field: string) => {
    if (!showErrors) return false;
    return hasFieldError(errors, field);
  }, [errors, showErrors]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Personal Details</Text>
      <Text style={styles.subtitle}>Please provide your personal information</Text>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <TextInput
            label="First Name"
            value={personalDetails.firstName}
            onChangeText={(text) => updatePersonalDetails({ firstName: text })}
            mode="outlined"
            error={hasError('firstName')}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
          />
          {hasError('firstName') && (
            <HelperText type="error" visible>{getError('firstName')}</HelperText>
          )}
        </View>

        <View style={styles.halfField}>
          <TextInput
            label="Last Name"
            value={personalDetails.lastName}
            onChangeText={(text) => updatePersonalDetails({ lastName: text })}
            mode="outlined"
            error={hasError('lastName')}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
          />
          {hasError('lastName') && (
            <HelperText type="error" visible>{getError('lastName')}</HelperText>
          )}
        </View>
      </View>

      <TextInput
        label="Email Address"
        value={personalDetails.email}
        onChangeText={(text) => updatePersonalDetails({ email: text })}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        error={hasError('email')}
        style={styles.input}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        textColor={colors.textPrimary}
      />
      {hasError('email') && (
        <HelperText type="error" visible>{getError('email')}</HelperText>
      )}

      <TextInput
        label="Phone Number"
        value={personalDetails.phone}
        onChangeText={handlePhoneChange}
        mode="outlined"
        keyboardType="phone-pad"
        error={hasError('phone')}
        style={styles.input}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        textColor={colors.textPrimary}
        placeholder="(555) 123-4567"
      />
      {hasError('phone') && (
        <HelperText type="error" visible>{getError('phone')}</HelperText>
      )}

      <TextInput
        label="Date of Birth"
        value={personalDetails.dateOfBirth}
        onChangeText={(text) => updatePersonalDetails({ dateOfBirth: text })}
        mode="outlined"
        error={hasError('dateOfBirth')}
        style={styles.input}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        textColor={colors.textPrimary}
        placeholder="YYYY-MM-DD"
      />
      {hasError('dateOfBirth') && (
        <HelperText type="error" visible>{getError('dateOfBirth')}</HelperText>
      )}

      <TextInput
        label="Street Address"
        value={personalDetails.address}
        onChangeText={(text) => updatePersonalDetails({ address: text })}
        mode="outlined"
        error={hasError('address')}
        style={styles.input}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        textColor={colors.textPrimary}
      />
      {hasError('address') && (
        <HelperText type="error" visible>{getError('address')}</HelperText>
      )}

      <View style={styles.row}>
        <View style={styles.cityField}>
          <TextInput
            label="City"
            value={personalDetails.city}
            onChangeText={(text) => updatePersonalDetails({ city: text })}
            mode="outlined"
            error={hasError('city')}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
          />
          {hasError('city') && (
            <HelperText type="error" visible>{getError('city')}</HelperText>
          )}
        </View>

        <View style={styles.stateField}>
          <TextInput
            label="State"
            value={personalDetails.state}
            onChangeText={(text) => updatePersonalDetails({ state: text.toUpperCase().slice(0, 2) })}
            mode="outlined"
            error={hasError('state')}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
            maxLength={2}
            autoCapitalize="characters"
          />
          {hasError('state') && (
            <HelperText type="error" visible>{getError('state')}</HelperText>
          )}
        </View>

        <View style={styles.zipField}>
          <TextInput
            label="ZIP Code"
            value={personalDetails.zipCode}
            onChangeText={(text) => updatePersonalDetails({ zipCode: text })}
            mode="outlined"
            keyboardType="numeric"
            error={hasError('zipCode')}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
            maxLength={10}
          />
          {hasError('zipCode') && (
            <HelperText type="error" visible>{getError('zipCode')}</HelperText>
          )}
        </View>
      </View>

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
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  cityField: {
    flex: 2,
  },
  stateField: {
    flex: 1,
  },
  zipField: {
    flex: 1.2,
  },
  spacer: {
    height: spacing.xl,
  },
});
