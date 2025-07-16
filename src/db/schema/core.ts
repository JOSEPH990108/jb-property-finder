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
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  phone: text("phone").unique(),
  phoneVerified: boolean("phoneVerified").default(false).notNull(),
  password: text("password"),
  image: text("image"),
  isAgent: boolean("isAgent").default(false).notNull(),
  lastLogin: timestamp("lastLogin", { mode: "date" }),
  failedAttempts: integer("failedAttempts").default(0),
  lockedUntil: timestamp("lockedUntil", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const accounts = pgTable("account", {
  id: text("id").notNull().primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { mode: "date" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const sessions = pgTable("session", {
  id: text("id").notNull().primaryKey(),
  token: text("token").notNull().unique(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  deviceId: text("deviceId"),
  country: text("country"),
});

export const passwordResetTokens = pgTable(
  "password_reset_token",
  {
    id: text("id").notNull().primaryKey(),
    token: text("token").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    used: boolean("used").default(false).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    tokenExpiresAtIndex: uniqueIndex().on(table.token, table.expiresAt),
  })
);

export const otps = pgTable(
  "otp",
  {
    id: text("id").notNull().primaryKey(),
    verificationId: text("verificationId").notNull().unique(),
    identifier: text("identifier").notNull(), // email or phone
    otp: text("otp").notNull(),
    method: text("method").notNull(), // 'email' or 'mobile'
    type: otpTypeEnum("type").notNull(),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    verified: boolean("verified").default(false).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    identifierIndex: uniqueIndex().on(table.identifier),
  })
);

export const loginHistories = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  country: text("country"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").notNull().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});
