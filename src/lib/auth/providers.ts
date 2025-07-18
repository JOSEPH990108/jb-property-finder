// src\lib\auth\providers.ts
import { betterAuth } from "better-auth";

// This file is now simplified. Its only purpose is to hold your
// provider credentials. All logic is handled manually.
export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
