// src/lib/auth/index.ts

import type { User as DbUser } from "@/types/db";
import { randomInt } from "crypto";

// --- Auth Providers (handles all strategies) ---
export { auth } from "./providers";

// --- JWT verification helpers ---
export { createVerificationToken, verifyToken } from "./jwt";

/**
 * Generates a secure random OTP (default 6 digits).
 * - Always returns a string of fixed length (padded if needed)
 * - Uses Node.js crypto for security
 */
export const generateOtp = (length = 6): string => {
  if (length <= 0) {
    throw new Error("OTP length must be a positive number.");
  }
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  const otpInt = randomInt(min, max + 1);
  return otpInt.toString().padStart(length, "0");
};

/**
 * SafeUser type: Fields allowed to be sent to client.
 * DO NOT expose anything sensitive!
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  isAgent: boolean;
}

/**
 * Sanitizes a user object for safe client use.
 * - Only picks public fields (never password, lockout, or system fields)
 * - Use this everywhere before returning user data from API!
 *
 * @param user Full database user object
 * @returns SafeUser (public shape)
 */
export function sanitizeUser(user: DbUser): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
    isAgent: user.isAgent,
  };
}
