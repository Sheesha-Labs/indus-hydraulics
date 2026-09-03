import * as React from 'react'
import { StatusPill } from './StatusPill'

export interface SeoHealthBadgeProps {
  score: number
  className?: string
  /** Mirrors StatusPill's ladder — `sm` for a rail's `<dl>` rows. */
  size?: 'default' | 'sm'
}

/**
 * Visual health indicator for the SEO inspector grid + entity drawer.
 * Tones map: ≥80 good (green), 50–79 warn (amber), <50 danger (red).
 */
export function SeoHealthBadge({ score, className, size = 'default' }: SeoHealthBadgeProps) {
  const tone = score >= 80 ? 'success' : score >= 50 ? 'warning' : 'danger'
  return (
    <StatusPill tone={tone} size={size} {...(className ? { className } : {})}>
      {score}
    </StatusPill>
  )
}
