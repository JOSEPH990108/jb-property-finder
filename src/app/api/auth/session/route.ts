// src\app\api\auth\session\route.ts

import { getSession } from "@/lib/auth/session";
import { sanitizeUser } from "@/lib/auth/index";
import { NextResponse } from "next/server";
import { handleError } from "@/lib/error-handler";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const safeUser = sanitizeUser(session.user);

    return NextResponse.json({ user: safeUser });
  } catch (err) {
    // Use the same centralized error handler for consistency
    return handleError(err);
  }
}
