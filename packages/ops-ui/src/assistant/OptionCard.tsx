'use client'

import { cn } from '../lib/cn'
import type { OptionCardProps } from './types'

/**
 * Assistant kit `ka-op`: one judgement-call option. A <label> card around a native radio (visually hidden,
 * still the control: arrows move between options, Space selects, the form posts `name=value`). Grid
 * 16/1fr, 10×12, radius 10, line border; checked = accent border + 1px accent ring + accent-faint. The
 * title is 500 with an optional tag and the ok "Suggested" chip; the sub line is 12.5 option-sub.
 */
export default function OptionCard({
  name,
  value,
  title,
  sub,
  tag,
  suggested = false,
  checked,
  onChange,
  className,
}: OptionCardProps) {
  return (
    <label
      data-part="option"
      data-state={checked ? 'on' : 'off'}
      className={cn(
        'border-io-line rounded-io-card bg-io-card grid w-full cursor-pointer grid-cols-[16px_minmax(0,1fr)] gap-2.5 border px-3 py-2.5 text-[13px] leading-[1.4]',
        'hover:border-io-stroke',
        'data-[state=on]:border-io-accent data-[state=on]:bg-io-accent-faint data-[state=on]:shadow-[0_0_0_1px_var(--io-accent)]',
        'has-[:focus-visible]:shadow-[0_0_0_2px_var(--io-card),0_0_0_4px_var(--io-accent)]',
        className
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'rounded-io-pill border-io-stroke bg-io-card mt-px size-4 border',
          'peer-checked:border-io-accent peer-checked:border-[5px]'
        )}
      />
      <span>
        <b className="flex flex-wrap items-center gap-2 font-medium">
          {title}
          {tag ? (
            <span className="rounded-io-pill bg-io-accent-tint text-io-accent h-io-chip inline-flex items-center px-2 text-[11px] font-medium">
              {tag}
            </span>
          ) : null}
          {suggested ? (
            <span className="rounded-io-pill bg-io-ok-tint text-io-ok h-io-tag inline-flex items-center px-[7px] text-[11px] font-medium">
              Suggested
            </span>
          ) : null}
        </b>
        {sub ? <small className="text-io-option-sub mt-px block text-[12.5px]">{sub}</small> : null}
      </span>
    </label>
  )
}
