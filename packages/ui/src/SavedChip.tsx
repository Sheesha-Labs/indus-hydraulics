import * as React from 'react'
import { cva } from 'class-variance-authority'
import { AlertTriangle, Check } from 'lucide-react'
import { cn } from './lib/utils'

/**
 * Admin design language — FB-7, the "Saved at 14:32" reassurance chip.
 *
 * TWO STATES, and that is the whole point. This is deliberately NOT the
 * four-state idle/saving/saved/error autosave indicator, because nothing in
 * this admin autosaves: FE-11 makes every editor an explicit
 * `disabled={pending || !isDirty}` Save, and FB-5 says the *pending* state is
 * carried by conjugating the button label ("Saving…"), never by a second
 * widget elsewhere on the page. An "idle" state would render a chip that
 * reports nothing, and a "saving" state would duplicate the button. So the
 * chip only ever describes a write that has already landed or already failed.
 *
 * WHY IT IS A COMPONENT AT ALL. FB-7 records the same span hand-rolled
 * verbatim in four editor clients — each with a hardcoded
 * `oklch(0.55 0.12 150)` — plus two further variants beside them. One
 * component, one geometry, one pair of tones.
 *
 * WHY THE TIME IS FORMATTED THE HARD WAY. A bare `toLocaleTimeString()` picks
 * up the runtime's locale *and* its timezone, so Node and the browser render
 * different strings and React logs a hydration mismatch — LT-12 records four
 * live instances of exactly this bug in the date columns. Locale and zone are
 * therefore both pinned, following the house pattern in FE-13/LT-12
 * (`toLocaleString('en-GB', { …, timeZone })`).
 *
 * DECISIONS THE DOCUMENT DOES NOT MAKE:
 *  - `timeZone` defaults to `Asia/Dubai`. The design document specifies no
 *    display zone; the business is AED-only and Dubai-based, and a wall-clock
 *    "Saved at" is only reassuring in the reader's own wall clock. UTC would
 *    read four hours wrong. Overridable per call site.
 *  - The error tones are `bg-ih-danger-soft` + `text-ih-danger-ink`. FB-7
 *    specifies only the saved state; the danger pair is the nearest existing
 *    primitive (Badge's `danger` kind), now on the §7.2 ink token instead of
 *    Badge's literal.
 *  - The icon is 14px, one step up from FB-7's 12px, so both states read at a
 *    glance in a footer row rather than only the accent one.
 *  - The clock is `font-mono tabular-nums`: TY-3 makes a machine-authored
 *    timestamp mono, and fixed-width figures stop the chip changing width as
 *    the minute ticks. (TY-4 prefers the `.mono` class; the utility is what
 *    every other primitive in this package uses — see `Table.tsx`'s `numeric`
 *    cell — and this package cannot depend on the app's globals.css.)
 *
 * Markup only: no state, no effects, no handlers, so NO `'use client'`. It is
 * rendered by client editors today, but a client module's exports become
 * client references and a Server Component that called one would throw at
 * request time.
 */
const savedChipVariants = cva(
  'inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-[11.5px]',
  {
    variants: {
      state: {
        /** The write landed. FB-7's string, verbatim. */
        saved: 'bg-ih-accent-soft text-ih-accent',
        /** The write was rejected. The sentence explaining why is a toast (FB-1). */
        error: 'bg-ih-danger-soft text-ih-danger-ink',
      },
    },
    defaultVariants: { state: 'saved' },
  }
)

/** The two things a non-autosaving editor can truthfully report. */
export type SavedChipState = 'saved' | 'error'

export interface SavedChipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'color'> {
  /** When the write landed, or was attempted. A `Date` or an ISO 8601 string. */
  at: Date | string
  state?: SavedChipState
  /** IANA zone the clock is rendered in. Pinned, never the runtime default. */
  timeZone?: string
}

const LABELS: Record<SavedChipState, { withTime: string; bare: string }> = {
  saved: { withTime: 'Saved at', bare: 'Saved' },
  error: { withTime: 'Not saved at', bare: 'Not saved' },
}

/**
 * Returns `hh:mm` on a 24-hour clock, or `null` when `at` is unparseable —
 * a chip that says "Saved" is still true and still reassuring; one that says
 * "Saved at Invalid Date" is neither.
 */
function formatClock(at: Date | string, timeZone: string): string | null {
  const date = at instanceof Date ? at : new Date(at)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(date)
}

/**
 * @example
 *   <SavedChip at={lastSavedAt} />                    // Saved at 14:32
 *   <SavedChip at={new Date()} state="error" />       // Not saved at 14:32
 */
export function SavedChip({
  at,
  state = 'saved',
  timeZone = 'Asia/Dubai',
  className,
  ...props
}: SavedChipProps) {
  const clock = formatClock(at, timeZone)
  const Icon = state === 'error' ? AlertTriangle : Check
  const label = LABELS[state]
  const iso = at instanceof Date ? at.toISOString() : at

  return (
    <span role="status" className={cn(savedChipVariants({ state }), className)} {...props}>
      <Icon size={14} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
      {clock === null ? (
        label.bare
      ) : (
        <>
          {label.withTime}
          {/* `dateTime` keeps the full instant machine-readable even though only hh:mm shows. */}
          <time dateTime={iso} className="font-mono tabular-nums">
            {clock}
          </time>
        </>
      )}
    </span>
  )
}

export { savedChipVariants }
