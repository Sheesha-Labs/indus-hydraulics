'use client'

import { useId, useState, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import ControlLabel, { controlAria } from './ControlLabel'

export interface ToggleProps {
  checked: boolean
  onCheckedChange?: (v: boolean) => void
  /** Posts "on" as a hidden input while on (like a checkbox: nothing while off). */
  name?: string
  label?: ReactNode
  /** 12px ink-3 line under the label. */
  sub?: ReactNode
  /** Set by policy: navy at .55, always on, aria-disabled; the reason is read through aria-describedby. */
  locked?: { reason: string }
  disabled?: boolean
  /** Name for a toggle without a visible label. */
  'aria-label'?: string
  className?: string
}

/**
 * Controls kit Toggle: a 32×18 track with a 14px knob; on = accent. A <button role="switch">, so Space
 * (and Enter) toggle natively and the label is a real <label>. Controlled when `onCheckedChange` is
 * given; otherwise it keeps its own state, so a server-rendered settings form can post it as is.
 */
export default function Toggle({
  checked,
  onCheckedChange,
  name,
  label,
  sub,
  locked,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: ToggleProps) {
  const id = useId()
  const [inner, setInner] = useState(checked)
  const on = locked ? true : onCheckedChange ? checked : inner

  function toggle() {
    if (locked || disabled) return
    if (!onCheckedChange) setInner(!on)
    onCheckedChange?.(!on)
  }

  return (
    <span
      data-state={on ? 'on' : 'off'}
      className={cn(
        'inline-flex items-start gap-[9px] text-[13px] leading-[1.4]',
        disabled && 'pointer-events-none opacity-45',
        className
      )}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
        {...controlAria(id, { label, sub, reason: locked?.reason })}
        {...(locked ? { 'aria-disabled': true, 'data-locked': '' } : {})}
        disabled={disabled}
        data-state={on ? 'on' : 'off'}
        onClick={toggle}
        className={cn(
          'rounded-io-pill bg-io-stroke io-focus relative mt-px inline-block h-4.5 w-8 flex-none cursor-pointer transition-[background-color] duration-150',
          'after:rounded-io-pill after:bg-io-card after:shadow-io-e-knob after:absolute after:top-0.5 after:left-0.5 after:size-3.5 after:transition-[left] after:duration-150 after:content-[""]',
          'data-[state=on]:bg-io-accent data-[state=on]:after:left-4',
          'data-[state=on]:data-locked:bg-io-navy data-locked:cursor-not-allowed data-locked:opacity-55'
        )}
      />
      <ControlLabel id={id} label={label} sub={sub} reason={locked?.reason} />
      {name && on ? <input type="hidden" name={name} value="on" /> : null}
    </span>
  )
}
