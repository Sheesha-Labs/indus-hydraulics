'use client'

import { Button, Field, Input, Select, ToastProvider, useToast } from '@indus/ui'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { generateEnquiryQuote } from '../../../actions'

function Inner({ enquiryId, linesPriced }: { enquiryId: string; linesPriced: number }) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = React.useTransition()

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await generateEnquiryQuote(formData)
      if (res.success) {
        toast({ title: `Estimate ${res.data.code} created` })
        router.refresh()
        return
      }
      toast({ title: res.message, tone: 'danger', duration: null })
    })
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="enquiryId" value={enquiryId} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Markup mode" hint="Percentage is on cost; target margin is on sell price.">
          <Select name="markupMode" defaultValue="percentage"><option value="percentage">Percentage on cost</option>
            <option value="target_margin">Target margin on sell</option>
            <option value="absolute">Absolute AED per unit</option></Select>
        </Field>
        <Field label="Value">
          <Input name="markupValue" type="number" step="0.01" min="0" defaultValue="30" />
        </Field>
        <Field label="Ship-to country" hint="UAE adds 5% VAT; anywhere else is zero-rated export.">
          <Input name="shipToCountryCode" maxLength={2} defaultValue="AE" className="uppercase" />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" kind="primary" loading={pending}>
          Generate estimate
        </Button>
        <p className="text-[13px] text-ih-muted">
          {linesPriced} {linesPriced === 1 ? 'line' : 'lines'} will be included.
        </p>
      </div>
    </form>
  )
}

export default function GenerateQuoteForm(props: { enquiryId: string; linesPriced: number }) {
  return (
    <ToastProvider>
      <Inner {...props} />
    </ToastProvider>
  )
}
