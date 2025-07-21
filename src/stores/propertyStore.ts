// src/stores/propertyStore.ts

import { Project, Layout } from "@/types/main";
import { create } from "zustand";

/**
 * FilterOptions
 * -------------
 * Types for all reference data used in filters.
 * You can strongly type these arrays later!
 */
interface FilterOptions {
  states: any[];
  areaCategories: any[];
  areas: any[];
  features: any[];
  propertyCategories: any[];
  propertyTypes: any[];
  tenureTypes: any[];
  projectStatuses: any[];
  projectTypes: any[];
  propertyTypeByCategory: Record<string, string[]>;
}

/**
 * PropertyStore
 * -------------
 * Main property state:
 * - projects: all projects from API (raw)
 * - allLayouts: all layouts, *flattened* for UI filtering/sorting
 * - isLoading: loading state for fetch
 * - filterOptions: all filter dropdown options
 * - fetchProperties: async fetcher (call on mount/page load)
 */
interface PropertyStore {
  projects: Project[];
  allLayouts: Layout[];
  isLoading: boolean;
  filterOptions: FilterOptions;
  fetchProperties: () => Promise<void>;
}

/**
 * usePropertyStore
 * ----------------
 * Zustand store to hold all fetched properties and reference filter data.
 * Usage:
 *   - Call fetchProperties() on mount.
 *   - UI: use allLayouts and filterOptions for fast filtering.
 */
export const usePropertyStore = create<PropertyStore>((set) => ({
  projects: [],
  allLayouts: [],
  isLoading: false,
  filterOptions: {
    states: [],
    areaCategories: [],
    areas: [],
    features: [],
    propertyCategories: [],
    propertyTypes: [],
    tenureTypes: [],
    projectStatuses: [],
    projectTypes: [],
    propertyTypeByCategory: {},
  },

  /**
   * fetchProperties
   * ---------------
   * Loads all project data and reference lists from the API.
   * Flattens layouts for filter/search UI.
   */
  fetchProperties: async () => {
    set({ isLoading: true });
    const res = await fetch("/api/property");
    const { properties, filterOptions } = await res.json();

    // ENHANCED: layouts from API already carry all filter keys.
    const allLayouts: Layout[] = properties.flatMap((proj: Project) =>
      proj.layouts.map((layout) => ({
        ...layout, // Already flat: includes all project/category/type IDs.
      }))
    );

    set({
      projects: properties,
      allLayouts,
      isLoading: false,
      filterOptions: filterOptions ?? {
        states: [],
        areaCategories: [],
        areas: [],
        features: [],
        propertyCategories: [],
        propertyTypes: [],
        tenureTypes: [],
        projectStatuses: [],
        projectTypes: [],
        propertyTypeByCategory: {},
      },
    });
  },
}));
