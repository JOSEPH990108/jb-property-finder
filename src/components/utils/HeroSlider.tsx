// src\components\utils\HeroSlider.tsx
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import Image from 'next/image'

const slides = [
  {
    id: 1,
    imageUrl: '/images/home.jpg',
    heading: 'Find Your Dream Property in Johor Bahru',
    subheading: 'Discover new projects, sub-sale, and rental listings all in one place.',
    ctaText: 'Explore Projects',
    ctaLink: '/projects',
    alt: 'Modern residential property in Johor Bahru',
  },
  {
    id: 2,
    imageUrl: '/images/living-room.jpg',
    heading: 'Live Near Everything You Love',
    subheading: 'Shopping, schools, and serene neighborhoods just minutes away.',
    ctaText: 'View Listings',
    ctaLink: '/listings',
    alt: 'Spacious living room interior',
  },
  {
    id: 3,
    imageUrl: '/images/apartment-jb.jpg',
    heading: 'Invest in Property with Confidence',
    subheading: 'We help you choose the right one for your future.',
    ctaText: 'Get Started',
    ctaLink: '/contact',
    alt: 'Modern apartment building in Johor Bahru',
  },
]

export default function HeroSlider() {
  const autoplayRef = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }))
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplayRef.current])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [isHovering, setIsHovering] = useState(false)

  // Update dot index on slide change
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  // Scroll to slide on dot click
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  )

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!emblaApi) return
    if (e.key === 'ArrowLeft') emblaApi.scrollPrev()
    if (e.key === 'ArrowRight') emblaApi.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    onSelect()
    
    // Add keyboard navigation
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      emblaApi.off('select', onSelect)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [emblaApi, onSelect, handleKeyDown])

  // Toggle autoplay on hover
  useEffect(() => {
    if (!emblaApi || !autoplayRef.current || scrollSnaps.length === 0) return;
    
    if (isHovering) {
      autoplayRef.current.stop()
    } else {
      autoplayRef.current.play()
    }
  }, [isHovering, emblaApi])

  return (
    <section 
      className="relative w-full h-screen overflow-hidden hero-slider"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label="Property showcase carousel"
    >
      <div 
        className="hero-slider__viewport h-full" 
        ref={emblaRef}
        role="region"
        aria-roledescription="carousel"
      >
        <div className="hero-slider__container flex h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative h-full w-full flex-shrink-0 min-w-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${slides.length}`}
            >
              {/* Next.js optimized image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.imageUrl}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  quality={80}
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              
              <motion.div
                className="relative z-10 h-full flex items-center px-6 sm:px-12 lg:px-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="max-w-3xl text-left text-white space-y-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight drop-shadow-xl">
                    {slide.heading}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-zinc-200 drop-shadow-md max-w-xl">
                    {slide.subheading}
                  </p>
                  <div>
                    <Button
                      asChild
                      size="lg"
                      className="backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 transition shadow-xl rounded-full px-6"
                    >
                      <a href={slide.ctaLink}>
                        {slide.ctaText}
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot Navigation */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={clsx(
              'w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ring-offset-black/50',
              selectedIndex === index
                ? 'bg-white w-4 h-4'
                : 'bg-white/50 hover:bg-white/80'
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={selectedIndex === index ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 z-20 flex items-center px-4">
        <button
          onClick={() => emblaApi && emblaApi.scrollPrev()}
          className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="absolute inset-y-0 right-0 z-20 flex items-center px-4">
        <button
          onClick={() => emblaApi && emblaApi.scrollNext()}
          className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}