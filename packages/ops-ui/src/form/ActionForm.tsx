'use client'

import type { Result } from '@indus/ops-core'
import {
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useRef,
  type FormEvent,
  type FormHTMLAttributes,
  type ReactNode,
} from 'react'
import { useFormStatus } from 'react-dom'
import Button from '../controls/Button'
import { cn } from '../lib/cn'
import InlineState from '../states/InlineState'
import { FormErrorsContext, FormPendingContext } from './form-context'

/** A server action shaped for useActionState: the previous result (null before the first submit), then the form. */
export type FormAction<T> = (previous: Result<T> | null, formData: FormData) => Promise<Result<T>>

export interface ActionFormProps<T> extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'action' | 'children' | 'onSubmit'
> {
  action: FormAction<T>
  /** Fields, sections and any custom footer (SubmitButton reads the pending state). */
  children: ReactNode
  /** Renders the footer's primary submit button with this label. */
  submitLabel?: string
  /** The submit label while pending, e.g. "Saving…". Default: the submit label. */
  busyLabel?: string
  /** Beside the submit button, e.g. a Cancel link. */
  secondary?: ReactNode
  /** Called once per successful result, e.g. to close a drawer or show a toast. */
  onSuccess?: (data: T) => void
}

const EMPTY: Record<string, string> = {}

/**
 * Form kit ActionForm: a <form action> around useActionState. Fields stay uncontrolled and render on the
 * server; this thin client wrapper adds the pending state on the submit button and maps the action's
 * `fieldErrors` onto the fields by name (FormErrorsContext, read by each Field). The form-level `error`
 * shows above the footer as an InlineState.
 *
 * Before hydration the form posts natively to the action. After hydration the submit is dispatched in a
 * transition instead, so React does not reset the fields when the action fails: the person keeps what they
 * typed. A successful result resets the form so it shows the revalidated defaults.
 *
 * Files never go through here: a Dropzone uploads to Storage and posts only the file ids.
 */
export default function ActionForm<T>({
  action,
  children,
  submitLabel,
  busyLabel,
  secondary,
  onSuccess,
  className,
  ...rest
}: ActionFormProps<T>) {
  const [result, dispatch, pending] = useActionState<Result<T> | null, FormData>(action, null)
  const formRef = useRef<HTMLFormElement>(null)
  const onSuccessRef = useRef(onSuccess)
  useEffect(() => {
    onSuccessRef.current = onSuccess
  })

  useEffect(() => {
    if (!result?.success) return
    formRef.current?.reset()
    onSuccessRef.current?.(result.data)
  }, [result])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(() => dispatch(data))
  }

  const fieldErrors = result && !result.success ? (result.fieldErrors ?? EMPTY) : EMPTY
  const formError = result && !result.success ? result.error : undefined

  return (
    <FormErrorsContext.Provider value={fieldErrors}>
      <FormPendingContext.Provider value={pending}>
        <form
          {...rest}
          ref={formRef}
          action={dispatch}
          onSubmit={onSubmit}
          aria-busy={pending || undefined}
          data-part="action-form"
          className={cn('flex flex-col', className)}
        >
          {children}
          {formError ? <InlineState kind="error" text={formError} /> : null}
          {submitLabel ? (
            <div className="flex items-center gap-2 pt-2">
              <SubmitButton busyLabel={busyLabel}>{submitLabel}</SubmitButton>
              {secondary}
            </div>
          ) : null}
        </form>
      </FormPendingContext.Provider>
    </FormErrorsContext.Provider>
  )
}

export interface SubmitButtonProps {
  children: ReactNode
  busyLabel?: string | undefined
  variant?: 'primary' | 'secondary' | 'navy'
  className?: string
}

/**
 * The submit button of the enclosing form: busy (spinner, aria-busy, no second click) while the form's
 * action is pending. Inside an ActionForm the pending state comes from its useActionState (its submits are
 * dispatched in a transition, which useFormStatus does not see); in any other <form action> from
 * useFormStatus. Primary by default: one primary per view.
 */
export function SubmitButton({
  children,
  busyLabel,
  variant = 'primary',
  className,
}: SubmitButtonProps) {
  const status = useFormStatus()
  const pending = useContext(FormPendingContext) || status.pending
  return (
    <Button type="submit" variant={variant} busy={pending} {...(className ? { className } : {})}>
      {pending && busyLabel ? busyLabel : children}
    </Button>
  )
}
