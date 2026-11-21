'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '../lib/cn'
import { LabelWithCount } from './Count'
import type { SegmentedProps } from './Segmented'
import { segmentedGroup, segmentedItem } from './styles'

const NEXT: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/**
 * Segmented's client half: role="radiogroup", one tab stop on the checked option, arrows move and
 * select (wrapping), Home/End jump. Controlled when `onValueChange` is given; otherwise it keeps its own
 * selection, so a server page can render a working control without a handler.
 */
export default function SegmentedRadios<V extends string>({
  options,
  value,
  size = 'md',
  onValueChange,
  className,
  'aria-label': ariaLabel,
}: Omit<SegmentedProps<V>, 'hrefFor'>) {
  const [inner, setInner] = useState(value)
  const active = onValueChange ? value : inner
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function select(index: number) {
    const o = options[index]
    if (!o) return
    if (!onValueChange) setInner(o.value)
    onValueChange?.(o.value)
    refs.current[index]?.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const current = Math.max(
      0,
      options.findIndex((o) => o.value === active)
    )
    const last = options.length - 1
    let target: number | undefined
    if (e.key in NEXT) target = (current + NEXT[e.key]! + options.length) % options.length
    else if (e.key === 'Home') target = 0
    else if (e.key === 'End') target = last
    if (target === undefined) return
    e.preventDefault()
    select(target)
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(segmentedGroup({ size }), className)}
    >
      {options.map((o, i) => {
        const on = o.value === active
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            data-state={on ? 'on' : 'off'}
            onClick={() => select(i)}
            className={segmentedItem({ size })}
          >
            <LabelWithCount label={o.label} count={o.count} tone={o.countTone} onNavy={on} />
          </button>
        )
      })}
    </div>
  )
}
