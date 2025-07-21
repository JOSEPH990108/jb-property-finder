// src\components\utils\ProjectLayoutList.tsx
"use client";

import ProjectLayoutCard from "./ProjectLayoutCard";
import { usePropertyStore } from "@/stores/propertyStore";
import { usePropertyFilterStore } from "@/stores/propertyFilterStore";

export default function ProjectLayoutList() {
  const { isLoading, allLayouts } = usePropertyStore();
  const { filtered, view } = usePropertyFilterStore();

  // Sync: if you want to use only the filtered layouts!
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!allLayouts.length) {
    return <p className="py-10 text-center text-2xl">No layouts found 🤔</p>;
  }

  if (!filtered.length) {
    return <p className="py-10 text-center text-2xl">No results found 🤔</p>;
  }

  // Optional: switch grid/list view if you want (uses your view mode from filter store)
  return view === "grid" ? (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((layout) => (
        <ProjectLayoutCard key={layout.id} layout={layout} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      {filtered.map((layout) => (
        <ProjectLayoutCard key={layout.id} layout={layout} />
      ))}
    </div>
  );
}
