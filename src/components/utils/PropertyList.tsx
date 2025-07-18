"use client";

import PropertyCardGallery from "./PropertyCardGallery";
import { usePropertyFilterStore } from "@/stores/propertyFilterStore";

export default function PropertyList() {
  const { filtered, view } = usePropertyFilterStore();

  if (!filtered.length) return <p className="py-10 text-center text-2xl">No results found 🤔</p>;

  return (
    <div className={view === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-6"}>
      {filtered.map(p => (
        <PropertyCardGallery key={p.id} property={p} />
      ))}
    </div>
  );
}