'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

/**
 * Design language v2 — `.ih-btn`.
 *
 * TWO SIZE LADDERS, on purpose.
 *
 *   sm | md | lg          the STOREFRONT ladder. Frozen. 40px is the default
 *                         because a storefront control is a 40px hit target
 *                         (CLAUDE.md §10.8) and the founder has explicitly
 *                         asked for the storefront to be left alone.
 *   dense | dense-sm |    the ADMIN ladder, from docs/admin-design-language.md.
 *   dense-xs | icon* |    32/28/24px. An admin is a dense tool used at a desk
 *                         all day; the storefront is a shop used once.
 *
 * They coexist rather than one replacing the other. Do not "unify" them
 * without a storefront design pass — changing the default would resize every
 * button on the public site, which is a visible change nobody asked for.
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
        /**
         * Destructive. A tinted fill rather than a solid red one: a solid
         * red button is the loudest thing on a page, and these sit in row
         * action clusters next to a dozen neutral controls. The weight
         * belongs on the confirmation, not on the trigger.
         */
        danger: 'bg-ih-danger-soft text-ih-danger-ink hover:bg-ih-danger hover:text-white',
      },
      size: {
        /** Dense admin tables and card footers only — see CLAUDE.md §10.8. */
        sm: 'h-8 rounded-sm px-3 text-[12.5px]',
        md: 'h-10 rounded-md px-[18px] text-[13.5px]',
        lg: 'h-12 rounded-md px-6 text-[14.5px]',

        // ── Admin ladder ──
        dense: 'h-8 gap-1.5 rounded-lg px-2.5 text-[14px]',
        'dense-sm': 'h-7 gap-1 rounded-md px-2.5 text-[12.8px]',
        'dense-xs': 'h-6 gap-1 rounded-md px-2 text-[12px]',
        /** Square icon-only buttons. Give these an aria-label. */
        icon: 'h-8 w-8 rounded-lg p-0',
        'icon-sm': 'h-7 w-7 rounded-md p-0',
        'icon-xs': 'h-6 w-6 rounded-md p-0',
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
  const classes = cn(buttonVariants({ kind, size, block }), className)

  // `asChild` hands rendering to the consumer's element via Radix Slot, which
  // requires EXACTLY ONE child. Emitting the icon/label/trailing-icon trio
  // into a Slot throws "React.Children.only expected to receive a single
  // React element child" at runtime — it type-checks cleanly and fails only
  // when the button is actually rendered. So in this mode we pass the child
  // through untouched and the caller composes any icons inside it.
  if (asChild) {
    return (
      <Slot ref={ref} className={classes} aria-busy={loading || undefined} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={loading || props.disabled}
      // The accessible name becomes "Submitting" while in flight, per
      // 03-interactions-and-states.md §4. aria-busy carries it to AT.
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
      {!loading && iconAfter}
    </button>
  )
})

export { Button, buttonVariants }
