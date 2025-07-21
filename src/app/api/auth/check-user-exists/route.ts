// src/app/api/auth/check-user-exists/route.ts

/**
 * check-user-exists API Route
 * ---------------------------
 * POST: Checks if a user exists by email or phone.
 * Used for signup flows, login hints, and pre-validation.
 * Protects with API auth and input validation (zod).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, or } from "drizzle-orm";
import { users } from "@/db/schema/core";
import { z } from "zod";
import { AppError, handleError } from "@/lib/error-handler";
import { withApiAuth } from "@/lib/api-utils";

// --- Input Validation Schema ---
const checkUserSchema = z.object({
  identifier: z.string().min(3, "Identifier is too short."),
});

async function handler(request: NextRequest) {
  try {
    // --- 1. Validate incoming body ---
    const body = await request.json();
    const validationResult = checkUserSchema.safeParse(body);

    if (!validationResult.success) {
      // Zod validation failed: return first error message
      throw new AppError(validationResult.error.issues[0].message, 400);
    }
    const { identifier } = validationResult.data;

    // --- 2. Check DB for user by email OR phone ---
    const foundUser = await db.query.users.findFirst({
      where: or(eq(users.email, identifier), eq(users.phone, identifier)),
      columns: {
        id: true, // Only select the 'id' for speed/privacy
      },
    });

    // --- 3. Respond with existence flag ---
    return NextResponse.json({ exists: !!foundUser });
  } catch (error) {
    // Handles AppError or unknowns (logs, formats, etc.)
    return handleError(error);
  }
}

// --- Only allow POST, with API auth wrapper ---
export const POST = withApiAuth(handler);
