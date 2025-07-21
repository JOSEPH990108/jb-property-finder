// src\components\utils\PropertyUniversalCard.tsx
"use client";

import React, { useState } from "react";
import { Project, Layout } from "@/types/main";
import ImageCarousel from "./ImageCarousel";
import {
  Heart,
  BedDouble,
  Ruler,
  ShowerHead,
  MessageCircle,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PropertyUniversalCardProps =
  | {
      mode: "project";
      project: Project;
      onApplyClick?: () => void;
      onWhatsAppClick?: () => void;
    }
  | {
      mode: "layout";
      layout: Layout;
      onApplyClick?: () => void;
      onWhatsAppClick?: () => void;
    };

export default function PropertyUniversalCard(
  props: PropertyUniversalCardProps
) {
  let images: string[] = [];
  let price = "-";
  let rooms: number | string = "-";
  let bathrooms: number | string = "-";
  let sqft: number | string = "-";
  let projectName = "";
  let location = "";
  let category = "";
  let status = "";
  let propertyType = "";
  let area = "";
  let tenure = "";
  let layoutName = "";

  if (props.mode === "project") {
    const { project } = props;
    const mainLayout =
      project.layouts?.reduce((min, curr) =>
        Number(curr.spaPriceNonBumiMin) < Number(min.spaPriceNonBumiMin)
          ? curr
          : min
      ) || project.layouts?.[0];

    images = project.images;
    price = mainLayout?.spaPriceNonBumiMin
      ? Number(mainLayout.spaPriceNonBumiMin).toLocaleString()
      : "-";
    rooms = mainLayout?.bedrooms ?? "-";
    bathrooms = mainLayout?.bathrooms ?? "-";
    sqft = mainLayout?.squareFeet ?? "-";
    projectName = project.projectName;
    location = project.location;
    category = project.category;
    status = project.status;
    propertyType = project.propertyType;
    area = project.area;
    tenure = project.tenure;
    layoutName = mainLayout?.name ?? "";
  } else {
    const { layout } = props;
    images = layout.images ?? [];
    price = layout.spaPriceNonBumiMin
      ? Number(layout.spaPriceNonBumiMin).toLocaleString()
      : "-";
    rooms = layout.bedrooms ?? "-";
    bathrooms = layout.bathrooms ?? "-";
    sqft = layout.squareFeet ?? "-";
    projectName = layout.projectName || "";
    location = layout.projectLocation || "";
    category = layout.category || "";
    status = layout.status || "";
    propertyType = layout.propertyType || "";
    area = layout.area || "";
    tenure = layout.tenure || "";
    layoutName = layout.name ?? "";
  }

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    props.onApplyClick?.();
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    props.onWhatsAppClick?.();
  };

  return (
    <article className="relative rounded-xl overflow-hidden shadow-md bg-white dark:bg-neutral-900 hover:shadow-lg transition-all duration-300 group w-full max-w-sm mx-auto">
      <ImageCarousel images={images} altPrefix={projectName}>
        {/* Badges and favorite button as overlays */}
        <span className="absolute top-2 left-2 text-xs sm:text-[11px] font-semibold bg-yellow-300 text-black px-2 py-0.5 rounded-full z-10">
          {category}
        </span>
        <span className="absolute top-2 right-2 text-xs sm:text-[11px] font-semibold bg-blue-900 text-white px-2 py-0.5 rounded-full z-10">
          {props.mode === "project" ? status : tenure}
        </span>
        <button
          onClick={toggleFavorite}
          className={cn(
            "absolute top-9 sm:top-8 right-2 bg-white/90 dark:bg-neutral-800/90 p-2 sm:p-1.5 rounded-full shadow transition-colors z-10",
            isFavorite
              ? "text-red-500"
              : "text-gray-400 dark:text-gray-300 hover:text-red-500"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </ImageCarousel>
      {/* Card Body */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-1 text-black dark:text-white">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xl sm:text-lg font-bold text-primary whitespace-nowrap">
              RM {price}
            </p>
            <h3
              className="text-lg sm:text-base font-bold truncate"
              title={projectName}
            >
              {projectName}
            </h3>
            {layoutName && props.mode === "layout" && (
              <div className="text-xs text-gray-500">{layoutName}</div>
            )}
            <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400 truncate">
              {location}
            </p>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400 truncate">
              {propertyType} · {area} · {tenure}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-3 text-gray-600 dark:text-gray-300 text-sm sm:text-xs pt-2 sm:pt-1.5">
          <span className="flex items-center gap-1.5 sm:gap-1">
            <BedDouble size={16} className="shrink-0" />
            <span className="font-medium">{rooms}</span>
          </span>
          <span className="flex items-center gap-1.5 sm:gap-1">
            <ShowerHead size={16} className="shrink-0" />
            <span className="font-medium">{bathrooms}</span>
          </span>
          <span className="flex items-center gap-1.5 sm:gap-1">
            <Ruler size={16} className="shrink-0" />
            <span className="font-medium">{sqft}</span>
            <span className="lowercase text-xs sm:text-[11px]">sqft</span>
          </span>
        </div>
        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-2 pt-3 sm:pt-2 sm:max-h-0 sm:opacity-0 sm:group-hover:max-h-20 sm:group-hover:opacity-100 transition-all duration-300 overflow-hidden">
          <Button
            variant="outline"
            className="text-sm sm:text-xs py-2 sm:py-1.5 h-auto border-green-600 text-green-600 hover:bg-[#25D366]/20 dark:hover:bg-[#25D366]/30 flex items-center gap-1.5 sm:gap-1"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle size={16} className="shrink-0" />
            WhatsApp
          </Button>
          <Button
            className="text-sm sm:text-xs py-2 sm:py-1.5 h-auto flex items-center gap-1.5 sm:gap-1"
            onClick={handleApplyClick}
          >
            <ClipboardList size={16} className="shrink-0" />
            Apply Now
          </Button>
        </div>
      </div>
    </article>
  );
}
