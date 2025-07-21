// src\db\schema\agents.ts
/// db/schema/agents.ts
/// Agency and agent-related tables
import {
  timestamp,
  pgTable,
  text,
  serial,
  integer,
  boolean,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./core";
import { projects } from "./projects";
import { projectAgentRoleEnum } from "./_enums";

export const developers = pgTable("developers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  website: text("website"),
  contact: text("contact"),
  email: text("email"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }), // Soft delete
});

export const agencies = pgTable("agencies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  website: text("website"),
  contact: text("contact"),
  email: text("email"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }), // Soft delete
});

export const agencyAgents = pgTable(
  "agency_agents",
  {
    id: serial("id").primaryKey(),
    agencyId: integer("agency_id")
      .notNull()
      .references(() => agencies.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    isActive: boolean("is_active").default(true).notNull(),
    assignedAt: timestamp("assigned_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }), // Soft delete
  },
  (t) => ({
    unq: uniqueIndex().on(t.agencyId, t.userId),
  })
);

export const projectAgents = pgTable(
  "project_agents",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    whatsappNumber: text("whatsapp_number").notNull(),
    role: projectAgentRoleEnum("role").default("AGENT").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    assignedAt: timestamp("assigned_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }), // Soft delete
  },
  (t) => ({
    unq: uniqueIndex().on(t.userId, t.projectId),
  })
);

export const leadAssignments = pgTable("lead_assignments", {
  id: serial("id").primaryKey(),
  projectAgentId: integer("project_agent_id")
    .notNull()
    .references(() => projectAgents.id),
  leadName: text("lead_name").notNull(),
  contact: text("contact").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
