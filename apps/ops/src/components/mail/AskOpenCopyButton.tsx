'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { askOpenCopyAction } from '../../app/(console)/mail/actions/translate'

/** Board 97 (3): asks the Assistant to draft the "open copy" reply; it lands in Review (Draft and ask). */
export default function AskOpenCopyButton({ messageId }: { messageId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [refreshing, start] = useTransition()

  async function ask() {
    setBusy(true)
    try {
      const res = await askOpenCopyAction({ messageId })
      if (!res.success) {
        toast({ kind: 'error', title: res.error })
        return
      }
      toast({ kind: 'success', title: 'Drafting it: the reply waits for you in Review' })
      start(() => router.refresh())
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant="secondary" busy={busy || refreshing} onClick={() => void ask()}>
      Draft “Ask sender for an open copy”
    </Button>
  )
}
