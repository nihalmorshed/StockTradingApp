// loan application screen 

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
  FadeIn,
} from 'react-native-reanimated';
import { useLoan } from '../../src/store';
import {
  PersonalDetailsForm,
  FinancialInfoForm,
  LoanTermsForm,
  LoanCalculationsDisplay,
  ReviewAndSubmit,
  StepIndicator,
  SuccessScreen,
} from '../../src/components/loan';
import { ValidationError } from '../../src/types/loan';
import { colors, spacing, borderRadius } from '../../src/theme';

const STEP_LABELS = ['Personal', 'Financial', 'Terms', 'Review', 'Submit'];
const TOTAL_STEPS = 5;

export default function LoanApplicationScreen() {
  const router = useRouter();
  const {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    validateStep1,
    validateStep2,
    validateStep3,
    submitApplication,
    resetApplication,
    application,
  } = useLoan();

  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const progressWidth = useSharedValue(0);

  // update progress bar
  useEffect(() => {
    progressWidth.value = withSpring((currentStep / TOTAL_STEPS) * 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [currentStep]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleNext = useCallback(() => {
    Keyboard.dismiss();
    setShowErrors(true);

    let validation;
    switch (currentStep) {
      case 1:
        validation = validateStep1();
        break;
      case 2:
        validation = validateStep2();
        break;
      case 3:
        validation = validateStep3();
        break;
      case 4:
        validation = { isValid: true, errors: [] };
        break;
      default:
        validation = { isValid: true, errors: [] };
    }

    setErrors(validation.errors);

    if (validation.isValid) {
      setShowErrors(false);
      setDirection('forward');
      nextStep();
    }
  }, [currentStep, validateStep1, validateStep2, validateStep3, nextStep]);

  const handleBack = useCallback(() => {
    Keyboard.dismiss();
    setShowErrors(false);
    setErrors([]);
    setDirection('backward');
    prevStep();
  }, [prevStep]);

  const handleStepPress = useCallback((step: number) => {
    if (step < currentStep) {
      setDirection('backward');
      setShowErrors(false);
      setErrors([]);
      goToStep(step);
    }
  }, [currentStep, goToStep]);

  const handleEditStep = useCallback((step: number) => {
    setDirection('backward');
    setShowErrors(false);
    setErrors([]);
    goToStep(step);
  }, [goToStep]);

  const handleSubmit = useCallback(() => {
    submitApplication();
  }, [submitApplication]);

  const handleStartNew = useCallback(() => {
    resetApplication();
  }, [resetApplication]);

  const handleGoHome = useCallback(() => {
    resetApplication();
    router.push('/');
  }, [resetApplication, router]);

  //  show success screen when submitted
  if (application.isSubmitted) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Application Submitted' }} />
        <SuccessScreen onStartNew={handleStartNew} onGoHome={handleGoHome} />
      </View>
    );
  }

  const renderStepContent = () => {
    const entering = direction === 'forward' ? SlideInRight : SlideInLeft;
    const exiting = direction === 'forward' ? SlideOutLeft : SlideOutRight;

    switch (currentStep) {
      case 1:
        return (
          <Animated.View
            key="step1"
            entering={entering.duration(300)}
            exiting={exiting.duration(300)}
            style={styles.stepContent}
          >
            <PersonalDetailsForm errors={errors} showErrors={showErrors} />
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View
            key="step2"
            entering={entering.duration(300)}
            exiting={exiting.duration(300)}
            style={styles.stepContent}
          >
            <FinancialInfoForm errors={errors} showErrors={showErrors} />
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View
            key="step3"
            entering={entering.duration(300)}
            exiting={exiting.duration(300)}
            style={styles.stepContent}
          >
            <LoanTermsForm errors={errors} showErrors={showErrors} />
          </Animated.View>
        );
      case 4:
        return (
          <Animated.View
            key="step4"
            entering={entering.duration(300)}
            exiting={exiting.duration(300)}
            style={styles.stepContent}
          >
            <LoanCalculationsDisplay />
          </Animated.View>
        );
      case 5:
        return (
          <Animated.View
            key="step5"
            entering={entering.duration(300)}
            exiting={exiting.duration(300)}
            style={styles.stepContent}
          >
            <ReviewAndSubmit onEdit={handleEditStep} onSubmit={handleSubmit} />
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen
        options={{
          title: 'Loan Application',
          headerLeft: () => (
            <IconButton
              icon="close"
              onPress={() => router.back()}
              iconColor={colors.textSecondary}
            />
          ),
        }}
      />

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>

      <StepIndicator
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        stepLabels={STEP_LABELS}
        onStepPress={handleStepPress}
      />

      <View style={styles.contentContainer}>
        {renderStepContent()}
      </View>

      <Animated.View
        entering={FadeIn.duration(200)}
        style={styles.navigationContainer}
      >
        {currentStep > 1 && (
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.backButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.backButtonLabel}
            icon="arrow-left"
          >
            Back
          </Button>
        )}

        {currentStep < TOTAL_STEPS && (
          <Button
            mode="contained"
            onPress={handleNext}
            style={[styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
            contentStyle={styles.nextButtonContent}
            labelStyle={styles.nextButtonLabel}
            icon="arrow-right"
          >
            {currentStep === 4 ? 'Review' : 'Continue'}
          </Button>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  progressBackground: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderColor: colors.border,
  },
  nextButton: {
    flex: 2,
    borderRadius: borderRadius.md,
  },
  fullWidthButton: {
    flex: 1,
  },
  buttonContent: {
    height: 50,
  },
  nextButtonContent: {
    height: 50,
    flexDirection: 'row-reverse',
  },
  backButtonLabel: {
    color: colors.textSecondary,
  },
  nextButtonLabel: {
    fontWeight: '600',
  },
});
