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

export const projects = pgTable("project", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  developerId: integer("developerId")
    .notNull()
    .references(() => developers.id),
  areaId: integer("areaId")
    .notNull()
    .references(() => areas.id),
  propertyCategoryId: integer("propertyCategoryId")
    .notNull()
    .references(() => propertyCategories.id),
  propertyTypeId: integer("propertyTypeId")
    .notNull()
    .references(() => propertyTypes.id),
  tenureTypeId: integer("tenureTypeId")
    .notNull()
    .references(() => tenureTypes.id),
  projectStatusId: integer("projectStatusId")
    .notNull()
    .references(() => projectStatuses.id),
  projectTypeId: integer("projectTypeId")
    .notNull()
    .references(() => projectTypes.id),
  yearOfCompletion: integer("yearOfCompletion"),
  description: text("description"),
  location: text("location").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const layouts = pgTable("layout", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  studyRoom: integer("studyRoom").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  squareFeet: integer("squareFeet").notNull(),
  spaPriceBumiMin: decimal("spaPriceBumiMin", {
    precision: 12,
    scale: 2,
  }).notNull(),
  spaPriceBumiMax: decimal("spaPriceBumiMax", {
    precision: 12,
    scale: 2,
  }).notNull(),
  spaPriceNonBumiMin: decimal("spaPriceNonBumiMin", {
    precision: 12,
    scale: 2,
  }).notNull(),
  spaPriceNonBumiMax: decimal("spaPriceNonBumiMax", {
    precision: 12,
    scale: 2,
  }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const projectFeatures = pgTable(
  "project_feature",
  {
    id: serial("id").primaryKey(),
    projectId: integer("projectId")
      .notNull()
      .references(() => projects.id),
    featureId: integer("featureId")
      .notNull()
      .references(() => features.id),
  },
  (t) => ({
    unq: uniqueIndex().on(t.projectId, t.featureId),
  })
);

export const projectImages = pgTable("project_image", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  isMain: boolean("isMain").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  projectId: integer("projectId")
    .notNull()
    .references(() => projects.id),
  layoutId: integer("layoutId").references(() => layouts.id),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const projectVideos = pgTable("project_video", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  isMain: boolean("isMain").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  projectId: integer("projectId")
    .notNull()
    .references(() => projects.id),
  layoutId: integer("layoutId").references(() => layouts.id),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const projectDocuments = pgTable("project_document", {
  id: serial("id").primaryKey(),
  fileUrl: text("fileUrl").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  projectId: integer("projectId")
    .notNull()
    .references(() => projects.id),
  layoutId: integer("layoutId").references(() => layouts.id),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});
