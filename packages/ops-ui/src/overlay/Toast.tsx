'use client'

import { useEffect, useRef, useState } from 'react'
import { useUndoCountdown } from '../lib/use-undo-countdown'
import { settle, type ActionResult } from './result'
import { toastAction, toastClose, type ToastKind } from './styles'
import { CloseIcon, ToastView } from './surfaces'

export interface ToastInput {
  kind: ToastKind
  title: string
  /** A link-styled button after the title ("Retry", "Open"). Activating it also dismisses the toast. */
  action?: { label: string; onAction: () => void }
  /**
   * The server-owned undo window (ADR-11): "Undo m:ss" counts down from the server's remainingMs. The
   * toast stays until the window closes or it is dismissed; a failed undo raises an error toast.
   */
  undo?: { remainingMs: number; onUndo: () => Promise<ActionResult> }
  /**
   * Auto-dismiss after this long; timers pause while the pointer or focus is in the toast region.
   * Default 6000. Undo toasts ignore it (they last as long as the window); running toasts stay until
   * dismissed unless a duration is given.
   */
  durationMs?: number
}

export interface ToastRecord extends ToastInput {
  id: number
}

export const DEFAULT_TOAST_MS = 6000

interface ToastProps {
  toast: ToastRecord
  /** Pointer or focus is in the region: auto-dismiss timers hold. */
  paused: boolean
  onDismiss: (id: number) => void
  /** A failed undo: the provider raises an error toast with this message. */
  onUndoFailed: (message: string) => void
}

/** How long a toast lives on its own, or null when it waits for its window or for a person. */
export function lifetimeOf(t: ToastInput): number | null {
  if (t.undo) return null
  if (t.durationMs != null) return t.durationMs
  return t.kind === 'running' ? null : DEFAULT_TOAST_MS
}

/**
 * One toast in the ToastProvider region. It never takes focus; F6 (or Tab) reaches its buttons. Mounted
 * only by ToastProvider.
 */
export default function Toast({ toast, paused, onDismiss, onUndoFailed }: ToastProps) {
  const { id, kind, title, action, undo } = toast
  const lifetime = lifetimeOf(toast)

  // Auto-dismiss that resumes with the time left, not a fresh full duration, after a pause.
  const left = useRef(lifetime)
  useEffect(() => {
    if (paused || left.current == null) return
    const started = performance.now()
    const timer = setTimeout(() => onDismiss(id), left.current)
    return () => {
      clearTimeout(timer)
      if (left.current != null)
        left.current = Math.max(0, left.current - (performance.now() - started))
    }
  }, [paused, id, onDismiss])

  return (
    <ToastView
      kind={kind}
      title={title}
      action={
        undo ? (
          <UndoButton
            remainingMs={undo.remainingMs}
            onUndo={undo.onUndo}
            onDone={() => onDismiss(id)}
            onFailed={onUndoFailed}
          />
        ) : action ? (
          <button
            type="button"
            className={toastAction}
            onClick={() => {
              action.onAction()
              onDismiss(id)
            }}
          >
            {action.label}
          </button>
        ) : null
      }
      close={
        <button
          type="button"
          aria-label="Dismiss"
          className={toastClose}
          onClick={() => onDismiss(id)}
        >
          <CloseIcon size={14} />
        </button>
      }
    />
  )
}

/** "Undo m:ss" from the server's remaining milliseconds; gone when the window closes. */
function UndoButton({
  remainingMs,
  onUndo,
  onDone,
  onFailed,
}: {
  remainingMs: number
  onUndo: () => Promise<ActionResult>
  onDone: () => void
  onFailed: (message: string) => void
}) {
  const { label } = useUndoCountdown(remainingMs, onDone)
  const [busy, setBusy] = useState(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const run = async () => {
    setBusy(true)
    const result = await settle(onUndo)
    if (!mounted.current) return
    setBusy(false)
    if (result.success) onDone()
    else onFailed(result.error)
  }

  return (
    <button
      type="button"
      className={toastAction}
      disabled={busy}
      onClick={() => void run()}
      {...(busy ? { 'aria-busy': true } : {})}
    >
      Undo <span className="tabular-nums">{label}</span>
    </button>
  )
}
