// src\app\api\auth\send-otp\route.ts

/**
 * Send OTP API Route
 * ------------------
 * POST: Generates & stores a one-time password (OTP) for register/login.
 * - Validates identifier (email/phone)
 * - Checks for duplicates (on REGISTER)
 * - Saves OTP in DB (plain for demo—hash for prod)
 * - Sends code via email/SMS/etc.
 * - Returns verificationId for next-step validation
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otps, users } from "@/db/schema/core";
import { nanoid } from "nanoid";
import { generateOtp } from "@/lib/auth";
import { getIdentifierSchema } from "@/lib/validation";
import { AppError, handleError } from "@/lib/error-handler";
import { sendOtpCode } from "@/lib/otp-service";
import { AuthMethod } from "@/types/main";
import { eq, or } from "drizzle-orm";
import { withApiAuth } from "@/lib/api-utils";

async function handler(req: NextRequest) {
  try {
    // --- 1. Parse and validate request body ---
    const body = await req.json();
    const {
      identifier,
      method,
      type = "REGISTER", // "REGISTER" or "LOGIN"
    }: {
      identifier: string;
      method: AuthMethod;
      type: "REGISTER" | "LOGIN";
    } = body;

    if (!identifier || !method) {
      throw new AppError("Missing identifier or method", 400);
    }

    const identifierSchema = getIdentifierSchema(method);
    const validationResult = identifierSchema.safeParse(identifier);
    if (!validationResult.success) {
      throw new AppError("Invalid identifier format.", 400);
    }
    const validIdentifier = validationResult.data;

    // --- 2. On registration: check for duplicate user ---
    if (type === "REGISTER") {
      const existingUser = await db.query.users.findFirst({
        where: or(
          eq(users.email, validIdentifier),
          eq(users.phone, validIdentifier)
        ),
      });
      if (existingUser) {
        throw new AppError(
          `An account with this ${method} already exists. Please login.`,
          409
        );
      }
    }

    // --- 3. Generate and store OTP in DB ---
    const otpCode = generateOtp();
    const verificationId = nanoid();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    await db.insert(otps).values({
      id: nanoid(),
      verificationId,
      identifier: validIdentifier,
      otp: otpCode, // For real apps: hash this for security!
      method,
      type,
      expiresAt,
    });

    // --- 4. Send the OTP via email/SMS/etc. ---
    await sendOtpCode({ identifier: validIdentifier, otp: otpCode, method });

    // --- 5. (Debug only) Log OTP in console ---
    console.log(`[DEBUG] OTP for ${validIdentifier}: ${otpCode}`);

    // --- 6. Respond with verificationId for next step ---
    return NextResponse.json({ verificationId });
  } catch (error) {
    return handleError(error);
  }
}

// Only POST supported, protected by API auth wrapper
export const POST = withApiAuth(handler);
