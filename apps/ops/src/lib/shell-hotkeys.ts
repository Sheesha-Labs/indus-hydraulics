import type { Hotkey } from '@indus/ops-ui/lib/use-hotkeys'
import { NAV_DESTINATIONS, type NavKey } from '@indus/ops-ui/shell/nav'

/**
 * The console's global shortcuts (05 §7.7), as data for the one hotkey registry. Pure (no React, no
 * router): Providers binds the effects; the tests drive the registry with plain key events. Record- and
 * list-scoped keys (J/K, X, ⌘↵, E/R/L) belong to the screens that own them.
 */

/** The shell surfaces opened from anywhere (05 §6.3). S02-T06 renders them. */
export type ShellPanel = 'command' | 'help' | 'notifications'

/** G-chords: the letter after G for each destination. */
export const GO_TO: ReadonlyArray<readonly [string, NavKey]> = [
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

/** Where N goes. */
export const NEW_ENQUIRY_HREF = '/enquiries/new'

export interface ShellHotkeyEffects {
  go: (href: string) => void
  open: (panel: ShellPanel) => void
  toggle: (panel: ShellPanel) => void
  /** Close the shell's own top-most layer (Radix layers close themselves first). False when none. */
  dismissTop: () => boolean
  /** Run the newest open undo. False when none. */
  undo: () => boolean
  /** The open record's neighbouring tab (RecordTabs' data-prev-href / data-next-href), if any. */
  recordTab: (direction: 'prev' | 'next') => string | undefined
}

export function shellHotkeys(fx: ShellHotkeyEffects): Hotkey[] {
  const step = (direction: 'prev' | 'next') => {
    const href = fx.recordTab(direction)
    if (!href) return false
    fx.go(href)
    return true
  }
  return [
    {
      keys: 'mod+k',
      label: 'Open the command bar',
      group: 'Anywhere',
      run: () => fx.open('command'),
      allowInInputs: true,
      allowInModal: true,
    },
    {
      keys: 'escape',
      label: 'Close the top-most layer',
      group: 'Anywhere',
      run: () => fx.dismissTop(),
      allowInInputs: true,
      allowInModal: true,
    },
    { keys: '?', label: 'Help and shortcuts', group: 'Anywhere', run: () => fx.toggle('help') },
    { keys: 'mod+z', label: 'Undo the last action', group: 'Anywhere', run: () => fx.undo() },
    ...GO_TO.map(([letter, key]): Hotkey => {
      const item = NAV_DESTINATIONS.find((d) => d.key === key)!
      return { keys: `g ${letter}`, label: item.label, group: 'Go to', run: () => fx.go(item.href) }
    }),
    { keys: 'n', label: 'New enquiry', group: 'Create', run: () => fx.go(NEW_ENQUIRY_HREF) },
    { keys: '[', label: 'Previous record tab', group: 'Records', run: () => step('prev') },
    { keys: ']', label: 'Next record tab', group: 'Records', run: () => step('next') },
  ]
}

export interface UndoStack {
  /** Register an undo whose window closes after `remainingMs`; returns the unregister function. */
  push: (run: () => void, remainingMs: number) => () => void
  /** Run the newest undo whose window is still open (dropping closed ones). False when none. */
  runLatest: () => boolean
}

/** ⌘Z's memory: toasts with an undo window register here (S07, ADR-11). */
export function createUndoStack(now: () => number = Date.now): UndoStack {
  let entries: Array<{ run: () => void; until: number }> = []
  return {
    push(run, remainingMs) {
      const entry = { run, until: now() + remainingMs }
      entries.push(entry)
      return () => {
        entries = entries.filter((e) => e !== entry)
      }
    },
    runLatest() {
      const t = now()
      entries = entries.filter((e) => e.until > t)
      const latest = entries.pop()
      if (!latest) return false
      latest.run()
      return true
    },
  }
}
