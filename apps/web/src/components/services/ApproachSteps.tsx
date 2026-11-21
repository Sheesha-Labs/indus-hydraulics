'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import PlaceholderImage from './PlaceholderImage'
import type { ApproachStep } from '../../lib/services-config'

type Props = {
  steps: ApproachStep[]
  /** Copy from Pages & Blocks; each falls back to the shipped string. */
  eyebrow?: string | null
  heading?: string | null
}

/** The sticky site header (utility bar + nav). The pinned frame sits under it. */
const HEADER_PX = 107

/**
 * How much scrolling each step gets while the section is pinned, as a height
 * class on the track. One screen for the frame itself plus 60svh per step
 * after the first. Written out because Tailwind only sees literal classes.
 */
const TRACK_HEIGHT: Record<number, string> = {
  1: 'lg:h-auto',
  2: 'lg:h-[calc(100svh+60svh)]',
  3: 'lg:h-[calc(100svh+120svh)]',
  4: 'lg:h-[calc(100svh+180svh)]',
  5: 'lg:h-[calc(100svh+240svh)]',
  6: 'lg:h-[calc(100svh+300svh)]',
}

const DESKTOP = '(min-width: 1024px)'

/**
 * "How we work": the numbered steps on the left, the active step's board on
 * the right.
 *
 * Sized to one desktop screen. The active step's detail (panel title, body,
 * deliverables) opens inside the step list instead of under the image, so the
 * right column is the image alone, capped by the viewport height so the whole
 * band fits between the header and the fold.
 *
 * On desktop the band PINS: the section is a tall track with a sticky frame,
 * and scrolling through the track steps 01 → 0n before the page moves on.
 * Clicking a step scrolls to that step's stretch of the track, so click and
 * scroll never disagree about which step is showing. Below `lg`, and when the
 * track is not taller than the frame (one step), it is a plain click-through
 * band with no pin.
 */
