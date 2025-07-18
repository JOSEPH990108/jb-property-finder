'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react' // make sure lucide-react is installed
import { formatCurrency } from '@/lib/utils'
import { useLoanCalculation } from '@/hooks/useLoanCalculation'

export default function LoanSummary() {
    const {
        downPaymentAmount,
        spaLegalFee,
        loanLegalFee,
        spaStampDuty,
        loanStampDuty,
        cashRequired,
    } = useLoanCalculation()
    const [expandCash, setExpandCash] = useState(false)
    const cashBreakdown = [
        { label: 'Down Payment', value: downPaymentAmount, icon: '💸' },
        { label: 'SPA Legal Fee', value: spaLegalFee, icon: '📄' },
        { label: 'SPA Stamp Duty', value: spaStampDuty, icon: '🧾' },
        { label: 'Loan Legal Fee', value: loanLegalFee, icon: '📁' },
        { label: 'Loan Stamp Duty', value: loanStampDuty, icon: '🏛️' },
    ]
    return (
        <>
        {/* Cash Required Panel */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow text-sm text-zinc-800 dark:text-zinc-200 flex flex-col h-full">
            <div
                onClick={() => setExpandCash(!expandCash)}
                className="flex items-center justify-between cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl">💵</span>
                    <h2 className="text-lg sm:text-xl font-bold text-primary">
                    Cash Required on Purchase
                    </h2>
                </div>
                {/* <h4 className="font-bold text-lg">💵 Cash Required on Purchase</h4> */}
                {expandCash ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandCash && (
            <div className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            {cashBreakdown.map(({ label, value, icon }) => (
                <div key={label} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span>{label}:</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(value)}</span>
                </div>
            ))}
                <hr className="my-2 border-zinc-300 dark:border-zinc-700" />
                <div className="flex justify-between items-center font-bold text-base">
                    <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span>Total Cash Required:</span>
                    </div>
                    <span className="text-primary">{formatCurrency(cashRequired)}</span>
                </div>
            </div>
            )}
        </div>
    </>
    )
}