// src\components\utils\PropertyFilterToolbar.tsx
"use client";

import { useState, useMemo } from "react";
import { Filter, Grid, List } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePropertyFilterStore } from "@/stores/propertyFilterStore";
import { usePropertyStore } from "@/stores/propertyStore";
import SearchableDropdown from "../ui/customize/SearchableDropdown";

const HARD_MAX_PRICE = 6000000;
const DEFAULT_MIN_PRICE = 50000;
const DEFAULT_MAX_PRICE = 1000000;

export default function PropertyFilterToolbar() {
  // ----------------------------------------------------------------
  // # State and Stores
  // ----------------------------------------------------------------
  const [isMobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filterStore = usePropertyFilterStore();
  const propertyStore = usePropertyStore();
  const { setFilter } = filterStore;

  // ----------------------------------------------------------------
  // # Derived Data and Options
  // ----------------------------------------------------------------
  const filterOptions = propertyStore.filterOptions;
  const categories = filterOptions?.propertyCategories ?? [];
  const types = filterOptions?.propertyTypes ?? [];
  const areas = filterOptions?.areas ?? [];

  const currentTypes = useMemo(() => {
    const categoryId = Number(filterStore.filters.categoryId);
    if (!categoryId) return [];
    return types.filter((t) => Number(t.propertyCategoryId) === categoryId);
  }, [types, filterStore.filters.categoryId]);

  const roomOptions = [1, 2, 3, 4, 5].map((num) => ({
    label: `${num} Room${num > 1 ? "s" : ""}`,
    value: String(num),
  }));

  const priceRange = [
    filterStore.filters.minPrice,
    filterStore.filters.maxPrice,
  ];

  // ----------------------------------------------------------------
  // # Handlers
  // ----------------------------------------------------------------
  const handleCategoryChange = (value: string | number | null) => {
    setFilter("categoryId", value ? Number(value) : "");
    setFilter("propertyTypeId", ""); // Reset property type when category changes
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = Number(rawValue);
    if (!isNaN(numericValue)) {
      setFilter(
        "minPrice",
        Math.min(numericValue, filterStore.filters.maxPrice)
      );
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = Number(rawValue);
    if (!isNaN(numericValue)) {
      const clampedValue = Math.max(
        filterStore.filters.minPrice,
        Math.min(numericValue, HARD_MAX_PRICE)
      );
      setFilter("maxPrice", clampedValue);
    }
  };

  return (
    <section className="w-full space-y-4 rounded-xl bg-white p-4 text-black shadow-lg dark:bg-zinc-900 dark:text-white mt-5">
      {/* Toggle View / Filters for Mobile */}
      <div className="flex items-center justify-between md:hidden">
        <button
          onClick={() => setMobileFiltersOpen(!isMobileFiltersOpen)}
          className="flex items-center gap-2 rounded bg-primary/90 px-4 py-2 text-sm font-semibold text-white hover:bg-primary"
        >
          <Filter className="h-4 w-4" />
          {isMobileFiltersOpen ? "Hide Filters" : "Show Filters"}
        </button>

        <div className="flex gap-2">
          <button
            className={`rounded p-2 ${
              filterStore.view === "grid"
                ? "bg-primary text-white"
                : "bg-zinc-300 dark:bg-zinc-700"
            }`}
            onClick={() => filterStore.setView("grid")}
          >
            <Grid size={16} />
          </button>
          <button
            className={`rounded p-2 ${
              filterStore.view === "list"
                ? "bg-primary text-white"
                : "bg-zinc-300 dark:bg-zinc-700"
            }`}
            onClick={() => filterStore.setView("list")}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div
        className={`${
          isMobileFiltersOpen ? "block" : "hidden"
        } space-y-4 transition-all duration-300 md:block`}
      >
        {/* Search & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={filterStore.filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="🔍 Search project name..."
            className="min-w-[200px] flex-grow rounded-lg bg-zinc-100 px-4 py-2 text-black placeholder:text-zinc-500 dark:bg-zinc-800 dark:text-white"
          />
          <select
            value={filterStore.sort}
            onChange={(e) => filterStore.setSort(e.target.value as any)}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-black dark:bg-zinc-800 dark:text-white"
          >
            <option value="newest">🆕 Newest First</option>
            <option value="priceAsc">⬆️ Price: Low → High</option>
            <option value="priceDesc">⬇️ Price: High → Low</option>
          </select>
        </div>

        {/* Category / Type / Location / Rooms */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <SearchableDropdown
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
            value={filterStore.filters.categoryId}
            onChange={handleCategoryChange}
            placeholder="🏷️ Category"
            clearable
          />
          <SearchableDropdown
            options={currentTypes.map((t) => ({ label: t.name, value: t.id }))}
            value={filterStore.filters.propertyTypeId}
            onChange={(v) => setFilter("propertyTypeId", v ? Number(v) : "")}
            placeholder="🏠 Property Type"
            hint={
              !filterStore.filters.categoryId ? "Select a category first" : ""
            }
            disabled={!filterStore.filters.categoryId}
            clearable
          />
          <SearchableDropdown
            options={areas.map((a) => ({ label: a.name, value: a.id }))}
            value={filterStore.filters.areaId}
            onChange={(v) => setFilter("areaId", v ? Number(v) : "")}
            placeholder="📍 Location"
            clearable
          />
          <SearchableDropdown
            options={roomOptions}
            value={
              filterStore.filters.rooms ? String(filterStore.filters.rooms) : ""
            }
            onChange={(v) => setFilter("rooms", v ? Number(v) : 0)}
            placeholder="🛏️ Rooms"
            clearable
          />
        </div>

        {/* Price Range */}
        <div className="space-y-3 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
          <label className="block text-sm font-semibold">
            💰 Price Range (RM)
          </label>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
            <div className="flex gap-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                placeholder="Min"
                value={filterStore.filters.minPrice || ""}
                onChange={handleMinPriceChange}
                onBlur={(e) => {
                  if (e.target.value === "")
                    setFilter("minPrice", DEFAULT_MIN_PRICE);
                }}
                className="w-28 rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                placeholder="Max"
                value={filterStore.filters.maxPrice || ""}
                onChange={handleMaxPriceChange}
                onBlur={(e) => {
                  if (e.target.value === "")
                    setFilter("maxPrice", DEFAULT_MAX_PRICE);
                }}
                className="w-28 rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div className="w-full flex-grow">
              <Slider
                min={0}
                max={HARD_MAX_PRICE}
                step={1000}
                value={priceRange}
                onValueChange={([min, max]) => {
                  setFilter("minPrice", min);
                  setFilter("maxPrice", max);
                }}
              />
              <div className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                RM {filterStore.filters.minPrice.toLocaleString()} – RM{" "}
                {filterStore.filters.maxPrice.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="flex justify-end">
          <button
            onClick={filterStore.clearFilters}
            className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            ✨ Clear All Filters
          </button>
        </div>
      </div>
    </section>
  );
}
