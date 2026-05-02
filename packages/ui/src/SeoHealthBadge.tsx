import * as React from 'react'
import { StatusPill } from './StatusPill'

export interface SeoHealthBadgeProps {
  score: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Visual health indicator for the SEO inspector grid + entity drawer.
 * Tones map: ≥80 good (green), 50–79 warn (amber), <50 danger (red).
 */
export function SeoHealthBadge({ score, className, size = 'md' }: SeoHealthBadgeProps) {
  const tone = score >= 80 ? 'good' : score >= 50 ? 'warn' : 'danger'
  return (
    <StatusPill tone={tone} size={size} {...(className ? { className } : {})}>
      {score}
    </StatusPill>
  )
}
