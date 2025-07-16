// lib/auth/providers.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import {
  users as userTable,
  accounts as accountTable,
  sessions,
  verifications,
  loginHistories,
} from "@/db/schema/core";
import { eq, and } from "drizzle-orm";

// ✅ Import generated types
import type { User, Account, NewAccount, NewLoginHistory } from "@/types/db";

// Optional: define user type from social login
type SocialUser = Pick<User, "email" | "name"> & {
  id: string;
  image?: string | null;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema: {
      users: userTable,
      accounts: accountTable,
      sessions,
      verifications,
    },
    provider: "pg",
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  callbacks: {
    async signIn({
      user,
      account,
      request,
    }: {
      user: SocialUser;
      account: Pick<Account, "providerId" | "accountId"> & {
        provider: string;
        type: string;
        providerAccountId: string;
      };
      request: Request;
    }) {
      try {
        const ip = request?.headers.get("x-forwarded-for") ?? "unknown";
        const ua = request?.headers.get("user-agent") ?? "unknown";

        // Normalize email
        const email = user.email?.toLowerCase();
        if (!email) return false;

        // 🧠 Find existing user
        const existingUser = await db.query.users.findFirst({
          where: eq(userTable.email, email),
        });

        if (existingUser) {
          // 🔗 Check if already linked
          const existingAccount = await db.query.accounts.findFirst({
            where: and(
              eq(accountTable.providerId, account.provider),
              eq(accountTable.accountId, account.providerAccountId)
            ),
          });

          if (!existingAccount) {
            // ✅ Link account using type-safe insert
            const newAccount: NewAccount = {
              id: crypto.randomUUID(),
              providerId: account.provider,
              accountId: account.providerAccountId,
              userId: existingUser.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            await db.insert(accountTable).values(newAccount);
          }

          // ✅ Update user ID in case it's needed downstream
          user.id = existingUser.id;
        }

        // 🪵 Log login using typed value
        const newLogin: NewLoginHistory = {
          userId: user.id,
          ipAddress: ip,
          userAgent: ua,
          country: "", // Add geo-detection if needed
        };

        await db.insert(loginHistories).values(newLogin);

        return true;
      } catch (err) {
        console.error("❌ signIn callback error:", err);
        return false;
      }
    },
  },
});
