// src\components\form\PhoneInputSection.tsx

"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils"; // Utility for merging classNames (Tailwind + logic)
import AnimatedFieldError from "./AnimatedFieldError";

// --- Types ---
// Use clear prop names and descriptions.
interface PhoneInputSectionProps {
  phone: string; // The phone number value
  onPhoneChange: (value: string) => void; // Handler for phone input changes
  countryCode: string; // The selected country code (e.g. "+60")
  onCountryCodeChange: (value: string) => void; // Handler for country code change
  error?: string; // Optional error message (shows under input)
  useNative?: boolean; // If true, uses <select> instead of shadcn/ui
  disabled?: boolean; // If true, disables all input fields
}

// Country code dropdown options (add more as needed)
const COUNTRY_OPTIONS = [
  { code: "+60", label: "🇲🇾 +60" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+66", label: "🇹🇭 +66" },
];

// --- Main Component ---
// Supports shadcn/ui custom Select or native <select> (for mobile/SSR fallback)
export default function PhoneInputSection({
  phone,
  onPhoneChange,
  countryCode,
  onCountryCodeChange,
  error,
  useNative = false,
  disabled = false,
}: PhoneInputSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        {useNative ? (
          // --- Native <select> for country code ---
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "border rounded-lg p-2 w-1/3 text-sm focus:outline-none",
              "dark:bg-gray-800 dark:border-gray-700"
            )}
          >
            {COUNTRY_OPTIONS.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        ) : (
          // --- shadcn/ui Select for custom dropdown ---
          <Select
            value={countryCode}
            onValueChange={onCountryCodeChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Code" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_OPTIONS.map(({ code, label }) => (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* --- Phone input field --- */}
        <Input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "rounded-lg border",
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500",
            "dark:bg-gray-800"
          )}
        />
      </div>
      {/* --- Animated error message (if any) --- */}
      <AnimatedFieldError message={error} />
    </div>
  );
}
