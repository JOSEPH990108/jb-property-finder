// app/api/auth/logout/route.ts

import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions as sessionTable } from "@/db/schema/core";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies(); // always call inside the function
  const sessionCookie = cookieStore.get("session");

  if (sessionCookie?.value) {
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.token, sessionCookie.value));
  }

  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.set("session", "", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
  });

  return response;
}
