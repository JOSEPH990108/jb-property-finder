// src\types\db.ts
// Generated at: 2025-07-17T12:50:55.284Z

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import * as core from "@/db/schema/core";
import * as properties from "@/db/schema/properties";
import * as projects from "@/db/schema/projects";
import * as agents from "@/db/schema/agents";

// =================================================================
// Core Schema Types
// =================================================================

// Account
export type Account = InferSelectModel<typeof core.accounts>;
export type NewAccount = InferInsertModel<typeof core.accounts>;

// LoginHistory
export type LoginHistory = InferSelectModel<typeof core.loginHistories>;
export type NewLoginHistory = Omit<InferInsertModel<typeof core.loginHistories>, "id">;

// Otp
export type Otp = InferSelectModel<typeof core.otps>;
export type NewOtp = InferInsertModel<typeof core.otps>;

// PasswordResetToken
export type PasswordResetToken = InferSelectModel<typeof core.passwordResetTokens>;
export type NewPasswordResetToken = InferInsertModel<typeof core.passwordResetTokens>;

// Session
export type Session = InferSelectModel<typeof core.sessions>;
export type NewSession = InferInsertModel<typeof core.sessions>;

// User
export type User = InferSelectModel<typeof core.users>;
export type NewUser = InferInsertModel<typeof core.users>;

// Verification
export type Verification = InferSelectModel<typeof core.verifications>;
export type NewVerification = InferInsertModel<typeof core.verifications>;

// =================================================================
// Properties Schema Types
// =================================================================

// AreaCategory
export type AreaCategory = InferSelectModel<typeof properties.areaCategories>;
export type NewAreaCategory = InferInsertModel<typeof properties.areaCategories>;

// Area
export type Area = InferSelectModel<typeof properties.areas>;
export type NewArea = InferInsertModel<typeof properties.areas>;

// Feature
export type Feature = InferSelectModel<typeof properties.features>;
export type NewFeature = InferInsertModel<typeof properties.features>;

// ProjectStatuse
export type ProjectStatuse = InferSelectModel<typeof properties.projectStatuses>;
export type NewProjectStatuse = InferInsertModel<typeof properties.projectStatuses>;

// ProjectType
export type ProjectType = InferSelectModel<typeof properties.projectTypes>;
export type NewProjectType = InferInsertModel<typeof properties.projectTypes>;

// PropertyCategory
export type PropertyCategory = InferSelectModel<typeof properties.propertyCategories>;
export type NewPropertyCategory = InferInsertModel<typeof properties.propertyCategories>;

// PropertyType
export type PropertyType = InferSelectModel<typeof properties.propertyTypes>;
export type NewPropertyType = InferInsertModel<typeof properties.propertyTypes>;

// State
export type State = InferSelectModel<typeof properties.states>;
export type NewState = InferInsertModel<typeof properties.states>;

// TenureType
export type TenureType = InferSelectModel<typeof properties.tenureTypes>;
export type NewTenureType = InferInsertModel<typeof properties.tenureTypes>;

// =================================================================
// Projects Schema Types
// =================================================================

// Layout
export type Layout = InferSelectModel<typeof projects.layouts>;
export type NewLayout = InferInsertModel<typeof projects.layouts>;

// ProjectDocument
export type ProjectDocument = InferSelectModel<typeof projects.projectDocuments>;
export type NewProjectDocument = InferInsertModel<typeof projects.projectDocuments>;

// ProjectFeature
export type ProjectFeature = InferSelectModel<typeof projects.projectFeatures>;
export type NewProjectFeature = InferInsertModel<typeof projects.projectFeatures>;

// ProjectImage
export type ProjectImage = InferSelectModel<typeof projects.projectImages>;
export type NewProjectImage = InferInsertModel<typeof projects.projectImages>;

// ProjectVideo
export type ProjectVideo = InferSelectModel<typeof projects.projectVideos>;
export type NewProjectVideo = InferInsertModel<typeof projects.projectVideos>;

// Project
export type Project = InferSelectModel<typeof projects.projects>;
export type NewProject = InferInsertModel<typeof projects.projects>;

// =================================================================
// Agents Schema Types
// =================================================================

// Agency
export type Agency = InferSelectModel<typeof agents.agencies>;
export type NewAgency = InferInsertModel<typeof agents.agencies>;

// AgencyAgent
export type AgencyAgent = InferSelectModel<typeof agents.agencyAgents>;
export type NewAgencyAgent = InferInsertModel<typeof agents.agencyAgents>;

// Developer
export type Developer = InferSelectModel<typeof agents.developers>;
export type NewDeveloper = InferInsertModel<typeof agents.developers>;

// LeadAssignment
export type LeadAssignment = InferSelectModel<typeof agents.leadAssignments>;
export type NewLeadAssignment = InferInsertModel<typeof agents.leadAssignments>;

// ProjectAgent
export type ProjectAgent = InferSelectModel<typeof agents.projectAgents>;
export type NewProjectAgent = InferInsertModel<typeof agents.projectAgents>;
