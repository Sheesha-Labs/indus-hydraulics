'use client'

import { Button, Field, Input, Textarea, ToastProvider, useToast } from '@indus/ui'
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
        <Input name="supplierName" placeholder="Acme Valves GmbH" />
      </Field>
      <Field label="Their reply">
        <Textarea
          name="rawText"
          required
          rows={12}
          className="font-mono"
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
