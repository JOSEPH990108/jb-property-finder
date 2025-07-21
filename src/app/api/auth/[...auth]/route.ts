// src/app/api/auth/[...auth]/route.ts

/**
 * Dynamic Auth API Route
 * ----------------------
 * Proxies all GET/POST auth requests to the custom auth handler.
 * Useful for custom sign-in, callback, etc. (e.g., NextAuth / Clerk / custom providers)
 * Logs every request for easier debugging.
 */

import { auth } from "@/lib/auth/providers";

// Handle all GET requests (e.g., sign-in, sign-out, callback)
export const GET = (req: Request) => {
  console.log("✅ BetterAuth GET called:", req.url);
  return auth.handler(req);
};

// Handle all POST requests (e.g., credential login, callbacks)
export const POST = (req: Request) => {
  console.log("✅ BetterAuth POST called:", req.url);
  return auth.handler(req);
};
