// src/lib/api-utils.ts

/**
 * API Route Utils
 * ---------------
 * Exports a HOC for Next.js API routes:
 * - Rate limits per IP (using global ratelimit helper)
 * - Centralizes error handling (so all responses are consistent)
 * - Easy to wrap any handler, returns NextResponse
 */

import { NextRequest, NextResponse } from "next/server";
import { ratelimit } from "./rate-limit";
import { AppError, handleError } from "./error-handler";

/**
 * Type for any API handler:
 * - Accepts (NextRequest, ...args)
 * - Returns Promise<NextResponse>
 */
type ApiHandler = (
  request: NextRequest,
  ...args: any[]
) => Promise<NextResponse>;

/**
 * Wraps your API handler with:
 * 1. IP-based rate limiting (429 with message if exceeded)
 * 2. Central error handler (catches everything, never exposes stack traces)
 * 3. Returns real HTTP codes (not just 200 + error in JSON)
 *
 * Usage:
 *   export const POST = withApiAuth(handler)
 */
export function withApiAuth(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // --- 1. Determine request IP (proxy safe) ---
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "127.0.0.1"; // fallback for local/dev

      // --- 2. Rate limit using IP ---
      const { success, limit, remaining, reset } = await ratelimit.limit(ip);

      if (!success) {
        const now = Date.now();
        const resetDate = new Date(reset);
        const retryAfter = Math.ceil((resetDate.getTime() - now) / 1000);

        // Optionally add Retry-After header for clients/bots
        console.warn(
          `🚨 Rate limit exceeded for IP: ${ip}. Remaining: ${remaining}. Retry after ${retryAfter}s.`
        );

        throw new AppError(
          "Too many requests. Please try again in a moment.",
          429
        );
      }

      // --- 3. Handler runs only if allowed ---
      return await handler(request, ...args);
    } catch (error) {
      // Central error handler: never leaks sensitive info!
      return handleError(error);
    }
  };
}
