// src\stores\loanCalculateStore.ts
import { create } from "zustand";

type DeveloperDiscounts = {
  spaLegalFee: boolean;
  spaStampDuty: boolean;
  loanLegalFee: boolean;
  loanStampDuty: boolean;
  rebate: boolean;
};

type LoanCalculatorState = {
  spaPrice: number; // SPA (Sale and Purchase Agreement) price
  downPaymentRate: number; // Down payment in %
  interestRate: number; // Annual interest rate in %
  tenureYears: number; // Loan tenure in years
  sinkRate: number; // sink rate in monthly
  sqft: number; // Built up (sqft)
  rebateAmount: number;
  developerDiscounts: DeveloperDiscounts;
  // Setters
  setSpaPrice: (value: number) => void;
  setDownPaymentRate: (value: number) => void;
  setInterestRate: (value: number) => void;
  setTenureYears: (value: number) => void;
  setSinkRate: (value: number) => void;
  setSqft: (value: number) => void;
  setRebate: (value: number) => void;
  setDeveloperDiscounts: (value: Partial<DeveloperDiscounts>) => void;
};

export const useLoanCalculatorStore = create<LoanCalculatorState>(
  (set, get) => ({
    spaPrice: 500000,
    downPaymentRate: 10,
    interestRate: 4.5,
    tenureYears: 30,
    sinkRate: 0.33,
    sqft: 1000,
    rebateAmount: 0,
    developerDiscounts: {
      spaLegalFee: false,
      spaStampDuty: false,
      loanLegalFee: false,
      loanStampDuty: false,
      rebate: false,
    },

    setSpaPrice: (value) => set({ spaPrice: value }),
    setDownPaymentRate: (value) => set({ downPaymentRate: value }),
    setInterestRate: (value) => set({ interestRate: value }),
    setTenureYears: (value) => set({ tenureYears: value }),
    setSinkRate: (value) => set({ sinkRate: value }),
    setSqft: (value) => set({ sqft: value }),
    setRebate: (value) => set({ rebateAmount: value }),
    setDeveloperDiscounts: (value) => {
      set({
        developerDiscounts: {
          ...get().developerDiscounts,
          ...value,
        },
      });
    },
  })
);
