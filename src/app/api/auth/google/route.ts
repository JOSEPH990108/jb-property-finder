// src/app/api/auth/google/route.ts

/**
 * Google OAuth Start Route
 * ------------------------
 * Redirects the user to Google's consent page to start OAuth2 flow.
 * Builds URL with all required scopes and options.
 * When done, Google will redirect to /api/auth/google/callback.
 */

import { NextResponse } from "next/server";

export function GET() {
  const baseURL = "https://accounts.google.com/o/oauth2/v2/auth";

  // All params Google needs for login + consent
  const options = {
    redirect_uri: `${process.env.BETTER_AUTH_URL}/api/auth/google/callback`,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    access_type: "offline",
    response_type: "code",
    prompt: "consent", // Always ask user to pick account
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  // Build full Google sign-in URL
  const url = `${baseURL}?${new URLSearchParams(options)}`;

  // Redirect user to Google
  return NextResponse.redirect(url);
}
