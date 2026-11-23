import { cn } from '@indus/ops-ui/lib/cn'
import type { InputHTMLAttributes, ReactNode } from 'react'

/** A field as the Form kit draws it, for the inputs Field does not offer (password, one-time code). */
export default function AuthField({
  label,
  hint,
  error,
  id,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  id: string
  hint?: ReactNode
  error?: string | undefined
}) {
  const msg = error ?? hint
  return (
    <div data-part="field" className="flex w-full min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-io-ink-2 text-[12px] leading-[1.45] font-medium">
        {label}
      </label>
      <div
        data-part="field-control"
        {...(error ? { 'data-invalid': '' } : {})}
        className={cn(
          'io-focus-field border-io-stroke bg-io-card text-io-ink rounded-io-ctl h-io-field flex min-w-0 items-center border px-3 text-[13px]',
          error && 'border-io-bad-solid'
        )}
      >
        <input
          id={id}
          {...input}
          {...(msg ? { 'aria-describedby': `${id}-msg` } : {})}
          {...(error ? { 'aria-invalid': true } : {})}
          className="placeholder:text-io-ink-4 h-full min-w-0 flex-1 bg-transparent text-current outline-none"
        />
      </div>
      {msg ? (
        <span
          id={`${id}-msg`}
          className={cn('text-[11.5px] leading-[1.45]', error ? 'text-io-bad' : 'text-io-ink-3')}
        >
          {msg}
        </span>
      ) : null}
    </div>
  )
}
