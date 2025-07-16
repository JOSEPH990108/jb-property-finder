import { NextRequest, NextResponse } from "next/server";
import { ratelimit } from "./rate-limit";
import { AppError, handleError } from "./error-handler";

/**
 * This is our custom type definition. It's not imported.
 * We are defining a "shape" for a function.
 * This shape says the function:
 * 1. Must accept a `NextRequest` object as its first argument.
 * 2. Can accept any other arguments after that (...args).
 * 3. Must return a Promise that resolves to a NextResponse.
 * This perfectly describes all of our Next.js API route handlers.
 */
type ApiHandler = (
  request: NextRequest,
  ...args: any[]
) => Promise<NextResponse>;

/**
 * @description A higher-order function to wrap API handlers with rate limiting and centralized error handling.
 * @param handler The API route handler function to wrap.
 * @returns A new handler function that includes rate limiting and error handling.
 */
export function withApiAuth(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // --- Rate Limiting ---
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "127.0.0.1"; // fallback
      const { success, limit, remaining, reset } = await ratelimit.limit(ip);

      if (!success) {
        const now = Date.now();
        const resetDate = new Date(reset);
        const retryAfter = Math.ceil((resetDate.getTime() - now) / 1000);

        // You can add a 'Retry-After' header to be more compliant with HTTP specs
        console.warn(
          `Rate limit exceeded for IP: ${ip}. Remaining: ${remaining}. Retrying after ${retryAfter}s.`
        );

        throw new AppError(
          "Too many requests. Please try again in a moment.",
          429
        );
      }

      // If rate limit check passes, execute the original handler
      return await handler(request, ...args);
    } catch (error) {
      // Use the centralized error handler for any exception
      return handleError(error);
    }
  };
}
