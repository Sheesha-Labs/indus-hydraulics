'use client'

import { Button, Field, ToastProvider, useToast } from '@indus/ui'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { recordSupplierOffer } from '../../../actions'

function Form({ enquiryId }: { enquiryId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = React.useTransition()

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await recordSupplierOffer(formData)
      if (res.success) {
        toast({
          title: `${res.data.lines} ${res.data.lines === 1 ? 'line' : 'lines'} extracted`,
          ...(res.data.dropped > 0
            ? { description: `${res.data.dropped} dropped — no traceable price in the text.` }
            : {}),
        })
        router.refresh()
        return
      }
      toast({ title: res.message, tone: 'danger', duration: null })
    })
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="enquiryId" value={enquiryId} />
      <Field label="Supplier" hint="Leave blank to take the name from the reply.">
        <input
          name="supplierName"
          className="h-10 w-full rounded-[6px] border border-ih-border bg-ih-surface px-3 text-[14px] text-ih-ink"
          placeholder="Acme Valves GmbH"
        />
      </Field>
      <Field label="Their reply">
        <textarea
          name="rawText"
          required
          rows={12}
          className="w-full rounded-[6px] border border-ih-border bg-ih-surface p-3 font-mono text-[13px] leading-relaxed text-ih-ink"
          placeholder="Paste the whole email, including prices and terms."
        />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" kind="primary" loading={pending}>
          Extract offer
        </Button>
        <p className="text-[13px] text-ih-muted">
          Any price we cannot trace back to your pasted text is dropped, not guessed.
        </p>
      </div>
    </form>
  )
}

export default function PasteOfferForm({ enquiryId }: { enquiryId: string }) {
  return (
    <ToastProvider>
      <Form enquiryId={enquiryId} />
    </ToastProvider>
  )
}
