// app/lib/auth/jwt.ts
// JWT Utilities

import { SignJWT, jwtVerify } from "jose";
import { AuthMethod } from "@/types/main";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface JwtPayload {
  verificationId: string;
  identifier: string;
  method: AuthMethod;
  [key: string]: any;
}

export const createVerificationToken = async (
  payload: JwtPayload,
  expiresIn = "15m"
) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
};
