// src/app/api/auth/verify-otp/route.ts

/**
 * Verify OTP API Route
 * --------------------
 * POST: Checks a one-time password (OTP) for given identifier (email/phone).
 * - Only looks for the latest, unverified OTP (prevents replay)
 * - Compares code (plaintext; hash in prod!)
 * - Returns verificationToken if valid (used in registration step)
 */

import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { otps } from "@/db/schema/core";
import { AppError, handleError } from "@/lib/error-handler";
import { z } from "zod";
import { withApiAuth } from "@/lib/api-utils";

// --- Zod schema: what must be in the body ---
const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
  identifier: z.string().min(1, "Identifier is required."),
});

async function handler(request: NextRequest) {
  try {
    // --- 1. Validate incoming data (zod) ---
    const body = await request.json();
    const validationResult = verifyOtpSchema.safeParse(body);
    if (!validationResult.success) {
      throw new AppError(validationResult.error.issues[0].message, 400);
    }
    const { otp: code, identifier } = validationResult.data;

    // --- 2. Find latest unverified OTP for this identifier ---
    const result = await db.query.otps.findFirst({
      where: and(eq(otps.identifier, identifier), eq(otps.verified, false)),
      orderBy: [desc(otps.createdAt)],
    });

    // --- 3. Check OTP matches (in prod: use hash) ---
    //   Note: In a real app, store hash, use bcrypt.compare(code, result.otp)
    if (!result || result.otp !== code) {
      throw new AppError("The OTP you entered is incorrect.", 400);
    }
    if (new Date(result.expiresAt) < new Date()) {
      throw new AppError(
        "This OTP has expired. Please request a new one.",
        400
      );
    }

    // --- 4. Return the verificationId (used for registration step) ---
    //   OTP is only marked 'verified' after full registration, not here.
    return NextResponse.json({ verificationToken: result.verificationId });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = withApiAuth(handler);
