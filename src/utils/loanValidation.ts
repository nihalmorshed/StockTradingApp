// loan Form validation 

import {
  PersonalDetails,
  FinancialInfo,
  LoanTerms,
  ValidationError,
  StepValidation,
  LOAN_LIMITS,
} from '../types/loan';

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


//  phone number format used -> USA

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-()]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 10;
}


  // zip code format used -> USA
 
export function isValidZipCode(zip: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

// date of birth (must be 18+ years old)
export function isValidDateOfBirth(dob: string): boolean {
  const date = new Date(dob);
  if (isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const dayDiff = today.getDate() - date.getDate();

  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

  return actualAge >= 18 && actualAge <= 120;
}

export function validatePersonalDetails(details: PersonalDetails): StepValidation {
  const errors: ValidationError[] = [];

  if (!details.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (details.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  }

  if (!details.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (details.lastName.trim().length < 2) {
    errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
  }

  if (!details.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(details.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!details.phone.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (!isValidPhone(details.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  if (!details.dateOfBirth) {
    errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
  } else if (!isValidDateOfBirth(details.dateOfBirth)) {
    errors.push({ field: 'dateOfBirth', message: 'You must be at least 18 years old' });
  }

  if (!details.address.trim()) {
    errors.push({ field: 'address', message: 'Address is required' });
  }

  if (!details.city.trim()) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  if (!details.state.trim()) {
    errors.push({ field: 'state', message: 'State is required' });
  }

  if (!details.zipCode.trim()) {
    errors.push({ field: 'zipCode', message: 'ZIP code is required' });
  } else if (!isValidZipCode(details.zipCode)) {
    errors.push({ field: 'zipCode', message: 'Please enter a valid ZIP code' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateFinancialInfo(info: FinancialInfo): StepValidation {
  const errors: ValidationError[] = [];

  if (!info.employmentStatus) {
    errors.push({ field: 'employmentStatus', message: 'Employment status is required' });
  }

  if (info.annualIncome <= 0) {
    errors.push({ field: 'annualIncome', message: 'Annual income is required' });
  } else if (info.annualIncome < LOAN_LIMITS.minIncome) {
    errors.push({
      field: 'annualIncome',
      message: `Minimum annual income is $${LOAN_LIMITS.minIncome.toLocaleString()}`,
    });
  }

  if (info.monthlyExpenses < 0) {
    errors.push({ field: 'monthlyExpenses', message: 'Monthly expenses cannot be negative' });
  }

  // validate expenses against income
  const monthlyIncome = info.annualIncome / 12;
  if (info.monthlyExpenses > monthlyIncome) {
    errors.push({
      field: 'monthlyExpenses',
      message: 'Monthly expenses exceed monthly income',
    });
  }
  if (!info.creditScore) {
    errors.push({ field: 'creditScore', message: 'Credit score range is required' });
  }

  if (info.existingDebts < 0) {
    errors.push({ field: 'existingDebts', message: 'Existing debts cannot be negative' });
  }

  if (!info.bankAccountType) {
    errors.push({ field: 'bankAccountType', message: 'Bank account type is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateLoanTerms(terms: LoanTerms): StepValidation {
  const errors: ValidationError[] = [];

  if (terms.loanAmount <= 0) {
    errors.push({ field: 'loanAmount', message: 'Loan amount is required' });
  } else if (terms.loanAmount < LOAN_LIMITS.minAmount) {
    errors.push({
      field: 'loanAmount',
      message: `Minimum loan amount is $${LOAN_LIMITS.minAmount.toLocaleString()}`,
    });
  } else if (terms.loanAmount > LOAN_LIMITS.maxAmount) {
    errors.push({
      field: 'loanAmount',
      message: `Maximum loan amount is $${LOAN_LIMITS.maxAmount.toLocaleString()}`,
    });
  }

  if (terms.loanTerm <= 0) {
    errors.push({ field: 'loanTerm', message: 'Loan term is required' });
  } else if (terms.loanTerm < LOAN_LIMITS.minTerm) {
    errors.push({
      field: 'loanTerm',
      message: `Minimum loan term is ${LOAN_LIMITS.minTerm} months`,
    });
  } else if (terms.loanTerm > LOAN_LIMITS.maxTerm) {
    errors.push({
      field: 'loanTerm',
      message: `Maximum loan term is ${LOAN_LIMITS.maxTerm} months (${LOAN_LIMITS.maxTerm / 12} years)`,
    });
  }

  if (!terms.loanPurpose) {
    errors.push({ field: 'loanPurpose', message: 'Loan purpose is required' });
  }

  if (!terms.interestRateType) {
    errors.push({ field: 'interestRateType', message: 'Interest rate type is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  const error = errors.find(e => e.field === field);
  return error?.message;
}

export function hasFieldError(errors: ValidationError[], field: string): boolean {
  return errors.some(e => e.field === field);
}

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
}

export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  const number = parseInt(digits, 10);
  if (isNaN(number)) {
    return '';
  }
  return number.toLocaleString('en-US');
}

export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  return parseInt(digits, 10) || 0;
}
