// src\hooks\useLoanCalculation.ts
import { useLoanCalculatorStore } from "@/stores/loanCalculateStore";
import { round } from "@/lib/utils";

function calcLegalFee(amount: number) {
  let fee = 0;
  if (amount <= 500000) {
    fee = Math.max(amount * 0.0125, 500);
  } else if (amount <= 7500000) {
    fee = 500000 * 0.0125 + (amount - 500000) * 0.01;
  } else {
    fee = 500000 * 0.0125 + 7000000 * 0.01 + (amount - 7500000) * 0.01;
  }
  return round(fee);
}

function calcStampDutySPA(price: number) {
  let duty = 0;
  if (price <= 100000) {
    duty = price * 0.01;
  } else if (price <= 500000) {
    duty = 100000 * 0.01 + (price - 100000) * 0.02;
  } else if (price <= 1000000) {
    duty = 100000 * 0.01 + 400000 * 0.02 + (price - 500000) * 0.03;
  } else {
    duty =
      100000 * 0.01 + 400000 * 0.02 + 500000 * 0.03 + (price - 1000000) * 0.04;
  }
  return round(duty);
}

function calcStampDutyLoan(loan: number) {
  return round(loan * 0.005);
}

export function useLoanCalculation() {
  const {
    spaPrice,
    downPaymentRate,
    interestRate,
    tenureYears,
    rebateAmount,
    developerDiscounts,
  } = useLoanCalculatorStore();

  const downPaymentAmount = (downPaymentRate / 100) * spaPrice;
  const loanAmount = spaPrice - downPaymentAmount;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfMonths = tenureYears * 12;

  let monthlyInstallment = 0;
  if (monthlyInterestRate > 0) {
    const numerator =
      loanAmount *
      monthlyInterestRate *
      Math.pow(1 + monthlyInterestRate, numberOfMonths);
    const denominator = Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1;
    monthlyInstallment = numerator / denominator;
  }

  const totalPayment = monthlyInstallment * numberOfMonths;
  const totalInterest = totalPayment - loanAmount;

  const today = new Date();
  const lastPaymentDate = new Date(
    today.setMonth(today.getMonth() + numberOfMonths)
  );

  const spaLegalFeeRaw = calcLegalFee(spaPrice);
  const loanLegalFeeRaw = calcLegalFee(loanAmount);
  const spaStampDutyRaw = calcStampDutySPA(spaPrice);
  const loanStampDutyRaw = calcStampDutyLoan(loanAmount);

  const spaLegalFee = developerDiscounts.spaLegalFee ? 0 : spaLegalFeeRaw;
  const loanLegalFee = developerDiscounts.loanLegalFee ? 0 : loanLegalFeeRaw;
  const spaStampDuty = developerDiscounts.spaStampDuty ? 0 : spaStampDutyRaw;
  const loanStampDuty = developerDiscounts.loanStampDuty ? 0 : loanStampDutyRaw;

  const cashRequired =
    spaLegalFee +
    loanLegalFee +
    spaStampDuty +
    loanStampDuty +
    downPaymentAmount -
    rebateAmount;

  return {
    // Raw inputs (optional, useful for summary component)
    spaPrice,
    downPaymentRate,
    interestRate,
    tenureYears,
    rebateAmount,

    // Derived values
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
