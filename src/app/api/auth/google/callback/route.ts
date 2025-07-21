// src/app/api/auth/google/callback/route.ts

/**
 * Google OAuth2 Callback Route
 * ----------------------------
 * Handles Google login: exchanges code, fetches user, creates user/session, then redirects.
 * Ultra explicit steps + error handling. Easy to maintain, extend, or debug.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createSession } from "@/lib/auth/session"; // Handles session logic (set cookies, etc.)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    // No code? Bounce back to login w/ error
    return NextResponse.redirect(
      new URL("/login?error=GoogleCallbackError", request.url)
    );
  }

  try {
    // --- 1. Exchange code for Google access token ---
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.BETTER_AUTH_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenResponse.json();
    if (tokens.error) throw new Error(tokens.error_description);

    // --- 2. Fetch Google user profile ---
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );
    const googleUser = await userResponse.json();
    const email = googleUser.email?.toLowerCase();

    // --- 3. Find or create user in your DB ---
    let dbUser = (
      await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1)
    )[0];

    if (!dbUser) {
      // Create new user if not found
      dbUser = (
        await db
          .insert(schema.users)
          .values({
            id: nanoid(),
            email,
            name: googleUser.name ?? "New User",
            image: googleUser.picture,
            emailVerified: true,
            lastLogin: new Date(),
          })
          .returning()
      )[0];
    }

    // --- 4. Link Google account if not already linked ---
    const existingAccount = (
      await db
        .select()
        .from(schema.accounts)
        .where(
          and(
            eq(schema.accounts.providerId, "google"),
            eq(schema.accounts.accountId, googleUser.id)
          )
        )
        .limit(1)
    )[0];

    if (!existingAccount) {
      await db.insert(schema.accounts).values({
        id: nanoid(),
        userId: dbUser.id,
        providerId: "google",
        accountId: googleUser.id,
      });
    }

    // --- 5. Create session (cookie, etc) ---
    await createSession(dbUser.id);

    // --- 6. Redirect to homepage (user is logged in) ---
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Manual Google Callback Error:", error);
    // Send user back to login with a generic error
    return NextResponse.redirect(
      new URL("/login?error=AuthenticationFailed", request.url)
    );
  }
}
