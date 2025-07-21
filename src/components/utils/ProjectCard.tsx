// src\components\utils\ProjectCard.tsx
"use client";
import { Project } from "@/types/main";
import { useRouter } from "next/navigation";
import PropertyUniversalCard from "./PropertyUniversalCard";

export default function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  return (
    <div
      className="cursor-pointer hover:shadow-lg transition"
      onClick={() => router.push(`/project/${project.projectId}`)}
    >
      <PropertyUniversalCard mode="project" project={project} />
    </div>
  );
}
