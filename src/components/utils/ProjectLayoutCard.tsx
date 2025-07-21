// src\components\utils\ProjectLayoutCard.tsx
"use client";
import { Layout } from "@/types/main";
import PropertyUniversalCard from "./PropertyUniversalCard";

export default function ProjectLayoutCard({ layout }: { layout: Layout }) {
  return (
    <div className="mb-4">
      <PropertyUniversalCard mode="layout" layout={layout} />
    </div>
  );
}
