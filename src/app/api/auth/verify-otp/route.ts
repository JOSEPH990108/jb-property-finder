// src\app\api\auth\verify-otp\route.ts

import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { otps } from "@/db/schema/core";
import { AppError, handleError } from "@/lib/error-handler";
import { z } from "zod";
import { withApiAuth } from "@/lib/api-utils";

// Schema for validating the incoming request body
const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
  identifier: z.string().min(1, "Identifier is required."),
});

async function handler(request: NextRequest) {
  try {
    // 2. Validate the request body
    const body = await request.json();
    const validationResult = verifyOtpSchema.safeParse(body);
    if (!validationResult.success) {
      throw new AppError(validationResult.error.issues[0].message, 400);
    }
    const { otp: code, identifier } = validationResult.data;

    // 3. Find the latest, unverified OTP for the given identifier
    const result = await db.query.otps.findFirst({
      where: and(
        eq(otps.identifier, identifier),
        eq(otps.verified, false) // Only look for unverified OTPs
      ),
      orderBy: [desc(otps.createdAt)], // Get the most recent one
    });

    // 4. Validate the found OTP
    // Note: For higher security, you would hash the incoming `code` and compare it to a hashed OTP in the DB.
    // e.g., const isMatch = await bcrypt.compare(code, result.otp);
    if (!result || result.otp !== code) {
      throw new AppError("The OTP you entered is incorrect.", 400);
    }

    if (new Date(result.expiresAt) < new Date()) {
      throw new AppError(
        "This OTP has expired. Please request a new one.",
        400
      );
    }

    // 5. Return the verificationId (which acts as a temporary token for the next step)
    // The OTP will be marked as 'verified' in the final registration step to ensure it's used.
    return NextResponse.json({ verificationToken: result.verificationId });
  } catch (error) {
    return handleError(error);
  }
}
export const POST = withApiAuth(handler);