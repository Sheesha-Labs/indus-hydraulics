'use client'

import * as React from 'react'
import { cn } from './lib/utils'

/**
 * Design language v2 — `.ih-field` and its labelling furniture.
 *
 * 40px tall, 12px padding, 1px border, radius 6, 13.5px. Focus takes the
 * accent border plus the 3px accent-soft halo, matching Button.
 *
 * Error presentation follows 03-interactions-and-states.md §4: the border goes
 * danger AND a message replaces the hint. Colour never carries the meaning on
 * its own — the message does — so `error` is a string, not a boolean.
 */

const fieldBase = cn(
  'w-full rounded-md border bg-ih-surface px-3 text-[13.5px] text-ih-ink',
  'transition-[border-color,box-shadow] duration-150 ease-[ease]',
  'placeholder:text-ih-muted',
  'outline-none focus:border-ih-accent focus:ring-[3px] focus:ring-ih-accent-soft',
  'disabled:cursor-not-allowed disabled:opacity-45'
)

const withError = (error?: string) => (error ? 'border-ih-danger' : 'border-ih-border')

/**
 * Field passes the generated id and the error DOWN rather than making every
 * caller thread them through by hand.
 *
 * The previous API took an optional `htmlFor` and left the matching `id` to
 * the caller. Nothing enforced the pair, so a label with no htmlFor and a
 * control with no id looked completely correct in review and shipped with no
 * association at all — clicking the label focused nothing, and a screen reader
 * announced the control unlabelled. That failure mode is invisible in a
 * screenshot, which is how ~150 of them accumulated.
 *
 * With the context, association is the default and opting out means passing an
 * explicit id. An explicit prop always wins so a caller can still override.
 */
interface FieldCtx {
  id: string
  // Explicit `| undefined` rather than `?:` — the repo runs
  // exactOptionalPropertyTypes, so an optional property may be ABSENT but not
  // present-and-undefined, and these are always passed.
  error: string | undefined
  describedBy: string | undefined
}
const FieldContext = React.createContext<FieldCtx | null>(null)

/** Explicit prop wins; otherwise inherit from the enclosing Field. */
function useFieldWiring(id?: string, error?: string) {
  const ctx = React.useContext(FieldContext)
  return {
    id: id ?? ctx?.id,
    error: error ?? ctx?.error,
    describedBy: ctx?.describedBy,
  }
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error: errorProp, id: idProp, ...props },
  ref
) {
  const { id, error, describedBy } = useFieldWiring(idProp, errorProp)
  return (
    <input
      ref={ref}
      id={id}
      className={cn(fieldBase, 'h-10', withError(error), className)}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      {...props}
    />
  )
})

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error: errorProp, id: idProp, rows = 4, ...props },
  ref
) {
  const { id, error, describedBy } = useFieldWiring(idProp, errorProp)
  return (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      className={cn(fieldBase, 'h-auto resize-y py-2.5 leading-[1.55]', withError(error), className)}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      {...props}
    />
  )
})

// The caret is an inline SVG background so it can be tinted to the muted token
// rather than left to the platform. Keep the 30px right padding — the native
// caret is suppressed by appearance-none and this is what replaces it.
const CARET =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%238b93a3' d='M0 0h10L5 6z'/></svg>\")"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, error: errorProp, id: idProp, style, ...props },
  ref
) {
  const { id, error, describedBy } = useFieldWiring(idProp, errorProp)
  return (
    <select
      ref={ref}
      id={id}
      className={cn(fieldBase, 'h-10 appearance-none pr-[30px]', withError(error), className)}
      // Repeat is set here rather than via `bg-no-repeat` so the caret cannot
      // tile if the utility is ever purged or overridden — the three
      // background longhands travel together.
      style={{
        backgroundImage: CARET,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        ...style,
      }}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      {...props}
    />
  )
})

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  function Label({ className, ...props }, ref) {
    return (
      <label
        ref={ref}
        className={cn('mb-1.5 block text-xs font-medium text-ih-ink-2', className)}
        {...props}
      />
    )
  }
)

export function Hint({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-[5px] text-[11.5px] text-ih-muted', className)} {...props} />
}

export function ErrorText({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-[5px] text-[11.5px] text-ih-danger', className)} {...props} />
}

export interface FieldProps {
  label?: React.ReactNode
  hint?: React.ReactNode
  /** When set, replaces the hint and marks the control invalid. */
  error?: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}

/**
 * Label + control + (hint | error). The error replaces the hint rather than
 * stacking under it, so the control never changes height on validation.
 */
export function Field({ label, hint, error, htmlFor, className, children }: FieldProps) {
  // useId() rather than a name-derived string: these forms render inside
  // .map()s (address rows, spec rows), so a static id would be duplicated
  // across instances and the browser would resolve every one of those labels
  // to whichever control it saw first.
  const auto = React.useId()
  const id = htmlFor ?? auto
  const messageId = `${id}-msg`
  const hasMessage = Boolean(error || hint)

  return (
    <FieldContext.Provider
      value={{ id, error, describedBy: hasMessage ? messageId : undefined }}
    >
      <div className={className}>
        {label ? <Label htmlFor={id}>{label}</Label> : null}
        {children}
        {error ? (
          <ErrorText id={messageId}>{error}</ErrorText>
        ) : hint ? (
          <Hint id={messageId}>{hint}</Hint>
        ) : null}
      </div>
    </FieldContext.Provider>
  )
}

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
}

/**
 * 16px box, radius 3 — the one place the language uses a 3px radius, shared
 * with the square badge tag. The native input stays in the DOM (it carries the
 * semantics and the keyboard behaviour) and is visually replaced by the span.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, ...props },
  ref
) {
  return (
    <label className={cn('group inline-flex cursor-pointer items-center gap-2.5', className)}>
      <span className="relative inline-grid h-4 w-4 shrink-0 place-items-center">
        <input ref={ref} type="checkbox" className="peer absolute inset-0 z-10 cursor-pointer opacity-0" {...props} />
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-grid h-4 w-4 place-items-center rounded-[3px] border border-ih-border-strong bg-ih-surface text-white',
            'transition-[background-color,border-color] duration-150 ease-[ease]',
            'peer-checked:border-ih-accent peer-checked:bg-ih-accent',
            // The tick is a DESCENDANT of this span, not a sibling of the
            // input, so `peer-checked:opacity-100` on the svg itself would
            // never match — peer-* compiles to a sibling combinator. Reach it
            // from here instead.
            'peer-checked:[&>svg]:opacity-100',
            'peer-focus-visible:border-ih-accent peer-focus-visible:ring-[3px] peer-focus-visible:ring-ih-accent-soft',
            'peer-disabled:opacity-45'
          )}
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3 opacity-0" fill="none">
            <path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      {label ? <span className="text-[13px] text-ih-ink-2">{label}</span> : null}
    </label>
  )
})
