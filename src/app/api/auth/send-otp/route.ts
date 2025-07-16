// app/api/auth/send-otp/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otps, users } from "@/db/schema/core";
import { nanoid } from "nanoid";
import { generateOtp } from "@/lib/auth";
import { getIdentifierSchema } from "@/lib/validation";
import { AppError, handleError } from "@/lib/error-handler";
import { sendOtpCode } from "@/lib/otp-service";
import { AuthMethod } from "@/types/property";
import { eq, or } from "drizzle-orm";
import { withApiAuth } from "@/lib/api-utils";

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      identifier,
      method,
      type = "REGISTER",
    }: {
      identifier: string;
      method: AuthMethod;
      type: "REGISTER" | "LOGIN";
    } = body;

    // 1. Validate input
    if (!identifier || !method) {
      throw new AppError("Missing identifier or method", 400);
    }
    const identifierSchema = getIdentifierSchema(method);
    const validationResult = identifierSchema.safeParse(identifier);
    if (!validationResult.success) {
      throw new AppError("Invalid identifier format.", 400);
    }
    const validIdentifier = validationResult.data;

    // 3. For registration, check if user already exists
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
        ); // 409 Conflict
      }
    }

    const otpCode = generateOtp();
    const verificationId = nanoid();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // 4. Store OTP in DB and send it
    await db.insert(otps).values({
      id: nanoid(),
      verificationId,
      identifier: validIdentifier,
      otp: otpCode, // In a real app, this should be hashed: await bcrypt.hash(otpCode, 10)
      method,
      type,
      expiresAt,
    });

    await sendOtpCode({ identifier: validIdentifier, otp: otpCode, method });

    console.log(`[DEBUG] OTP for ${validIdentifier}: ${otpCode}`);

    return NextResponse.json({ verificationId });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = withApiAuth(handler);