export default function ApproachSteps({ steps, eyebrow, heading }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const pinned = steps.length > 1

  // Scroll position → active step, on desktop only.
  useEffect(() => {
    if (!pinned) return
    const mq = window.matchMedia(DESKTOP)
    let frame = 0

    const update = () => {
      frame = 0
      const track = trackRef.current
      if (!track || !mq.matches) return
      const rect = track.getBoundingClientRect()
      const travel = rect.height - (window.innerHeight - HEADER_PX)
      if (travel <= 0) return
      const progress = Math.min(1, Math.max(0, (HEADER_PX - rect.top) / travel))
      setActiveIdx(Math.min(steps.length - 1, Math.floor(progress * steps.length)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    mq.addEventListener('change', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      mq.removeEventListener('change', onScroll)
    }
  }, [pinned, steps.length])

  const select = useCallback(
    (i: number) => {
      const track = trackRef.current
      if (!pinned || !track || !window.matchMedia(DESKTOP).matches) {
        setActiveIdx(i)
        return
      }
      // Land in the middle of step i's stretch of the track.
      const rect = track.getBoundingClientRect()
      const travel = rect.height - (window.innerHeight - HEADER_PX)
      const target = window.scrollY + rect.top - HEADER_PX + travel * ((i + 0.5) / steps.length)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' })
    },
    [pinned, steps.length]
  )

  const active = steps[activeIdx] ?? steps[0]
  if (!active) return null

  return (
    <section className="border-ih-border bg-ih-surface -mx-[var(--spacing-page-gutter)] border-y px-[var(--spacing-page-gutter)]">
      <div
        ref={trackRef}
        className={`relative ${pinned ? (TRACK_HEIGHT[steps.length] ?? TRACK_HEIGHT[6]) : ''}`}
      >
        <div
          className={`mx-auto flex max-w-[var(--spacing-max-w)] flex-col justify-center py-14 lg:py-8 lg:[@media(max-height:820px)]:py-5 ${
            pinned ? 'lg:sticky lg:top-[107px] lg:h-[calc(100svh-107px)]' : ''
          }`}
        >
          <span className="eyebrow">{eyebrow ?? 'HOW WE WORK · A LOOK INSIDE'}</span>
          <h2 className="mt-2.5 mb-6 max-w-[920px] text-2xl leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[30px]">
            {heading ??
              'The same four steps run every service, every time — from a piston seal to a BOP recert.'}
          </h2>

          <div className="grid min-h-0 grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(300px,380px)_1fr] lg:gap-12">
            {/* Left: steps; the active one opens to show its panel copy. */}
            <ol className="flex flex-col gap-1">
              {steps.map((step, i) => {
                const isActive = i === activeIdx
                return (
                  <li key={step.number}>
                    <button
                      type="button"
                      onClick={() => select(i)}
                      aria-pressed={isActive}
                      aria-controls={isActive ? panelId : undefined}
                      className={`grid w-full grid-cols-[32px_1fr] items-baseline gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors ${
                        isActive ? 'border-ih-border bg-ih-bg' : 'hover:bg-ih-bg border-transparent'
                      }`}
                    >
                      <span className="mono text-ih-muted-2 pt-0.5 text-xs">{step.number}</span>
                      <span>
                        <span
                          className={`block text-[15px] font-medium ${isActive ? 'text-ih-accent' : ''}`}
                        >
                          {step.title}
                        </span>
                        {isActive ? null : (
                          <span className="text-ih-muted mt-0.5 block text-[13px] leading-[1.45]">
                            {step.body}
                          </span>
                        )}
                      </span>
                    </button>

                    {isActive ? (
                      <div id={panelId} className="px-4 pt-2 pb-2 pl-[60px]">
                        {active.preview.title ? (
                          <p className="text-ih-ink m-0 text-[15px] leading-snug font-semibold tracking-[-0.01em]">
                            {active.preview.title}
                          </p>
                        ) : null}
                        {/* The paragraph drops on short desktop screens (≤820px
                            tall) so the pinned frame still fits; the lead line
                            and deliverables carry the step there. */}
                        {active.preview.body ? (
                          <p className="text-ih-ink-2 mt-2 mb-0 text-[13.5px] leading-[1.55] lg:[@media(max-height:820px)]:hidden">
                            {active.preview.body}
                          </p>
                        ) : null}
                        {active.preview.deliverables.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {active.preview.deliverables.map((d) => (
                              <span
                                key={d}
                                className="mono border-ih-border text-ih-ink-2 rounded-[var(--radius-sm)] border px-2 py-0.5 text-[10.5px] tracking-[0.04em]"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ol>

            {/* Right: the active step's board, capped by the viewport height so
                the band fits one screen — width follows from 16:9. */}
            <div className="order-first w-full lg:order-none lg:max-w-[calc((100svh-107px-230px)*16/9)] lg:justify-self-end">
              <span className="mono text-ih-accent mb-2 block text-[11px] tracking-[0.12em] uppercase">
                {active.preview.tagLabel}
              </span>
              <div className="border-ih-border bg-ih-bg overflow-hidden rounded-[var(--radius-lg)] border">
                <PlaceholderImage
                  storagePath={active.preview.image?.url ?? null}
                  alt={active.preview.image?.alt ?? active.preview.title}
                  placeholderLabel={active.preview.placeholderLabel}
                  className="aspect-video"
                  sizes="(min-width: 1024px) 960px, 100vw"
                />
              </div>
              {steps.length > 1 ? (
                // Progress through the pinned track — a quiet cue that scrolling
                // advances the steps.
                <div className="mt-3 hidden gap-1.5 lg:flex" aria-hidden="true">
                  {steps.map((s, i) => (
                    <span
                      key={s.number}
                      className={`h-[3px] flex-1 rounded-full ${i <= activeIdx ? 'bg-ih-accent' : 'bg-ih-border'}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
