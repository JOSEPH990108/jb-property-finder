// src\app\api\auth\check-user-exists\route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, or } from "drizzle-orm";
import { users } from "@/db/schema/core";
import { z } from "zod";
import { AppError, handleError } from "@/lib/error-handler";
import { withApiAuth } from "@/lib/api-utils";

// Define a simple schema for input validation
const checkUserSchema = z.object({
  identifier: z.string().min(3, "Identifier is too short."),
});

async function handler(request: NextRequest) {
  try {
    // 1. Validate the request body
    const body = await request.json();
    const validationResult = checkUserSchema.safeParse(body);

    if (!validationResult.success) {
      throw new AppError(validationResult.error.issues[0].message, 400);
    }
    const { identifier } = validationResult.data;

    // 2. Query the database for the user
    const foundUser = await db.query.users.findFirst({
      where: or(eq(users.email, identifier), eq(users.phone, identifier)),
      columns: {
        id: true, // Only select the 'id' column for efficiency
      },
    });

    // 3. Return whether the user exists
    return NextResponse.json({ exists: !!foundUser });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = withApiAuth(handler);
