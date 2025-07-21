// src/lib/auth/providers.ts

import { betterAuth } from "better-auth";

/**
 * Auth Provider Config
 * -------------------
 * - Only responsible for holding your social provider credentials (env only!).
 * - All logic (sign-in, callbacks, session) is handled manually in your API routes.
 *
 * To add more providers: just extend the `socialProviders` object below.
 */
export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    // Example for more providers:
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // },
  },
});
