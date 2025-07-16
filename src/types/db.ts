// types/db.ts
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Import all table schemas
import * as core from "@/db/schema/core";
import * as properties from "@/db/schema/properties";
import * as projects from "@/db/schema/projects";
import * as agents from "@/db/schema/agents";

// =================================================================
// Core Schema Types
// =================================================================

// User
export type User = InferSelectModel<typeof core.users>;
export type NewUser = InferInsertModel<typeof core.users>;

// Account
export type Account = InferSelectModel<typeof core.accounts>;
export type NewAccount = InferInsertModel<typeof core.accounts>;

// Session
export type Session = InferSelectModel<typeof core.sessions>;
export type NewSession = InferInsertModel<typeof core.sessions>;

// PasswordResetToken
export type PasswordResetToken = InferSelectModel<
  typeof core.passwordResetTokens
>;
export type NewPasswordResetToken = InferInsertModel<
  typeof core.passwordResetTokens
>;

// Otp
export type Otp = InferSelectModel<typeof core.otps>;
export type NewOtp = InferInsertModel<typeof core.otps>;

// LoginHistory
export type LoginHistory = InferSelectModel<typeof core.loginHistories>;
export type NewLoginHistory = Omit<
  InferInsertModel<typeof core.loginHistories>,
  "id"
>;

// Verification
export type Verification = InferSelectModel<typeof core.verifications>;
export type NewVerification = InferInsertModel<typeof core.verifications>;

// =================================================================
// Properties Schema Types
// =================================================================

// State
export type State = InferSelectModel<typeof properties.states>;
export type NewState = InferInsertModel<typeof properties.states>;

// AreaCategory
export type AreaCategory = InferSelectModel<typeof properties.areaCategories>;
export type NewAreaCategory = InferInsertModel<
  typeof properties.areaCategories
>;

// Area
export type Area = InferSelectModel<typeof properties.areas>;
export type NewArea = InferInsertModel<typeof properties.areas>;

// PropertyCategory
export type PropertyCategory = InferSelectModel<
  typeof properties.propertyCategories
>;
export type NewPropertyCategory = InferInsertModel<
  typeof properties.propertyCategories
>;

// PropertyType
export type PropertyType = InferSelectModel<typeof properties.propertyTypes>;
export type NewPropertyType = InferInsertModel<typeof properties.propertyTypes>;

// TenureType
export type TenureType = InferSelectModel<typeof properties.tenureTypes>;
export type NewTenureType = InferInsertModel<typeof properties.tenureTypes>;

// Feature
export type Feature = InferSelectModel<typeof properties.features>;
export type NewFeature = InferInsertModel<typeof properties.features>;

// ProjectType
export type ProjectType = InferSelectModel<typeof properties.projectTypes>;
export type NewProjectType = InferInsertModel<typeof properties.projectTypes>;

// ProjectStatus
export type ProjectStatus = InferSelectModel<typeof properties.projectStatuses>;
export type NewProjectStatus = InferInsertModel<
  typeof properties.projectStatuses
>;

// =================================================================
// Projects Schema Types
// =================================================================

// Project
export type Project = InferSelectModel<typeof projects.projects>;
export type NewProject = InferInsertModel<typeof projects.projects>;

// Layout
export type Layout = InferSelectModel<typeof projects.layouts>;
export type NewLayout = InferInsertModel<typeof projects.layouts>;

// ProjectFeature
export type ProjectFeature = InferSelectModel<typeof projects.projectFeatures>;
export type NewProjectFeature = InferInsertModel<
  typeof projects.projectFeatures
>;

// ProjectImage
export type ProjectImage = InferSelectModel<typeof projects.projectImages>;
export type NewProjectImage = InferInsertModel<typeof projects.projectImages>;

// ProjectVideo
export type ProjectVideo = InferSelectModel<typeof projects.projectVideos>;
export type NewProjectVideo = InferInsertModel<typeof projects.projectVideos>;

// ProjectDocument
export type ProjectDocument = InferSelectModel<
  typeof projects.projectDocuments
>;
export type NewProjectDocument = InferInsertModel<
  typeof projects.projectDocuments
>;

// =================================================================
// Agents Schema Types (Assuming it exists at db/schema/agents.ts)
// =================================================================

// Developer
export type Developer = InferSelectModel<typeof agents.developers>;
export type NewDeveloper = InferInsertModel<typeof agents.developers>;

// Agency
export type Agency = InferSelectModel<typeof agents.agencies>;
export type NewAgency = InferInsertModel<typeof agents.agencies>;

// AgencyAgent
export type AgencyAgent = InferSelectModel<typeof agents.agencyAgents>;
export type NewAgencyAgent = InferInsertModel<typeof agents.agencyAgents>;

// ProjectAgent
export type ProjectAgent = InferSelectModel<typeof agents.projectAgents>;
export type NewProjectAgent = InferInsertModel<typeof agents.projectAgents>;

// LeadAssignment
export type LeadAssignment = InferSelectModel<typeof agents.leadAssignments>;
export type NewLeadAssignment = InferInsertModel<typeof agents.leadAssignments>;
