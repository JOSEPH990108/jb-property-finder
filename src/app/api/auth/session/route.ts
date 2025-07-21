// src/app/api/auth/session/route.ts

/**
 * Session Check API Route
 * -----------------------
 * GET: Returns the current logged-in user (from session/cookie), or null if unauthenticated.
 * - Always returns { user: User | null }
 * - Uses centralized error handling for consistent errors.
 */

import { getSession } from "@/lib/auth/session";
import { sanitizeUser } from "@/lib/auth/index";
import { NextResponse } from "next/server";
import { handleError } from "@/lib/error-handler";

export async function GET() {
  try {
    // --- 1. Try to fetch the user's session (cookie, etc) ---
    const session = await getSession();

    // --- 2. No session? User not authenticated ---
    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // --- 3. Return only safe/sanitized user data ---
    const safeUser = sanitizeUser(session.user);
    return NextResponse.json({ user: safeUser });
  } catch (err) {
    // Centralized error handling for any thrown issues
    return handleError(err);
  }
}
