// src/types/main.ts

/**
 * Developer
 * ---------
 * Info about a real estate developer.
 */
export type Developer = {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  establishedYear?: number;
  projects?: string[]; // Project IDs
  websiteUrl?: string;
  contactNumber?: string;
};

/**
 * BaseProjectInfo
 * ---------------
 * Shared info between projects and layouts, for consistent UI display/filtering.
 */
export interface BaseProjectInfo {
  projectId: number;
  projectName: string;
  projectLocation: string;
  images: string[];
  category: string;
  categoryId: number;
  status: string;
  propertyType: string;
  propertyTypeId: number;
  area: string;
  areaId: number;
  tenure: string;
  tenureTypeId: number;
  developer: string;
  developerId: number;
}

/**
 * Layout
 * ------
 * Flat, filterable property layout (unit type) with all filterable info.
 */
export interface Layout extends BaseProjectInfo {
  id: number; // Layout ID
  name: string;
  bedrooms: number;
  studyRoom: number;
  bathrooms: number;
  squareFeet: number;
  spaPriceBumiMin: string;
  spaPriceBumiMax: string;
  spaPriceNonBumiMin: string;
  spaPriceNonBumiMax: string;
}

/**
 * Project
 * -------
 * Project info, plus layouts for filtering.
 */
export interface Project extends BaseProjectInfo {
  id: number;
  location: string;
  layouts: Layout[];
  dateCompleted: string;
}

/**
 * AuthMethod
 * ----------
 * Login/register method.
 */
export type AuthMethod = "email" | "phone";

/**
 * AuthUser
 * --------
 * Public user info for session/auth state.
 */
export type AuthUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  isAgent: boolean;
};
