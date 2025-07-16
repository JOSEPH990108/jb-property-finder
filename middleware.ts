// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  try {
    const session = await getSession();

    if (session && session.user) {
      // If a valid session exists, pass user data to server components via headers.
      // This is a common pattern for accessing user data in layouts and pages.
      requestHeaders.set("x-user-id", session.user.id);
      requestHeaders.set("x-user-email", session.user.email ?? "");
      requestHeaders.set("x-user-name", session.user.name ?? "");
      requestHeaders.set("x-user-phone", (session.user as any).phone ?? ""); // Cast if phone is not on base type
      requestHeaders.set(
        "x-user-agent",
        (session.user as any).isAgent ? "true" : "false"
      );
    }
  } catch (error) {
    // If getSession() fails, log the error but allow the request to proceed
    // without user data. This prevents a single point of failure.
    console.error("Middleware session error:", error);
  }

  // Create the response with the potentially modified headers.
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Security headers
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none';"
  );

  return response;
}

export const config = {
  matcher: "/:path*",
};
