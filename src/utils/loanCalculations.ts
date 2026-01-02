// loan Calculation equations

import {
  FinancialInfo,
  LoanTerms,
  LoanCalculations,
  CreditScoreRange,
  BASE_INTEREST_RATES,
  LOAN_LIMITS,
  EmploymentStatus,
} from '../types/loan';

/**
 * monthly payment calculation using the standard amortization formula:
 * M = P * [r(1+r)^n] / [(1+r)^n - 1];
 * M = Monthly payment
 * P = Principal (loan amount)
 * r = Monthly interest rate (annual rate / 12)
 * n = Total number of payments (loan term in months)
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) {
    return 0;
  }

  if (annualInterestRate === 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;

  return principal * (numerator / denominator);
}

export function calculateTotalInterest(
  monthlyPayment: number,
  termMonths: number,
  principal: number
): number {
  const totalPayment = monthlyPayment * termMonths;
  return totalPayment - principal;
}

export function getEffectiveInterestRate(
  creditScore: CreditScoreRange,
  employmentStatus: EmploymentStatus,
  interestRateType: 'fixed' | 'variable'
): number {
  let baseRate = BASE_INTEREST_RATES[creditScore];

  const employmentAdjustments: Record<EmploymentStatus, number> = {
    employed_full_time: 0,
    employed_part_time: 0.5,
    self_employed: 0.75,
    retired: 0.25,
    student: 1.0,
    unemployed: 2.5,
  };

  baseRate += employmentAdjustments[employmentStatus];

  if (interestRateType === 'variable') {
    baseRate -= 0.5;
  }

  return Math.max(baseRate, 3.0); // minimum 3% interest
}


export function calculateDebtToIncomeRatio(
  monthlyDebtPayments: number,
  monthlyIncome: number
): number {
  if (monthlyIncome <= 0) {
    return 1; 
  }
  return monthlyDebtPayments / monthlyIncome;
}


export function checkEligibility(
  financialInfo: FinancialInfo,
  loanTerms: LoanTerms,
  monthlyPayment: number
): { isEligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let isEligible = true;

  const monthlyIncome = financialInfo.annualIncome / 12;
  const monthlyDebtWithLoan = (financialInfo.existingDebts / 12) + monthlyPayment;
  const dti = calculateDebtToIncomeRatio(monthlyDebtWithLoan, monthlyIncome);

  // check minimum income
  if (financialInfo.annualIncome < LOAN_LIMITS.minIncome) {
    isEligible = false;
    reasons.push(`Annual income must be at least $${LOAN_LIMITS.minIncome.toLocaleString()}`);
  }

  // check DTI ratio
  if (dti > LOAN_LIMITS.maxDebtToIncomeRatio) {
    isEligible = false;
    reasons.push(`Debt-to-income ratio (${(dti * 100).toFixed(1)}%) exceeds maximum of ${LOAN_LIMITS.maxDebtToIncomeRatio * 100}%`);
  }

  //check employment status
  if (financialInfo.employmentStatus === 'unemployed') {
    isEligible = false;
    reasons.push('Employment is required for loan approval');
  }

  // check credit score
  if (financialInfo.creditScore === 'very_poor') {
    isEligible = false;
    reasons.push('Credit score is below minimum requirement');
  }

  // check bank account
  if (financialInfo.bankAccountType === 'none') {
    isEligible = false;
    reasons.push('A bank account is required for loan disbursement');
  }

  // check loan amount based on income
  const maxLoanBasedOnIncome = financialInfo.annualIncome * 5;
  if (loanTerms.loanAmount > maxLoanBasedOnIncome) {
    isEligible = false;
    reasons.push(`Loan amount exceeds maximum based on income (${formatCurrency(maxLoanBasedOnIncome)})`);
  }

  // check monthly payment affordability (should be less than 35% of monthly income)
  if (monthlyPayment > monthlyIncome * 0.35) {
    reasons.push('Monthly payment exceeds 35% of monthly income - consider a smaller loan');
  }

  if (isEligible) {
    if (financialInfo.creditScore === 'excellent' || financialInfo.creditScore === 'good') {
      reasons.push('Your credit score qualifies you for competitive rates');
    }
    if (dti < 0.3) {
      reasons.push('Your debt-to-income ratio is healthy');
    }
    if (financialInfo.employmentStatus === 'employed_full_time') {
      reasons.push('Full-time employment strengthens your application');
    }
  }

  return { isEligible, reasons };
}

export function calculateLoanDetails(
  financialInfo: FinancialInfo,
  loanTerms: LoanTerms
): LoanCalculations {
  const effectiveInterestRate = getEffectiveInterestRate(
    financialInfo.creditScore,
    financialInfo.employmentStatus,
    loanTerms.interestRateType
  );

  const monthlyPayment = calculateMonthlyPayment(
    loanTerms.loanAmount,
    effectiveInterestRate,
    loanTerms.loanTerm
  );

  const totalInterest = calculateTotalInterest(
    monthlyPayment,
    loanTerms.loanTerm,
    loanTerms.loanAmount
  );

  const totalPayment = loanTerms.loanAmount + totalInterest;

  const monthlyIncome = financialInfo.annualIncome / 12;
  const monthlyDebtWithLoan = (financialInfo.existingDebts / 12) + monthlyPayment;
  const debtToIncomeRatio = calculateDebtToIncomeRatio(monthlyDebtWithLoan, monthlyIncome);

  const { isEligible, reasons } = checkEligibility(financialInfo, loanTerms, monthlyPayment);

  return {
    monthlyPayment,
    totalInterest,
    totalPayment,
    effectiveInterestRate,
    isEligible,
    eligibilityReasons: reasons,
    debtToIncomeRatio,
  };
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function getAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  termMonths: number
): Array<{
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}> {
  const schedule = [];
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, termMonths);
  const monthlyRate = annualInterestRate / 100 / 12;
  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
}
