import * as React from 'react'
import { Badge, type BadgeProps } from './Badge'
import { cn } from './lib/utils'
import type { Tone } from './tone'

/**
 * Semantic status tone. New tones should map to a Tailwind class set in
 * `TONE_CLASSES` below — adding a tone in one place and not the other will
 * fail the type check.
 */
/**
 * @deprecated Use `Tone` from './tone'. Kept as an alias so existing imports
 * keep compiling; the value set is identical.
 */
export type StatusTone = Tone

/*
  Tone → the Badge kind that already draws it.

  StatusPill and Badge were two components doing one job in two geometries:
  Badge at the contract's 22px/11px pill, StatusPill at 9/10/11px with mono,
  semibold and capitalize bolted on. Badge was the correct one, so this is now
  a thin semantic wrapper over it — callers keep saying "this is a good status"
  rather than "this is a green pill", and there is one set of metrics.

  The raw oklch() literals that used to live here are gone: the -ink tokens
  added in Unit 1 are what a label on a -soft tint should use.
*/
const TONE_KIND: Record<Tone, BadgeProps['kind']> = {
  success: 'success',
  // Badge's kind vocabulary is its own and stays `warn`; this map is exactly
  // where the two are translated, so no call site has to know that.
  warning: 'warn',
  danger: 'danger',
  info: 'steel',
  neutral: 'default',
  accent: 'accent',
}

export interface StatusPillProps {
  tone?: StatusTone
  /**
   * `sm` is 20px/10.5px and exists for a rail's `<dl>` rows, where a 22px pill
   * sits taller than the line it labels. Everywhere else takes the default.
   */
  size?: 'default' | 'sm'
  className?: string
  children: React.ReactNode
}

/**
 * A status, said semantically.
 *
 * Callers name the MEANING — success / warning / danger — and this maps it to the
 * one pill geometry in `Badge`. Thirty-odd admin sites drew their own version
 * of this with their own oklch() literals, four distinct greens among them for
 * a single meaning.
 *
 * @example
 *   <StatusPill tone="success">Active</StatusPill>
 *   <StatusPill tone="warning" size="sm">Draft</StatusPill>
 */
export function StatusPill({
  tone = 'neutral',
  size = 'default',
  className,
  children,
}: StatusPillProps) {
  return (
    <Badge
      kind={TONE_KIND[tone]}
      className={cn(size === 'sm' && 'h-[20px] px-1.5 text-[10.5px]', className)}
    >
      {children}
    </Badge>
  )
}

// ── Domain helpers ──────────────────────────────────────────────────────────
//
// Project-specific mappings live below the generic component so non-Indus
// consumers don't need to opt in.

const PRODUCT_STATUS_TONES: Record<string, StatusTone> = {
  active: 'success',
  draft: 'neutral',
  discontinued: 'danger',
}

export function productStatusTone(status: string): StatusTone {
  return PRODUCT_STATUS_TONES[status] ?? 'neutral'
}

const ACCOUNT_STATUS_TONES: Record<string, StatusTone> = {
  active: 'success',
  prospect: 'warning',
  at_risk: 'danger',
  archived: 'neutral',
}

export function accountStatusTone(status: string): StatusTone {
  return ACCOUNT_STATUS_TONES[status] ?? 'neutral'
}

const ACCOUNT_TIER_TONES: Record<string, StatusTone> = {
  bronze: 'warning',
  silver: 'neutral',
  gold: 'accent',
  platinum: 'info',
}

export function accountTierTone(tier: string): StatusTone {
  return ACCOUNT_TIER_TONES[tier] ?? 'neutral'
}
