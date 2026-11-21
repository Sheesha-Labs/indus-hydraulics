import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'
import type { ButtonVariant, Icon } from '../types'
import Kbd from './Kbd'
import Spinner from './Spinner'

export type ButtonSize = 'lg' | 'md' | 'sm' | 'xs'

export interface ButtonOwnProps {
  /** Default 'secondary'. One primary per view; navy for batch sends; destructive only in ConfirmDialog. */
  variant?: ButtonVariant
  /** Default 'md'. lg: proposal cards and dialogs; md: headers; sm: rows; xs: dense tables. */
  size?: ButtonSize
  /** Spinner + aria-busy, pointer-events none; the label stays (e.g. "Sending…"). */
  busy?: boolean
  /** Secondary text after the label, opacity .7 weight 400 (e.g. a count). */
  trail?: ReactNode
  /** Leading, decorative. */
  icon?: Icon
  /** Renders <Kbd> after the label (e.g. "⌘↵"). */
  kbd?: string
}

/** An icon-only button must carry a name: without children, aria-label is required. */
export type Labelled =
  { children: ReactNode; 'aria-label'?: string } | { children?: never; 'aria-label': string }

export type ButtonProps = ButtonOwnProps &
  Labelled &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
    /** Render the single child element (e.g. a link) with the button's look (Radix Slot). */
    asChild?: boolean
  }

const BOXED = ['primary', 'secondary', 'navy', 'ghost', 'danger', 'destructive'] as const

/**
 * Controls kit `kc-btn`. Shared by Button and ButtonLink, and usable on its own.
 *
 * Two rules from packages/ui/src/Button.tsx, which shipped bugs for both:
 *  - EVERY variant names its own border colour and the base names none. cva only concatenates; a
 *    `border-transparent` in the base sits beside secondary's `border-io-stroke` in the raw string and
 *    whichever Tailwind emits later wins, so anyone styling with `buttonVariants()` without cn() gets a
 *    borderless secondary.
 *  - No two classes in the raw string fight. Height and padding come from compound variants that skip
 *    `link`, so a link never carries `h-io-btn` next to `h-auto`.
 */
export const buttonVariants = cva(
  [
    'inline-flex cursor-pointer items-center justify-center gap-[7px] border font-medium whitespace-nowrap select-none',
    'transition-[background-color,border-color,color] duration-[120ms]',
    'io-focus',
    'disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45',
    'aria-busy:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-io-accent border-io-accent hover:bg-io-accent-hover hover:border-io-accent-hover text-white',
        secondary:
          'bg-io-card border-io-stroke text-io-ink hover:bg-io-paper hover:border-io-stroke-hover',
        navy: 'bg-io-navy border-io-navy hover:bg-io-navy-hover text-white',
        ghost: 'text-io-ink-3 hover:bg-io-fill hover:text-io-ink border-transparent bg-transparent',
        danger:
          'bg-io-card border-io-stroke text-io-bad hover:bg-io-bad-hover-tint hover:border-io-bad-hover-line',
        destructive: 'bg-io-bad-solid border-io-bad-solid text-white',
        link: 'text-io-accent hover:text-io-accent-hover h-auto border-0 border-transparent bg-transparent p-0',
      },
      size: {
        lg: 'rounded-io-ctl text-[13px]',
        md: 'rounded-io-ctl text-[13px]',
        sm: 'rounded-io-ctl text-[12.5px]',
        xs: 'rounded-io-5 text-[12px]',
      },
    },
    compoundVariants: [
      { variant: [...BOXED], size: 'lg', class: 'h-io-btn-lg px-3.5' },
      { variant: [...BOXED], size: 'md', class: 'h-io-btn px-3.5' },
      { variant: [...BOXED], size: 'sm', class: 'h-io-btn-sm px-2.5' },
      { variant: [...BOXED], size: 'xs', class: 'h-io-btn-xs px-2' },
    ],
    defaultVariants: { variant: 'secondary', size: 'md' },
  }
)

/**
 * Spinner, icon, label, trail and kbd in kit order, as a flat keyed array. It is an array (not a fragment
 * or a component) because Radix Slot looks for <Slottable> among its direct children: with asChild the
 * label's element becomes the rendered element and the rest is placed around its own children.
 */
export function buttonChildren({
  busy,
  icon: IconPart,
  trail,
  kbd,
  label,
}: {
  busy?: boolean | undefined
  icon?: Icon | undefined
  trail?: ReactNode
  kbd?: string | undefined
  label: ReactNode
}): ReactNode[] {
  return [
    busy ? <Spinner key="spinner" /> : null,
    IconPart ? (
      <IconPart key="icon" aria-hidden="true" strokeWidth={1.75} className="size-3.5 flex-none" />
    ) : null,
    <Slottable key="label">{label}</Slottable>,
    trail == null ? null : (
      <span key="trail" className="font-normal opacity-70">
        {trail}
      </span>
    ),
    kbd ? <Kbd key="kbd" keys={kbd} /> : null,
  ]
}

/**
 * Button. Shared (no hooks): renders from a server component, and an onClick works once a client
 * component renders it. Defaults to type="button" so a button inside a form never submits by accident.
 */
export default function Button({
  variant = 'secondary',
  size = 'md',
  busy = false,
  trail,
  icon,
  kbd,
  asChild = false,
  className,
  children,
  type,
  onClick,
  ...rest
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      {...rest}
      {...(asChild ? {} : { type: type ?? 'button' })}
      {...(onClick && !busy ? { onClick } : {})}
      data-variant={variant}
      data-size={size}
      {...(busy ? { 'aria-busy': true, 'data-state': 'busy' } : {})}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {buttonChildren({ busy, icon, trail, kbd, label: children })}
    </Comp>
  )
}
