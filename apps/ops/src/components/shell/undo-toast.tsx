'use client'

import type { Result } from '@indus/ops-core'
import { useToast } from '@indus/ops-ui/overlay'
import { useMemo } from 'react'
import { useShell } from './Providers'

export interface UndoToastInput {
  title: string
  /** The server's remaining milliseconds of the undo window (ADR-11). */
  remainingMs: number
  onUndo: () => Promise<Result<unknown>>
  kind?: 'success' | 'info'
}

/**
 * An Undo toast whose undo is also ⌘Z while its window is open (S07, 05 §7.7). The undo runs once,
 * whichever of the two fires first.
 */
export function useUndoToast(): (input: UndoToastInput) => void {
  const { toast, dismiss } = useToast()
  const { registerUndo } = useShell()
  return useMemo(
    () => (input: UndoToastInput) => {
      let running: Promise<Result<unknown>> | null = null
      let off = () => {}
      const undoOnce = () => {
        off()
        running ??= input.onUndo()
        return running
      }
      const id = toast({
        kind: input.kind ?? 'success',
        title: input.title,
        undo: { remainingMs: input.remainingMs, onUndo: undoOnce },
      })
      off = registerUndo(() => {
        void undoOnce().then((r) => {
          if (r.success) dismiss(id)
          else toast({ kind: 'error', title: r.error })
        })
      }, input.remainingMs)
    },
    [toast, dismiss, registerUndo]
  )
}
