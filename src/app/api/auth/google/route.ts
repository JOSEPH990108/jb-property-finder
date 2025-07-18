// src\app\api\auth\google\route.ts
import { NextResponse } from "next/server";

// This route constructs the Google sign-in URL and redirects the user.
export function GET() {
  const baseURL = "https://accounts.google.com/o/oauth2/v2/auth";

  const options = {
    redirect_uri: `${process.env.BETTER_AUTH_URL}/api/auth/google/callback`,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const url = `${baseURL}?${new URLSearchParams(options)}`;

  return NextResponse.redirect(url);
}
