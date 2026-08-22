'use client'

/**
 * The swapping half of the homepage headline.
 *
 * Renders one term from `HERO_TERMS` and cycles through the rest. The static
 * half of the headline — the country possessive — is server-rendered by the
 * page; see `hero-geo.ts`.
 *
 * ## The search-visibility constraint this component exists to satisfy
 *
 * Rotation is a browser behaviour and crawlers read the HTML before any of it
 * happens. Two ways to get that wrong, both of which this avoids:
 *
 *   - Rendering an empty slot and filling it on mount ships a homepage whose
 *     `<h1>` has no product noun in it at all.
 *   - Rendering all six terms and hiding five reads as keyword stuffing.
 *
 * So exactly one term is in the markup — index 0 — and the browser only ever
 * replaces text that is already there. Because this is a client component
 * without `ssr: false`, React renders that first term into the server HTML.
 * Term 0 is therefore the indexed one, which is why its position in
 * `HERO_TERMS` is a deliberate choice rather than an alphabetical accident.
 *
 * ## Screen readers
 *
 * There is no `aria-live` here on purpose. A text change inside a normal
 * region is not announced, so a screen reader reads the headline once, as
 * written, with term 0 — the same sentence a crawler sees. Marking it live
 * would re-read the whole `<h1>` every 2.6 seconds and make the page unusable.
 *
 * ## Motion
 *
 * Rotation stops when the pointer is over the hero, when the tab is
 * backgrounded, and entirely when the visitor prefers reduced motion — in that
 * last case the headline is simply static on term 0, which is a complete and
 * correct sentence rather than a degraded one.
 */

import { useEffect, useRef, useState } from 'react'
import { HERO_TERM_DWELL_MS, HERO_TERM_FADE_MS, type HeroTerm } from '@indus/domain'

interface Props {
  terms: readonly HeroTerm[]
  /** Applied to the wrapper so the hero owns the typography. */
  className?: string
}

export default function HeroTermRotator({ terms, className }: Props) {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  // Held across renders so the fade timeout can be cancelled on unmount
  // without it becoming a dependency of the interval effect.
  const fadeTimer = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // A backgrounded tab still fires intervals. Without this the term keeps
  // advancing unseen and the visitor returns to an arbitrary one rather than
  // the one they left.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (terms.length <= 1 || paused || reducedMotion) return
    const id = window.setInterval(() => {
      setFading(true)
      fadeTimer.current = window.setTimeout(() => {
        setActive((i) => (i + 1) % terms.length)
        setFading(false)
      }, HERO_TERM_FADE_MS)
    }, HERO_TERM_DWELL_MS)
    return () => {
      window.clearInterval(id)
      if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current)
    }
  }, [terms.length, paused, reducedMotion])

  const term = terms[active]
  if (!term) return null

  return (
    <span
      className={className}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* The full stop fades inside the same element as the word. Left as a
          sibling it stays at full opacity through the crossfade, parked at the
          outgoing word's width, and jumps sideways when the new one swaps in —
          which is exactly the cheap-looking reflow the two-line layout exists
          to avoid. */}
      <span
        className={`inline-block transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${
          fading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <em className="italic text-ih-accent">{term.word}</em>.
      </span>
    </span>
  )
}
