'use client'

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import Button from '../controls/Button'
import { cn } from '../lib/cn'
import { settle, type ActionResult } from './result'
import { LAYER, modalBody, modalPanel, modalTitle, SCRIM, type ModalWidth } from './styles'
import { Consequences, ModalSections } from './surfaces'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** A question naming the thing: "Block Example Valve Co?" */
  title: string
  text?: ReactNode
  /** What happens, listed before the buttons (S07). Required: a destructive action always says. */
  consequences: readonly string[]
  /** "Block supplier". Rendered as the destructive button. */
  confirmLabel: string
  /** Shown on the confirm button while the action runs. Default: the confirm label. */
  busyLabel?: string
  /** Default "Cancel". Gets the initial focus. */
  cancelLabel?: string
  /** Runs the action. Busy while pending; a failure stays open with the error inline; success closes. */
  onConfirm: () => Promise<ActionResult>
  /** Foot, left. */
  note?: ReactNode
  width?: ModalWidth
  /** The control that opens it (AlertDialog.Trigger asChild); focus returns here on close. */
  trigger?: ReactNode
}

/**
 * Overlay kit `ConfirmDialog` on Radix AlertDialog, for destructive actions only (everything else runs at
 * once with an Undo toast). role="alertdialog"; initial focus on Cancel; Escape cancels; an outside click
 * does nothing; the consequences come before the buttons; the title is always in the danger tone.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  ...content
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger> : null}
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className={cn(
            'fixed inset-0 grid place-items-center overflow-y-auto p-8',
            SCRIM,
            LAYER.modal
          )}
        >
          {/* Mounted per opening (Radix unmounts closed content), so busy and error start clean. */}
          <ConfirmContent {...content} onClose={() => onOpenChange(false)} />
        </AlertDialog.Overlay>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

function ConfirmContent({
  title,
  text,
  consequences,
  confirmLabel,
  busyLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  note,
  width = 520,
  onClose,
}: Omit<ConfirmDialogProps, 'open' | 'onOpenChange' | 'trigger'> & { onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const confirm = async () => {
    setBusy(true)
    setError(null)
    const result = await settle(onConfirm)
    if (!mounted.current) return
    setBusy(false)
    if (result.success) onClose()
    else setError(result.error)
  }

  return (
    <AlertDialog.Content
      aria-modal="true"
      data-tone="danger"
      className={modalPanel({ width })}
      // While the action runs the dialog stays put: Escape cannot orphan a pending request.
      onEscapeKeyDown={(e) => {
        if (busy) e.preventDefault()
      }}
      {...(busy ? { 'aria-busy': true } : {})}
    >
      <ModalSections
        title={
          <AlertDialog.Title className={cn('m-0', modalTitle({ tone: 'danger' }))}>
            {title}
          </AlertDialog.Title>
        }
        close={null}
        body={
          <div className={modalBody}>
            <AlertDialog.Description asChild>
              <div className="flex flex-col gap-3">
                {text ? <div className="[&>p]:m-0">{text}</div> : null}
                <Consequences items={consequences} label="What happens" />
              </div>
            </AlertDialog.Description>
            {error ? (
              <p
                role="alert"
                className="border-io-bad-hover-line bg-io-bad-tint text-io-bad rounded-io-ctl m-0 border px-3 py-2 text-[12.5px]"
              >
                {error}
              </p>
            ) : null}
          </div>
        }
        note={note}
        actions={
          <>
            <AlertDialog.Cancel asChild>
              <Button variant="ghost" disabled={busy}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            {/* Not AlertDialog.Action: that closes on click, before the result is known. */}
            <Button variant="destructive" busy={busy} onClick={() => void confirm()}>
              {busy ? (busyLabel ?? confirmLabel) : confirmLabel}
            </Button>
          </>
        }
      />
    </AlertDialog.Content>
  )
}
