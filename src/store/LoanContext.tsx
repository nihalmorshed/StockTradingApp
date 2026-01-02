// loan Application State Management

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  LoanApplication,
  PersonalDetails,
  FinancialInfo,
  LoanTerms,
  LoanCalculations,
  StepValidation,
} from '../types/loan';
import { calculateLoanDetails } from '../utils/loanCalculations';
import {
  validatePersonalDetails,
  validateFinancialInfo,
  validateLoanTerms,
} from '../utils/loanValidation';

const initialPersonalDetails: PersonalDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
};

const initialFinancialInfo: FinancialInfo = {
  employmentStatus: 'employed_full_time',
  annualIncome: 0,
  monthlyExpenses: 0,
  creditScore: 'good',
  existingDebts: 0,
  bankAccountType: 'checking',
};

const initialLoanTerms: LoanTerms = {
  loanAmount: 10000,
  loanTerm: 36,
  loanPurpose: 'debt_consolidation',
  interestRateType: 'fixed',
};

const initialState: LoanApplication = {
  personalDetails: initialPersonalDetails,
  financialInfo: initialFinancialInfo,
  loanTerms: initialLoanTerms,
  calculations: null,
  currentStep: 1,
  isSubmitted: false,
  submittedAt: null,
};

type LoanAction =
  | { type: 'UPDATE_PERSONAL_DETAILS'; payload: Partial<PersonalDetails> }
  | { type: 'UPDATE_FINANCIAL_INFO'; payload: Partial<FinancialInfo> }
  | { type: 'UPDATE_LOAN_TERMS'; payload: Partial<LoanTerms> }
  | { type: 'SET_CALCULATIONS'; payload: LoanCalculations }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SUBMIT_APPLICATION' }
  | { type: 'RESET_APPLICATION' };

function loanReducer(state: LoanApplication, action: LoanAction): LoanApplication {
  switch (action.type) {
    case 'UPDATE_PERSONAL_DETAILS':
      return {
        ...state,
        personalDetails: { ...state.personalDetails, ...action.payload },
      };

    case 'UPDATE_FINANCIAL_INFO':
      return {
        ...state,
        financialInfo: { ...state.financialInfo, ...action.payload },
      };

    case 'UPDATE_LOAN_TERMS':
      return {
        ...state,
        loanTerms: { ...state.loanTerms, ...action.payload },
      };

    case 'SET_CALCULATIONS':
      return {
        ...state,
        calculations: action.payload,
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 5),
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };

    case 'SUBMIT_APPLICATION':
      return {
        ...state,
        isSubmitted: true,
        submittedAt: Date.now(),
      };

    case 'RESET_APPLICATION':
      return initialState;

    default:
      return state;
  }
}

interface LoanContextValue {
  
  application: LoanApplication;
  currentStep: number;

  updatePersonalDetails: (details: Partial<PersonalDetails>) => void;
  validateStep1: () => StepValidation;

  updateFinancialInfo: (info: Partial<FinancialInfo>) => void;
  validateStep2: () => StepValidation;

  updateLoanTerms: (terms: Partial<LoanTerms>) => void;
  validateStep3: () => StepValidation;
  recalculateLoan: () => void;

  goToStep: (step: number) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  canProceed: () => boolean;

  submitApplication: () => void;
  resetApplication: () => void;
}

const LoanContext = createContext<LoanContextValue | null>(null);

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(loanReducer, initialState);

  const updatePersonalDetails = useCallback((details: Partial<PersonalDetails>) => {
    dispatch({ type: 'UPDATE_PERSONAL_DETAILS', payload: details });
  }, []);

  const validateStep1 = useCallback((): StepValidation => {
    return validatePersonalDetails(state.personalDetails);
  }, [state.personalDetails]);

  const updateFinancialInfo = useCallback((info: Partial<FinancialInfo>) => {
    dispatch({ type: 'UPDATE_FINANCIAL_INFO', payload: info });
  }, []);

  const validateStep2 = useCallback((): StepValidation => {
    return validateFinancialInfo(state.financialInfo);
  }, [state.financialInfo]);

  const updateLoanTerms = useCallback((terms: Partial<LoanTerms>) => {
    dispatch({ type: 'UPDATE_LOAN_TERMS', payload: terms });
  }, []);

  const validateStep3 = useCallback((): StepValidation => {
    return validateLoanTerms(state.loanTerms);
  }, [state.loanTerms]);

  const recalculateLoan = useCallback(() => {
    const calculations = calculateLoanDetails(state.financialInfo, state.loanTerms);
    dispatch({ type: 'SET_CALCULATIONS', payload: calculations });
  }, [state.financialInfo, state.loanTerms]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 5) {
      dispatch({ type: 'SET_STEP', payload: step });
    }
  }, []);

  const canProceed = useCallback((): boolean => {
    switch (state.currentStep) {
      case 1:
        return validatePersonalDetails(state.personalDetails).isValid;
      case 2:
        return validateFinancialInfo(state.financialInfo).isValid;
      case 3:
        return validateLoanTerms(state.loanTerms).isValid;
      case 4:
        return state.calculations?.isEligible ?? false;
      case 5:
        return true;
      default:
        return false;
    }
  }, [state]);

  const nextStep = useCallback((): boolean => {
    if (canProceed()) {
      if (state.currentStep === 3) {
        const calculations = calculateLoanDetails(state.financialInfo, state.loanTerms);
        dispatch({ type: 'SET_CALCULATIONS', payload: calculations });
      }
      dispatch({ type: 'NEXT_STEP' });
      return true;
    }
    return false;
  }, [canProceed, state.currentStep, state.financialInfo, state.loanTerms]);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const submitApplication = useCallback(() => {
    dispatch({ type: 'SUBMIT_APPLICATION' });
  }, []);

  const resetApplication = useCallback(() => {
    dispatch({ type: 'RESET_APPLICATION' });
  }, []);

  const value = useMemo(
    () => ({
      application: state,
      currentStep: state.currentStep,
      updatePersonalDetails,
      validateStep1,
      updateFinancialInfo,
      validateStep2,
      updateLoanTerms,
      validateStep3,
      recalculateLoan,
      goToStep,
      nextStep,
      prevStep,
      canProceed,
      submitApplication,
      resetApplication,
    }),
    [
      state,
      updatePersonalDetails,
      validateStep1,
      updateFinancialInfo,
      validateStep2,
      updateLoanTerms,
      validateStep3,
      recalculateLoan,
      goToStep,
      nextStep,
      prevStep,
      canProceed,
      submitApplication,
      resetApplication,
    ]
  );

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
}

// hook for using loan context
export function useLoan(): LoanContextValue {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
}
