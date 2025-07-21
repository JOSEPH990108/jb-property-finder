// src/hooks/useLoginForm.ts

/**
 * useLoginForm Hook
 * -----------------
 * Handles all login form logic: field state, validation (live + debounced), mode switch, and submit.
 * Designed for both email and phone login flows.
 * Debounced validation = instant UX, no spam API calls.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useDebounce } from "use-debounce";
import {
  emailSchema,
  getLoginSchema,
  extractFieldErrors,
} from "@/lib/validation";
import { validateMobileByCountry } from "@/lib/utils";
import { toast } from "sonner";
import { ZodError } from "zod";
import { AuthMethod } from "@/types/main";

export function useLoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  // --- Form state ---
  const [method, setMethod] = useState<AuthMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [countryCode, setCountryCode] = useState("+60");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- Debounced identifier for validation (no jitter) ---
  const [debouncedIdentifier] = useDebounce(identifier, 500);

  // --- Error state (field + global) ---
  const [formError, setFormError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});

  /** Resets all field/global errors. */
  const resetFormErrors = useCallback(() => {
    setFieldErrors({});
    setFormError("");
  }, []);

  /**
   * Switch between 'email' and 'phone' login methods.
   * Clears identifier and errors on change.
   */
  const handleMethodChange = (newMethod: AuthMethod) => {
    if (method === newMethod) return;
    setMethod(newMethod);
    setIdentifier("");
    resetFormErrors();
  };

  /**
   * Debounced identifier validation (email/phone).
   * - Runs after 500ms pause for smooth UX.
   * - Phone uses country code utils.
   */
  useEffect(() => {
    if (!debouncedIdentifier) {
      setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
      return;
    }

    let error: string | undefined;
    if (method === "email") {
      const result = emailSchema.safeParse(debouncedIdentifier);
      if (!result.success) error = "Invalid email format";
    } else {
      const result = validateMobileByCountry(debouncedIdentifier, countryCode);
      if (!result.isValid) error = result.reason;
    }
    setFieldErrors((prev) => ({ ...prev, identifier: error }));
  }, [debouncedIdentifier, method, countryCode]);

  /** Live validation for password field, updates error as user types. */
  useEffect(() => {
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
      return;
    }
    const schema = getLoginSchema(method);
    const result = schema.shape.password.safeParse(password);
    setFieldErrors((prev) => ({
      ...prev,
      password: result.success ? undefined : result.error.errors[0].message,
    }));
  }, [password, method]);

  /**
   * Handles form submit:
   * - Final validation (schema, phone format)
   * - Calls store login (which manages API + loading)
   * - Handles redirect and errors
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormErrors();

    // Final format for phone before submit
    const loginIdentifier =
      method === "phone"
        ? validateMobileByCountry(identifier, countryCode).formatted
        : identifier;

    if (method === "phone" && !loginIdentifier) {
      setFieldErrors((prev) => ({
        ...prev,
        identifier: "Invalid phone number.",
      }));
      toast.error("Invalid phone number.");
      return;
    }

    const schema = getLoginSchema(method);
    const validationResult = schema.safeParse({
      identifier: loginIdentifier,
      password,
    });

    if (!validationResult.success) {
      const errors = extractFieldErrors(validationResult.error as ZodError);
      setFieldErrors(errors);
      toast.error(Object.values(errors)[0]);
      return;
    }

    // Call global auth store's login (handles API and error toast)
    const { success } = await login(
      validationResult.data.identifier,
      validationResult.data.password,
      method
    );

    if (success) {
      toast.success("Login successful! Redirecting...");
      router.push("/");
    } else {
      setFormError("Invalid credentials. Please try again.");
    }
  };

  // --- Expose all state & handlers for component use ---
  return {
    method,
    identifier,
    password,
    countryCode,
    showPassword,
    isLoading,
    formError,
    fieldErrors,
    setIdentifier,
    setPassword,
    setCountryCode,
    setShowPassword,
    handleMethodChange,
    handleSubmit,
  };
}
