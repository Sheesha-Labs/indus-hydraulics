import * as React from 'react'
import { cn } from './lib/utils'

export interface CharCounterProps {
  value: string
  min: number
  max: number
  className?: string
}

/**
 * Inline length indicator for SEO title/description fields.
 * Green inside the optimal range, amber if too short / borderline, red if past max.
 */
export function CharCounter({ value, min, max, className }: CharCounterProps) {
  const len = value.length
  const tone = len === 0
    ? 'text-[var(--color-muted)]'
    : len < min
      ? 'text-[oklch(0.5_0.14_70)]'
      : len > max
        ? 'text-[oklch(0.5_0.18_25)]'
        : 'text-[oklch(0.4_0.14_145)]'
  return (
    <span className={cn('font-mono text-[10px] tabular-nums', tone, className)}>
      {len}/{max}
    </span>
  )
}
