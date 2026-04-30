import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium text-xs tracking-wide border',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-deep)] text-[var(--color-body)] border-[var(--color-border)]',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-red-50 text-red-700 border-red-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent)]',
      },
      size: {
        sm: 'h-4 px-1.5 text-[10px]',
        md: 'h-5 px-2 text-xs',
        lg: 'h-6 px-2.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

// Tier badge with fixed colors per tier
const TIER_CLASSES = {
  bronze: 'bg-amber-50 text-amber-800 border-amber-200',
  silver: 'bg-slate-50 text-slate-700 border-slate-300',
  gold: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  platinum: 'bg-purple-50 text-purple-800 border-purple-200',
} as const

export function TierBadge({
  tier,
  className,
}: {
  tier: keyof typeof TIER_CLASSES
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center h-5 px-2 text-xs font-medium tracking-wide border uppercase',
        TIER_CLASSES[tier],
        className
      )}
    >
      {tier}
    </span>
  )
}

// RFQ status badge
const STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-[var(--color-deep)] text-[var(--color-muted)] border-[var(--color-border)]',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  engineer_review: 'bg-amber-50 text-amber-700 border-amber-200',
  engineer_questions_pending: 'bg-orange-50 text-orange-700 border-orange-200',
  quote_sent: 'bg-purple-50 text-purple-700 border-purple-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  declined: 'bg-red-50 text-red-700 border-red-200',
  expired: 'bg-slate-50 text-slate-500 border-slate-200',
  order_created: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  fulfilling: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-blue-50 text-blue-800 border-blue-300',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  cancelled: 'bg-slate-50 text-slate-500 border-slate-200',
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center h-5 px-2 text-xs font-medium border',
        STATUS_CLASSES[status] ?? STATUS_CLASSES.draft,
        className
      )}
    >
      {label}
    </span>
  )
}

export { Badge, badgeVariants }
