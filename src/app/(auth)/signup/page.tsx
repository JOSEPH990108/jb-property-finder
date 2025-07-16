// app/(auth)/register/page.tsx
"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PhoneInputSection from "@/components/form/PhoneInputSection";
import AnimatedFieldError from "@/components/form/AnimatedFieldError";
import { useRegisterForm } from "@/hooks/useRegisterForm"; // <-- Import the new hook

// A simple presentational component for the progress bar
const ProgressBar = ({ step }: { step: number }) => (
  <div className="flex items-center justify-between relative mb-6">
    {["Verify", "OTP", "Details"].map((label, i) => (
      <div key={i} className="flex flex-col items-center flex-1 text-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 transition-colors
          ${
            step > i + 1
              ? "bg-green-500 text-white"
              : step === i + 1
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {step > i + 1 ? "✓" : i + 1}
        </div>
        <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">
          {label}
        </span>
      </div>
    ))}
    <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
  </div>
);

export default function RegisterPage() {
  // All logic is now cleanly encapsulated in the custom hook
  const {
    step,
    method,
    identifier,
    countryCode,
    otp,
    timer,
    name,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    isLoading,
    fieldErrors,
    setMethod,
    setIdentifier,
    setCountryCode,
    setOtp,
    setName,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleSendOtp,
    handleVerifyOtp,
    handleRegister,
  } = useRegisterForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-gray-900 px-4 py-8">
      <div className="w-full max-w-sm bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-xl space-y-6 text-gray-900 dark:text-white">
        <ProgressBar step={step} />

        <h2 className="text-xl font-semibold text-center">
          {step === 1 && "Create Your Account"}
          {step === 2 && "Enter Verification Code"}
          {step === 3 && "Complete Your Details"}
        </h2>

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={method === "email" ? "default" : "outline"}
                className="flex-1 rounded-md"
                onClick={() => setMethod("email")}
              >
                Email
              </Button>
              <Button
                variant={method === "phone" ? "default" : "outline"}
                className="flex-1 rounded-md"
                onClick={() => setMethod("phone")}
              >
                Phone
              </Button>
            </div>
            {method === "email" ? (
              <div>
                <Input
                  placeholder="Your email address"
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                />
                <AnimatedFieldError message={fieldErrors.identifier} />
              </div>
            ) : (
              <PhoneInputSection
                phone={identifier}
                onPhoneChange={setIdentifier}
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
                error={fieldErrors.identifier}
                disabled={isLoading}
              />
            )}
            <Button
              onClick={handleSendOtp}
              disabled={isLoading || !!fieldErrors.identifier}
              className="w-full"
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Input
              placeholder="Enter the 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              disabled={isLoading}
            />
            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length < 6}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              {timer > 0 ? (
                `Resend available in ${timer}s`
              ) : (
                <button
                  className="text-blue-600 underline dark:text-blue-400 hover:text-blue-700"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
              <AnimatedFieldError message={fieldErrors.name} />
            </div>
            <div className="relative">
              <Input
                placeholder="Create a Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2.5 right-3 text-gray-500 dark:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <AnimatedFieldError message={fieldErrors.password} />
            </div>
            <div className="relative">
              <Input
                placeholder="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-2.5 right-3 text-gray-500 dark:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <AnimatedFieldError message={fieldErrors.confirmPassword} />
            </div>
            <Button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Creating Account..." : "Complete Registration"}
            </Button>
          </div>
        )}

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
