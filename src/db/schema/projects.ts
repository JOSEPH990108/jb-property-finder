// src\db\schema\projects.ts
/// db/schema/projects.ts
/// Project-related tables
import {
  timestamp,
  pgTable,
  text,
  serial,
  integer,
  boolean,
  decimal,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  areas,
  propertyCategories,
  propertyTypes,
  tenureTypes,
  projectStatuses,
  projectTypes,
  features,
} from "./properties";
import { developers } from "./agents";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  developerId: integer("developer_id")
    .notNull()
    .references(() => developers.id),
  areaId: integer("area_id")
    .notNull()
    .references(() => areas.id),
  propertyCategoryId: integer("property_category_id")
    .notNull()
    .references(() => propertyCategories.id),
  propertyTypeId: integer("property_type_id")
    .notNull()
    .references(() => propertyTypes.id),
  tenureTypeId: integer("tenure_type_id")
    .notNull()
    .references(() => tenureTypes.id),
  projectStatusId: integer("project_status_id")
    .notNull()
    .references(() => projectStatuses.id),
  projectTypeId: integer("project_type_id")
    .notNull()
    .references(() => projectTypes.id),
  yearOfCompletion: integer("year_of_completion"),
  description: text("description"),
  location: text("location").notNull(),
  totalLevel: integer("total_level"),
  totalUnit: integer("total_unit"),
  totalTower: integer("total_tower"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }), // Soft delete
});

export const layouts = pgTable("layouts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  studyRoom: integer("study_room").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  squareFeet: integer("square_feet").notNull(),
  spaPriceBumiMin: decimal("spa_price_bumi_min", {
    precision: 12,
    scale: 2,
  }).notNull(),
  spaPriceBumiMax: decimal("spa_price_bumi_max", {
    precision: 12,
    scale: 2,
  }).notNull(),
  spaPriceNonBumiMin: decimal("spa_price_non_bumi_min", {
    precision: 12,
    scale: 2,
  }).notNull(),
  spaPriceNonBumiMax: decimal("spa_price_non_bumi_max", {
    precision: 12,
    scale: 2,
  }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }), // Soft delete
});

export const projectFeatures = pgTable(
  "project_feature",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id),
    featureId: integer("feature_id")
      .notNull()
      .references(() => features.id),
  },
  (t) => ({
    unq: uniqueIndex().on(t.projectId, t.featureId),
  })
);

export const projectImages = pgTable("project_images", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  isMain: boolean("is_main").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  layoutId: integer("layout_id").references(() => layouts.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }), // Soft delete
});

export const projectVideos = pgTable("project_videos", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  isMain: boolean("is_main").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  layoutId: integer("layout_id").references(() => layouts.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }), // Soft delete
});

export const projectDocuments = pgTable("project_documents", {
  id: serial("id").primaryKey(),
  fileUrl: text("file_url").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }), // Soft delete
});
