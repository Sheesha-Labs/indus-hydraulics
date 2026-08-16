'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

/**
 * Design language v2 — `.ih-btn`.
 *
 * Five kinds, three sizes. Geometry is from the contract and is deliberately
 * expressed in px: 40px tall / 18px horizontal / 13.5px-500 / radius 6, with
 * an 8px gap between icon and label.
 *
 * Two details that are easy to get wrong:
 *
 *  - `outline`'s hover is NOT a grey hover. Background goes to surface-2 and
 *    both the border and the text go accent. It is the one place the language
 *    lets a secondary control reach for the signal colour.
 *  - Only the transition properties listed in the contract animate. Notably
 *    there is no transform on :active — the press reads as a colour step, not
 *    a nudge, because this is a catalogue used under time pressure.
 */
const buttonVariants = cva(
  cn(
    'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap',
    'border border-transparent font-medium tracking-[-0.005em]',
    'transition-[background-color,border-color,color] duration-150 ease-[ease]',
    // v2 focus ring: accent border + a 3px accent-soft halo.
    'outline-none focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft',
    'disabled:pointer-events-none disabled:opacity-45'
  ),
  {
    variants: {
      kind: {
        /** THE signal. One primary action per view. */
        primary: 'bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover',
        /** Dark fill for chrome-adjacent actions. */
        navy: 'bg-ih-navy text-white hover:bg-ih-ink',
        /** Secondary. Note the accent hover. */
        outline:
          'border-ih-border-strong text-ih-ink hover:border-ih-accent hover:bg-ih-surface-2 hover:text-ih-accent',
        /** Tertiary / text-only. */
        ghost: 'text-ih-ink-2 hover:bg-ih-surface-2',
        /** For use on a navy band, where the palette inverts. */
        onnavy: 'border-white/28 text-white hover:bg-white/10',
      },
      size: {
        /** Dense admin tables and card footers only — see CLAUDE.md §10.8. */
        sm: 'h-8 rounded-sm px-3 text-[12.5px]',
        md: 'h-10 rounded-md px-[18px] text-[13.5px]',
        lg: 'h-12 rounded-md px-6 text-[14.5px]',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { kind: 'outline', size: 'md', block: false },
  }
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  /** Leading icon. Decorative — give the button a text label or an aria-label. */
  icon?: React.ReactNode
  /** Trailing icon. */
  iconAfter?: React.ReactNode
}

const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin motion-reduce:animate-none"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
)

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, kind, size, block, asChild = false, loading = false, icon, iconAfter, children, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ kind, size, block }), className)}
      disabled={loading || props.disabled}
      // The accessible name becomes "Submitting" while in flight, per
      // 03-interactions-and-states.md §4. aria-busy carries it to AT.
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
      {!loading && iconAfter}
    </Comp>
  )
})

export { Button, buttonVariants }
