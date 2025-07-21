// src\components\loan\LoanCalculator.tsx
"use client";

import { useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useLoanCalculatorStore } from "@/stores/loanCalculateStore";
import { useLoanCalculation } from "@/hooks/useLoanCalculation";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function LoanCalculator() {
  const {
    spaPrice,
    downPaymentRate,
    interestRate,
    tenureYears,
    sqft,
    sinkRate,
    rebateAmount,
    developerDiscounts,
    setSpaPrice,
    setDownPaymentRate,
    setInterestRate,
    setTenureYears,
    setSqft,
    setSinkRate,
    setRebate,
    setDeveloperDiscounts,
  } = useLoanCalculatorStore();

  const { downPaymentAmount, monthlyInstallment } = useLoanCalculation();
  const sinkingFee = sqft * sinkRate;

  // Reset all fields to default
  const handleReset = () => {
    setSpaPrice(500000);
    setDownPaymentRate(10);
    setInterestRate(4.5);
    setTenureYears(30);
    setSqft(1000);
    setSinkRate(0.33);
    setRebate(0);
    setDeveloperDiscounts({
      spaLegalFee: false,
      spaStampDuty: false,
      loanLegalFee: false,
      loanStampDuty: false,
      rebate: false,
    });
  };

  // Ref for autofocus on mobile
  const priceInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="w-full max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-xl space-y-6 transition">
      <h2 className="text-xl font-semibold text-primary">🏦 Loan Calculator</h2>

      {/* Property Price */}
      <div>
        <label
          className="block mb-1 text-sm font-medium"
          htmlFor="propertyPrice"
        >
          💰 Property Price (RM)
        </label>
        <Slider
          min={50000}
          max={6000000}
          step={10000}
          value={[spaPrice]}
          onValueChange={([val]) => setSpaPrice(val)}
          aria-label="Property price slider"
        />
        <input
          ref={priceInputRef}
          id="propertyPrice"
          type="number"
          value={spaPrice}
          onChange={(e) => setSpaPrice(Number(e.target.value))}
          className="mt-2 w-full px-4 py-2 rounded border bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
          inputMode="decimal"
          aria-label="Property price"
          autoFocus
        />
        <div className="flex justify-between text-xs mt-1 text-zinc-400 dark:text-zinc-500">
          <span>RM 50,000</span>
          <span>RM 6,000,000</span>
        </div>
      </div>

      {/* Down Payment Group */}
      <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded space-y-2">
        <h4 className="text-sm font-semibold">💸 Down Payment</h4>
        <div className="flex gap-2 items-center">
          <div className="w-1/2">
            <label className="block text-xs mb-1" htmlFor="downPaymentRM">
              RM
            </label>
            <input
              id="downPaymentRM"
              type="number"
              value={downPaymentAmount.toFixed(2)}
              onChange={(e) => {
                const rm = Math.min(Number(e.target.value), spaPrice);
                const pct = spaPrice > 0 ? (rm / spaPrice) * 100 : 0;
                setDownPaymentRate(pct);
              }}
              className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
              inputMode="decimal"
              aria-label="Down payment amount in RM"
            />
          </div>
          <div className="w-1/2 flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1" htmlFor="downPaymentPct">
                %
              </label>
              <input
                id="downPaymentPct"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={downPaymentRate}
                onChange={(e) => {
                  const pct = Math.min(Number(e.target.value), 100);
                  setDownPaymentRate(pct);
                }}
                className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
                inputMode="decimal"
                aria-label="Down payment percent"
              />
            </div>
            {/* Progress badge */}
            <span
              className={`ml-2 text-xs px-2 py-1 rounded-full font-semibold transition-all
                ${
                  downPaymentRate >= 20
                    ? "bg-green-200 text-green-700"
                    : downPaymentRate >= 10
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              title="Down payment % indicator"
            >
              {downPaymentRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Interest Rate + Tenure Group */}
      <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded space-y-2">
        <h4 className="text-sm font-semibold">📊 Loan Details</h4>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-xs mb-1" htmlFor="interestRate">
              Interest %
            </label>
            <input
              id="interestRate"
              type="number"
              value={interestRate}
              step={0.05}
              min={0.1}
              max={15}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
              inputMode="decimal"
              aria-label="Loan interest rate"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-xs mb-1" htmlFor="tenureYears">
              Tenure (Years)
            </label>
            <input
              id="tenureYears"
              type="number"
              min={5}
              max={35}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
              inputMode="numeric"
              aria-label="Loan tenure in years"
            />
          </div>
        </div>
      </div>

      {/* Built-up, Rate, Fee (Collapsible) */}
      <details className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded">
        <summary className="text-sm font-medium cursor-pointer select-none">
          📐 Advanced Details
        </summary>
        {/* Developer Discounts Section */}
        <div className="mt-2 bg-zinc-50 dark:bg-zinc-800 rounded space-y-2">
          <h4 className="text-sm font-semibold">🏗️ Developer Discounts</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              ["spaLegalFee", "Free SPA Legal Fee"],
              ["spaStampDuty", "Free SPA Stamp Duty / MOT"],
              ["loanLegalFee", "Free Loan Legal Fee"],
              ["loanStampDuty", "Free Loan Stamp Duty"],
              ["rebate", "Rebate (RM)"],
            ].map(([key, label]) => (
              <div
                key={key}
                className="flex flex-col gap-2 border rounded-md px-3 py-2 bg-zinc-100 dark:bg-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  <Switch
                    checked={
                      developerDiscounts[key as keyof typeof developerDiscounts]
                    }
                    onCheckedChange={(val) => {
                      setDeveloperDiscounts({ [key]: val });
                      if (key === "rebate" && !val) {
                        setRebate(0); // reset rebate amount when turned off
                      }
                    }}
                  />
                </div>

                {key === "rebate" && developerDiscounts.rebate && (
                  <input
                    type="number"
                    min={0}
                    value={rebateAmount.toFixed(2)}
                    onChange={(e) => setRebate(Number(e.target.value))}
                    placeholder="Enter rebate amount"
                    className="w-full rounded-md border px-2 py-1 text-right bg-white dark:bg-zinc-800"
                    inputMode="decimal"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-xs mb-1" htmlFor="sqft">
                Built-up (sqft)
              </label>
              <input
                id="sqft"
                type="number"
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
                inputMode="numeric"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs mb-1" htmlFor="sinkRate">
                Rate (RM/sqft)
              </label>
              <input
                id="sinkRate"
                type="number"
                step={0.01}
                value={sinkRate}
                onChange={(e) => setSinkRate(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
                inputMode="decimal"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1">🏗️ Sinking Fee (RM)</label>
            <div className="px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700">
              {formatCurrency(sinkingFee)}
            </div>
          </div>
        </div>
      </details>

      {/* Reset All Button */}
      <button
        type="button"
        onClick={handleReset}
        className="w-full mt-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 py-2 rounded-md text-sm font-medium transition"
      >
        🔄 Reset All
      </button>

      {/* Estimated Monthly Repayment (with animation) */}
      <div className="mt-4 text-center text-lg font-semibold bg-primary text-white py-4 rounded-lg dark:bg-zinc-800 transition relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={monthlyInstallment}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            🧮 Estimated Monthly Repayment: {formatCurrency(monthlyInstallment)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
