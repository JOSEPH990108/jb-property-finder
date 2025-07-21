// src/lib/auth/jwt.ts

/**
 * JWT Utilities
 * -------------
 * Used for secure, short-lived verification tokens (e.g., OTP, email, etc).
 * Uses `jose` for robust JWT handling.
 */

import { SignJWT, jwtVerify } from "jose";
import { AuthMethod } from "@/types/main";

// --- Secret for signing/verifying (MUST be set in env) ---
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// --- JWT payload shape for verification tokens ---
export interface JwtPayload {
  verificationId: string;
  identifier: string;
  method: AuthMethod;
  [key: string]: any; // Support for extra claims
}

/**
 * Creates a signed verification JWT with payload and expiry.
 * - Default: 15m expiry (short-lived!)
 * - Alg: HS256 (symmetric)
 */
export const createVerificationToken = async (
  payload: JwtPayload,
  expiresIn = "15m"
) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
};

/**
 * Verifies a JWT token and returns payload if valid, or null if invalid/expired.
 * Always returns null (never throws) for easy use in API routes.
 */
export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
};
