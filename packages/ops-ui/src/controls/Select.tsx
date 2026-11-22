import type { SelectHTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../lib/cn'

export interface SelectProps<V extends string> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  options: { value: V; label: string; disabled?: boolean }[]
  /** inline 30 (filters, header controls), md 36 (forms). Default inline. */
  size?: 'inline' | 'md'
  /** "Currency" prefix inside the control, ink-3; also the select's name unless aria-label is given. */
  inlineLabel?: string
}

const frame = cva(
  'border-io-stroke rounded-io-ctl bg-io-card io-focus-field relative inline-flex items-center border whitespace-nowrap',
  {
    variants: {
      size: { inline: 'h-io-select-inline text-[12.5px]', md: 'h-io-field text-[13px]' },
      disabled: { true: 'pointer-events-none opacity-45', false: '' },
    },
    defaultVariants: { size: 'inline', disabled: false },
  }
)

/**
 * Controls kit Select: a native <select>, so it posts with FormData and is accessible as it is (no Radix
 * Select). The frame draws the border, the inline label and the caret; the select inside is transparent
 * and fills it. Focus (the kit's "open") is the field ring, on the frame through :focus-within.
 */
export default function Select<V extends string>({
  options,
  size = 'inline',
  inlineLabel,
  className,
  disabled,
  ...rest
}: SelectProps<V>) {
  return (
    <span className={cn(frame({ size, disabled: Boolean(disabled) }), className)}>
      {inlineLabel ? (
        <span aria-hidden="true" className="text-io-ink-3 pl-2.5">
          {inlineLabel}
        </span>
      ) : null}
      <select
        {...(inlineLabel && !rest['aria-label'] ? { 'aria-label': inlineLabel } : {})}
        {...rest}
        {...(disabled === undefined ? {} : { disabled })}
        className={cn(
          'text-io-ink h-full cursor-pointer appearance-none bg-transparent pr-7 outline-none',
          inlineLabel ? 'pl-1.5' : 'pl-2.5'
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2"
      >
        <path d="M0 0h10L5 6z" fill="var(--io-caret)" />
      </svg>
    </span>
  )
}
