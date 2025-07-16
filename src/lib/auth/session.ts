// app/lib/auth/session.ts
"use server";

import { cookies } from "next/headers";
import { createAuthClient } from "better-auth/client";
import { nanoid } from "nanoid";
import { eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema/core";
import type { User, NewLoginHistory } from "@/types/db";
export const createSession = async (userId: string) => {
  try {
    const sessionId = nanoid(); // unique DB id
    const sessionToken = nanoid(); // used in cookie
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

export const getSession = async () => {
  try {
    // 1. Check for the VIP Pass from better-auth (Door #2)
    const authClient = createAuthClient();
    const betterAuthSession = await authClient.getSession();
    const sessionData = betterAuthSession?.data;

    if (sessionData?.user) {
      return {
        source: "oauth" as const,
        user: sessionData.user as User,
      };
    }

    // 2. If no VIP pass, check for your own session cookie (Door #1)
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

// Optional: Clean up expired sessions (can be run periodically or in a job)
export const cleanExpiredSessions = async () => {
  try {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  } catch (err) {
    console.error("Failed to clean expired sessions:", err);
  }
};
