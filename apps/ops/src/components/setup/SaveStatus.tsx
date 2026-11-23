'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

/**
 * "Step n of 6 · saved 2 s ago" (board 79 foot). A step's form reports its saves here; the label in
 * the T9 foot reads them. Shared by every setup step, so S03-T06's steps report the same way.
 */
export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type SaveStatusValue = {
  state: SaveState
  savedAt: string | null
  report: (state: SaveState, savedAt?: string) => void
}

const SaveStatusContext = createContext<SaveStatusValue | null>(null)

export function SaveStatusProvider({
  savedAt: initial,
  children,
}: {
  /** ISO time of the step's last save, from the server; null when it has none. */
  savedAt: string | null
  children: ReactNode
}) {
  const [state, setState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState(initial)
  const value = useMemo<SaveStatusValue>(
    () => ({
      state,
      savedAt,
      report: (next, at) => {
        setState(next)
        if (at) setSavedAt(at)
      },
    }),
    [state, savedAt]
  )
  return <SaveStatusContext.Provider value={value}>{children}</SaveStatusContext.Provider>
}

/** A step's form calls `report('saving')`, then `report('saved', iso)` or `report('error')`. */
export function useSaveStatus(): SaveStatusValue {
  const v = useContext(SaveStatusContext)
  if (!v) throw new Error('useSaveStatus outside SaveStatusProvider')
  return v
}

/** "2 s ago", "4 min ago", "3 h ago"; a day or more: "on 12 Nov". */
export function savedAgo(at: string, now: number): string {
  const s = Math.max(0, Math.round((now - new Date(at).getTime()) / 1000))
  if (s < 60) return `${s} s ago`
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86_400) return `${Math.floor(s / 3600)} h ago`
  return `on ${new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Dubai' })}`
}

function subscribeClock(onTick: () => void) {
  const t = window.setInterval(onTick, 1000)
  return () => window.clearInterval(t)
}

/** Whole seconds, so the snapshot is stable between ticks. */
function clockSeconds(): number {
  return Math.floor(Date.now() / 1000) * 1000
}

export function SavedLabel({ step, total }: { step: number; total: number }) {
  const ctx = useContext(SaveStatusContext)
  // The relative time is drawn only in the browser (null on the server), so the server and the first
  // client render agree; it ticks once a second.
  const now = useSyncExternalStore(subscribeClock, clockSeconds, () => null)
  let tail = ''
  if (ctx?.state === 'saving') tail = ' · saving…'
  else if (ctx?.state === 'error') tail = ' · not saved'
  else if (ctx?.savedAt && now !== null) tail = ` · saved ${savedAgo(ctx.savedAt, now)}`
  // Announce the state changes only; the ticking time stays out of the live region.
  const spoken = ctx?.state === 'saved' ? 'Saved' : ctx?.state === 'error' ? 'Not saved' : ''
  return (
    <span
      data-saved-label=""
      data-state={ctx?.state ?? 'idle'}
      className="text-io-ink-3 text-[12.5px]"
    >
      Step {step} of {total}
      {tail}
      <span aria-live="polite" className="sr-only">
        {spoken}
      </span>
    </span>
  )
}
