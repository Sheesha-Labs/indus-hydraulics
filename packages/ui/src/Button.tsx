'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const buttonVariants = cva(
  // Base — flat industrial style, 0-2px radius
  'inline-flex items-center justify-center gap-2 font-medium text-sm tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        /** Dark filled — primary CTA */
        primary:
          'bg-[var(--color-primary)] text-[var(--color-elevated)] hover:bg-[var(--color-body)] border border-[var(--color-primary)]',
        /** Accent orange — secondary CTA */
        accent:
          'bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:opacity-90 border border-[var(--color-accent)]',
        /** Outline — secondary actions */
        secondary:
          'bg-transparent text-[var(--color-primary)] border border-[var(--color-border)] hover:bg-[var(--color-deep)] hover:border-[var(--color-primary)]',
        /** Ghost — tertiary / text-only actions */
        ghost:
          'bg-transparent text-[var(--color-body)] border border-transparent hover:bg-[var(--color-deep)] hover:text-[var(--color-primary)]',
        /** Destructive */
        destructive:
          'bg-[var(--color-danger)] text-white border border-[var(--color-danger)] hover:opacity-90',
      },
      size: {
        xs: 'h-6 px-2 text-xs',
        sm: 'h-7 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      block: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, block, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
