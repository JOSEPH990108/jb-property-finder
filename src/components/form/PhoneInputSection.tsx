// src/components/form/PhoneInputSection.tsx
"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils"; // optional: utility for className merging
import AnimatedFieldError from "./AnimatedFieldError";

interface PhoneInputSectionProps {
  phone: string;
  onPhoneChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (value: string) => void;
  error?: string;
  useNative?: boolean;
  disabled?: boolean;
}

const COUNTRY_OPTIONS = [
  { code: "+60", label: "🇲🇾 +60" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+66", label: "🇹🇭 +66" },
];

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

        <Input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          disabled={disabled}
          className={`rounded-lg border ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500"
          } dark:bg-gray-800`}
        />
      </div>
      <AnimatedFieldError message={error} />
    </div>
  );
}
