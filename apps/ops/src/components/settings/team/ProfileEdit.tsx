'use client'

import { Button } from '@indus/ops-ui/controls'
import { Field } from '@indus/ops-ui/form'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { Banner } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition, type FormEvent } from 'react'
import { updateProfileAction } from '../../../app/(console)/settings/team/actions/profile'
import { formText } from './labels'

/** A field's error prop only when there is one (exactOptionalPropertyTypes). */
function fieldError(message: string | undefined): { error?: string } {
  return message ? { error: message } : {}
}

/**
 * Profile › Edit (board 84 #profile): name, phone and the signature in one small form. The signature is
 * plain text until the mailbox is connected (S04 replaces it with the Gmail signature).
 */
export default function ProfileEdit({
  name,
  phone,
  signature,
  signatureLabel,
}: {
  name: string
  phone: string | null
  signature: string
  signatureLabel: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const formId = useId()
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    start(async () => {
      const result = await updateProfileAction({
        name: formText(form, 'name'),
        phone: formText(form, 'phone'),
        signature: formText(form, 'signature'),
      })
      if (result.success) {
        setOpen(false)
        toast({ kind: 'success', title: 'Profile saved.' })
        router.refresh()
      } else {
        setErrors(result.fieldErrors ?? {})
        setError(result.fieldErrors ? null : result.error)
      }
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setErrors({})
          setError(null)
        }
      }}
      title="Edit profile"
      trigger={
        <Button variant="link" className="text-[13px]">
          Edit<span className="sr-only"> profile</span>
        </Button>
      }
      actions={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form={formId} busy={pending}>
            Save
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="flex flex-col gap-3.5">
        <Field
          type="text"
          label="Name"
          name="name"
          required
          defaultValue={name}
          {...fieldError(errors.name)}
        />
        <Field
          type="text"
          label="Phone"
          name="phone"
          optional
          defaultValue={phone ?? ''}
          {...fieldError(errors.phone)}
        />
        <Field
          type="textarea"
          label={signatureLabel}
          name="signature"
          optional
          defaultValue={signature}
          hint="Replaced by your Gmail signature once the mailbox is connected"
          {...fieldError(errors.signature)}
        />
        {error ? (
          <Banner tone="bad" className="px-3 py-2.5 text-[12.5px]">
            {error}
          </Banner>
        ) : null}
      </form>
    </Modal>
  )
}
