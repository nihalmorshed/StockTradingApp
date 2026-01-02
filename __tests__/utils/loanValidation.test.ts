// unit test for loan validation 

import {
  isValidEmail,
  isValidPhone,
  isValidZipCode,
  isValidDateOfBirth,
  validatePersonalDetails,
  validateFinancialInfo,
  validateLoanTerms,
  formatPhoneNumber,
  formatCurrencyInput,
  parseCurrencyInput,
} from '../../src/utils/loanValidation';
import { PersonalDetails, FinancialInfo, LoanTerms } from '../../src/types/loan';

describe('Loan Validation', () => {
  describe('isValidEmail', () => {
    it('accepts valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user @domain.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('accepts valid phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('123 456 7890')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('12345')).toBe(false);
      expect(isValidPhone('abcdefghij')).toBe(false);
    });
  });

  describe('isValidZipCode', () => {
    it('accepts only valid US ZIP codes', () => {
      expect(isValidZipCode('12345')).toBe(true);
      expect(isValidZipCode('12345-6789')).toBe(true);
    });

    it('rejects invalid ZIP codes', () => {
      expect(isValidZipCode('')).toBe(false);
      expect(isValidZipCode('1234')).toBe(false);
      expect(isValidZipCode('123456')).toBe(false);
      expect(isValidZipCode('abcde')).toBe(false);
      expect(isValidZipCode('12345-')).toBe(false);
    });
  });

  describe('isValidDateOfBirth', () => {
    it('accepts valid DOB for adults', () => {
      const thirtyYearsAgo = new Date();
      thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
      expect(isValidDateOfBirth(thirtyYearsAgo.toISOString().split('T')[0])).toBe(true);
    });

    it('rejects DOB for minors', () => {
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      expect(isValidDateOfBirth(tenYearsAgo.toISOString().split('T')[0])).toBe(false);
    });

    it('rejects invalid date strings', () => {
      expect(isValidDateOfBirth('')).toBe(false);
      expect(isValidDateOfBirth('invalid')).toBe(false);
      expect(isValidDateOfBirth('2099-01-01')).toBe(false);
    });
  });

  describe('validatePersonalDetails', () => {
    const validDetails: PersonalDetails = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      dateOfBirth: '1990-01-15',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    };

    it('validates correct personal details', () => {
      const result = validatePersonalDetails(validDetails);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('requires first name', () => {
      const result = validatePersonalDetails({ ...validDetails, firstName: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'firstName')).toBe(true);
    });

    it('requires last name', () => {
      const result = validatePersonalDetails({ ...validDetails, lastName: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'lastName')).toBe(true);
    });

    it('validates email format', () => {
      const result = validatePersonalDetails({ ...validDetails, email: 'invalid' });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('validates phone format', () => {
      const result = validatePersonalDetails({ ...validDetails, phone: '123' });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'phone')).toBe(true);
    });

    it('validates ZIP code format', () => {
      const result = validatePersonalDetails({ ...validDetails, zipCode: '1234' });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'zipCode')).toBe(true);
    });
  });

  describe('validateFinancialInfo', () => {
    const validInfo: FinancialInfo = {
      employmentStatus: 'employed_full_time',
      annualIncome: 60000,
      monthlyExpenses: 2000,
      creditScore: 'good',
      existingDebts: 5000,
      bankAccountType: 'checking',
    };

    it('validates correct financial info', () => {
      const result = validateFinancialInfo(validInfo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('requires minimum income', () => {
      const result = validateFinancialInfo({ ...validInfo, annualIncome: 5000 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'annualIncome')).toBe(true);
    });

    it('rejects negative expenses', () => {
      const result = validateFinancialInfo({ ...validInfo, monthlyExpenses: -100 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'monthlyExpenses')).toBe(true);
    });

    it('rejects expenses exceeding income', () => {
      const result = validateFinancialInfo({ ...validInfo, monthlyExpenses: 10000 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'monthlyExpenses')).toBe(true);
    });

    it('rejects negative debts', () => {
      const result = validateFinancialInfo({ ...validInfo, existingDebts: -100 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'existingDebts')).toBe(true);
    });
  });

  describe('validateLoanTerms', () => {
    const validTerms: LoanTerms = {
      loanAmount: 25000,
      loanTerm: 36,
      loanPurpose: 'home_improvement',
      interestRateType: 'fixed',
    };

    it('validates correct loan terms', () => {
      const result = validateLoanTerms(validTerms);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('enforces minimum loan amount', () => {
      const result = validateLoanTerms({ ...validTerms, loanAmount: 500 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'loanAmount')).toBe(true);
    });

    it('enforces maximum loan amount', () => {
      const result = validateLoanTerms({ ...validTerms, loanAmount: 1000000 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'loanAmount')).toBe(true);
    });

    it('enforces minimum loan term', () => {
      const result = validateLoanTerms({ ...validTerms, loanTerm: 3 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'loanTerm')).toBe(true);
    });

    it('enforces maximum loan term', () => {
      const result = validateLoanTerms({ ...validTerms, loanTerm: 500 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'loanTerm')).toBe(true);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('555')).toBe('555');
      expect(formatPhoneNumber('555123')).toBe('(555) 123');
    });
  });

  describe('formatCurrencyInput', () => {
    it('should format currency input with commas', () => {
      expect(formatCurrencyInput('1000')).toBe('1,000');
      expect(formatCurrencyInput('1000000')).toBe('1,000,000');
      expect(formatCurrencyInput('500')).toBe('500');
    });

    it('should handle non-numeric input', () => {
      expect(formatCurrencyInput('')).toBe('');
      expect(formatCurrencyInput('abc')).toBe('');
    });
  });

  describe('parseCurrencyInput', () => {
    it('should parse currency strings to numbers', () => {
      expect(parseCurrencyInput('1,000')).toBe(1000);
      expect(parseCurrencyInput('$1,000,000')).toBe(1000000);
      expect(parseCurrencyInput('500')).toBe(500);
    });

    it('should return 0 for invalid input', () => {
      expect(parseCurrencyInput('')).toBe(0);
      expect(parseCurrencyInput('abc')).toBe(0);
    });
  });
});
