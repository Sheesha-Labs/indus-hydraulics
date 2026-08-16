'use client'

/**
 * Homepage hero carousel — client component for the right-side visual on `/`.
 *
 * Behaviour:
 *   - Auto-rotates every ROTATE_MS (currently 2.5 s).
 *   - Pauses while the user hovers the carousel.
 *   - Respects `prefers-reduced-motion: reduce` — no auto-rotation, manual
 *     navigation only via the index dots.
 *   - Slide 1 (index 0) is rendered with `priority` so it counts as the LCP
 *     candidate; slides 2–N are lazy-loaded.
 *   - The decorative grid overlay and auto-derived spec bar at the bottom
 *     match the industrial "CAD render" aesthetic of the placeholder this
 *     replaces. Spec bar pulls FILE: from Media.originalFilename and
 *     REV: from the slide's position + createdAt.
 *
 * Loaded by the homepage server component when at least one published slide
 * exists; otherwise the page falls back to the original static placeholder.
 */

import { useEffect, useState } from 'react'
import Image from 'next/image'

export type HomeHeroSlide = {
  id: string
  src: string
  width: number
  height: number
  alt: string
  originalFilename: string
  createdAtIso: string // serialised — RSC props can't carry Date objects
}

interface Props {
  slides: HomeHeroSlide[]
}

// Cycle every 2.5 s. The crossfade on each slide div (500 ms) is well
// inside this window so each fade completes with ~2 s of dwell time before
// the next swap.
const ROTATE_MS = 2500

export default function HomeHeroCarousel({ slides }: Props) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Respect prefers-reduced-motion. Read once on mount and on media-query
  // change so OS-level toggles take effect without a reload.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Auto-rotate. Disabled when only one slide, when hovered, or when
  // reduced motion is requested.
  useEffect(() => {
    if (slides.length <= 1 || paused || reducedMotion) return
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [slides.length, paused, reducedMotion])

  if (slides.length === 0) return null

  const activeSlide = slides[active]!
  const revNumber = String(active + 1).padStart(2, '0')
  const revDate = activeSlide.createdAtIso.slice(0, 7) // YYYY-MM

  return (
    <div
      className="relative bg-ih-bg border border-ih-border overflow-hidden"
      style={{ aspectRatio: '1.05 / 1' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Homepage feature carousel"
    >
      {/* Decorative grid overlay — kept from the original placeholder design */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] z-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Slide stack — all rendered, only active is opacity 1 (crossfade).
          Inset from the container so each image floats inside the framed
          chrome with breathing room: 1.75 rem on top + sides, 5.5 rem at
          the bottom (clears the ~3 rem spec bar with ~2.5 rem visible gap
          above it). object-contain shows the full image with letterbox
          where aspect ratios differ — fine for our square 1254×1254
          technical drawings inside a slightly-wider container. */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-7 bottom-22 transition-opacity duration-500 ease-in-out ${
            idx === active ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={idx !== active}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            width={slide.width}
            height={slide.height}
            priority={idx === 0}
            loading={idx === 0 ? undefined : 'lazy'}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      ))}

      {/* Index dots — only show if 2+ slides */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex gap-2"
          role="tablist"
          aria-label="Select carousel slide"
        >
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={idx === active}
              aria-label={`Slide ${idx + 1} of ${slides.length}`}
              onClick={() => setActive(idx)}
              className={`w-1.5 h-1.5 transition-all ${
                idx === active
                  ? 'w-6 bg-ih-accent'
                  : 'bg-ih-border-strong hover:bg-ih-navy'
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-derived spec bar (bottom) — matches industrial CAD aesthetic */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-ih-surface border-t border-ih-border px-4 py-3 flex justify-between font-mono text-[12px] text-ih-muted">
        <span className="truncate">
          FILE:{' '}
          <strong className="text-ih-ink font-medium">
            {activeSlide.originalFilename.toUpperCase()}
          </strong>
        </span>
        <span className="shrink-0 ml-4">
          REV:{' '}
          <strong className="text-ih-ink font-medium">
            {revNumber} · {revDate}
          </strong>
        </span>
      </div>
    </div>
  )
}
