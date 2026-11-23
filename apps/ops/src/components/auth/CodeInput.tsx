'use client'

import { cn } from '@indus/ops-ui/lib/cn'
import { useRef, useState } from 'react'

/**
 * The board's six code boxes, drawn by classes over ONE real input (inputMode numeric,
 * autocomplete one-time-code), so paste, autofill from the phone and screen readers see a single
 * field. The input is transparent and covers the boxes; the box after the last digit shows the focus.
 * At six digits the form submits itself.
 */
export default function CodeInput({
  id,
  name = 'code',
  label,
  describedBy,
  invalid = false,
}: {
  id: string
  name?: string
  label: string
  describedBy?: string | undefined
  invalid?: boolean
}) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-col items-center gap-1.5">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="group relative flex gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            data-filled={i < value.length || undefined}
            className={cn(
              'rounded-io-ctl bg-io-card text-io-ink flex h-12 w-10 items-center justify-center border text-[20px]',
              i < value.length ? 'border-io-accent' : 'border-io-line',
              invalid && 'border-io-bad-solid',
              (i === value.length || (i === 5 && value.length === 6)) &&
                'group-focus-within:border-io-accent group-focus-within:shadow-[0_0_0_3px_var(--io-accent-tint)]'
            )}
          >
            {value[i] ?? ''}
          </span>
        ))}
        <input
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '').slice(0, 6)
            setValue(digits)
            if (digits.length === 6) ref.current?.form?.requestSubmit()
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          {...(describedBy ? { 'aria-describedby': describedBy } : {})}
          {...(invalid ? { 'aria-invalid': true } : {})}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />
      </div>
    </div>
  )
}
