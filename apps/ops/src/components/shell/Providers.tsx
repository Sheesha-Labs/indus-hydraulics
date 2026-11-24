'use client'

import { HotkeysProvider, useHotkeyRegistry, useHotkeys } from '@indus/ops-ui/lib/use-hotkeys'
import { ToastProvider } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  createUndoStack,
  DOCKED_PANELS,
  shellHotkeys,
  type ShellPanel,
} from '../../lib/shell-hotkeys'
import { CorrectionProvider } from '../undo/CorrectionModal'
import { ConfirmProvider } from './confirm'

export type { ShellPanel } from '../../lib/shell-hotkeys'

export interface ShellControls {
  /** Which surfaces are open. The command bar and notifications are modal; help is docked. */
  panels: Readonly<Record<ShellPanel, boolean>>
  open: (panel: ShellPanel) => void
  close: (panel: ShellPanel) => void
  toggle: (panel: ShellPanel) => void
  /**
   * A toast with an undo window registers its undo here so ⌘Z can run it (S07). Returns the unregister
   * function; call it when the toast closes. ⌘Z runs the newest undo whose window is still open.
   */
  registerUndo: (undo: () => void, remainingMs: number) => () => void
}

const ShellContext = createContext<ShellControls | null>(null)

/** The shell's panel state and undo registry (S02-T06 renders the panels). Throws outside Providers. */
export function useShell(): ShellControls {
  const shell = useContext(ShellContext)
  if (!shell) throw new Error('useShell() needs the console <Providers> above it')
  return shell
}

/** The open record's tab neighbours, published by RecordTabs (S02-T02). */
function recordTab(direction: 'prev' | 'next'): string | undefined {
  const tabs = document.querySelector<HTMLElement>('[data-record-tabs]')
  return (direction === 'prev' ? tabs?.dataset.prevHref : tabs?.dataset.nextHref) || undefined
}

const CLOSED: Record<ShellPanel, boolean> = {
  command: false,
  help: false,
  notifications: false,
  assistant: false,
}

/** Open `p`; a docked panel closes the other docked panel (one dock on the right edge). */
function opened(s: Record<ShellPanel, boolean>, p: ShellPanel): Record<ShellPanel, boolean> {
  const next = { ...s, [p]: true }
  if (DOCKED_PANELS.includes(p)) for (const d of DOCKED_PANELS) if (d !== p) next[d] = false
  return next
}

/**
 * The console's client providers, mounted once by AppShell (05 §6.1):
 *
 *   HotkeysProvider        one registry, one window keydown listener
 *   └ ToastProvider        one toast region, placed clear of the sidebar (236, or 64 collapsed)
 *     └ ShellContext       panels (command bar, notifications, help, Assistant) and the ⌘Z undo stack
 *       └ ConfirmProvider  useConfirm() for destructive actions (S07)
 *         └ CorrectionProvider  "Send a correction instead?" when an undo finds the email left (S06-T07)
 *       └ global shortcuts ⌘K, Esc, ?, ⌘Z, G T/R/M/E/Q/O/S/C/P, N, [ and ]
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <HotkeysProvider>
      <ToastProvider className="left-[calc(var(--io-sidebar)_+_24px)] in-[body:has([data-part=sidebar][data-collapsed])]:left-[calc(var(--io-sidebar-collapsed)_+_24px)]">
        <ShellState>{children}</ShellState>
      </ToastProvider>
    </HotkeysProvider>
  )
}

function ShellState({ children }: { children: ReactNode }) {
  const [panels, setPanels] = useState<Record<ShellPanel, boolean>>(CLOSED)
  const [undos] = useState(() => createUndoStack())
  const router = useRouter()
  const registry = useHotkeyRegistry()

  const open = useCallback((p: ShellPanel) => setPanels((s) => opened(s, p)), [])
  const close = useCallback((p: ShellPanel) => setPanels((s) => ({ ...s, [p]: false })), [])
  const toggle = useCallback(
    (p: ShellPanel) => setPanels((s) => (s[p] ? { ...s, [p]: false } : opened(s, p))),
    []
  )

  useHotkeys(
    shellHotkeys({
      go: (href) => router.push(href as Route),
      open,
      toggle,
      dismissTop: registry.dismissTop,
      undo: undos.runLatest,
      recordTab,
    })
  )

  const value = useMemo<ShellControls>(
    () => ({ panels, open, close, toggle, registerUndo: undos.push }),
    [panels, open, close, toggle, undos]
  )
  return (
    <ShellContext value={value}>
      <ConfirmProvider>
        <CorrectionProvider>{children}</CorrectionProvider>
      </ConfirmProvider>
    </ShellContext>
  )
}
