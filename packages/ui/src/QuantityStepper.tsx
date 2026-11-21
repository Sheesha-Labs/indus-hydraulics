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
        'border-ih-border bg-ih-surface inline-flex items-center border',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || value <= min}
        className="text-ih-muted hover:text-ih-ink hover:bg-ih-surface-2 flex h-8 w-8 items-center justify-center transition-colors disabled:opacity-30"
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
        className="text-ih-ink border-ih-border focus:bg-ih-surface-2 h-8 w-12 [appearance:textfield] border-x bg-transparent text-center font-mono text-sm font-medium focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={increment}
        disabled={disabled || value >= max}
        className="text-ih-muted hover:text-ih-ink hover:bg-ih-surface-2 flex h-8 w-8 items-center justify-center transition-colors disabled:opacity-30"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
