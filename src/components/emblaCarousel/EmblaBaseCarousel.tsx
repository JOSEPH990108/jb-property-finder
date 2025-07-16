'use client'

import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { EmblaCarouselType, EmblaEventType, EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import AutoScroll from 'embla-carousel-auto-scroll'
import Fade from 'embla-carousel-fade'

import { CirclePlay, CirclePause } from 'lucide-react'

import {
  NextButton,
  PrevButton,
  usePrevNextButtons
} from '@/components/emblaCarousel/utils/EmblaCarouselArrowButton'
import {
  DotButton,
  useDotButton
} from '@/components/emblaCarousel/utils/EmblaCarouselDotButton'

export type CarouselPluginType = 'autoplay' | 'autoscroll' | 'fade' | 'scale' | null

type BaseEmblaCarouselProps = {
  children: React.ReactNode[]
  options?: EmblaOptionsType
  plugins?: CarouselPluginType[]
  slideHeight?: string
  slideSpacing?: string
  slideSize?: string
  maxWidth?: string
  showArrows?: boolean
  showDots?: boolean
  showAutoplayButton?: boolean
  autoStart?: boolean
  autoplayDelay?: number
  fadeDuration?: number
  pauseAutoplayOnHover?: boolean
}

const TWEEN_FACTOR_BASE = 0.52

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max)

