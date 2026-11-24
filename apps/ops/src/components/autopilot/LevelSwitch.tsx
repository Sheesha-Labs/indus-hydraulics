'use client'

import type { AutopilotLevel } from '@indus/ops-core'
import { cn } from '@indus/ops-ui/lib/cn'
import { Lock } from 'lucide-react'
import { useRef, type KeyboardEvent } from 'react'

const ORDER = ['off', 'suggest', 'draft_and_ask', 'do_and_tell', 'do_quietly'] as const
const WORD: Record<(typeof ORDER)[number], string> = {
  off: 'Off',
  suggest: 'Suggest',
  draft_and_ask: 'Draft and ask',
  do_and_tell: 'Do and tell',
  do_quietly: 'Do quietly',
}

export interface LevelSwitchProps {
  label: string
  value: AutopilotLevel
  /** The levels the row may take; others are drawn but disabled. */
  allowed: readonly AutopilotLevel[]
  /** A fixed row: drawn in the navy locked style, not a control. */
  locked: AutopilotLevel | null
  /** Read-only (the Helper, a save in flight). */
  disabled?: boolean
  onChange?: (level: AutopilotLevel) => void
  className?: string
}

/**
 * Board 98's per-row level control: five equal segments Off · Suggest · Draft and ask · Do and tell · Do
 * quietly, the current one navy. A radiogroup with arrows/Home/End over the allowed levels only. A locked row
 * (#20, #28, #32 and the system locks) is not a control: a navy "Locked · you send" (or "Never") box.
 */
export default function LevelSwitch({
  label,
  value,
  allowed,
  locked,
  disabled = false,
  onChange,
  className,
}: LevelSwitchProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  if (locked) {
    return (
      <div
        data-part="level-locked"
        className={cn(
          'border-io-navy bg-io-navy rounded-io-ctl flex h-9 w-[400px] items-center justify-center gap-1.5 border text-[12.5px] font-medium text-white',
          className
        )}
      >
        <span className="sr-only">{label}: </span>
        <Lock aria-hidden="true" size={13} strokeWidth={1.75} />
        {locked === 'never' ? 'Never' : 'Locked · you send'}
      </div>
    )
  }
  const usable = ORDER.filter((l) => allowed.includes(l))
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (disabled || !onChange) return
    const i = Math.max(0, usable.indexOf(value as (typeof ORDER)[number]))
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(usable.length - 1, i + 1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, i - 1)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = usable.length - 1
    if (next === null) return
    e.preventDefault()
    const level = usable[next]!
    refs.current[ORDER.indexOf(level)]?.focus()
    if (level !== value) onChange(level)
  }
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      onKeyDown={onKeyDown}
      data-part="level-switch"
      className={cn(
        'border-io-stroke rounded-io-ctl bg-io-card grid h-9 w-[400px] grid-cols-5 overflow-hidden border text-[12px]',
        className
      )}
    >
      {ORDER.map((level, i) => {
        const on = level === value
        const can = allowed.includes(level) && !disabled && !!onChange
        return (
          <button
            key={level}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={on}
            aria-disabled={!can || undefined}
            tabIndex={on ? 0 : -1}
            data-state={on ? 'on' : 'off'}
            onClick={() => {
              if (can && !on) onChange?.(level)
            }}
            className={cn(
              'border-io-line io-focus flex items-center justify-center border-r whitespace-nowrap last:border-r-0',
              on ? 'bg-io-navy text-white' : 'text-io-ink-2',
              !on && can && 'hover:bg-io-paper cursor-pointer',
              !on && !can && 'text-io-ink-4 cursor-default'
            )}
          >
            {WORD[level]}
          </button>
        )
      })}
    </div>
  )
}
