import * as React from 'react'
import { cn } from './lib/utils'

/**
 * Semantic status tone. New tones should map to a Tailwind class set in
 * `TONE_CLASSES` below — adding a tone in one place and not the other will
 * fail the type check.
 */
export type StatusTone =
  /** Healthy / published / active. */
  | 'good'
  /** Warning / draft / unconfigured. */
  | 'warn'
  /** Negative / discontinued / declined / cancelled. */
  | 'danger'
  /** Informational / neutral. */
  | 'info'
  /** Disabled / archived / muted. */
  | 'muted'
  /** Accent — uses the brand orange; reserve for "current" / pending CTA. */
  | 'accent'

const TONE_CLASSES: Record<StatusTone, string> = {
  good: 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]',
  warn: 'text-[oklch(0.5_0.14_70)] bg-[oklch(0.96_0.05_70)]',
  danger: 'text-[oklch(0.5_0.18_25)] bg-[oklch(0.97_0.04_25)]',
  info: 'text-[oklch(0.4_0.1_240)] bg-[oklch(0.95_0.03_240)]',
  muted: 'text-[var(--color-muted)] bg-[var(--color-deep)]',
  accent: 'text-white bg-[var(--color-accent)]',
}

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0 text-[9px]',
  md: 'px-2 py-0.5 text-[10px]',
  lg: 'px-2.5 py-1 text-[11px]',
} as const

export interface StatusPillProps {
  tone?: StatusTone
  size?: keyof typeof SIZE_CLASSES
  className?: string
  children: React.ReactNode
}

/**
 * Small status badge. Use for product/category/RFQ/account status indicators
 * where a single semantic tone applies.
 *
 * @example
 *   <StatusPill tone="good">Active</StatusPill>
 *   <StatusPill tone="warn" size="sm">Draft</StatusPill>
 */
export function StatusPill({
  tone = 'muted',
  size = 'md',
  className,
  children,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-semibold capitalize tracking-tight',
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        className
      )}
    >
      {children}
    </span>
  )
}

// ── Domain helpers ──────────────────────────────────────────────────────────
//
// Project-specific mappings live below the generic component so non-Indus
// consumers don't need to opt in.

const PRODUCT_STATUS_TONES: Record<string, StatusTone> = {
  active: 'good',
  draft: 'muted',
  discontinued: 'danger',
}

export function productStatusTone(status: string): StatusTone {
  return PRODUCT_STATUS_TONES[status] ?? 'muted'
}

const ACCOUNT_STATUS_TONES: Record<string, StatusTone> = {
  active: 'good',
  prospect: 'warn',
  at_risk: 'danger',
  archived: 'muted',
}

export function accountStatusTone(status: string): StatusTone {
  return ACCOUNT_STATUS_TONES[status] ?? 'muted'
}

const ACCOUNT_TIER_TONES: Record<string, StatusTone> = {
  bronze: 'warn',
  silver: 'muted',
  gold: 'accent',
  platinum: 'info',
}

export function accountTierTone(tier: string): StatusTone {
  return ACCOUNT_TIER_TONES[tier] ?? 'muted'
}
