// src\lib\auth\index.ts
import type { User as DbUser } from "@/types/db";
import { randomInt } from "crypto";

export { auth } from "./providers";

export { createVerificationToken, verifyToken } from "./jwt";

export const generateOtp = (length = 6): string => {
  // Ensure length is a positive number to avoid errors.
  if (length <= 0) {
    throw new Error("OTP length must be a positive number.");
  }
  // Calculate the minimum and maximum values for the given length.
  // e.g., for length 6, min is 100000 and max is 999999.
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  // Generate a secure random integer within the range.
  const otpInt = randomInt(min, max + 1);

  // Pad with leading zeros if necessary (though randomInt should handle the range correctly).
  return otpInt.toString().padStart(length, "0");
};

export interface SafeUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  isAgent: boolean;
}

/**
 * @description Takes a full user object from the database and returns a "sanitized" version,
 * safe to be sent to the client. This prevents sensitive data like password hashes,
 * lockout details, or verification statuses from being exposed.
 *
 * @param user - The full user object, likely from a database query.
 * @returns A new object containing only the fields safe for public exposure.
 */
export function sanitizeUser(user: DbUser): SafeUser {
  // Explicitly pick only the fields that are safe to expose.
  // This is safer than deleting fields, as you can't accidentally forget one.
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
    isAgent: user.isAgent,
  };
}
