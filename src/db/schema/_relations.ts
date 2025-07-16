/// db/schema/_relations.ts
/// Centralized relationship definitions
import { relations } from "drizzle-orm";
import * as core from "./core";
import * as properties from "./properties";
import * as projects from "./projects";
import * as agents from "./agents";

// =================================================================
// Core Relations
// =================================================================
export const usersRelations = relations(core.users, ({ many }) => ({
  accounts: many(core.accounts),
  sessions: many(core.sessions),
  loginHistories: many(core.loginHistories),
  passwordResetTokens: many(core.passwordResetTokens),
  agencyAgents: many(agents.agencyAgents),
  projectAgents: many(agents.projectAgents),
}));

export const accountsRelations = relations(core.accounts, ({ one }) => ({
  user: one(core.users, {
    fields: [core.accounts.userId],
    references: [core.users.id],
  }),
}));

export const sessionsRelations = relations(core.sessions, ({ one }) => ({
  // Each session belongs to one user
  user: one(core.users, {
    fields: [core.sessions.userId],
    references: [core.users.id],
  }),
}));

export const passwordResetTokensRelations = relations(
  core.passwordResetTokens,
  ({ one }) => ({
    // Each password reset token belongs to one user
    user: one(core.users, {
      fields: [core.passwordResetTokens.userId],
      references: [core.users.id],
    }),
  })
);

export const loginHistoriesRelations = relations(
  core.loginHistories,
  ({ one }) => ({
    // Each login history entry belongs to one user
    user: one(core.users, {
      fields: [core.loginHistories.userId],
      references: [core.users.id],
    }),
  })
);

// =================================================================
// Properties Relations
// =================================================================
export const statesRelations = relations(properties.states, ({ many }) => ({
  areas: many(properties.areas),
}));

export const areaCategoriesRelations = relations(
  properties.areaCategories,
  ({ many }) => ({
    areas: many(properties.areas),
  })
);

export const areasRelations = relations(properties.areas, ({ one, many }) => ({
  state: one(properties.states, {
    fields: [properties.areas.stateId],
    references: [properties.states.id],
  }),
  category: one(properties.areaCategories, {
    fields: [properties.areas.categoryId],
    references: [properties.areaCategories.id],
  }),
  projects: many(projects.projects),
}));

export const propertyCategoryRelations = relations(
  properties.propertyCategories,
  ({ many }) => ({
    projects: many(projects.projects),
    types: many(properties.propertyTypes),
  })
);

export const propertyTypeRelations = relations(
  properties.propertyTypes,
  ({ one, many }) => ({
    propertyCategory: one(properties.propertyCategories, {
      fields: [properties.propertyTypes.propertyCategoryId],
      references: [properties.propertyCategories.id],
    }),
    projects: many(projects.projects),
  })
);

export const tenureTypesRelations = relations(
  properties.tenureTypes,
  ({ many }) => ({
    projects: many(projects.projects),
  })
);

export const featuresRelations = relations(properties.features, ({ many }) => ({
  projectFeatures: many(projects.projectFeatures),
}));

export const projectTypesRelations = relations(
  properties.projectTypes,
  ({ many }) => ({
    projects: many(projects.projects),
  })
);

