'use client'

import { Button } from '@indus/ops-ui/controls'
import { useUndoCountdown } from '@indus/ops-ui/lib/use-undo-countdown'
import { useEffect, useState } from 'react'
import type { ReviewReceipt } from '../../data/review'
import { useShell } from '../shell/Providers'
import { useServerUndo } from '../undo/UndoToast'

const WINDOW_MS = 5 * 60_000

/**
 * Board 104's receipt row: the person's last approval, with Undo while the server's window is open. `detailed`
 * (boards 103 "Approved · receipt with undo" and 114 part 1) adds the window's bar and what happens next.
 */
export default function ReceiptRow({
  receipt,
  detailed = false,
}: {
  receipt: ReviewReceipt
  detailed?: boolean
}) {
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
  const row = (
    <section
      aria-label="Last approval"
      className="bg-io-ok-tint border-io-ok rounded-io-card flex items-center gap-3 border px-4 py-3 text-[13px]"
    >
      <span aria-hidden className="text-io-ok">
        ✓
      </span>
      <p className="min-w-0 flex-1">
        <span className="font-medium">
          {detailed ? receipt.headline : `Approved · ${receipt.headline}`}
        </span>
        <span className="text-io-ink-2"> · {receipt.detail}</span>
      </p>
      {receipt.state === 'queued' ? (
        <Button variant="secondary" size="sm" busy={busy} onClick={() => void undo()}>
          Undo {left.label}
        </Button>
      ) : null}
    </section>
  )
  if (!detailed) return row
  const share = Math.min(1, left.remainingMs / WINDOW_MS)
  return (
    <div className="flex flex-col gap-2">
      {row}
      <svg
        aria-hidden
        className="text-io-ok-solid h-1 w-full"
        viewBox="0 0 100 4"
        preserveAspectRatio="none"
      >
        <rect width="100" height="4" className="fill-io-ok-tint" />
        <rect width={100 * share} height="4" fill="currentColor" />
      </svg>
      <p className="text-io-ink-3 m-0 text-[12.5px]">
        {receipt.state === 'queued'
          ? 'Until the countdown ends the email has not left. Undo returns the card to Review as it was, with your edits kept.'
          : 'Until the countdown ends Undo puts every change back as new rows.'}
      </p>
    </div>
  )
}
