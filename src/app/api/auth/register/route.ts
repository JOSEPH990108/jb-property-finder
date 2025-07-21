// src\app\api\auth\register\route.ts

/**
 * Register API Route
 * ------------------
 * POST: Registers a new user (email or phone), after OTP verification.
 * - Validates input and OTP
 * - Checks for duplicate users
 * - Hashes password
 * - Creates user and marks OTP as used (transactional)
 * - Logs registration as loginHistory
 * - Starts session (cookie)
 * - Returns sanitized user object
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { loginHistories, otps, users } from "@/db/schema/core";
import { nanoid } from "nanoid";
import { registerSchema } from "@/lib/validation";
import { AppError } from "@/lib/error-handler";
import { createSession } from "@/lib/auth/session";
import { sanitizeUser } from "@/lib/auth/index";
import { withApiAuth } from "@/lib/api-utils";
import bcrypt from "bcryptjs";

async function handler(request: NextRequest) {
  // --- 1. Extract IP and parse input ---
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";
  const body = await request.json();
  const data = registerSchema.parse(body);

  // --- 2. Run registration logic in a DB transaction ---
  const result = await db.transaction(async (tx) => {
    // --- 2a. Find & validate OTP token ---
    const foundOtp = await tx.query.otps.findFirst({
      where: eq(otps.verificationId, data.verificationToken),
    });

    if (
      !foundOtp ||
      foundOtp.verified ||
      new Date(foundOtp.expiresAt) < new Date()
    ) {
      throw new AppError("Invalid or expired verification token.", 400);
    }
    if (data.identifier !== foundOtp.identifier) {
      throw new AppError("Verification token mismatch.", 400);
    }

    // --- 2b. Ensure user is not already registered ---
    const existingUser = await tx.query.users.findFirst({
      where: eq(
        data.method === "email" ? users.email : users.phone,
        foundOtp.identifier
      ),
    });
    if (existingUser) {
      throw new AppError(
        `${data.method === "email" ? "Email" : "Phone"} is already registered.`,
        409
      );
    }

    // --- 2c. Hash password and create new user ---
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [newUser] = await tx
      .insert(users)
      .values({
        id: nanoid(),
        name: data.name,
        password: hashedPassword,
        email: data.method === "email" ? foundOtp.identifier : null,
        phone: data.method === "phone" ? foundOtp.identifier : null,
        emailVerified: data.method === "email",
        phoneVerified: data.method === "phone",
        lastLogin: new Date(),
      })
      .returning();
    if (!newUser) throw new AppError("Failed to create user.", 500);

    // --- 2d. Mark OTP as used ---
    await tx
      .update(otps)
      .set({ verified: true })
      .where(eq(otps.verificationId, data.verificationToken));

    // --- 2e. Log this registration/login event ---
    await tx.insert(loginHistories).values({
      userId: newUser.id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") ?? "unknown",
      country: request.headers.get("x-vercel-ip-country") ?? "unknown",
    });

    return newUser;
  });

  // --- 3. Start session & return sanitized user object ---
  await createSession(result.id);
  const safeUser = sanitizeUser(result);
  return NextResponse.json({ user: safeUser });
}

// Only POST supported, with API auth wrapper
export const POST = withApiAuth(handler);
