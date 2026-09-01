'use client'

import { Button, ToastProvider, useToast } from '@indus/ui'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { selectOfferLine } from '../../../actions'

type Props = {
  offerLineId: string
  enquiryLineId: string
  selected: boolean
  /** An alternative part is an engineering substitution — confirm explicitly. */
  requiresConfirmation: boolean
}

function Inner(props: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = React.useTransition()

  function onSubmit(formData: FormData) {
    if (
      props.requiresConfirmation &&
      !window.confirm(
        'This is an ALTERNATIVE part, not the one requested. Substituting a part on a hydraulic system is an engineering decision. Select it anyway?',
      )
    ) {
      return
    }
    startTransition(async () => {
      const res = await selectOfferLine(formData)
      if (res.success) {
        router.refresh()
        return
      }
      toast({ title: res.message, tone: 'danger' })
    })
  }

  return (
    <form action={onSubmit}>
      <input type="hidden" name="offerLineId" value={props.offerLineId} />
      <input type="hidden" name="enquiryLineId" value={props.enquiryLineId} />
      <Button type="submit" kind={props.selected ? 'ghost' : 'outline'} size="dense-sm" loading={pending}>
        {props.selected ? 'Selected' : 'Use this'}
      </Button>
    </form>
  )
}

export default function SelectOfferButton(props: Props) {
  return (
    <ToastProvider>
      <Inner {...props} />
    </ToastProvider>
  )
}
