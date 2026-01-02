// unit tests for loan calculation functions

import {
  calculateMonthlyPayment,
  calculateTotalInterest,
  getEffectiveInterestRate,
  calculateDebtToIncomeRatio,
  checkEligibility,
  calculateLoanDetails,
  formatCurrency,
  formatPercentage,
} from '../../src/utils/loanCalculations';
import { FinancialInfo, LoanTerms } from '../../src/types/loan';

describe('Loan Calculations', () => {
  describe('calculateMonthlyPayment', () => {
    it(' calculate correct monthly payment for standard loan', () => {
      // 10,000 dollars loan at 5% for 36 months
      const payment = calculateMonthlyPayment(10000, 5, 36);
      expect(payment).toBeCloseTo(299.71, 2);
    });

    it('calculate correct monthly payment for higher interest', () => {
      // 25,000 dollars loan at 10% for 60 months
      const payment = calculateMonthlyPayment(25000, 10, 60);
      expect(payment).toBeCloseTo(531.18, 2);
    });

    it('return 0 for zero principal', () => {
      const payment = calculateMonthlyPayment(0, 5, 36);
      expect(payment).toBe(0);
    });

    it('return 0 for zero term', () => {
      const payment = calculateMonthlyPayment(10000, 5, 0);
      expect(payment).toBe(0);
    });

    it('handle zero interest rate', () => {
      // 12,000 dollars loan at 0% for 12 months = 1,000 dollars/month
      const payment = calculateMonthlyPayment(12000, 0, 12);
      expect(payment).toBe(1000);
    });
  });

  describe('calculateTotalInterest', () => {
    it('calculate total interest correctly', () => {
      const monthlyPayment = 300;
      const termMonths = 36;
      const principal = 10000;
      const totalInterest = calculateTotalInterest(monthlyPayment, termMonths, principal);
      expect(totalInterest).toBe(800); // (300 * 36) - 10000 = 800
    });

    it('return zero for zero interest loan', () => {
      const totalInterest = calculateTotalInterest(1000, 12, 12000);
      expect(totalInterest).toBe(0);
    });
  });

  describe('getEffectiveInterestRate', () => {
    it('returns base rate for excellent credit full-time employed', () => {
      const rate = getEffectiveInterestRate('excellent', 'employed_full_time', 'fixed');
      expect(rate).toBe(5.5);
    });

    it('adds adjustment for part-time employment', () => {
      const rate = getEffectiveInterestRate('excellent', 'employed_part_time', 'fixed');
      expect(rate).toBe(6.0); // 5.5 + 0.5
    });

    it('reduces rate for variable interest type', () => {
      const rate = getEffectiveInterestRate('excellent', 'employed_full_time', 'variable');
      expect(rate).toBe(5.0); // 5.5 - 0.5
    });

    it('returns higher rate for poor credit', () => {
      const rate = getEffectiveInterestRate('poor', 'employed_full_time', 'fixed');
      expect(rate).toBe(12.0);
    });

    it('adds maximum adjustment for unemployed', () => {
      const rate = getEffectiveInterestRate('good', 'unemployed', 'fixed');
      expect(rate).toBe(9.5); // 7.0 + 2.5
    });

    it('should not return less than 3%', () => {
      const rate = getEffectiveInterestRate('excellent', 'employed_full_time', 'variable');
      expect(rate).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe('calculateDebtToIncomeRatio', () => {
    it('calculates DTI correctly', () => {
      const dti = calculateDebtToIncomeRatio(1500, 5000);
      expect(dti).toBe(0.3); // 30%
    });

    it('returns 1 for zero income', () => {
      const dti = calculateDebtToIncomeRatio(1000, 0);
      expect(dti).toBe(1); // 100%
    });

    it('handles zero debt', () => {
      const dti = calculateDebtToIncomeRatio(0, 5000);
      expect(dti).toBe(0);
    });
  });

  describe('checkEligibility', () => {
    const baseFinancialInfo: FinancialInfo = {
      employmentStatus: 'employed_full_time',
      annualIncome: 60000,
      monthlyExpenses: 2000,
      creditScore: 'good',
      existingDebts: 0,
      bankAccountType: 'checking',
    };

    const baseLoanTerms: LoanTerms = {
      loanAmount: 10000,
      loanTerm: 36,
      loanPurpose: 'debt_consolidation',
      interestRateType: 'fixed',
    };

    it('approves eligible applicant', () => {
      const result = checkEligibility(baseFinancialInfo, baseLoanTerms, 300);
      expect(result.isEligible).toBe(true);
    });

    it('rejects applicant with low income', () => {
      const lowIncomeInfo = { ...baseFinancialInfo, annualIncome: 10000 };
      const result = checkEligibility(lowIncomeInfo, baseLoanTerms, 300);
      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContain('Annual income must be at least $12,000');
    });

    it('rejects unemployed applicant', () => {
      const unemployedInfo = { ...baseFinancialInfo, employmentStatus: 'unemployed' as const };
      const result = checkEligibility(unemployedInfo, baseLoanTerms, 300);
      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContain('Employment is required for loan approval');
    });

    it('rejects very poor credit score', () => {
      const poorCreditInfo = { ...baseFinancialInfo, creditScore: 'very_poor' as const };
      const result = checkEligibility(poorCreditInfo, baseLoanTerms, 300);
      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContain('Credit score is below minimum requirement');
    });

    it('rejects applicant without bank account', () => {
      const noBankInfo = { ...baseFinancialInfo, bankAccountType: 'none' as const };
      const result = checkEligibility(noBankInfo, baseLoanTerms, 300);
      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContain('A bank account is required for loan disbursement');
    });

    it('rejects if DTI exceeds 43%', () => {
      const highDebtInfo = { ...baseFinancialInfo, existingDebts: 30000 };
      const result = checkEligibility(highDebtInfo, baseLoanTerms, 1500);
      expect(result.isEligible).toBe(false);
    });
  });

  describe('calculateLoanDetails', () => {
    it('calculates all loan details correctly', () => {
      const financialInfo: FinancialInfo = {
        employmentStatus: 'employed_full_time',
        annualIncome: 60000,
        monthlyExpenses: 2000,
        creditScore: 'good',
        existingDebts: 0,
        bankAccountType: 'checking',
      };

      const loanTerms: LoanTerms = {
        loanAmount: 10000,
        loanTerm: 36,
        loanPurpose: 'debt_consolidation',
        interestRateType: 'fixed',
      };

      const result = calculateLoanDetails(financialInfo, loanTerms);

      expect(result.effectiveInterestRate).toBe(7.0);
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.totalPayment).toBe(loanTerms.loanAmount + result.totalInterest);
      expect(result.isEligible).toBe(true);
      expect(result.debtToIncomeRatio).toBeGreaterThanOrEqual(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(5.5)).toBe('5.50%');
      expect(formatPercentage(12.345)).toBe('12.35%');
      expect(formatPercentage(0)).toBe('0.00%');
    });
  });
});
