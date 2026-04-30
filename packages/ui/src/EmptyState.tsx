import * as React from 'react'
import { cn } from './lib/utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-8',
        'border-2 border-dashed border-[var(--color-border)]',
        'bg-[var(--color-deep)]',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-[var(--color-caption)] opacity-60">{icon}</div>
      )}
      <p className="text-sm font-medium text-[var(--color-body)]">{title}</p>
      {description && (
        <p className="mt-1.5 text-xs text-[var(--color-caption)] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
