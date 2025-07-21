// src/lib/error-handler.ts

import { NextResponse } from "next/server";

/**
 * AppError
 * --------
 * Custom error class for expected API errors.
 * Use this to throw known errors with specific status codes (400, 401, 404, etc).
 */
export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * handleError
 * -----------
 * Centralized error-to-response function for all API routes.
 * - Logs every error (dev/prod)
 * - Known (AppError): uses custom status & message
 * - Unknown errors: generic 500
 */
export function handleError(error: unknown) {
  // Always log for ops/dev debugging
  console.error(error);

  if (error instanceof AppError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 }
  );
}
