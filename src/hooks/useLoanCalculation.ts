// src\hooks\useLoanCalculation.ts

/**
 * useLoanCalculation Hook
 * -----------------------
 * Centralizes all logic for housing loan calculations.
 * Returns: input params + all derived values for UI/summary.
 * - Handles legal fees, stamp duty, discounts, total costs, cash required, etc.
 */

import { useLoanCalculatorStore } from "@/stores/loanCalculateStore";
import { round } from "@/lib/utils";

// --- Malaysia legal fee calculation (SPA/Loan) ---
function calcLegalFee(amount: number): number {
  let fee = 0;
  if (amount <= 500_000) {
    fee = Math.max(amount * 0.0125, 500);
  } else if (amount <= 7_500_000) {
    fee = 500_000 * 0.0125 + (amount - 500_000) * 0.01;
  } else {
    fee = 500_000 * 0.0125 + 7_000_000 * 0.01 + (amount - 7_500_000) * 0.01;
  }
  return round(fee);
}

// --- Stamp duty for SPA price (progressive tier) ---
function calcStampDutySPA(price: number): number {
  let duty = 0;
  if (price <= 100_000) {
    duty = price * 0.01;
  } else if (price <= 500_000) {
    duty = 100_000 * 0.01 + (price - 100_000) * 0.02;
  } else if (price <= 1_000_000) {
    duty = 100_000 * 0.01 + 400_000 * 0.02 + (price - 500_000) * 0.03;
  } else {
    duty =
      100_000 * 0.01 +
      400_000 * 0.02 +
      500_000 * 0.03 +
      (price - 1_000_000) * 0.04;
  }
  return round(duty);
}

// --- Stamp duty for loan (flat 0.5%) ---
function calcStampDutyLoan(loan: number): number {
  return round(loan * 0.005);
}

export function useLoanCalculation() {
  // --- 1. Grab all user input/setting from global store ---
  const {
    spaPrice,
    downPaymentRate,
    interestRate,
    tenureYears,
    rebateAmount,
    developerDiscounts,
  } = useLoanCalculatorStore();

  // --- 2. Core derived loan values ---
  const downPaymentAmount = (downPaymentRate / 100) * spaPrice;
  const loanAmount = spaPrice - downPaymentAmount;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfMonths = tenureYears * 12;

  // --- 3. Calculate monthly installment (handle zero-interest edge) ---
  let monthlyInstallment = 0;
  if (monthlyInterestRate > 0) {
    const numerator =
      loanAmount *
      monthlyInterestRate *
      Math.pow(1 + monthlyInterestRate, numberOfMonths);
    const denominator = Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1;
    monthlyInstallment = numerator / denominator;
  } else {
    monthlyInstallment = loanAmount / numberOfMonths;
  }

  // --- 4. Total payment and interest ---
  const totalPayment = monthlyInstallment * numberOfMonths;
  const totalInterest = totalPayment - loanAmount;

  // --- 5. Last payment date (for UI timeline) ---
  const today = new Date();
  const lastPaymentDate = new Date(
    today.setMonth(today.getMonth() + numberOfMonths)
  );

  // --- 6. Calculate legal fees & stamp duty (before discount) ---
  const spaLegalFeeRaw = calcLegalFee(spaPrice);
  const loanLegalFeeRaw = calcLegalFee(loanAmount);
  const spaStampDutyRaw = calcStampDutySPA(spaPrice);
  const loanStampDutyRaw = calcStampDutyLoan(loanAmount);

  // --- 7. Apply developer discounts if any ---
  const spaLegalFee = developerDiscounts.spaLegalFee ? 0 : spaLegalFeeRaw;
  const loanLegalFee = developerDiscounts.loanLegalFee ? 0 : loanLegalFeeRaw;
  const spaStampDuty = developerDiscounts.spaStampDuty ? 0 : spaStampDutyRaw;
  const loanStampDuty = developerDiscounts.loanStampDuty ? 0 : loanStampDutyRaw;

  // --- 8. Calculate all-in cash required (before loan) ---
  const cashRequired =
    spaLegalFee +
    loanLegalFee +
    spaStampDuty +
    loanStampDuty +
    downPaymentAmount -
    rebateAmount;

  // --- 9. Return everything you might want for the UI ---
  return {
    // Raw inputs (optional, great for summary UI)
    spaPrice,
    downPaymentRate,
    interestRate,
    tenureYears,
    rebateAmount,

    // Derived values for calculator
    downPaymentAmount,
    loanAmount,
    monthlyInstallment,
    totalPayment,
    totalInterest,
    numberOfMonths,
    lastPaymentDate,
    spaLegalFee,
    loanLegalFee,
    spaStampDuty,
    loanStampDuty,
    cashRequired,
  };
}
