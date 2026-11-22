import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface KPIProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  /** Colours the sub line (up ok, dn bad) and says the direction to screen readers. */
  direction?: 'up' | 'dn'
  /** What the direction means when it is not simply "Up" / "Down", e.g. "Worse". */
  directionText?: string
  className?: string
}

const DIRECTION = { up: 'Up', dn: 'Down' } as const

/**
 * Card kit KPI tile (`kr-kpi`): white, line, radius 10, p 14×16, min-w 150; label 12 ink-3; value Geist
 * 24/500 −.02em (the kit and tokens set Geist, not Instrument Serif: open question Q6, awaiting
 * sign-off); sub 11, up ok / dn bad. The colour is never the only signal: the direction is read as text.
 */
export default function Kpi({ label, value, sub, direction, directionText, className }: KPIProps) {
  return (
    <div
      data-part="kpi"
      className={cn(
        'rounded-io-card border-io-line bg-io-card flex min-w-[150px] flex-col gap-0.5 border px-4 py-3.5',
        className
      )}
    >
      <span className="text-io-ink-3 text-[12px] leading-[1.45]">{label}</span>
      <b className="text-io-kpi font-medium">{value}</b>
      {sub ? (
        <small
          className={cn(
            'text-[11px] leading-[1.45]',
            direction === 'up' ? 'text-io-ok' : direction === 'dn' ? 'text-io-bad' : 'text-io-ink-3'
          )}
        >
          {direction ? (
            <span className="sr-only">{directionText ?? DIRECTION[direction]}: </span>
          ) : null}
          {sub}
        </small>
      ) : null}
    </div>
  )
}
