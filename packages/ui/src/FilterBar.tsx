'use client'

import * as React from 'react'
import { cn } from './lib/utils'

export interface FilterOption {
  key: string
  label: string
  count?: number
}

export interface FilterBarProps {
  filters: FilterOption[]
  active: string[]
  onToggle: (key: string) => void
  onClear?: () => void
  clearLabel?: string
  className?: string
}

export function FilterBar({
  filters,
  active,
  onToggle,
  onClear,
  clearLabel = 'Clear all',
  className,
}: FilterBarProps) {
  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {filters.map((filter) => {
        const isActive = active.includes(filter.key)
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onToggle(filter.key)}
            className={cn(
              'inline-flex items-center gap-1.5 h-7 px-3 text-xs font-medium border transition-colors',
              isActive
                ? 'bg-[var(--color-primary)] text-[var(--color-elevated)] border-[var(--color-primary)]'
                : 'bg-[var(--color-elevated)] text-[var(--color-body)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            )}
            aria-pressed={isActive}
          >
            {filter.label}
            {filter.count !== undefined && (
              <span
                className={cn(
                  'font-mono text-[10px]',
                  isActive ? 'opacity-70' : 'text-[var(--color-caption)]'
                )}
              >
                {filter.count}
              </span>
            )}
            {isActive && (
              <span className="ml-0.5 opacity-60">×</span>
            )}
          </button>
        )
      })}
      {active.length > 0 && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center h-7 px-2 text-xs text-[var(--color-danger)] hover:underline"
        >
          {clearLabel}
        </button>
      )}
    </div>
  )
}
