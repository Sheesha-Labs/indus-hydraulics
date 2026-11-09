'use client'

import { Button, type ButtonProps } from '@indus/ui'
import { useActionState, useEffect, useRef } from 'react'

import type { Result } from '../../../lib/result'

type State = Result<{ message: string }> | Result<never> | null

type Props = {
  /** A server action in useActionState's shape, bound to its leading arguments. */
  action: (prev: State, formData: FormData) => Promise<State>
  submitLabel: string
  pendingLabel?: string
  kind?: ButtonProps['kind']
  /** Clear the form after a success (add-one-more forms). */
  resetOnSuccess?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * A form posting to one server action, with its outcome said under it. The
 * fields are the children; field errors from the action land in the message
 * line (each form here has one or two fields, so per-field placement would
 * add markup for no gain).
 */
export default function ActionForm({
  action,
  submitLabel,
  pendingLabel = 'Saving…',
  kind = 'outline',
  resetOnSuccess = false,
  className,
  children,
}: Props) {
  const [state, formAction, pending] = useActionState(action, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (resetOnSuccess && state?.success) formRef.current?.reset()
  }, [state, resetOnSuccess])

  const message = state ? (state.success ? (state.data as { message?: string } | undefined)?.message : state.message) : null

  return (
    <form ref={formRef} action={formAction} className={className}>
      <div className="flex flex-wrap items-end gap-3">
        {children}
        <Button type="submit" kind={kind} size="dense" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
      {message ? (
        <p
          role={state?.success ? 'status' : 'alert'}
          className={state?.success ? 'mt-2 text-[13px] text-ih-success-ink' : 'mt-2 text-[13px] text-ih-danger-ink'}
        >
          {message}
        </p>
      ) : null}
    </form>
  )
}
