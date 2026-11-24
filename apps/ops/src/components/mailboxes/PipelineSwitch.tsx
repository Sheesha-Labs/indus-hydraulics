'use client'

import { Toggle } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { setMailPipelineAction } from '../../app/(console)/settings/mailboxes/actions/pipeline'

/**
 * Settings › Mailboxes (S05-T09): the Owner's switch for the mail pipeline. On, the Assistant classifies,
 * links and labels new mail (and sorts what arrived while it was off, oldest first); off, mail is stored and
 * shown but left unsorted. The Helper sees the state, read only.
 */
export default function PipelineSwitch({
  enabled,
  canChange,
}: {
  enabled: boolean
  canChange: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [on, setOn] = useState(enabled)
  const [busy, setBusy] = useState(false)

  async function change(next: boolean) {
    setBusy(true)
    setOn(next)
    try {
      const res = await setMailPipelineAction({ enabled: next })
      if (!res.success) {
        setOn(!next)
        toast({ kind: 'error', title: res.error })
        return
      }
      toast({
        kind: 'success',
        title: next
          ? 'The Assistant sorts new mail now, and what arrived while it was off, oldest first.'
          : 'New mail is stored and shown, but no longer sorted.',
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      aria-label="Mail pipeline"
      className="bg-io-card border-io-line rounded-io-card flex items-center gap-4 border px-4.5 py-3.5"
    >
      <Toggle
        checked={on}
        onCheckedChange={(v) => void change(v)}
        disabled={!canChange || busy}
        label="Let the Assistant sort new mail"
        sub={
          canChange
            ? 'Classify, link and label each new email within two minutes. Off: mail is stored and shown, left unsorted.'
            : 'Only the Owner can switch this.'
        }
      />
    </section>
  )
}
