// src\app\api\auth\google\callback\route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createSession } from "@/lib/auth/session"; // <-- IMPORT YOUR FUNCTION

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=GoogleCallbackError", request.url)
    );
  }

  try {
    // 1. Exchange the code for an access token
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

    // 2. Get the user's profile from Google
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );
    const googleUser = await userResponse.json();
    const email = googleUser.email?.toLowerCase();

    // 3. Find or create the user in your database
    const existingUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    let dbUser = existingUsers[0];

    if (!dbUser) {
      const newUsers = await db
        .insert(schema.users)
        .values({
          id: nanoid(), // Use nanoid to match your register route
          email,
          name: googleUser.name ?? "New User",
          image: googleUser.picture,
          emailVerified: true,
          lastLogin: new Date(),
        })
        .returning();
      dbUser = newUsers[0];
    }

    // 4. Link the Google account
    const existingAccounts = await db
      .select()
      .from(schema.accounts)
      .where(
        and(
          eq(schema.accounts.providerId, "google"),
          eq(schema.accounts.accountId, googleUser.id)
        )
      )
      .limit(1);
    if (!existingAccounts[0]) {
      await db.insert(schema.accounts).values({
        id: nanoid(),
        userId: dbUser.id,
        providerId: "google",
        accountId: googleUser.id,
      });
    }

    // 5. CRITICAL: Use your existing session creation logic
    await createSession(dbUser.id);

    // 6. Redirect to the homepage, session is now set
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Manual Google Callback Error:", error);
    return NextResponse.redirect(
      new URL("/login?error=AuthenticationFailed", request.url)
    );
  }
}
