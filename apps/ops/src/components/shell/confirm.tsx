'use client'

import { ConfirmDialog, type ConfirmDialogProps } from '@indus/ops-ui/overlay'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

/**
 * Confirm (S07, shell/README "Shared behaviour"): destructive actions confirm with their consequences
 * listed. Everything else runs at once with an Undo toast (undo-toast.tsx).
 */

export type ConfirmOptions = Omit<
  ConfirmDialogProps,
  'open' | 'onOpenChange' | 'trigger' | 'returnFocusRef'
>

/** Resolves true when the action ran and succeeded, false when the person cancelled. */
export type Confirm = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<Confirm | null>(null)

/**
 * `const confirm = useConfirm(); if (await confirm({ title, consequences, confirmLabel, onConfirm })) …`.
 * One ConfirmDialog for the console: initial focus on Cancel, Escape cancels, a failed action stays open
 * with its error, focus returns to whatever opened it. Throws outside the console providers.
 */
export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm() needs the console <Providers> above it')
  return confirm
}

interface Pending {
  options: ConfirmOptions
  resolve: (done: boolean) => void
  succeeded: boolean
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null)
  const [open, setOpen] = useState(false)
  const current = useRef<Pending | null>(null)
  // Whatever had focus when the question was asked gets it back when the dialog closes.
  const opener = useRef<HTMLElement | null>(null)

  const confirm = useCallback<Confirm>(
    (options) =>
      new Promise<boolean>((resolve) => {
        // A second confirm while one is open cancels the first: there is only ever one question.
        current.current?.resolve(false)
        const el = document.activeElement
        opener.current = el instanceof HTMLElement && el !== document.body ? el : null
        const next: Pending = { options, resolve, succeeded: false }
        current.current = next
        setPending(next)
        setOpen(true)
      }),
    []
  )

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (next) return
    const p = current.current
    current.current = null
    p?.resolve(p.succeeded)
  }, [])

  return (
    <ConfirmContext value={confirm}>
      {children}
      {pending ? (
        <ConfirmDialog
          {...pending.options}
          open={open}
          onOpenChange={onOpenChange}
          returnFocusRef={opener}
          onConfirm={async () => {
            const result = await pending.options.onConfirm()
            const asked = current.current
            if (result.success && asked) asked.succeeded = true
            return result
          }}
        />
      ) : null}
    </ConfirmContext>
  )
}
