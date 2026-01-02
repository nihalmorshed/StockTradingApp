// loan types and interfaces

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface FinancialInfo {
  employmentStatus: EmploymentStatus;
  annualIncome: number;
  monthlyExpenses: number;
  creditScore: CreditScoreRange;
  existingDebts: number;
  bankAccountType: BankAccountType;
}

export interface LoanTerms {
  loanAmount: number;
  loanTerm: number; // in months
  loanPurpose: LoanPurpose;
  interestRateType: InterestRateType;
}

export interface LoanCalculations {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  effectiveInterestRate: number;
  isEligible: boolean;
  eligibilityReasons: string[];
  debtToIncomeRatio: number;
}

export interface LoanApplication {
  personalDetails: PersonalDetails;
  financialInfo: FinancialInfo;
  loanTerms: LoanTerms;
  calculations: LoanCalculations | null;
  currentStep: number;
  isSubmitted: boolean;
  submittedAt: number | null;
}

export type EmploymentStatus =
  | 'employed_full_time'
  | 'employed_part_time'
  | 'self_employed'
  | 'unemployed'
  | 'retired'
  | 'student';

export type CreditScoreRange =
  | 'excellent'    // 750+
  | 'good'         // 700-749
  | 'fair'         // 650-699
  | 'poor'         // 600-649
  | 'very_poor';   // below 600

export type BankAccountType =
  | 'checking'
  | 'savings'
  | 'both'
  | 'none';

export type LoanPurpose =
  | 'home_purchase'
  | 'home_improvement'
  | 'debt_consolidation'
  | 'auto_loan'
  | 'business'
  | 'education'
  | 'medical'
  | 'vacation'
  | 'other';

export type InterestRateType = 'fixed' | 'variable';

export interface ValidationError {
  field: string;
  message: string;
}

export interface StepValidation {
  isValid: boolean;
  errors: ValidationError[];
}

export const CREDIT_SCORE_VALUES: Record<CreditScoreRange, number> = {
  excellent: 780,
  good: 720,
  fair: 670,
  poor: 620,
  very_poor: 550,
};

export const BASE_INTEREST_RATES: Record<CreditScoreRange, number> = {
  excellent: 5.5,
  good: 7.0,
  fair: 9.5,
  poor: 12.0,
  very_poor: 15.5,
};

export const LOAN_PURPOSE_LABELS: Record<LoanPurpose, string> = {
  home_purchase: 'Home Purchase',
  home_improvement: 'Home Improvement',
  debt_consolidation: 'Debt Consolidation',
  auto_loan: 'Auto Loan',
  business: 'Business',
  education: 'Education',
  medical: 'Medical Expenses',
  vacation: 'Vacation',
  other: 'Other',
};

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  employed_full_time: 'Employed Full-Time',
  employed_part_time: 'Employed Part-Time',
  self_employed: 'Self-Employed',
  unemployed: 'Unemployed',
  retired: 'Retired',
  student: 'Student',
};

export const CREDIT_SCORE_LABELS: Record<CreditScoreRange, string> = {
  excellent: 'Excellent (750+)',
  good: 'Good (700-749)',
  fair: 'Fair (650-699)',
  poor: 'Poor (600-649)',
  very_poor: 'Very Poor (Below 600)',
};

export const BANK_ACCOUNT_LABELS: Record<BankAccountType, string> = {
  checking: 'Checking Account',
  savings: 'Savings Account',
  both: 'Both Checking & Savings',
  none: 'No Bank Account',
};

export const LOAN_LIMITS = {
  minAmount: 1000,
  maxAmount: 500000,
  minTerm: 6,    // 6 months
  maxTerm: 360,  // 30 years
  minIncome: 12000, // 12k annual minimum
  maxDebtToIncomeRatio: 0.43, //maximum DebtToIncome Ratio is 43%
};