export const projectStatusesRelations = relations(
  properties.projectStatuses,
  ({ many }) => ({
    projects: many(projects.projects),
  })
);
// =================================================================
// Projects Relations
// =================================================================
export const projectsRelations = relations(
  projects.projects,
  ({ one, many }) => ({
    developer: one(agents.developers, {
      fields: [projects.projects.developerId],
      references: [agents.developers.id],
    }),
    area: one(properties.areas, {
      fields: [projects.projects.areaId],
      references: [properties.areas.id],
    }),
    propertyCategory: one(properties.propertyCategories, {
      fields: [projects.projects.propertyCategoryId],
      references: [properties.propertyCategories.id],
    }),
    propertyType: one(properties.propertyTypes, {
      fields: [projects.projects.propertyTypeId],
      references: [properties.propertyTypes.id],
    }),
    tenureType: one(properties.tenureTypes, {
      fields: [projects.projects.tenureTypeId],
      references: [properties.tenureTypes.id],
    }),
    status: one(properties.projectStatuses, {
      fields: [projects.projects.projectStatusId],
      references: [properties.projectStatuses.id],
    }),
    projectType: one(properties.projectTypes, {
      fields: [projects.projects.projectTypeId],
      references: [properties.projectTypes.id],
    }),
    layouts: many(projects.layouts),
    agents: many(agents.projectAgents),
    documents: many(projects.projectDocuments),
    images: many(projects.projectImages),
    videos: many(projects.projectVideos),
    features: many(projects.projectFeatures),
  })
);

export const layoutsRelations = relations(
  projects.layouts,
  ({ one, many }) => ({
    project: one(projects.projects, {
      fields: [projects.layouts.projectId],
      references: [projects.projects.id],
    }),
    documents: many(projects.projectDocuments),
    images: many(projects.projectImages),
    videos: many(projects.projectVideos),
  })
);

export const projectFeaturesRelations = relations(
  projects.projectFeatures,
  ({ one }) => ({
    project: one(projects.projects, {
      fields: [projects.projectFeatures.projectId],
      references: [projects.projects.id],
    }),
    feature: one(properties.features, {
      fields: [projects.projectFeatures.featureId],
      references: [properties.features.id],
    }),
  })
);

export const projectImagesRelations = relations(
  projects.projectImages,
  ({ one }) => ({
    project: one(projects.projects, {
      fields: [projects.projectImages.projectId],
      references: [projects.projects.id],
    }),
    layout: one(projects.layouts, {
      fields: [projects.projectImages.layoutId],
      references: [projects.layouts.id],
    }),
  })
);

export const projectVideosRelations = relations(
  projects.projectVideos,
  ({ one }) => ({
    project: one(projects.projects, {
      fields: [projects.projectVideos.projectId],
      references: [projects.projects.id],
    }),
    layout: one(projects.layouts, {
      fields: [projects.projectVideos.layoutId],
      references: [projects.layouts.id],
    }),
  })
);

export const projectDocumentsRelations = relations(
  projects.projectDocuments,
  ({ one }) => ({
    project: one(projects.projects, {
      fields: [projects.projectDocuments.projectId],
      references: [projects.projects.id],
    }),
    layout: one(projects.layouts, {
      fields: [projects.projectDocuments.layoutId],
      references: [projects.layouts.id],
    }),
  })
);
// =================================================================
// Agents Relations
// =================================================================
export const developersRelations = relations(agents.developers, ({ many }) => ({
  projects: many(projects.projects),
}));

export const agenciesRelations = relations(agents.agencies, ({ many }) => ({
  agents: many(agents.agencyAgents),
}));

export const agencyAgentsRelations = relations(
  agents.agencyAgents,
  ({ one }) => ({
    agency: one(agents.agencies, {
      fields: [agents.agencyAgents.agencyId],
      references: [agents.agencies.id],
    }),
    user: one(core.users, {
      fields: [agents.agencyAgents.userId],
      references: [core.users.id],
    }),
  })
);

export const projectAgentsRelations = relations(
  agents.projectAgents,
  ({ one, many }) => ({
    user: one(core.users, {
      fields: [agents.projectAgents.userId],
      references: [core.users.id],
    }),
    project: one(projects.projects, {
      fields: [agents.projectAgents.projectId],
      references: [projects.projects.id],
    }),
    leadAssignments: many(agents.leadAssignments),
  })
);

export const leadAssignmentsRelations = relations(
  agents.leadAssignments,
  ({ one }) => ({
    projectAgent: one(agents.projectAgents, {
      fields: [agents.leadAssignments.projectAgentId],
      references: [agents.projectAgents.id],
    }),
  })
);
