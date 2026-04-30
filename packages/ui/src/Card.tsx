import * as React from 'react'
import { cn } from './lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-[var(--color-elevated)] border border-[var(--color-border)]',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1 px-5 py-4 border-b border-[var(--color-border)]', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-sm font-semibold text-[var(--color-primary)] leading-none', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xs text-[var(--color-muted)]', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-5 py-4', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center px-5 py-3 border-t border-[var(--color-border)] bg-[var(--color-deep)]',
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

// KPI card for dashboard metrics
export interface KPICardProps {
  label: string
  value: string | number
  delta?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function KPICard({ label, value, delta, trend = 'neutral', className }: KPICardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-[var(--color-good)]'
      : trend === 'down'
        ? 'text-[var(--color-danger)]'
        : 'text-[var(--color-caption)]'

  return (
    <Card className={cn('p-5', className)}>
      <p className="text-xs text-[var(--color-muted)] uppercase tracking-widest font-mono">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold font-mono text-[var(--color-primary)] tracking-tight">
        {value}
      </p>
      {delta && (
        <p className={cn('mt-1 text-xs font-mono', trendColor)}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {delta}
        </p>
      )}
    </Card>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
