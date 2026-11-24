'use client'

import { Button } from '@indus/ops-ui/controls'
import { useUndoCountdown } from '@indus/ops-ui/lib/use-undo-countdown'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { undoApprovalAction } from '../../actions/proposal/decide'
import type { ReviewReceipt } from '../../data/review'

/** Board 104's receipt row: the person's last approval, with Undo while the server's window is open. */
export default function ReceiptRow({ receipt }: { receipt: ReviewReceipt }) {
  const router = useRouter()
  const { toast } = useToast()
  const left = useUndoCountdown(receipt.undoRemainingMs)
  const [busy, setBusy] = useState(false)
  if (left.remainingMs <= 0) return null
  async function undo() {
    setBusy(true)
    try {
      const r = await undoApprovalAction({ actionId: receipt.actionId })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      toast({ kind: 'success', title: '↺ Undone · nothing was sent · back in Review' })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }
  return (
    <section
      aria-label="Last approval"
      className="bg-io-ok-tint border-io-ok rounded-io-card flex items-center gap-3 border px-4 py-3 text-[13px]"
    >
      <span aria-hidden className="text-io-ok">
        ✓
      </span>
      <p className="min-w-0 flex-1">
        <span className="font-medium">Approved · {receipt.headline}</span>
        <span className="text-io-ink-2"> · {receipt.detail}</span>
      </p>
      {receipt.state === 'queued' ? (
        <Button variant="secondary" size="sm" busy={busy} onClick={() => void undo()}>
          Undo {left.label}
        </Button>
      ) : null}
    </section>
  )
}
