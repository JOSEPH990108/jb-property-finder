// src/hooks/useRegisterForm.ts
"use client";

/**
 * useRegisterForm Hook
 * --------------------
 * Handles all multi-step registration form logic.
 * - Step 1: Enter identifier (email/phone) & send OTP
 * - Step 2: Enter/verify OTP
 * - Step 3: Enter user details & complete registration
 * Manages validation, debouncing, timers, and all async actions.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useDebounce } from "use-debounce";
import {
  registerSchema,
  extractFieldErrors,
  getIdentifierSchema,
} from "@/lib/validation";
import { validateMobileByCountry } from "@/lib/utils";
import { toast } from "sonner";
import { ZodError } from "zod";
import { AuthMethod } from "@/types/main";

export function useRegisterForm() {
  const router = useRouter();
  const { sendOtp, verifyOtp, register, isLoading } = useAuthStore();

  // --- Multi-step state ---
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<AuthMethod>("email");

  // --- Step 1: Identifier entry ---
  const [identifier, setIdentifier] = useState("");
  const [countryCode, setCountryCode] = useState("+60");
  const [debouncedIdentifier] = useDebounce(identifier, 500);

  // --- Step 2: OTP verification ---
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  // --- Step 3: User details & password ---
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null
  );
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Field errors for UI feedback ---
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, string>>
  >({});

  // --- Timer for OTP resend cooldown (runs every second when active) ---
  useEffect(() => {
    if (timer > 0) {
      const id = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [timer]);

  // --- Helper: Get valid identifier (format phone if needed) ---
  const getValidIdentifier = useCallback(() => {
    if (method === "email") return identifier;
    return validateMobileByCountry(identifier, countryCode).formatted;
  }, [method, identifier, countryCode]);

  // --- Live validation for identifier field (debounced for UX) ---
  useEffect(() => {
    if (!debouncedIdentifier) {
      setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
      return;
    }
    const schema = getIdentifierSchema(method);
    const result = schema.safeParse(debouncedIdentifier);
    setFieldErrors((prev) => ({
      ...prev,
      identifier: result.success ? undefined : result.error.errors[0].message,
    }));
  }, [debouncedIdentifier, method]);

  // --- Step 1: Send OTP handler ---
  const handleSendOtp = async () => {
    const validIdentifier = getValidIdentifier();
    if (!validIdentifier) {
      toast.error("Please enter a valid email or phone number.");
      return;
    }

    const res = await sendOtp(validIdentifier, method);
    if (res.success) {
      setStep(2);
      setTimer(60); // 60-second cooldown before resend allowed
    }
  };

  // --- Step 2: Verify OTP handler ---
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }
    const validIdentifier = getValidIdentifier();
    if (!validIdentifier) return;

    const res = await verifyOtp(otp, validIdentifier);
    if (res.success && res.verificationToken) {
      setVerificationToken(res.verificationToken);
      setStep(3);
      setTimer(0); // Clear timer
    }
  };

  // --- Step 3: Complete registration handler ---
  const handleRegister = async () => {
    setFieldErrors({});
    const validIdentifier = getValidIdentifier();
    if (!validIdentifier || !verificationToken) return;

    const formData = {
      name,
      password,
      confirmPassword,
      method,
      identifier: validIdentifier,
      verificationToken,
    };
    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      const errors = extractFieldErrors(result.error as ZodError);
      setFieldErrors(errors);
      toast.error(Object.values(errors)[0] || "Please check your inputs.");
      return;
    }

    const { success } = await register(
      result.data.name,
      result.data.password,
      result.data.confirmPassword,
      result.data.verificationToken,
      result.data.method,
      result.data.identifier
    );

    if (success) {
      toast.success("Registration successful! Welcome!");
      router.push("/");
    }
  };

  // --- Expose state & handlers for the registration UI ---
  return {
    // State
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
    // Setters & Handlers
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
  };
}
