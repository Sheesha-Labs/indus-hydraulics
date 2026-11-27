'use client'

import { useToast } from '@indus/ops-ui/overlay'
import { Chip } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { undoSpamAction } from '../../app/(console)/enquiries/[ref]/actions/choose-path'

/**
 * 171b state 3 · "Ignore (spam) · Sure … Filed as Not business. No reply, no record. Undo · treat as enquiry",
 * shown on the record while the 5-minute window is open (the server checks the window again on undo).
 */
export default function SpamFiled({
  enquiryId,
  text,
  reason,
  bare = false,
}: {
  enquiryId: string
  text: string
  reason: string | null
  /** 171b state sheet: the content without the card frame and eyebrow. */
  bare?: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, start] = useTransition()
  const undo = () =>
    start(async () => {
      const r = await undoSpamAction({ enquiryId })
      if (!r.success) toast({ kind: 'error', title: r.error })
      else toast({ kind: 'info', title: '↺ Treated as an enquiry · back to Qualifying' })
      router.refresh()
    })
  return (
    <section
      id="qualification"
      aria-label="Filed as spam"
      data-state="spam_filed"
      className={bare ? '' : 'rounded-io-card border-io-line bg-io-card border p-5'}
    >
      {bare ? null : <h2 className="io-eyebrow m-0">Qualification · phishing</h2>}
      <p className={bare ? 'm-0' : 'm-0 mt-3'}>
        <Chip tone="n" label="Ignore (spam) · Sure" />
      </p>
      {reason ? <p className="text-io-ink m-0 mt-3 text-[13px] leading-[1.5]">{reason}</p> : null}
      <p className="text-io-ink-3 m-0 mt-2 text-[12.5px]">{text}</p>
      <button
        type="button"
        onClick={undo}
        disabled={pending}
        className="text-io-accent io-focus rounded-io-tag mt-3 cursor-pointer border-0 bg-transparent p-0 text-[12.5px] hover:underline disabled:opacity-60"
      >
        Undo · treat as enquiry
      </button>
    </section>
  )
}
