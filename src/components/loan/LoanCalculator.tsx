'use client'

import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useLoanCalculatorStore } from '@/stores/loanCalculateStore'
import { useLoanCalculation } from '@/hooks/useLoanCalculation'
import { formatCurrency } from '@/lib/utils'

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
  } = useLoanCalculatorStore()

  const { downPaymentAmount, monthlyInstallment } = useLoanCalculation()
  const sinkingFee = sqft * sinkRate

  return (
    <section className="w-full max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-xl space-y-6 transition">
      <h2 className="text-xl font-semibold text-primary">🏦 Loan Calculator</h2>

      {/* Property Price */}
      <div>
        <label className="block mb-1 text-sm font-medium">💰 Property Price (RM)</label>
        <Slider
          min={50000}
          max={6000000}
          step={10000}
          value={[spaPrice]}
          onValueChange={([val]) => setSpaPrice(val)}
        />
        <input
          type="number"
          value={spaPrice}
          onChange={e => setSpaPrice(Number(e.target.value))}
          className="mt-2 w-full px-4 py-2 rounded border bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
        />
      </div>

      {/* Down Payment Group */}
      <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded space-y-2">
        <h4 className="text-sm font-semibold">💸 Down Payment</h4>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-xs mb-1">RM</label>
            <input
              type="number"
              value={downPaymentAmount.toFixed(2)}
              onChange={e => {
                const rm = Math.min(Number(e.target.value), spaPrice)
                const pct = spaPrice > 0 ? (rm / spaPrice) * 100 : 0
                setDownPaymentRate(pct)
              }}
              className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-xs mb-1">%</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={downPaymentRate}
              onChange={e => {
                const pct = Math.min(Number(e.target.value), 100)
                setDownPaymentRate(pct)
              }}
              className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
            />
          </div>
        </div>
      </div>

      {/* Interest Rate + Tenure Group */}
      <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded space-y-2">
        <h4 className="text-sm font-semibold">📊 Loan Details</h4>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-xs mb-1">Interest %</label>
            <input
              type="number"
              value={interestRate}
              step={0.05}
              min={0.1}
              max={15}
              onChange={e => setInterestRate(Number(e.target.value))}
              className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-xs mb-1">Tenure (Years)</label>
            <input
              type="number"
              min={5}
              max={35}
              value={tenureYears}
              onChange={e => setTenureYears(Number(e.target.value))}
              className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
            />
          </div>
        </div>
      </div>

      {/* Built-up, Rate, Fee (Collapsible) */}
      <details className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded">
        <summary className="text-sm font-medium cursor-pointer">📐 Advanced Details</summary>
        {/* Developer Discounts Section */}
        <div className="mt-2 bg-zinc-50 dark:bg-zinc-800 rounded space-y-2">
          <h4 className="text-sm font-semibold">🏗️ Developer Discounts</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              ['spaLegalFee', 'Free SPA Legal Fee'],
              ['spaStampDuty', 'Free SPA Stamp Duty / MOT'],
              ['loanLegalFee', 'Free Loan Legal Fee'],
              ['loanStampDuty', 'Free Loan Stamp Duty'],
              ['rebate', 'Rebate (RM)'],
            ].map(([key, label]) => (
              <div
                key={key}
                className="flex flex-col gap-2 border rounded-md px-3 py-2 bg-zinc-100 dark:bg-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  <Switch
                    checked={developerDiscounts[key as keyof typeof developerDiscounts]}
                    onCheckedChange={(val) => {
                      setDeveloperDiscounts({ [key]: val });
                      if (key === 'rebate' && !val) {
                        setRebate(0); // reset rebate amount when turned off
                      }
                    }}
                  />
                </div>

                {key === 'rebate' && developerDiscounts.rebate && (
                  <input
                    type="number"
                    min={0}
                    value={rebateAmount.toFixed(2)}
                    onChange={(e) => setRebate(Number(e.target.value))}
                    placeholder="Enter rebate amount"
                    className="w-full rounded-md border px-2 py-1 text-right bg-white dark:bg-zinc-800"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-xs mb-1">Built-up (sqft)</label>
              <input
                type="number"
                value={sqft}
                onChange={e => setSqft(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs mb-1">Rate (RM/sqft)</label>
              <input
                type="number"
                step={0.01}
                value={sinkRate}
                onChange={e => setSinkRate(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm rounded border bg-zinc-100 dark:bg-zinc-700"
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

      {/* Estimated Monthly Repayment */}
      <div className="mt-4 text-center text-lg font-semibold bg-primary text-white py-4 rounded-lg dark:bg-zinc-800 transition">
        🧮 Estimated Monthly Repayment: {formatCurrency(monthlyInstallment)}
      </div>
    </section>
  )
}