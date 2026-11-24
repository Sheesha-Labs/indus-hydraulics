'use client'

import { Button } from '@indus/ops-ui/controls'
import { useUndoCountdown } from '@indus/ops-ui/lib/use-undo-countdown'
import { useEffect, useState } from 'react'
import type { ReviewReceipt } from '../../data/review'
import { useShell } from '../shell/Providers'
import { useServerUndo } from '../undo/UndoToast'

/** Board 104's receipt row: the person's last approval, with Undo while the server's window is open. */
export default function ReceiptRow({ receipt }: { receipt: ReviewReceipt }) {
  const { undo: serverUndo } = useServerUndo()
  const { registerUndo } = useShell()
  const left = useUndoCountdown(receipt.undoRemainingMs)
  const [busy, setBusy] = useState(false)
  const queued = receipt.state === 'queued'
  async function undo() {
    setBusy(true)
    try {
      await serverUndo(receipt.actionId, queued ? 'send' : 'change')
    } finally {
      setBusy(false)
    }
  }
  // ⌘Z undoes the last approval while its window is open (S07B).
  useEffect(
    () =>
      receipt.undoRemainingMs > 0
        ? registerUndo(
            () => void serverUndo(receipt.actionId, queued ? 'send' : 'change'),
            receipt.undoRemainingMs
          )
        : undefined,
    [registerUndo, serverUndo, receipt.actionId, receipt.undoRemainingMs, queued]
  )
  if (left.remainingMs <= 0) return null
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
