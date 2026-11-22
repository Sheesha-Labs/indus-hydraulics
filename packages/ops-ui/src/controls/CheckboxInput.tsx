'use client'

import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export interface CheckboxInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked'
> {
  checked?: boolean | 'mixed'
  locked?: boolean
}

/**
 * The native <input type="checkbox"> behind Checkbox: its only client part. 'mixed' needs the DOM
 * `indeterminate` property, which has no attribute, so it is set through a ref. Locked boxes stay checked
 * and refuse clicks. Controlled when `onChange` is given; otherwise `checked` is the starting state.
 */
export default function CheckboxInput({
  checked,
  locked = false,
  onChange,
  onClick,
  className,
  ...rest
}: CheckboxInputProps) {
  const ref = useRef<HTMLInputElement>(null)
  // Uncontrolled: a click clears 'mixed', as the native control does.
  const [mixed, setMixed] = useState(checked === 'mixed')
  const isMixed = onChange ? checked === 'mixed' : mixed

  // aria-checked="mixed" is written next to the DOM flag, in the same effect, never in markup: server HTML
  // cannot carry `indeterminate`, and an aria-checked that disagrees with the native state is an axe
  // violation (aria-conditional-attr).
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.indeterminate = isMixed
    if (isMixed) el.setAttribute('aria-checked', 'mixed')
    else el.removeAttribute('aria-checked')
  }, [isMixed])

  const state = locked ? 'locked' : isMixed ? 'mixed' : undefined
  return (
    <input
      {...rest}
      ref={ref}
      type="checkbox"
      // Locked is controlled at true and swallows the change: React puts `checked` back after the
      // event. (preventDefault in onClick fights React's own restore and can leave it unchecked.)
      {...(locked
        ? { checked: true, onChange: () => {} }
        : onChange
          ? { checked: checked === true, onChange }
          : { defaultChecked: checked === true, onChange: () => setMixed(false) })}
      {...(locked ? { 'aria-disabled': true } : {})}
      {...(state ? { 'data-state': state } : {})}
      {...(onClick ? { onClick } : {})}
      className={cn(
        'peer border-io-stroke rounded-io-tag bg-io-card io-focus m-0 size-4 flex-none cursor-pointer appearance-none border',
        'checked:bg-io-accent checked:border-io-accent data-[state=mixed]:bg-io-accent data-[state=mixed]:border-io-accent',
        'data-[state=locked]:checked:bg-io-navy data-[state=locked]:checked:border-io-navy data-[state=locked]:cursor-not-allowed',
        className
      )}
    />
  )
}
