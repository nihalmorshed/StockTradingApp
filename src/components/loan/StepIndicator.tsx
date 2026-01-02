import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { colors, spacing, fontSize } from '../../theme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepPress?: (step: number) => void;
  completedSteps?: number[];
}

export function StepIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  onStepPress,
  completedSteps = [],
}: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = completedSteps.includes(step) || step < currentStep;
        const isClickable = onStepPress && (isCompleted || step === currentStep);

        return (
          <React.Fragment key={step}>
            <Pressable
              onPress={() => isClickable && onStepPress?.(step)}
              style={[
                styles.stepContainer,
                isClickable && styles.stepClickable,
              ]}
            >
              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isCompleted && styles.stepCircleCompleted,
                ]}
              >
                {isCompleted && !isActive ? (
                  <Icon source="check" size={14} color={colors.textPrimary} />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      (isActive || isCompleted) && styles.stepNumberActive,
                    ]}
                  >
                    {step}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                ]}
                numberOfLines={1}
              >
                {stepLabels[index]}
              </Text>
            </Pressable>

            {step < totalSteps && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  stepContainer: {
    alignItems: 'center',
    minWidth: 50,
  },
  stepClickable: {
    opacity: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: colors.positive,
    borderColor: colors.positive,
  },
  stepNumber: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  stepNumberActive: {
    color: colors.textPrimary,
  },
  stepLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    maxWidth: 60,
  },
  stepLabelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.lg,
  },
  connectorCompleted: {
    backgroundColor: colors.positive,
  },
});
