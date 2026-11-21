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
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((filter) => {
        const isActive = active.includes(filter.key)
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onToggle(filter.key)}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 border px-3 text-xs font-medium transition-colors',
              isActive
                ? 'bg-ih-navy border-ih-ink text-white'
                : 'bg-ih-surface text-ih-ink-2 border-ih-border hover:border-ih-ink hover:text-ih-ink'
            )}
            aria-pressed={isActive}
          >
            {filter.label}
            {filter.count !== undefined && (
              <span
                className={cn('font-mono text-[10px]', isActive ? 'opacity-70' : 'text-ih-muted-2')}
              >
                {filter.count}
              </span>
            )}
            {isActive && <span className="ml-0.5 opacity-60">×</span>}
          </button>
        )
      })}
      {active.length > 0 && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-ih-danger inline-flex h-7 items-center px-2 text-xs hover:underline"
        >
          {clearLabel}
        </button>
      )}
    </div>
  )
}
