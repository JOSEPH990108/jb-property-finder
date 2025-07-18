// src\app\api\auth\password-reset\route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { passwordSchema } from "@/lib/validation";
import { AppError, handleError } from "@/lib/error-handler";
import { db } from "@/db";
import { eq, and, gt } from "drizzle-orm";
import { users, passwordResetTokens } from "@/db/schema/core";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    // 1. Validate password
    const validation = passwordSchema.safeParse(newPassword);
    if (!validation.success) {
      throw new AppError(validation.error.issues[0].message, 400);
    }

    // 2. Find the reset token
    const tokens = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date()),
          eq(passwordResetTokens.used, false)
        )
      )
      .limit(1);

    const resetToken = tokens[0];
    if (!resetToken) {
      throw new AppError("Invalid or expired token", 400);
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update user password and mark token as used (transaction)
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, resetToken.userId));

      await tx
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, resetToken.id));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
