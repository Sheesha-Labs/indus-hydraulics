'use client'

import * as React from 'react'
import { cn } from './lib/utils'

export interface QuantityStepperProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export function QuantityStepper({
  value,
  min = 1,
  max = 9999,
  onChange,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const decrement = () => onChange(Math.max(min, value - 1))
  const increment = () => onChange(Math.min(max, value + 1))

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10)
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)))
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center border border-ih-border bg-ih-surface',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || value <= min}
        className="flex items-center justify-center w-8 h-8 text-ih-muted hover:text-ih-ink hover:bg-ih-surface-2 transition-colors disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={handleInput}
        disabled={disabled}
        className="w-12 h-8 text-center text-sm font-mono font-medium text-ih-ink border-x border-ih-border bg-transparent focus:outline-none focus:bg-ih-surface-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={increment}
        disabled={disabled || value >= max}
        className="flex items-center justify-center w-8 h-8 text-ih-muted hover:text-ih-ink hover:bg-ih-surface-2 transition-colors disabled:opacity-30"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
