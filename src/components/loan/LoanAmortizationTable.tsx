// src\components\loan\LoanAmortizationTable.tsx
"use client";

import { useState, useMemo } from "react";
import { useAmortizationSchedule } from "@/hooks/useAmortizationSchedule";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

// Dynamically import file-saver to ensure it only runs on the client
const saveAs =
  typeof window !== "undefined" ? require("file-saver").saveAs : () => {};

/**
 * A component that renders a single row in the amortization table.
 * @param {object} props - The component props.
 * @param {object} props.row - The data for the table row.
 * @returns {JSX.Element} The rendered table row.
 */
const AmortizationTableRow = ({ row }: any) => {
  const total = row.principal + row.interest;
  // Handle potential division by zero if total is 0
  const principalPct = total > 0 ? (row.principal / total) * 100 : 0;
  const interestPct = total > 0 ? 100 - principalPct : 0;

  return (
    <tr className="border-t border-zinc-200 dark:border-zinc-700">
      <td className="p-2 font-medium">{row.month}</td>
      <td className="p-2">{formatCurrency(row.principal)}</td>
      <td className="p-2">{formatCurrency(row.interest)}</td>
      <td className="p-2">
        <div className="flex w-full h-3 rounded overflow-hidden shadow-inner bg-zinc-100 dark:bg-zinc-800">
          <div
            className="bg-blue-500 transition-all duration-300"
            style={{
              width: `${principalPct}%`,
              borderTopLeftRadius: "0.375rem",
              borderBottomLeftRadius: "0.375rem",
            }}
          />
          <div
            className="bg-rose-500 transition-all duration-300"
            style={{
              width: `${interestPct}%`,
              borderTopRightRadius: "0.375rem",
              borderBottomRightRadius: "0.375rem",
            }}
          />
        </div>
      </td>
      <td className="p-2">{formatCurrency(row.balance)}</td>
    </tr>
  );
};

/**
 * The main component for displaying the loan amortization table.
 * It includes features for expanding/collapsing years and exporting to CSV.
 * @returns {JSX.Element} The rendered loan amortization table component.
 */
export default function LoanAmortizationTable() {
  const rows = useAmortizationSchedule();
  const [showAmortizationSection, setShowAmortizationSection] = useState(false);
  const [expandedYears, setExpandedYears] = useState<number[]>([]);

  // Toggles the visibility of a single year's details.
  const toggleYear = (year: number) =>
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );

  // Memoize the list of all years to avoid recalculating on every render.
  const allYears = useMemo(
    () => Array.from(new Set(rows.map((r) => r.year))),
    [rows]
  );

  // Toggles the expansion state of all years at once.
  const toggleAllYears = () => {
    const allExpanded = allYears.every((y) => expandedYears.includes(y));
    setExpandedYears(allExpanded ? [] : allYears);
  };

  // Exports the full amortization schedule to a CSV file.
  const exportCSV = () => {
    const header =
      "Year,Month,Principal (RM),Interest (RM),Total Payment (RM),Balance (RM)\n";
    const body = rows
      .map(
        (r) =>
          `${r.year},${r.month},${r.principal},${r.interest},${r.total},${r.balance}`
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "monthly_amortization_schedule.csv");
  };

  // Memoizes the grouped data to prevent unnecessary recalculation when the component re-renders.
  const groupedData = useMemo(
    () =>
      rows.reduce<Record<number, typeof rows>>((acc, row) => {
        acc[row.year] = acc[row.year] || [];
        acc[row.year].push(row);
        return acc;
      }, {}),
    [rows]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Sticky Bar for controls */}
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md rounded-lg px-4 py-4 flex flex-col gap-3 transition hover:shadow-lg">
        {/* Title and main toggle */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowAmortizationSection((prev) => !prev)}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="text-lg sm:text-xl font-bold text-primary">
              Amortization Overview
            </h2>
          </div>
          {showAmortizationSection ? (
            <ChevronUp className="w-5 h-5 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 shrink-0" />
          )}
        </div>

        {/* Action Buttons */}
        {showAmortizationSection && (
          <div
            className="flex flex-col sm:flex-row gap-2"
            onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up to the main toggle
          >
            <button
              onClick={toggleAllYears}
              className="w-full sm:w-auto px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-sm rounded-lg shadow hover:brightness-105"
            >
              {expandedYears.length === allYears.length
                ? "🔽 Collapse All"
                : "🔼 Expand All"}
            </button>
            <button
              onClick={exportCSV}
              className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-lg shadow-md dark:bg-zinc-700 transition"
            >
              ⬇️ Download CSV
            </button>
          </div>
        )}
      </div>

      {/* Amortization Section */}
      {showAmortizationSection && (
        <div className="space-y-6">
          {Object.entries(groupedData).map(([yearStr, months]) => {
            const year = Number(yearStr);
            const totalPrincipal = months.reduce(
              (sum, r) => sum + r.principal,
              0
            );
            const totalInterest = months.reduce(
              (sum, r) => sum + r.interest,
              0
            );
            const isExpanded = expandedYears.includes(year);

            return (
              <div
                key={year}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden bg-white dark:bg-zinc-900"
              >
                <button
                  onClick={() => toggleYear(year)}
                  className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-100 via-white to-rose-100 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 transition-colors hover:brightness-105"
                  aria-expanded={isExpanded}
                  aria-controls={`amortization-year-${year}`}
                >
                  <div>
                    <p className="text-lg font-semibold">📆 Year {year}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Principal: {formatCurrency(totalPrincipal)} | Interest:{" "}
                      {formatCurrency(totalInterest)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </button>

                {isExpanded && (
                  <div
                    className="overflow-x-auto touch-auto scroll-smooth"
                    id={`amortization-year-${year}`}
                  >
                    <table
                      className="min-w-[700px] w-full text-sm text-center"
                      role="table"
                    >
                      <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        <tr>
                          <th className="p-2">Month</th>
                          <th className="p-2">Principal</th>
                          <th className="p-2">Interest</th>
                          <th className="p-2">Payment Split</th>
                          <th className="p-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-zinc-900">
                        {months.map((row) => (
                          <AmortizationTableRow
                            key={`${year}-${row.month}`}
                            row={row}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
