'use client'

import type { Result } from '@indus/ops-core'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { undoApprovalAction } from '../../actions/proposal/undo'
import { useUndoToast } from '../shell/undo-toast'
import { useOfferCorrection } from './CorrectionModal'

/**
 * Server-owned undo on the client (S06-T07, S07B toasts). `undo(actionId)` asks the server; an undo that
 * worked says when and what happened ("↺ Undone at 10:15 · nothing was sent · back in Review"); an email
 * that already left is refused with "<ref> left at 10:19. It can't be recalled." and the correction modal
 * opens. `showUndoable` raises the success toast whose "Undo m:ss" counts down from the server's remaining
 * milliseconds and is also ⌘Z while the window is open.
 */
export function useServerUndo() {
  const router = useRouter()
  const { toast } = useToast()
  const offer = useOfferCorrection()
  const undoToast = useUndoToast()

  const undo = useCallback(
    async (
      actionId: string,
      what: 'send' | 'change' = 'send',
      /** The caller raises errors itself (ProposalActions toasts a failed result). */
      quietErrors = false
    ): Promise<Result<undefined>> => {
      const r = await undoApprovalAction({ actionId })
      if (!r.success) {
        if (!quietErrors) toast({ kind: 'error', title: r.error })
        return r
      }
      if (!r.data.undone) {
        const { ref, at } = r.data.left
        const error = `${ref} left${at ? ` at ${at}` : ''}. It can’t be recalled.`
        if (!quietErrors) toast({ kind: 'error', title: error })
        offer({ actionId, ref, at })
        return { success: false, error }
      }
      toast({
        kind: 'info',
        title:
          what === 'send'
            ? `↺ Undone at ${r.data.at} · nothing was sent · back in Review`
            : `↺ Undone at ${r.data.at} · put back as it was`,
      })
      router.refresh()
      return { success: true, data: undefined }
    },
    [toast, offer, router]
  )

  const showUndoable = useCallback(
    (input: { title: string; actionId: string; remainingMs: number; what?: 'send' | 'change' }) =>
      undoToast({
        title: input.title,
        remainingMs: input.remainingMs,
        onUndo: () => undo(input.actionId, input.what ?? 'send'),
      }),
    [undoToast, undo]
  )

  return useMemo(() => ({ undo, showUndoable }), [undo, showUndoable])
}
