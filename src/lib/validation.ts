// src/lib/validation.ts

import { z, ZodError } from "zod";
import { AuthMethod } from "@/types/main";

// --- Schema definitions ---

/**
 * Name validation: 2-50 chars, only.
 */
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be under 50 characters");

/**
 * Email: required, must be valid format.
 */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format");

/**
 * Phone: required, E.164-like regex.
 */
export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");

/**
 * Password (login): required (no strength check)
 */
export const loginPasswordSchema = z.string().min(1, "Password is required");

/**
 * Password (register): strong password required
 * - 8+ chars, 1 uppercase, 1 number, 1 special char
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

/**
 * Confirm Password: required (matching checked in .refine below)
 */
export const confirmPasswordSchema = z
  .string()
  .min(1, "Confirm Password is required");

/**
 * Returns the right identifier validator based on method.
 */
export const getIdentifierSchema = (method: AuthMethod) => {
  return method === "email" ? emailSchema : phoneSchema;
};

/**
 * Login schema: identifier (email/phone), password.
 */
export const getLoginSchema = (method: "email" | "phone") =>
  z.object({
    identifier: method === "email" ? emailSchema : phoneSchema,
    password: loginPasswordSchema,
  });

/**
 * Registration schema:
 * - Name, identifier (email/phone), password, confirm, method, token.
 * - Passwords must match!
 */
export const registerSchema = z
  .object({
    name: nameSchema,
    identifier: z.union([emailSchema, phoneSchema]),
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    method: z.enum(["email", "phone"]),
    verificationToken: z.string().min(1, "Verification token is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * extractFieldErrors
 * ------------------
 * Given a ZodError, returns a { fieldName: firstErrorMessage } map.
 * Only the first error per field is included.
 */
export const extractFieldErrors = (error: ZodError) => {
  const { fieldErrors } = error.flatten();
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, val]) => [key, val?.[0]])
  );
};
