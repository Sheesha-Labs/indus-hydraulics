'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { cn } from '../lib/cn'
import { useFieldError } from './form-context'
import type { FieldProps } from './types'

const FRAME = {
  base: 'io-focus-field border-io-stroke bg-io-card text-io-ink rounded-io-ctl h-io-field flex min-w-0 items-center gap-2 border px-3 text-[13px]',
  textarea: 'h-auto min-h-[84px] items-stretch py-[9px] leading-[1.5]',
  select: 'relative pr-7',
  readonly: 'bg-io-paper border-io-line text-io-ink-2',
  disabled: 'opacity-50',
  assistant: 'bg-io-accent-faint border-io-accent-line',
  error: 'border-io-bad-solid shadow-[0_0_0_3px_var(--io-bad-tint)]',
} as const

/** The native control fills the frame; the frame draws border, ground and focus (:focus-within). */
const CONTROL =
  'placeholder:text-io-ink-4 h-full min-w-0 flex-1 bg-transparent text-current outline-none'

/**
 * The control half of Field: frame, input/select/textarea and the hint or error line. Client only to read
 * the enclosing ActionForm's error for this field's name; the ActionForm error wins over the `error` prop
 * because it is the newer of the two. An error replaces the hint, sets aria-invalid and is the control's
 * description, so a screen reader reads it on focus.
 */
export default function FieldControl(props: FieldProps & { id: string }) {
  const {
    id,
    name,
    type,
    hint,
    required = false,
    suffix,
    state,
    assistantSource,
    placeholder,
    defaultValue,
    controlClassName,
  } = props
  const error = useFieldError(name) ?? props.error
  const prefix = props.prefix ?? (props.type === 'money' ? props.currency : undefined)
  const numeric = type === 'number' || type === 'money'
  const why = state === 'assistant' && assistantSource ? assistantSource.evidenceId : undefined
  const message = error ?? hint
  const ids = {
    msg: `${id}-msg`,
    px: `${id}-px`,
    sx: `${id}-sx`,
    tag: `${id}-tag`,
  }
  const describedBy =
    [
      prefix ? ids.px : null,
      suffix ? ids.sx : null,
      state === 'assistant' ? ids.tag : null,
      message ? ids.msg : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  const shared = {
    id,
    name,
    required,
    ...(describedBy ? { 'aria-describedby': describedBy } : {}),
    ...(error ? { 'aria-invalid': true as const } : {}),
    ...(state === 'disabled' ? { disabled: true } : {}),
    ...(defaultValue === undefined ? {} : { defaultValue }),
  }
  const readOnly = state === 'readonly'

  let control
  if (props.type === 'select') {
    control = (
      <select {...shared} className={cn(CONTROL, 'cursor-pointer appearance-none')}>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  } else if (props.type === 'textarea') {
    control = (
      <textarea
        {...shared}
        readOnly={readOnly}
        {...(placeholder ? { placeholder } : {})}
        className={cn(CONTROL, 'min-h-[64px] resize-y')}
      />
    )
  } else {
    control = (
      <input
        {...shared}
        readOnly={readOnly}
        type={type === 'email' ? 'email' : type === 'date' ? 'date' : 'text'}
        {...(numeric ? { inputMode: 'decimal' as const, autoComplete: 'off' } : {})}
        {...(placeholder ? { placeholder } : {})}
        className={cn(CONTROL, numeric && 'text-right')}
      />
    )
  }

  return (
    <>
      <div
        data-part="field-control"
        data-type={type}
        {...(state ? { 'data-state': state } : {})}
        {...(error ? { 'data-invalid': '' } : {})}
        className={cn(
          FRAME.base,
          type === 'textarea' && FRAME.textarea,
          type === 'select' && FRAME.select,
          state && FRAME[state],
          error && FRAME.error,
          controlClassName
        )}
      >
        {prefix ? (
          <span
            id={ids.px}
            className="text-io-ink-3 border-io-line mr-0.5 flex items-center self-stretch border-r pr-2 text-[12px]"
          >
            {prefix}
          </span>
        ) : null}
        {control}
        {state === 'assistant' ? (
          <span
            id={ids.tag}
            className="text-io-navy bg-io-accent-tint rounded-io-3 px-[5px] py-0.5 text-[10px] font-medium tracking-[.06em] uppercase"
          >
            Assistant
          </span>
        ) : null}
        {suffix ? (
          <span id={ids.sx} className="text-io-ink-3 text-[12px]">
            {suffix}
          </span>
        ) : null}
        {type === 'select' ? (
          <svg
            aria-hidden="true"
            width="10"
            height="6"
            viewBox="0 0 10 6"
            className="pointer-events-none absolute top-1/2 right-[11px] -translate-y-1/2"
          >
            <path d="M0 0h10L5 6z" fill="var(--io-caret)" />
          </svg>
        ) : null}
      </div>
      {message || why ? (
        <span
          className={cn(
            'text-[11.5px] leading-[1.45]',
            error ? 'text-io-bad' : 'text-io-ink-3',
            why && 'flex flex-wrap items-baseline gap-x-1.5'
          )}
        >
          {message ? <span id={ids.msg}>{message}</span> : null}
          {why ? (
            <Link
              href={`/why/${encodeURIComponent(why)}` as Route}
              className="io-focus rounded-io-tag text-io-accent font-medium hover:underline"
            >
              Why?
            </Link>
          ) : null}
        </span>
      ) : null}
    </>
  )
}
