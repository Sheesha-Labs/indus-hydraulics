'use client'

import { Button, ToastProvider, useToast } from '@indus/ui'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { startSupplierResearch } from '../../actions'

function Inner({ enquiryId, disabled, disabledReason }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = React.useTransition()

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await startSupplierResearch(formData)
      if (res.success) {
        toast({ title: 'Researching suppliers', description: 'Results appear per item as they land.' })
        router.refresh()
        return
      }
      toast({ title: res.message, tone: 'danger' })
    })
  }

  return (
    <form action={onSubmit}>
      <input type="hidden" name="enquiryId" value={enquiryId} />
      <Button type="submit" kind="primary" size="dense" loading={pending} disabled={disabled}>
        Find suppliers
      </Button>
      {disabled && disabledReason ? (
        <p className="mt-1 text-[12px] text-ih-muted">{disabledReason}</p>
      ) : null}
    </form>
  )
}

type Props = {
  enquiryId: string
  disabled?: boolean
  disabledReason?: string
}

export default function ResearchButton(props: Props) {
  return (
    <ToastProvider>
      <Inner {...props} />
    </ToastProvider>
  )
}
