// src\app\projects\new\page.tsx
"use client";

import { useEffect } from "react";
import { usePropertyFilterStore } from "@/stores/propertyFilterStore";
import PropertyToolbar from "@/components/utils/PropertyFilterToolbar";
import PropertyList from "@/components/utils/PropertyList";

// Dummy data (replace with fetch from API/DB)
import { properties } from "@/data/constants";
import { Property } from "@/types/main";

export default function HomePage() {
  const setProperties = usePropertyFilterStore((s) => s.setProperties);

  useEffect(() => {
    setProperties(properties as Property[]); // in real life -> fetch('/api/properties').then(r=>r.json())
  }, [setProperties]);

  return (
    <div
      className="max-w-7xl mx-auto px-4 py-8 space-y-8"
      style={{ paddingTop: "var(--header-height)" }}
    >
      <PropertyToolbar />
      <PropertyList />
    </div>
  );
}
