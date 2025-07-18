// src\hooks\useRegisterForm.ts
"use client";

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

/**
 * @description Custom hook to manage the entire logic for the multi-step registration form.
 */
export function useRegisterForm() {
  const router = useRouter();
  const { sendOtp, verifyOtp, register, isLoading } = useAuthStore();

  // Form state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<AuthMethod>("email");

  // Step 1 state
  const [identifier, setIdentifier] = useState("");
  const [countryCode, setCountryCode] = useState("+60");
  const [debouncedIdentifier] = useDebounce(identifier, 500);

  // Step 2 state
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  // Step 3 state
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null
  );
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error state
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, string>>
  >({});

  // Timer effect
  useEffect(() => {
    if (timer > 0) {
      const id = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [timer]);

  const getValidIdentifier = useCallback(() => {
    if (method === "email") return identifier;
    return validateMobileByCountry(identifier, countryCode).formatted;
  }, [method, identifier, countryCode]);

  // Live validation for identifier
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

  const handleSendOtp = async () => {
    const validIdentifier = getValidIdentifier();
    if (!validIdentifier) {
      toast.error("Please enter a valid email or phone number.");
      return;
    }

    const res = await sendOtp(validIdentifier, method);
    if (res.success) {
      setStep(2);
      setTimer(60); // Start 60-second timer
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }
    const validIdentifier = getValidIdentifier();
    if (!validIdentifier) return; // Should not happen

    const res = await verifyOtp(otp, validIdentifier);
    if (res.success && res.verificationToken) {
      setVerificationToken(res.verificationToken);
      setStep(3);
      setTimer(0); // Clear timer
    }
  };

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
