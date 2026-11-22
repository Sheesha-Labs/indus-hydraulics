import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export type CountTone = 'n' | 'bad'

interface CountProps {
  count: number
  tone?: CountTone | undefined
  /** On a navy (selected) segment the neutral count turns translucent white. */
  onNavy?: boolean
  /** On a selected accent tab the neutral count takes the accent tint (the kit's white-on-white is a bug). */
  onAccent?: boolean
}

/**
 * Controls kit `kc-cnt`: the count badge inside Segmented items and tabs. 11px 500, min-w 18, h 17,
 * pill. A 'bad' count is red AND still prints its number, so colour is never the only signal.
 */
export default function Count({ count, tone = 'n', onNavy = false, onAccent = false }: CountProps) {
  return (
    <span
      data-part="count"
      data-tone={tone}
      className={cn(
        'rounded-io-pill inline-grid h-[17px] min-w-[18px] place-items-center px-[5px] text-[11px] font-medium',
        tone === 'bad'
          ? 'bg-io-bad-tint text-io-bad'
          : onNavy
            ? 'bg-white/18 text-white'
            : onAccent
              ? 'bg-io-accent-tint text-io-accent'
              : 'bg-io-fill text-io-ink-2'
      )}
    >
      {count}
    </span>
  )
}

/** A label followed by its count badge, as Segmented items and tabs print them. */
export function LabelWithCount({
  label,
  count,
  tone,
  onNavy = false,
  onAccent = false,
}: {
  label: ReactNode
  count?: number | undefined
  tone?: CountTone | undefined
  onNavy?: boolean
  onAccent?: boolean
}) {
  return (
    <>
      {label}
      {count === undefined ? null : (
        <Count count={count} tone={tone} onNavy={onNavy} onAccent={onAccent} />
      )}
    </>
  )
}
