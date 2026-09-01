'use client'

import { Button, Field, Input, Textarea, ToastProvider, useToast } from '@indus/ui'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { createEnquiryFromPaste } from '../../actions'

function Form() {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = React.useTransition()
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({})

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createEnquiryFromPaste(formData)
      if (res.success) {
        router.push(`/admin/enquiries/${res.data.code}`)
        return
      }
      setFieldErrors(res.fieldErrors ?? {})
      toast({ title: res.message, tone: 'danger' })
    })
  }

  return (
    /* FE-2: a create form is capped at 672px. FE-11: the save row sits below
       the card, not inside it. */
    <form action={onSubmit} className="flex max-w-2xl flex-col gap-5">
      {/* FE-3: fields never sit naked on the page ground. */}
      <div className="flex flex-col gap-5 rounded-lg border border-ih-border bg-ih-surface p-6">
        <Field
          label="Title or subject line"
          hint="Paste the subject verbatim. A bid number or revision token glued to the front is split off automatically."
          {...(fieldErrors.title?.[0] ? { error: fieldErrors.title[0] } : {})}
        >
          <Input name="title" required placeholder="A6-Y260603007PUMP OVERHAUL SPARES" />
        </Field>

        {/* FE-8: field groups share the vertical stack's 20px gap. */}
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Buyer" hint="The organisation requesting the quote.">
            <Input name="buyerName" placeholder="ASYAD Group / Oman Drydock" />
          </Field>
          <Field label="Source portal">
            <Input name="sourcePortal" placeholder="ProcureWare" />
          </Field>
        </div>

        <Field
          label="Closing date"
          hint="Two thirds of these close within two days. Setting it sorts the queue by what closes first."
          {...(fieldErrors.closingAt?.[0] ? { error: fieldErrors.closingAt[0] } : {})}
        >
          <Input type="datetime-local" name="closingAt" />
        </Field>

        <Field
          label="Enquiry text"
          hint="Paste the whole body, including the numbered item list. Line endings and run-together lists are handled."
          {...(fieldErrors.rawText?.[0] ? { error: fieldErrors.rawText[0] } : {})}
        >
          <Textarea
            name="rawText"
            required
            rows={14}
            className="font-mono"
            placeholder={'1. GASKET SET FOR MAIN PUMP - 4 Nos.2. SHAFT SEAL 60MM - 2 Nos.'}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" kind="primary" loading={pending}>
          Extract line items
        </Button>
        <p className="text-[13px] text-ih-muted">
          Extraction is deterministic. Every line records the exact text it came from.
        </p>
      </div>
    </form>
  )
}

export default function PasteForm() {
  return (
    <ToastProvider>
      <Form />
    </ToastProvider>
  )
}
