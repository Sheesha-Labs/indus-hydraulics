'use client'

import { useId, useState } from 'react'
import { cn } from '../lib/cn'
import OptionCard from './OptionCard'
import type { OptionItem } from './types'

export interface OptionGroupProps {
  /** Radio group name (posted with the form). */
  name: string
  items: OptionItem[]
  /** Eyebrow legend (kit `optionsK`). Without one, a visually hidden "Options" names the group. */
  legend?: string
  /** Controlled value; omit for a self-managed group starting at `defaultValue`. */
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  className?: string
}

/**
 * Assistant kit Option group: a <fieldset> with a <legend> and native radios inside <label> cards
 * (05 §3.11 accessibility). Arrow keys move the selection, as in any radio group. Client.
 */
export default function OptionGroup({
  name,
  items,
  legend,
  value,
  defaultValue,
  onValueChange,
  className,
}: OptionGroupProps) {
  const legendId = useId()
  const [inner, setInner] = useState(defaultValue)
  const current = value ?? inner
  const choose = (v: string) => {
    if (value === undefined) setInner(v)
    onValueChange?.(v)
  }
  return (
    <fieldset
      data-part="options"
      aria-labelledby={legendId}
      className={cn('m-0 flex min-w-0 flex-col gap-3 border-0 p-0', className)}
    >
      <legend id={legendId} className={legend ? 'io-eyebrow float-left w-full' : 'sr-only'}>
        {legend ?? 'Options'}
      </legend>
      {items.map((o) => (
        <OptionCard
          key={o.value}
          {...o}
          name={name}
          checked={current === o.value}
          onChange={choose}
        />
      ))}
    </fieldset>
  )
}
