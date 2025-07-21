// src\db\schema\advanced.ts
/// db/schema/advanced.ts
/// Schemas for advanced patterns like auditing and tagging
import {
  timestamp,
  pgTable,
  text,
  serial,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./core";
import { projects } from "./projects";

/**
 * A centralized log to track all important data changes.
 * This is best implemented with database triggers.
 */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  action: text("action").notNull(), // e.g., 'INSERT', 'UPDATE', 'DELETE'
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  changedAt: timestamp("changed_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * A table to store reusable tags.
 */
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

/**

 * A join table to apply tags to projects in a many-to-many relationship.
 */
export const projectTags = pgTable("project_tags", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});
