'use client'

import { Button, Checkbox } from '@indus/ops-ui/controls'
import { Field } from '@indus/ops-ui/form'
import { Banner } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition, type FormEvent, type ReactNode } from 'react'
import { inviteHelperAction } from '../../../app/(console)/settings/team/actions/team'
import { formText } from './labels'

export type InviteSent = { email: string; expiresAt: string; mail: string }

/**
 * The invite form (board 84's "Invite a helper" modal and setup step 6): the Helper's address, the
 * domain override and the board's note. Self-contained (no console providers), so the setup wizard can
 * mount it. The server decides everything: domain, one Helper, open invitations.
 */
export default function InviteForm({
  domain,
  submitLabel = 'Send invite',
  primary = true,
  onSent,
  secondary,
}: {
  domain: string
  submitLabel?: string
  /** False where the view already has its one primary (the setup wizard's Next). */
  primary?: boolean
  onSent?: (sent: InviteSent) => void
  /** Beside the submit button (the modal's Cancel). */
  secondary?: ReactNode
}) {
  const router = useRouter()
  const noteId = useId()
  const [override, setOverride] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | undefined>()
  const [pending, start] = useTransition()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = formText(new FormData(event.currentTarget), 'email')
    start(async () => {
      const result = await inviteHelperAction({ email, overrideDomain: override })
      if (result.success) {
        setError(null)
        setFieldError(undefined)
        onSent?.(result.data)
        router.refresh()
      } else {
        setFieldError(result.fieldErrors?.email)
        setError(result.fieldErrors?.email ? null : result.error)
      }
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5" aria-busy={pending || undefined}>
      <Field
        type="email"
        label="Helper’s email"
        name="email"
        required
        placeholder={`name@${domain}`}
        {...(fieldError ? { error: fieldError } : {})}
      />
      <Checkbox
        name="overrideDomain"
        checked={override}
        onChange={(e) => setOverride(e.target.checked)}
        label="Allow another domain"
        sub="Only for someone outside the Workspace. The override is logged."
      />
      <p id={noteId} className="text-io-ink-3 m-0 text-[12px] leading-[1.45]">
        Invites must be @{domain} unless you override it. Transfer ownership asks you to sign in
        again.
      </p>
      {error ? (
        <Banner tone="bad" className="px-3 py-2.5 text-[12.5px]">
          {error}
        </Banner>
      ) : null}
      <div className="flex justify-end gap-2">
        {secondary}
        <Button
          type="submit"
          variant={primary ? 'primary' : 'secondary'}
          busy={pending}
          aria-describedby={noteId}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
