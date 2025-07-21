// src\app\projects\new\page.tsx
"use client";

import PropertyFilterToolbar from "@/components/utils/PropertyFilterToolbar";
import PropertyList from "@/components/utils/ProjectLayoutList";

export default function ProjectLayoutPage() {
  return (
    <div
      className="max-w-7xl mx-auto px-4 py-8 space-y-8"
      style={{ paddingTop: "var(--header-height)" }}
    >
      <PropertyFilterToolbar />
      <PropertyList />
    </div>
  );
}
