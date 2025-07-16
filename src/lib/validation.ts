// lib/validation.ts
import { z, ZodError } from "zod";
import { validateMobileByCountry } from "./utils";
import { AuthMethod } from "@/types/property";

// Schemas
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be under 50 characters");

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format");

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");

export const loginPasswordSchema = z.string().min(1, "Password is required");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export const confirmPasswordSchema = z
  .string()
  .min(1, "Confirm Password is required");

export const getIdentifierSchema = (method: AuthMethod) => {
  return method === "email" ? emailSchema : phoneSchema;
};

export const getLoginSchema = (method: "email" | "phone") =>
  z.object({
    identifier: method === "email" ? emailSchema : phoneSchema,
    password: loginPasswordSchema,
  });

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

// 🔧 Helper to extract first error per field
export const extractFieldErrors = (error: ZodError) => {
  const { fieldErrors } = error.flatten();
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, val]) => [key, val?.[0]])
  );
};
