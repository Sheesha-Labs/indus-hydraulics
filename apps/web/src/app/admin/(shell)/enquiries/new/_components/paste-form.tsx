'use client'

import { Button, Field, ToastProvider, useToast } from '@indus/ui'
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
    <form action={onSubmit} className="flex max-w-[820px] flex-col gap-5">
      <Field
        label="Title or subject line"
        hint="Paste the subject verbatim. A bid number or revision token glued to the front is split off automatically."
        {...(fieldErrors.title?.[0] ? { error: fieldErrors.title[0] } : {})}
      >
        <input
          name="title"
          required
          className="h-10 w-full rounded-[6px] border border-ih-border bg-ih-surface px-3 text-[14px] text-ih-ink"
          placeholder="A6-Y260603007PUMP OVERHAUL SPARES"
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Buyer" hint="The organisation requesting the quote.">
          <input
            name="buyerName"
            className="h-10 w-full rounded-[6px] border border-ih-border bg-ih-surface px-3 text-[14px] text-ih-ink"
            placeholder="ASYAD Group / Oman Drydock"
          />
        </Field>
        <Field label="Source portal">
          <input
            name="sourcePortal"
            className="h-10 w-full rounded-[6px] border border-ih-border bg-ih-surface px-3 text-[14px] text-ih-ink"
            placeholder="ProcureWare"
          />
        </Field>
      </div>

      <Field
        label="Closing date"
        hint="Two thirds of these close within two days. Setting it sorts the queue by what is closing first."
        {...(fieldErrors.closingAt?.[0] ? { error: fieldErrors.closingAt[0] } : {})}
      >
        <input
          type="datetime-local"
          name="closingAt"
          className="h-10 rounded-[6px] border border-ih-border bg-ih-surface px-3 text-[14px] text-ih-ink"
        />
      </Field>

      <Field
        label="Enquiry text"
        hint="Paste the whole body, including the numbered item list. Line endings and run-together lists are handled."
        {...(fieldErrors.rawText?.[0] ? { error: fieldErrors.rawText[0] } : {})}
      >
        <textarea
          name="rawText"
          required
          rows={16}
          className="w-full rounded-[6px] border border-ih-border bg-ih-surface p-3 font-mono text-[13px] leading-relaxed text-ih-ink"
          placeholder={'1. GASKET SET FOR MAIN PUMP - 4 Nos.2. SHAFT SEAL 60MM - 2 Nos.'}
        />
      </Field>

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
