'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { requestQuickReadAction } from '../../app/(console)/enquiries/[ref]/actions/choose-path'

/** The quick read for an enquiry without one (S09-T06): asks the Assistant; the card reads until it lands. */
export default function ReadNowButton({
  enquiryId,
  enquiryRef,
}: {
  enquiryId: string
  enquiryRef: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, start] = useTransition()
  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await requestQuickReadAction({ enquiryId, ref: enquiryRef })
          if (!r.success) toast({ kind: 'error', title: r.error })
          else toast({ kind: 'info', title: 'Reading the sender and the lines' })
          router.refresh()
        })
      }
    >
      {pending ? 'Asking…' : 'Read it now'}
    </Button>
  )
}
