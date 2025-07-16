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

export const developers = pgTable("developer", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  website: text("website"),
  contact: text("contact"),
  email: text("email"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const agencies = pgTable("agency", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  website: text("website"),
  contact: text("contact"),
  email: text("email"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const agencyAgents = pgTable(
  "agency_agent",
  {
    id: serial("id").primaryKey(),
    agencyId: integer("agencyId")
      .notNull()
      .references(() => agencies.id),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    isActive: boolean("isActive").default(true).notNull(),
    assignedAt: timestamp("assignedAt", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    unq: uniqueIndex().on(t.agencyId, t.userId),
  })
);

export const projectAgents = pgTable(
  "project_agent",
  {
    id: serial("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: integer("projectId")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    whatsappNumber: text("whatsappNumber").notNull(),
    role: projectAgentRoleEnum("role").default("AGENT").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    assignedAt: timestamp("assignedAt", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    unq: uniqueIndex().on(t.userId, t.projectId),
  })
);

export const leadAssignments = pgTable("lead_assignment", {
  id: serial("id").primaryKey(),
  projectAgentId: integer("projectAgentId")
    .notNull()
    .references(() => projectAgents.id),
  leadName: text("leadName").notNull(),
  contact: text("contact").notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});
