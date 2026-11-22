'use client'

import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode, RefObject } from 'react'
import { cn } from '../lib/cn'
import {
  closeButton,
  LAYER,
  modalBody,
  modalPanel,
  modalTitle,
  SCRIM,
  type ModalWidth,
} from './styles'
import { CloseIcon, Consequences, ModalSections } from './surfaces'

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Body text (13/1.55 ink-2). Becomes the dialog's description. */
  children?: ReactNode
  /** "What happens" list in the paper box, after the text. Always present for destructive actions. */
  consequences?: readonly string[]
  /** Foot, left (12px ink-3). */
  note?: ReactNode
  /** Foot, right. Cancel is ghost; one primary. */
  actions: ReactNode
  /** danger colours the title bad. */
  tone?: 'danger'
  /** Default 520. */
  width?: ModalWidth
  /**
   * The control that opens the modal (Dialog.Trigger asChild). With it, focus returns to the trigger on
   * close even if the trigger re-rendered or was replaced in between.
   */
  trigger?: ReactNode
  /**
   * Where focus goes on close when there is no `trigger` (a modal opened from a menu item, a shortcut or
   * another surface). Without either, Radix returns focus to whatever was focused when it opened.
   */
  returnFocusRef?: RefObject<HTMLElement | null>
}

/**
 * Overlay kit `Modal` on Radix Dialog: scrim, focus trap, Escape and outside click close, focus returns to
 * the trigger, everything behind is aria-hidden, aria-labelledby the title and aria-describedby the body.
 * Escape closes only the top-most layer (one Radix DismissableLayer stack for every Ops overlay).
 */
export default function Modal({
  open,
  onOpenChange,
  title,
  children,
  consequences = [],
  note,
  actions,
  tone,
  width = 520,
  trigger,
  returnFocusRef,
}: ModalProps) {
  const hasBody = children != null || consequences.length > 0
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        {/* The scrim is the scroll container, so a tall modal scrolls inside it, not the page behind. */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 grid place-items-center overflow-y-auto p-8',
            SCRIM,
            LAYER.modal
          )}
        >
          <Dialog.Content
            // Radix hides everything else with aria-hidden; aria-modal states the same for readers that
            // look for it (packages/ui/src/Dialog.tsx docblock).
            aria-modal="true"
            {...(hasBody ? {} : { 'aria-describedby': undefined })}
            data-tone={tone ?? 'neutral'}
            className={modalPanel({ width })}
            {...(trigger || !returnFocusRef
              ? {}
              : {
                  onCloseAutoFocus: (e: Event) => {
                    const el = returnFocusRef.current
                    if (el?.isConnected) {
                      e.preventDefault()
                      el.focus()
                    }
                  },
                })}
          >
            <ModalSections
              title={
                <Dialog.Title className={cn('m-0', modalTitle({ tone: tone ?? 'neutral' }))}>
                  {title}
                </Dialog.Title>
              }
              close={
                <Dialog.Close aria-label="Close" className={closeButton}>
                  <CloseIcon />
                </Dialog.Close>
              }
              body={
                hasBody ? (
                  <Dialog.Description asChild>
                    <div className={modalBody}>
                      {children}
                      <Consequences items={consequences} />
                    </div>
                  </Dialog.Description>
                ) : null
              }
              note={note}
              actions={actions}
            />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
