// src/stores/propertyFilterStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Layout } from "@/types/main";

// --- Sort & View Mode Types ---
type SortOption = "newest" | "priceAsc" | "priceDesc";
export type ViewMode = "grid" | "list";

// --- Filter State ---
// Keys match your Layout API shape, so filtering is easy and type-safe.
interface Filters {
  categoryId: number | ""; // Matches dropdown: number or ""
  propertyTypeId: number | "";
  areaId: number | "";
  rooms: number;
  minPrice: number;
  maxPrice: number;
  search: string;
}

/**
 * LayoutState
 * -----------
 * - layouts: raw list from API
 * - filtered: filtered/sorted results
 * - filters: active filter values
 * - sort: current sort option
 * - view: grid or list mode
 * - All setter methods for UI control
 */
interface LayoutState {
  layouts: Layout[];
  filtered: Layout[];
  filters: Filters;
  sort: SortOption;
  view: ViewMode;
  setLayouts: (data: Layout[]) => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  setSort: (sort: SortOption) => void;
  setView: (view: ViewMode) => void;
  clearFilters: () => void;
}

// --- Pure filtering logic ---
// Works with your flat API Layout objects.
const applyFilters = (layouts: Layout[], f: Filters) => {
  let out = [...layouts];
  if (f.search)
    out = out.filter((l) =>
      l.projectName?.toLowerCase().includes(f.search.toLowerCase())
    );
  if (f.categoryId)
    out = out.filter((l) => l.categoryId === Number(f.categoryId));
  if (f.propertyTypeId)
    out = out.filter((l) => l.propertyTypeId === Number(f.propertyTypeId));
  if (f.areaId) out = out.filter((l) => l.areaId === Number(f.areaId));
  if (f.rooms) out = out.filter((l) => l.bedrooms === f.rooms);
  out = out.filter(
    (l) =>
      Number(l.spaPriceNonBumiMin) >= f.minPrice &&
      Number(l.spaPriceNonBumiMin) <= f.maxPrice
  );
  return out;
};

// --- Pure sorting logic ---
const applySort = (layouts: Layout[], s: SortOption) => {
  switch (s) {
    case "priceAsc":
      return [...layouts].sort(
        (a, b) => Number(a.spaPriceNonBumiMin) - Number(b.spaPriceNonBumiMin)
      );
    case "priceDesc":
      return [...layouts].sort(
        (a, b) => Number(b.spaPriceNonBumiMin) - Number(a.spaPriceNonBumiMin)
      );
    default:
      return layouts; // 'newest' fallback (assumes API order is newest)
  }
};

/**
 * usePropertyFilterStore
 * ----------------------
 * Zustand store for property filtering/sorting.
 * - Pure, side-effect-free filters and sorters.
 * - All UI state handled in one place.
 * - Devtools integration for debugging.
 */
export const usePropertyFilterStore = create<LayoutState>()(
  devtools((set) => ({
    layouts: [],
    filtered: [],
    filters: {
      categoryId: "",
      propertyTypeId: "",
      areaId: "",
      rooms: 0,
      minPrice: 50000,
      maxPrice: 1000000,
      search: "",
    },
    sort: "newest",
    view: "grid",

    setLayouts: (data) =>
      set(() => ({
        layouts: data,
        filtered: applySort(data, "newest"),
      })),

    setFilter: (key, value) =>
      set((state) => {
        const filters = { ...state.filters, [key]: value } as Filters;
        const filtered = applySort(
          applyFilters(state.layouts, filters),
          state.sort
        );
        return { filters, filtered };
      }),

    setSort: (sort) =>
      set((state) => ({
        sort,
        filtered: applySort(state.filtered, sort),
      })),

    setView: (view) => set({ view }),

    clearFilters: () =>
      set((state) => {
        const filters: Filters = {
          categoryId: "",
          propertyTypeId: "",
          areaId: "",
          rooms: 0,
          minPrice: 50000,
          maxPrice: 1000000,
          search: "",
        };
        const filtered = applySort(
          applyFilters(state.layouts, filters),
          state.sort
        );
        return { filters, filtered };
      }),
  }))
);
