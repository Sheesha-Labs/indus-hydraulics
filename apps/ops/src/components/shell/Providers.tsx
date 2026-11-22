'use client'

import {
  HotkeysProvider,
  useHotkeyRegistry,
  useHotkeys,
  type Hotkey,
} from '@indus/ops-ui/lib/use-hotkeys'
import { ToastProvider } from '@indus/ops-ui/overlay'
import { NAV_DESTINATIONS, type NavKey } from '@indus/ops-ui/shell/nav'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/** The shell surfaces opened from anywhere (05 §6.3): client state, not navigations. S02-T06 renders them. */
export type ShellPanel = 'command' | 'help' | 'notifications'

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

/** The shell's panel state and undo registry. Throws outside the console's Providers. */
export function useShell(): ShellControls {
  const shell = useContext(ShellContext)
  if (!shell) throw new Error('useShell() needs the console <Providers> above it')
  return shell
}

/** G-chords: the letter after G for each destination (05 §7.7). */
const GO_TO: ReadonlyArray<readonly [string, NavKey]> = [
  ['t', 'today'],
  ['r', 'review'],
  ['m', 'mail'],
  ['e', 'enquiries'],
  ['q', 'quotations'],
  ['o', 'orders'],
  ['s', 'suppliers'],
  ['c', 'clients'],
  ['p', 'parts'],
]

/** Where N goes. The folder arrives with the route skeleton (S02-T07). */
const NEW_ENQUIRY_HREF = '/enquiries/new'

/** The open record's tab neighbours, published by RecordTabs (S02-T02). */
function recordTabHref(direction: 'prev' | 'next'): string | undefined {
  const tabs = document.querySelector<HTMLElement>('[data-record-tabs]')
  return (direction === 'prev' ? tabs?.dataset.prevHref : tabs?.dataset.nextHref) || undefined
}

const CLOSED: Record<ShellPanel, boolean> = { command: false, help: false, notifications: false }

/**
 * The console's client providers, mounted once by AppShell: the hotkey registry (one window listener), the
 * toast region (cleared of the sidebar) and the shell state (panels, undo). The global shortcuts are
 * registered here; record- and list-scoped ones (J/K, X, E/R/L) are registered by the screens that own them.
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
  const undos = useRef<Array<{ run: () => void; until: number }>>([])

  const open = useCallback((p: ShellPanel) => setPanels((s) => ({ ...s, [p]: true })), [])
  const close = useCallback((p: ShellPanel) => setPanels((s) => ({ ...s, [p]: false })), [])
  const toggle = useCallback((p: ShellPanel) => setPanels((s) => ({ ...s, [p]: !s[p] })), [])
  const registerUndo = useCallback((run: () => void, remainingMs: number) => {
    const entry = { run, until: Date.now() + remainingMs }
    undos.current.push(entry)
    return () => {
      undos.current = undos.current.filter((u) => u !== entry)
    }
  }, [])

  const value = useMemo<ShellControls>(
    () => ({ panels, open, close, toggle, registerUndo }),
    [panels, open, close, toggle, registerUndo]
  )

  return (
    <ShellContext value={value}>
      <GlobalHotkeys
        open={open}
        toggle={toggle}
        undo={() => {
          const now = Date.now()
          undos.current = undos.current.filter((u) => u.until > now)
          const latest = undos.current.pop()
          if (!latest) return false
          latest.run()
          return true
        }}
      />
      {children}
    </ShellContext>
  )
}

function GlobalHotkeys({
  open,
  toggle,
  undo,
}: {
  open: (p: ShellPanel) => void
  toggle: (p: ShellPanel) => void
  undo: () => boolean
}) {
  const router = useRouter()
  const registry = useHotkeyRegistry()
  const go = (href: string) => router.push(href as Route)
  const step = (direction: 'prev' | 'next') => {
    const href = recordTabHref(direction)
    if (!href) return false
    go(href)
    return true
  }

  const hotkeys: Hotkey[] = [
    {
      keys: 'mod+k',
      label: 'Open the command bar',
      group: 'Anywhere',
      run: () => open('command'),
      allowInInputs: true,
      allowInModal: true,
    },
    {
      keys: 'escape',
      label: 'Close the top-most layer',
      group: 'Anywhere',
      // Radix layers close themselves first (and prevent the event); this closes the shell's own.
      run: () => registry.dismissTop(),
      allowInInputs: true,
      allowInModal: true,
    },
    { keys: '?', label: 'Help and shortcuts', group: 'Anywhere', run: () => toggle('help') },
    { keys: 'mod+z', label: 'Undo the last action', group: 'Anywhere', run: undo },
    ...GO_TO.map(([letter, key]): Hotkey => {
      const item = NAV_DESTINATIONS.find((d) => d.key === key)!
      return { keys: `g ${letter}`, label: item.label, group: 'Go to', run: () => go(item.href) }
    }),
    { keys: 'n', label: 'New enquiry', group: 'Create', run: () => go(NEW_ENQUIRY_HREF) },
    { keys: '[', label: 'Previous record tab', group: 'Records', run: () => step('prev') },
    { keys: ']', label: 'Next record tab', group: 'Records', run: () => step('next') },
  ]
  useHotkeys(hotkeys)
  return null
}
