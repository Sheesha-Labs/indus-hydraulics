'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

/**
 * Design language v2 — `.ih-badge`.
 *
 * 22px pill, 11px-500, radius 999. The `square` modifier switches to radius 3
 * plus mono 10px with 0.06em tracking; that variant exists for corner tags on
 * imagery, not for inline status.
 *
 * The semantic pairings are fixed by the contract and are deliberately
 * low-chroma so they never compete with the accent. Do not introduce ad-hoc
 * tints — if a state needs a colour that is not here, that is a design
 * question.
 */
const badgeVariants = cva(
  'inline-flex h-[22px] shrink-0 items-center gap-[5px] whitespace-nowrap px-2 text-[11px] font-medium tracking-normal',
  {
    variants: {
      kind: {
        default: 'bg-ih-surface-2 text-ih-ink-2',
        accent: 'bg-ih-accent-soft text-ih-accent',
        navy: 'bg-ih-navy text-white',
        steel: 'bg-ih-steel-soft text-ih-info-ink',
        success: 'bg-ih-success-soft text-ih-success-ink',
        warn: 'bg-ih-warning-soft text-ih-warning-ink',
        danger: 'bg-ih-danger-soft text-ih-danger-ink',
      },
      square: {
        true: 'rounded-[3px] font-mono text-[10px] tracking-[0.06em]',
        false: 'rounded-full',
      },
    },
    defaultVariants: { kind: 'default', square: false },
  }
)

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof badgeVariants> {
  /** Prepends a 6px currentColor dot. */
  dot?: boolean
}

export function Badge({ className, kind, square, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ kind, square }), className)} {...props}>
      {dot ? <span aria-hidden="true" className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current" /> : null}
      {children}
    </span>
  )
}

export { badgeVariants }
