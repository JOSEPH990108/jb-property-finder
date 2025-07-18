/// db/schema/core.ts
/// Core shared tables (users, accounts, sessions)
import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  boolean,
  uniqueIndex,
  serial,
} from "drizzle-orm/pg-core";
import { otpTypeEnum } from "./_enums";

// User and authentication models
export const users = pgTable("users", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phone: text("phone").unique(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  password: text("password"),
  image: text("image"),
  isAgent: boolean("is_agent").default(false).notNull(),
  lastLogin: timestamp("last_login", { mode: "date" }),
  failedAttempts: integer("failed_attempts").default(0),
  lockedUntil: timestamp("locked_until", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }), // Soft delete
});

export const accounts = pgTable("accounts", {
  id: text("id").notNull().primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    mode: "date",
  }),
  scope: text("scope"),
  password: text("password"), // This seems redundant if user.password exists, consider removing
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").notNull().primaryKey(),
  token: text("token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceId: text("device_id"),
  country: text("country"),
});

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: text("id").notNull().primaryKey(),
    token: text("token").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    used: boolean("used").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    tokenExpiresAtIndex: uniqueIndex().on(table.token, table.expiresAt),
  })
);

export const otps = pgTable(
  "otps",
  {
    id: text("id").notNull().primaryKey(),
    verificationId: text("verification_id").notNull().unique(),
    identifier: text("identifier").notNull(), // email or phone
    otp: text("otp").notNull(),
    method: text("method").notNull(), // 'email' or 'mobile'
    type: otpTypeEnum("type").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    verified: boolean("verified").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    identifierIndex: uniqueIndex().on(table.identifier),
  })
);

export const loginHistories = pgTable("login_histories", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  country: text("country"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").notNull().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }),
});
