// src/lib/auth/session.ts
"use server";

/**
 * Session Management Utils
 * ------------------------
 * Handles session creation, retrieval, and cleanup for both credentials and social logins.
 * - Creates HTTP-only cookie for user session
 * - Checks both custom cookie & better-auth (social/OAuth)
 * - Cleans up expired sessions in DB
 */

import { cookies } from "next/headers";
import { createAuthClient } from "better-auth/client";
import { nanoid } from "nanoid";
import { eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema/core";
import type { User } from "@/types/db";

/**
 * Creates a new session for a user.
 * - Stores token in DB
 * - Sets HTTP-only session cookie (7 days)
 */
export const createSession = async (userId: string) => {
  try {
    const sessionId = nanoid(); // unique DB id
    const sessionToken = nanoid(); // cookie value
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessions).values({
      id: sessionId,
      token: sessionToken,
      userId,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (await cookies()).set({
      name: "session",
      value: sessionToken,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      expires: expiresAt,
    });
  } catch (err) {
    console.error("Failed to create session:", err);
    throw new Error("Session creation failed");
  }
};

/**
 * Gets current session for user, supports:
 * - better-auth (OAuth/social): checked first
 * - custom cookie (credentials): checked next
 * Returns: { source: "oauth" | "credentials", user }
 */
export const getSession = async () => {
  try {
    // 1. VIP pass: better-auth social session (OAuth)
    const authClient = createAuthClient();
    const betterAuthSession = await authClient.getSession();
    const sessionData = betterAuthSession?.data;

    if (sessionData?.user) {
      return {
        source: "oauth" as const,
        user: sessionData.user as User,
      };
    }

    // 2. Custom session cookie (credentials login)
    const token = (await cookies()).get("session")?.value;
    if (!token) return null;

    const result = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
      with: { user: true },
    });

    if (!result || new Date(result.expiresAt) < new Date()) {
      return null;
    }

    return {
      source: "credentials" as const,
      user: result.user as User,
    };
  } catch (err) {
    console.error("Failed to get session:", err);
    return null;
  }
};

/**
 * Deletes the current session (credentials).
 * - Removes from DB and deletes cookie
 */
export const deleteSession = async () => {
  try {
    const token = (await cookies()).get("session")?.value;
    if (!token) return;

    await db.delete(sessions).where(eq(sessions.token, token));
    (await cookies()).delete("session");
  } catch (err) {
    console.error("Failed to delete session:", err);
  }
};

/**
 * Cleans up expired sessions from the DB.
 * - Call periodically as a job/task (not required on every request)
 */
export const cleanExpiredSessions = async () => {
  try {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  } catch (err) {
    console.error("Failed to clean expired sessions:", err);
  }
};