const BaseEmblaCarousel: React.FC<BaseEmblaCarouselProps> = ({
  children,
  options,
  plugins = [],
  slideHeight = '19rem',
  slideSpacing = '1rem',
  slideSize = '100%',
  maxWidth = '48rem',
  showArrows = true,
  showDots = true,
  showAutoplayButton = true,
  autoStart = true,
  autoplayDelay = 3000,
  fadeDuration = 1500,
  pauseAutoplayOnHover = true,
}) => {
  const progressNode = useRef<HTMLDivElement>(null)
  const tweenFactor = useRef(0)
  const tweenNodes = useRef<HTMLElement[]>([])

  const isAutoplay = plugins.includes('autoplay')
  const isAutoScroll = plugins.includes('autoscroll')
  const isFade = plugins.includes('fade')
  const isScale = plugins.includes('scale')

  const pluginInstances = []
  if (isAutoplay) pluginInstances.push(Autoplay({ playOnInit: autoStart, delay: autoplayDelay }))
  if (isAutoScroll) pluginInstances.push(AutoScroll({ playOnInit: autoStart }))
  if (isFade) pluginInstances.push(Fade())

  const [emblaRef, emblaApi] = useEmblaCarousel(options, pluginInstances)

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
    usePrevNextButtons(emblaApi)

  const [autoplayIsPlaying, setAutoplayIsPlaying] = useState(autoStart)
  const animationName = useRef('')
  const timeoutId = useRef(0)
  const rafId = useRef(0)
  const [showAutoplayProgress, setShowAutoplayProgress] = useState(false)

  const startProgress = useCallback((timeUntilNext: number | null) => {
    const node = progressNode.current
    if (!node || timeUntilNext === null) return

    if (!animationName.current) {
      const style = window.getComputedStyle(node)
      animationName.current = style.animationName
    }

    node.style.animationName = 'none'
    node.style.transform = 'translate3d(0,0,0)'

    rafId.current = window.requestAnimationFrame(() => {
      timeoutId.current = window.setTimeout(() => {
        node.style.animationName = animationName.current
        node.style.animationDuration = `${timeUntilNext}ms`
      }, 0)
    })

    setShowAutoplayProgress(true)
  }, [])

  const onAutoplayButtonClick = useCallback(
    (callback: () => void) => {
      const autoplay = emblaApi?.plugins()?.autoplay
      if (!autoplay) return

      const resetOrStop = autoplay.options.stopOnInteraction === false
        ? autoplay.reset
        : autoplay.stop

      resetOrStop()
      callback()
    },
    [emblaApi]
  )

  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay) return

    autoplay.isPlaying() ? autoplay.stop() : autoplay.play()
  }, [emblaApi])

  useEffect(() => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay) return

    setAutoplayIsPlaying(autoplay.isPlaying())

    emblaApi
      .on('autoplay:play', () => setAutoplayIsPlaying(true))
      .on('autoplay:stop', () => setAutoplayIsPlaying(false))
      .on('reInit', () => setAutoplayIsPlaying(autoplay.isPlaying()))
      .on('autoplay:timerset', () => startProgress(autoplay.timeUntilNext()))
      .on('autoplay:timerstopped', () => setShowAutoplayProgress(false))

    return () => {
      cancelAnimationFrame(rafId.current)
      clearTimeout(timeoutId.current)
    }
  }, [emblaApi, startProgress])

  // === Scale Effect ===
  useEffect(() => {
    if (!emblaApi || !isScale) return

    const setTweenNodes = () => {
      tweenNodes.current = emblaApi.slideNodes().map((node) =>
        node.querySelector('.embla__slide__number') as HTMLElement
      )
    }

    const setTweenFactor = () => {
      tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
    }

    const tweenScale = (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine()
      const scrollProgress = emblaApi.scrollProgress()
      const slidesInView = emblaApi.slidesInView()
      const isScrollEvent = eventName === 'scroll'

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress
        const slidesInSnap = engine.slideRegistry[snapIndex]

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target()
              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target)
                if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress)
                if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress)
              }
            })
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current)
          const scale = numberWithinRange(tweenValue, 0, 1).toString()
          const tweenNode = tweenNodes.current[slideIndex]
          tweenNode.style.transform = `scale(${scale})`
        })
      })
    }

    setTweenNodes()
    setTweenFactor()
    tweenScale(emblaApi)

    emblaApi
      .on('reInit', () => {
        setTweenNodes()
        setTweenFactor()
        tweenScale(emblaApi)
      })
      .on('scroll', () => tweenScale(emblaApi, 'scroll'))
      .on('slideFocus', () => tweenScale(emblaApi))
  }, [emblaApi, isScale])

  return (
    <div
      className="embla"
      style={{
        '--slide-height': slideHeight,
        '--slide-spacing': slideSpacing,
        '--slide-size': slideSize,
        '--embla-max-width': maxWidth,
        '--fade-duration': `${fadeDuration}ms`
      } as React.CSSProperties}
    >
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {children.map((child, index) => (
            <div className="embla__slide" key={index}>
              <div
                className={isFade ? 'embla__slide__img' : 'embla__slide__number'}
                onMouseEnter={() => {
                  if (pauseAutoplayOnHover && isAutoplay) {
                    emblaApi?.plugins()?.autoplay?.stop()
                  }
                }}
                onMouseLeave={() => {
                  if (pauseAutoplayOnHover && isAutoplay) {
                    emblaApi?.plugins()?.autoplay?.play()
                  }
                }}
              >
                {child}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls">
        {showArrows && (
          <div className="embla__buttons">
            <PrevButton
              onClick={() =>
                (isAutoplay || isAutoScroll)
                  ? onAutoplayButtonClick(onPrevButtonClick)
                  : onPrevButtonClick()
              }
              disabled={prevBtnDisabled}
            />
            <NextButton
              onClick={() =>
                (isAutoplay || isAutoScroll)
                  ? onAutoplayButtonClick(onNextButtonClick)
                  : onNextButtonClick()
              }
              disabled={nextBtnDisabled}
            />
          </div>
        )}

        {(isAutoplay || isAutoScroll) && (
          <div className="embla__autoplay-wrapper">
            <div className="embla__progress-container">
              <div className={`embla__progress${showAutoplayProgress ? '' : ' embla__progress--hidden'}`}>
                <div className="embla__progress__bar" ref={progressNode} />
              </div>
            </div>
            {showAutoplayButton && (
              <button className="embla__play" onClick={toggleAutoplay} type="button">
                {autoplayIsPlaying ? (
                  <span className="flex items-center gap-2 w-[110px] justify-center text-sm font-medium">
                    <CirclePause size={16} className="w-4 h-4" /> Pause
                  </span>
                ) : (
                  <span className="flex items-center gap-2 w-[110px] justify-center text-sm font-medium">
                    <CirclePlay size={16} className="w-4 h-4" /> Play
                  </span>
                )}
              </button>
            )}
          </div>
        )}

        {showDots && (
          <div className="embla__dots">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={`embla__dot${index === selectedIndex ? ' embla__dot--selected' : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BaseEmblaCarousel
