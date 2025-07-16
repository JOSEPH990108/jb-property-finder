// hooks/useLoginForm.ts
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
import { AuthMethod } from "@/types/property";

/**
 * @description Custom hook to manage the entire logic for the login form.
 * It handles state, validation (with debouncing), and submission.
 */
export function useLoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  // Form state
  const [method, setMethod] = useState<AuthMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [countryCode, setCountryCode] = useState("+60");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Debounced value for live validation to avoid excessive checks
  const [debouncedIdentifier] = useDebounce(identifier, 500);

  // Error state
  const [formError, setFormError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});

  /**
   * @description Resets all form errors.
   */
  const resetFormErrors = useCallback(() => {
    setFieldErrors({});
    setFormError("");
  }, []);

  /**
   * @description Switches the authentication method between 'email' and 'phone'.
   * Resets identifier and errors on switch.
   */
  const handleMethodChange = (newMethod: AuthMethod) => {
    if (method === newMethod) return;
    setMethod(newMethod);
    setIdentifier("");
    resetFormErrors();
  };

  /**
   * @description Live validation for the identifier field (email or phone).
   * Uses the debounced value to prevent validation on every keystroke.
   */
  useEffect(() => {
    if (!debouncedIdentifier) {
      setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
      return;
    }

    let error: string | undefined;
    if (method === "email") {
      const result = emailSchema.safeParse(debouncedIdentifier);
      if (!result.success) {
        error = "Invalid email format";
      }
    } else {
      const result = validateMobileByCountry(debouncedIdentifier, countryCode);
      if (!result.isValid) {
        error = result.reason;
      }
    }
    setFieldErrors((prev) => ({ ...prev, identifier: error }));
  }, [debouncedIdentifier, method, countryCode]);

  /**
   * @description Live validation for the password field.
   */
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
   * @description Handles the form submission process.
   * Performs final validation and calls the login action from the auth store.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormErrors();

    // Final validation before submission
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
      // Show toast for the first error found
      toast.error(Object.values(errors)[0]);
      return;
    }

    const { success } = await login(
      validationResult.data.identifier,
      validationResult.data.password,
      method
    );

    if (success) {
      toast.success("Login successful! Redirecting...");
      router.push("/");
    } else {
      // The store's login function already shows an error toast.
      // You could set a form-specific error here if needed.
      setFormError("Invalid credentials. Please try again.");
    }
  };

  return {
    // State
    method,
    identifier,
    password,
    countryCode,
    showPassword,
    isLoading,
    formError,
    fieldErrors,
    // Setters & Handlers
    setIdentifier,
    setPassword,
    setCountryCode,
    setShowPassword,
    handleMethodChange,
    handleSubmit,
  };
}
