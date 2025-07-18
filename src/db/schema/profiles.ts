/// db/schema/profiles.ts
/// User profile, preferences, and activity-related tables
import {
  timestamp,
  pgTable,
  text,
  serial,
  integer,
  decimal,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./core";
import { areas, propertyTypes } from "./properties";
import { layouts } from "./projects";
import { layoutInteractionTypeEnum } from "./_enums";

/**
 * Stores user-specific property preferences, maintaining a one-to-one
 * relationship with the users table.
 */
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique() // Ensures one preference set per user
    .references(() => users.id, { onDelete: "cascade" }),
  budgetMin: decimal("budget_min", { precision: 14, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 14, scale: 2 }),
  preferredSqftMin: integer("preferred_sqft_min"),
  preferredSqftMax: integer("preferred_sqft_max"),
  preferredBedroomsMin: integer("preferred_bedrooms_min"),
  preferredBedroomsMax: integer("preferred_bedrooms_max"),
  preferredBathroomsMin: integer("preferred_bathrooms_min"),
  preferredBathroomsMax: integer("preferred_bathrooms_max"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * Junction table for a user's preferred areas.
 * Application logic should enforce the limit of 3.
 */
export const userPreferredAreas = pgTable(
  "user_preferred_areas",
  {
    id: serial("id").primaryKey(),
    userPreferenceId: integer("user_preference_id")
      .notNull()
      .references(() => userPreferences.id, { onDelete: "cascade" }),
    areaId: integer("area_id")
      .notNull()
      .references(() => areas.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    unq: uniqueIndex().on(t.userPreferenceId, t.areaId),
  })
);

/**
 * Junction table for a user's preferred property types.
 * Application logic should enforce the limit of 3.
 */
export const userPreferredPropertyTypes = pgTable(
  "user_preferred_property_types",
  {
    id: serial("id").primaryKey(),
    userPreferenceId: integer("user_preference_id")
      .notNull()
      .references(() => userPreferences.id, { onDelete: "cascade" }),
    propertyTypeId: integer("property_type_id")
      .notNull()
      .references(() => propertyTypes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    unq: uniqueIndex().on(t.userPreferenceId, t.propertyTypeId),
  })
);

/**
 * Junction table for a user's favorite layouts, creating a many-to-many
 * relationship between users and layouts.
 */
export const favoriteLayouts = pgTable(
  "favorite_layouts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    layoutId: integer("layout_id")
      .notNull()
      .references(() => layouts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    unq: uniqueIndex().on(t.userId, t.layoutId),
  })
);

export const layoutInteractions = pgTable("layout_interactions", {
  id: serial("id").primaryKey(),
  layoutId: integer("layout_id")
    .notNull()
    .references(() => layouts.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }), // Nullable for anonymous users
  sessionId: text("session_id"), // To track anonymous user sessions
  eventType: layoutInteractionTypeEnum("event_type").notNull(), // 'CLICK' or 'VIEW'
  durationInSeconds: integer("duration_in_seconds"), // Null for clicks, populated for views
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
