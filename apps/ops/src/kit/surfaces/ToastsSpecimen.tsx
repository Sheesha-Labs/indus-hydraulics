'use client'

import { useToast } from '@indus/ops-ui/overlay'
import { useEffect, useRef } from 'react'
import { useUndoToast } from '../../components/shell/undo-toast'

// Stand-in undo: waits a moment and succeeds. Nothing leaves the page.
const ok = async () => {
  await new Promise((r) => setTimeout(r, 300))
  return { success: true as const, data: undefined }
}

/**
 * S07b "Toasts · Undo after send" inside the real AppShell (S02-T09): the shell's own toast region with
 * what the board stacks in it, an Undo toast after a send (through useUndoToast, so ⌘Z undoes it too)
 * above a running toast. Raised once on mount; neutral wording.
 */
export default function ToastsSpecimen() {
  const { toast } = useToast()
  const undoToast = useUndoToast()
  const raised = useRef(false)

  useEffect(() => {
    if (raised.current) return
    raised.current = true
    undoToast({ title: '5 RFQs go from purchase@ at 10:47', remainingMs: 5 * 60_000, onUndo: ok })
    toast({
      kind: 'running',
      title: 'Capturing sample offer…',
      action: { label: 'Undo', onAction: () => {} },
    })
  }, [toast, undoToast])

  return (
    <div className="px-io-page-x py-6" data-arrives>
      <h1 className="text-io-page text-io-ink">Toasts</h1>
      <p className="text-io-body text-io-ink-3 mt-1">
        S07b · an Undo toast after a send above a running toast, in the shell&apos;s toast region.
      </p>
    </div>
  )
}
