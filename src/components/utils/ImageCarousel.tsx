// src\components\utils\ImageCarousel.tsx
"use client";

import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageCarousel {
  images: string[];
  altPrefix: string;
  children?: React.ReactNode; // Overlay favorite button, badges, etc
}

function Arrow({
  dir,
  onClick,
}: {
  dir: "left" | "right";
  onClick: React.MouseEventHandler<HTMLButtonElement>; // accept event
}) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 -translate-y-1/2 z-20 p-2 sm:p-1.5 bg-white/90 dark:bg-neutral-900/90 rounded-full shadow-md hover:scale-105 transition-all duration-200 active:scale-95"
      style={{ [dir === "left" ? "left" : "right"]: "0.5rem" } as any}
      aria-label={dir}
    >
      <Icon size={18} className="text-black dark:text-white" />
    </button>
  );
}

export default function ImageCarouselfrom({ images, altPrefix, children }: ImageCarousel) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [isFirst, setIsFirst] = useState(true);
  const [isLast, setIsLast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setIsFirst(emblaApi.selectedScrollSnap() === 0);
      setIsLast(emblaApi.selectedScrollSnap() === images.length - 1);
    };
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, images.length]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative aspect-[4/3]">
      <div ref={emblaRef} className="embla w-full h-full">
        <div className="embla__container flex h-full">
          {(images.length ? images : ["/images/placeholder.png"]).map(
            (src, i) => (
              <div key={i} className="min-w-full h-full relative">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <Image
                    src={src}
                    alt={`${altPrefix} photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                    priority={i === 0}
                  />
                )}
              </div>
            )
          )}
        </div>
        {children}
      </div>
      {images.length > 1 && !isLoading && (
        <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          {!isFirst && (
            <Arrow
              dir="left"
              onClick={(e) => {
                e.stopPropagation();
                emblaApi?.scrollPrev();
              }}
            />
          )}
          {!isLast && (
            <Arrow
              dir="right"
              onClick={(e) => {
                e.stopPropagation();
                emblaApi?.scrollNext();
              }}
            />
          )}
        </div>
      )}
      {/* Carousel Dots */}
      {images.length > 1 && !isLoading && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                emblaApi?.scrollTo(index);
              }}
              className={cn(
                "w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-white/90 dark:bg-neutral-800/90",
                index === emblaApi?.selectedScrollSnap() &&
                  "bg-primary dark:bg-primary w-3 sm:w-2.5"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
