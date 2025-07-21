// src\app\api\auth\login\route.ts

/**
 * Login API Route
 * ---------------
 * POST: Handles user login by email/phone + password.
 * Features:
 *   - IP-based login logging
 *   - Lockout on too many failed attempts
 *   - Password validation (bcrypt)
 *   - User session creation (DB + cookie)
 *   - Only returns sanitized user object
 */

import { NextResponse } from "next/server";
import { getLoginSchema } from "@/lib/validation";
import { createSession } from "@/lib/auth/session";
import { db } from "@/db";
import { eq, or } from "drizzle-orm";
import { users as userTable, loginHistories } from "@/db/schema/core";
import { AppError, handleError } from "@/lib/error-handler";
import type { User, NewLoginHistory } from "@/types/db";
import bcrypt from "bcryptjs";
import { sanitizeUser } from "@/lib/auth";
import { withApiAuth } from "@/lib/api-utils";

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION = 10 * 60 * 1000; // 10 min in ms

async function handler(request: Request) {
  try {
    // --- 1. Get User IP for rate limiting/logging ---
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1"; // fallback if missing

    // --- 2. Parse & validate input ---
    const body = await request.json();
    const { method, identifier, password } = body;
    const result = getLoginSchema(method).safeParse({ identifier, password });

    if (!result.success) {
      throw new AppError(result.error.issues[0].message, 400);
    }
    const { identifier: loginIdentifier } = result.data;

    // --- 3. Find user by email or phone ---
    const foundUser: User | undefined = await db.query.users.findFirst({
      where: or(
        eq(userTable.email, loginIdentifier),
        eq(userTable.phone, loginIdentifier)
      ),
    });

    if (!foundUser || !foundUser.password) {
      throw new AppError("Invalid credentials", 400);
    }

    // --- 4. Check lockout (too many failed attempts) ---
    if (foundUser.lockedUntil && new Date(foundUser.lockedUntil) > new Date()) {
      const lockedUntilTime = new Date(
        foundUser.lockedUntil
      ).toLocaleTimeString();
      throw new AppError(
        `Account is locked due to too many failed attempts. Please try again after ${lockedUntilTime}.`,
        403
      );
    }

    // --- 5. Check password hash (bcrypt) ---
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      // Update failed attempt count + lockout if over limit
      const failedAttempts = (foundUser.failedAttempts || 0) + 1;
      const isLocked = failedAttempts >= MAX_FAILED_ATTEMPTS;

      await db
        .update(userTable)
        .set({
          failedAttempts,
          lockedUntil: isLocked
            ? new Date(Date.now() + LOCKOUT_DURATION)
            : null,
        })
        .where(eq(userTable.id, foundUser.id));

      const errorMessage = isLocked
        ? `Too many failed attempts. Your account has been temporarily locked for ${
            LOCKOUT_DURATION / 60000
          } minutes.`
        : "Invalid credentials. Please check your email/phone and password.";
      throw new AppError(errorMessage, 401);
    }

    // --- 6. Success! Reset lockout & update last login ---
    await db
      .update(userTable)
      .set({
        lastLogin: new Date(),
        failedAttempts: 0,
        lockedUntil: null,
      })
      .where(eq(userTable.id, foundUser.id));

    // --- 7. Create user session (DB + cookie/etc) ---
    await createSession(foundUser.id);

    // --- 8. Log the login event (for security/audit) ---
    const newLogin: NewLoginHistory = {
      userId: foundUser.id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") ?? null,
      country: request.headers.get("x-vercel-ip-country") ?? null, // if available
      createdAt: new Date(),
    };
    await db.insert(loginHistories).values(newLogin);

    // --- 9. Return only sanitized user object ---
    const safeUserData = sanitizeUser(foundUser);
    return NextResponse.json({ user: safeUserData });
  } catch (error) {
    return handleError(error);
  }
}

// POST only, protected by API auth middleware
export const POST = withApiAuth(handler);
