// src\app\api\auth\logout\route.ts

/**
 * Logout API Route
 * ----------------
 * POST: Destroys the user's session both server-side (DB) and client-side (cookie).
 *  - Deletes session row in DB if session cookie is present.
 *  - Overwrites the cookie with an expired blank for hard logout.
 *  - Safe to call even if user is already logged out (idempotent).
 */

import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions as sessionTable } from "@/db/schema/core";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  // Always grab cookies in the route handler
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  // If user has a session, nuke it from DB
  if (sessionCookie?.value) {
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.token, sessionCookie.value));
  }

  // Build response & force-expire the session cookie
  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.set("session", "", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0), // Instantly expire
  });

  return response;
}
