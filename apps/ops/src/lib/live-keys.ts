'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getLiveCounts } from '../actions/read/live-counts'
import {
  LIVE_CHANNEL,
  LivePoller,
  type LiveChannel,
  type LiveCounts,
  type LiveKey,
} from './live-poller'

export type { LiveCounts, LiveKey } from './live-poller'

/**
 * Live counts for React (C24, ADR-19). One poller per tab, shared by every component that asks: it polls
 * `getLiveCounts` every 30 s while the tab is visible, refetches on focus and after `bumpLiveKeys()`, and
 * shares the work across tabs (live-poller.ts). Components see only keys and numbers, so Supabase Broadcast
 * can replace the transport later without touching them.
 */

let shared: LivePoller | null = null

async function fetchCounts(keys: LiveKey[]): Promise<LiveCounts | null> {
  try {
    const result = await getLiveCounts(keys)
    return result.success ? result.data : null
  } catch {
    // Offline or a deploy in between: keep the last counts and try at the next interval.
    return null
  }
}

function tabId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function poller(): LivePoller {
  if (shared) return shared
  const channel: LiveChannel | null =
    typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(LIVE_CHANNEL)
  const p = new LivePoller({
    fetch: fetchCounts,
    isVisible: () => document.visibilityState === 'visible',
    channel,
    id: tabId(),
  })
  document.addEventListener('visibilitychange', () => p.visibilityChanged())
  window.addEventListener('focus', () => p.focused())
  // Leave cleanly so another tab takes over at once; come back from the bfcache as a fresh member.
  window.addEventListener('pagehide', () => p.stop())
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) p.start()
  })
  p.start()
  shared = p
  return p
}

/**
 * Ask for fresh counts now: call it after a mutation of your own (the action has already committed). Safe
 * to call anywhere; it does nothing on the server or before the shell has mounted.
 */
export function bumpLiveKeys(): void {
  shared?.requestFresh()
}

export interface UseLiveKeysOptions {
  /** Called when a followed key's value changes after the first reading (not for the first reading). */
  onChange?: (key: LiveKey, value: number, previous: number) => void
}

/** The current counts for `keys` (absent until the first reading arrives). */
export function useLiveKeys(
  keys: readonly LiveKey[],
  options: UseLiveKeysOptions = {}
): LiveCounts {
  const [counts, setCounts] = useState<LiveCounts>({})
  const onChange = useRef(options.onChange)
  useLayoutEffect(() => {
    onChange.current = options.onChange
  })
  const signature = [...keys].sort().join('|')

  useEffect(() => {
    const wanted = signature ? (signature.split('|') as LiveKey[]) : []
    if (wanted.length === 0) return
    let last: LiveCounts = {}
    return poller().subscribe(wanted, (all) => {
      const mine: LiveCounts = {}
      for (const k of wanted) {
        const v = all[k]
        if (v === undefined) continue
        mine[k] = v
        const before = last[k]
        if (before !== undefined && before !== v) onChange.current?.(k, v, before)
      }
      last = mine
      setCounts(mine)
    })
  }, [signature])

  return counts
}
