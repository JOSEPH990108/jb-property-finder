// src\stores\propertyFilterStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Property } from "@/types/main";

type SortOption = "newest" | "priceAsc" | "priceDesc";
export type ViewMode = "grid" | "list";

interface Filters {
  search: string;
  type: string;
  category: string;
  location: string;
  rooms: number;
  minPrice: number;
  maxPrice: number;
}

interface PropertyState {
  properties: Property[];
  filtered: Property[];
  filters: Filters;
  sort: SortOption;
  view: ViewMode;

  setProperties: (data: Property[]) => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  setSort: (sort: SortOption) => void;
  setView: (view: ViewMode) => void;
  clearFilters: () => void;
}

const applyFilters = (props: Property[], f: Filters) => {
  let out = [...props];
  if (f.search)
    out = out.filter((p) =>
      p.projectName.toLowerCase().includes(f.search.toLowerCase())
    );
  if (f.type)
    out = out.filter(
      (p) => p.propertyType.toLowerCase() === f.type.toLowerCase()
    );
  if (f.category)
    out = out.filter(
      (p) => p.category.toLowerCase() === f.category.toLowerCase()
    );
  if (f.location)
    out = out.filter(
      (p) => p.location.toLowerCase() === f.location.toLowerCase()
    );
  if (f.rooms) out = out.filter((p) => p.rooms === f.rooms);
  out = out.filter((p) => p.price >= f.minPrice && p.price <= f.maxPrice);
  return out;
};

const applySort = (props: Property[], s: SortOption) => {
  switch (s) {
    case "priceAsc":
      return [...props].sort((a, b) => a.price - b.price);
    case "priceDesc":
      return [...props].sort((a, b) => b.price - a.price);
    default:
      return;
  }
};

export const usePropertyFilterStore = create<PropertyState>()(
  devtools((set) => ({
    properties: [],
    filtered: [],
    filters: {
      search: "",
      type: "",
      category: "",
      location: "",
      rooms: 0,
      minPrice: 50000,
      maxPrice: 1000000,
    },
    sort: "newest",
    view: "grid",

    setProperties: (data) =>
      set(() => ({
        properties: data,
        filtered: applySort(data, "newest"),
      })),

    setFilter: (key, value) =>
      set((state) => {
        const filters = { ...state.filters, [key]: value } as Filters;
        const filtered = applySort(
          applyFilters(state.properties, filters),
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
          search: "",
          type: "",
          category: "",
          location: "",
          rooms: 0,
          minPrice: 50000,
          maxPrice: 1000000,
        };
        const filtered = applySort(
          applyFilters(state.properties, filters),
          state.sort
        );
        return { filters, filtered };
      }),
  }))
);
