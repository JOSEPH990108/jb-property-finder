'use client'

import React, { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import {
  BedDouble,
  Ruler,
  ShowerHead,
  Heart,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ClipboardList,
} from 'lucide-react'
import { Property } from '@/types/property'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface PropertyCardGalleryProps {
  property: Property;
  onApplyClick?: () => void;
  onWhatsAppClick?: () => void;
}

function Arrow({
  dir,
  onClick,
}: {
  dir: 'left' | 'right'
  onClick: () => void
}) {
  const Icon = dir === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 -translate-y-1/2 z-20 p-2 sm:p-1.5 bg-white/90 dark:bg-neutral-900/90 rounded-full shadow-md hover:scale-105 transition-all duration-200 active:scale-95"
      style={{ [dir === 'left' ? 'left' : 'right']: '0.5rem' } as any}
      aria-label={dir}
    >
      <Icon size={18} className="text-black dark:text-white" />
    </button>
  )
}

export default function PropertyCardGallery({ 
  property,
  onApplyClick,
  onWhatsAppClick
}: PropertyCardGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [isFirst, setIsFirst] = useState(true)
  const [isLast, setIsLast] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setIsFirst(emblaApi.selectedScrollSnap() === 0)
      setIsLast(emblaApi.selectedScrollSnap() === property.images.length - 1)
    }
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, property.images.length])

  // Simulate image loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onApplyClick?.()
  }

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onWhatsAppClick?.()
  }

  return (
    <article 
      className="relative rounded-xl overflow-hidden shadow-md bg-white dark:bg-neutral-900 hover:shadow-lg transition-all duration-300 group w-full max-w-sm mx-auto"
    >
      {/* Carousel */}
      <div className="relative aspect-[4/3]">
        <div ref={emblaRef} className="embla w-full h-full">
          <div className="embla__container flex h-full">
            {property.images.map((src, i) => (
              <div key={i} className="min-w-full h-full relative">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <Image
                    src={src}
                    alt={`${property.projectName} photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                    priority={i === 0}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Arrows - Show on mobile and on hover for desktop */}
        {property.images.length > 1 && !isLoading && (
          <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            {!isFirst && <Arrow dir="left" onClick={() => emblaApi?.scrollPrev()} />}
            {!isLast && <Arrow dir="right" onClick={() => emblaApi?.scrollNext()} />}
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-2 left-2 text-xs sm:text-[11px] font-semibold bg-yellow-300 text-black px-2 py-0.5 rounded-full z-10">
          {property.category}
        </span>

        {/* Status Badge */}
        <span className="absolute top-2 right-2 text-xs sm:text-[11px] font-semibold bg-blue-900 text-white px-2 py-0.5 rounded-full z-10">
          {property.status}
        </span>

        {/* Favourite */}
        <button 
          onClick={toggleFavorite}
          className={cn(
            "absolute top-9 sm:top-8 right-2 bg-white/90 dark:bg-neutral-800/90 p-2 sm:p-1.5 rounded-full shadow transition-colors z-10",
            isFavorite ? "text-red-500" : "text-gray-400 dark:text-gray-300 hover:text-red-500"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            size={18} 
            fill={isFavorite ? "currentColor" : "none"} 
          />
        </button>

        {/* Carousel Dots */}
        {property.images.length > 1 && !isLoading && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-10">
            {property.images.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  'w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-white/90 dark:bg-neutral-800/90',
                  index === emblaApi?.selectedScrollSnap() && 'bg-primary dark:bg-primary w-3 sm:w-2.5'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-1 text-black dark:text-white">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xl sm:text-lg font-bold text-primary whitespace-nowrap">
              RM {property.price.toLocaleString()}
            </p>
            <h3
              className="text-lg sm:text-base font-bold truncate"
              title={property.projectName}
            >
              {property.projectName}
            </h3>
            <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400 truncate">
              {property.location}
            </p>
          </div>
        
        </div>

        <div className="flex items-center gap-4 sm:gap-3 text-gray-600 dark:text-gray-300 text-sm sm:text-xs pt-2 sm:pt-1.5">
          <span className="flex items-center gap-1.5 sm:gap-1">
            <BedDouble size={16} className="shrink-0" /> 
            <span className="font-medium">{property.rooms}</span>
          </span>
          <span className="flex items-center gap-1.5 sm:gap-1">
            <ShowerHead size={16} className="shrink-0" /> 
            <span className="font-medium">{property.bathrooms}</span>
          </span>
          <span className="flex items-center gap-1.5 sm:gap-1">
            <Ruler size={16} className="shrink-0" /> 
            <span className="font-medium">{property.sqft}</span>
            <span className="lowercase text-xs sm:text-[11px]">sqft</span>
          </span>
        </div>

        {/* CTA Buttons - Always visible on mobile, appear on hover for desktop */}
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
  )
}