/**
 * Live counts, the transport half (C24, ADR-19). v1 polls one read action every 30 s while the tab is
 * visible, on focus and right after the person's own mutations. Tabs of the same browser share the work over
 * `BroadcastChannel('ops-live')`: one leader tab polls for the union of every tab's keys and broadcasts the
 * result; followers only listen. `useLiveKeys` (live-keys.ts) is the React face; Supabase Broadcast can
 * replace this class later without touching a component.
 *
 * Leadership needs no election: every tab says it is alive (its keys and whether it is visible) on a short
 * heartbeat, and the leader is the visible tab with the smallest id among those heard from recently. A hidden
 * tab is never the leader, so a browser with no visible tab never polls. Leaving tabs say goodbye; a tab
 * that dies silently drops out after `PEER_TIMEOUT_MS`.
 *
 * Pure: no React, no DOM globals. Time, visibility, the channel and the fetch are injected, so the tests
 * drive it with fake timers.
 */

export type LiveKey = 'today' | 'review' | 'mail' | `record:${string}`
export type LiveCounts = Partial<Record<LiveKey, number>>

/** The keys the read action accepts: the three badges and one record (`record:ENQ-2026-0001`). */
export const LIVE_KEY_PATTERN = /^(?:today|review|mail|record:[A-Za-z0-9/_.-]{1,64})$/
export const MAX_LIVE_KEYS = 24

export const POLL_MS = 30_000
export const HEARTBEAT_MS = 5_000
export const PEER_TIMEOUT_MS = 12_000
/** How long a new tab listens for peers before deciding whether it leads. */
export const DISCOVERY_MS = 250
export const LIVE_CHANNEL = 'ops-live'

export function isLiveKey(value: string): value is LiveKey {
  return LIVE_KEY_PATTERN.test(value)
}

/** Record sections whose second segment is a ref, minus the sub-pages that share the level. */
const RECORD_SECTIONS: Readonly<Record<string, ReadonlySet<string>>> = {
  enquiries: new Set(['new', 'intake', 'leads']),
  orders: new Set(),
}

/**
 * The open record's live key from the console's selected segments (route groups already removed):
 * `['enquiries', 'ENQ-2026-0001', 'lines']` → `record:ENQ-2026-0001`; anything else → null.
 */
export function recordKeyFromSegments(segments: readonly string[]): LiveKey | null {
  const [section, ref] = segments
  const reserved = section ? RECORD_SECTIONS[section] : undefined
  if (!reserved || !ref || reserved.has(ref)) return null
  let decoded: string
  try {
    decoded = decodeURIComponent(ref)
  } catch {
    return null
  }
  const key = `record:${decoded}`
  return isLiveKey(key) ? key : null
}

type Message =
  | { t: 'alive'; id: string; keys: LiveKey[]; visible: boolean; hello?: boolean }
  | { t: 'bye'; id: string }
  | { t: 'counts'; at: number; counts: LiveCounts }
  | { t: 'refresh'; id: string }

/** The slice of BroadcastChannel the poller uses. */
export interface LiveChannel {
  postMessage: (message: unknown) => void
  addEventListener: (type: 'message', listener: (event: { data: unknown }) => void) => void
  removeEventListener: (type: 'message', listener: (event: { data: unknown }) => void) => void
  close: () => void
}

export interface LivePollerDeps {
  /** One request for these keys; null when it failed (the poller keeps the last counts). */
  fetch: (keys: LiveKey[]) => Promise<LiveCounts | null>
  isVisible: () => boolean
  /** Null when the browser has no BroadcastChannel: the tab then leads on its own. */
  channel: LiveChannel | null
  id: string
  now?: () => number
}

interface Peer {
  keys: LiveKey[]
  visible: boolean
  seen: number
}

type Listener = (counts: LiveCounts) => void

export class LivePoller {
  private readonly deps: LivePollerDeps
  private readonly now: () => number
  private readonly subscribers = new Map<Listener, readonly LiveKey[]>()
  private readonly peers = new Map<string, Peer>()
  private counts: LiveCounts = {}
  private lastAt = Number.NEGATIVE_INFINITY
  private inFlight = false
  private again = false
  private started = false
  private discovering = false
  private pollTimer: ReturnType<typeof setTimeout> | undefined
  private heartbeat: ReturnType<typeof setInterval> | undefined
  private discovery: ReturnType<typeof setTimeout> | undefined

  constructor(deps: LivePollerDeps) {
    this.deps = deps
    this.now = deps.now ?? Date.now
  }

  /** Follow these keys. The listener gets the full count map whenever it changes. */
  subscribe(keys: readonly LiveKey[], listener: Listener): () => void {
    this.subscribers.set(listener, keys)
    this.announce()
    if (Object.keys(this.counts).length > 0) listener(this.counts)
    // A key nobody asked for before: fetch it now rather than at the next interval.
    if (keys.some((k) => !(k in this.counts)) && this.started && !this.discovering)
      this.requestFresh()
    return () => {
      this.subscribers.delete(listener)
      this.announce()
    }
  }

  get latest(): LiveCounts {
    return this.counts
  }

  start(): void {
    if (this.started) return
    this.started = true
    const { channel } = this.deps
    if (!channel) {
      this.schedule()
      return
    }
    channel.addEventListener('message', this.onMessage)
    this.heartbeat = setInterval(() => {
      this.prune()
      this.announce()
      this.schedule()
    }, HEARTBEAT_MS)
    this.discovering = true
    this.announce(true)
    this.discovery = setTimeout(() => {
      this.discovering = false
      this.schedule()
    }, DISCOVERY_MS)
  }

  stop(): void {
    if (!this.started) return
    this.started = false
    clearTimeout(this.pollTimer)
    clearTimeout(this.discovery)
    clearInterval(this.heartbeat)
    const { channel } = this.deps
    if (channel) {
      this.send({ t: 'bye', id: this.deps.id })
      channel.removeEventListener('message', this.onMessage)
    }
  }

  /** document.visibilitychange. Hidden stops the polling; visible resumes it (at once if a poll is due). */
  visibilityChanged(): void {
    this.announce()
    this.schedule()
  }

  /** window focus: fresh counts now, from whichever tab leads. */
  focused(): void {
    this.announce()
    this.requestFresh()
  }

  /** After the person's own mutation (`bumpLiveKeys`), or a key appearing. */
  requestFresh(): void {
    if (!this.started) return
    if (this.isLeader()) void this.poll()
    else this.send({ t: 'refresh', id: this.deps.id })
  }

  /** Visible, and no visible tab with a smaller id was heard from recently. */
  isLeader(): boolean {
    if (!this.deps.isVisible()) return false
    const cutoff = this.now() - PEER_TIMEOUT_MS
    for (const [id, peer] of this.peers)
      if (peer.visible && peer.seen >= cutoff && id < this.deps.id) return false
    return true
  }

  private ownKeys(): LiveKey[] {
    const all = new Set<LiveKey>()
    for (const keys of this.subscribers.values()) for (const k of keys) all.add(k)
    return [...all].sort()
  }

  private wantedKeys(): LiveKey[] {
    const all = new Set(this.ownKeys())
    const cutoff = this.now() - PEER_TIMEOUT_MS
    for (const peer of this.peers.values())
      if (peer.seen >= cutoff) for (const k of peer.keys) all.add(k)
    return [...all].sort().slice(0, MAX_LIVE_KEYS)
  }

  private send(message: Message): void {
    // A BroadcastChannel reaches only this origin's tabs: there is no target origin to give.
    // eslint-disable-next-line unicorn/require-post-message-target-origin
    this.deps.channel?.postMessage(message)
  }

  private announce(hello = false): void {
    if (!this.started || !this.deps.channel) return
    const message: Message = {
      t: 'alive',
      id: this.deps.id,
      keys: this.ownKeys(),
      visible: this.deps.isVisible(),
      ...(hello ? { hello: true } : {}),
    }
    this.send(message)
  }

  private prune(): void {
    const cutoff = this.now() - PEER_TIMEOUT_MS
    for (const [id, peer] of this.peers) if (peer.seen < cutoff) this.peers.delete(id)
  }

  /** One timer: the next poll, set only while this tab leads. */
  private schedule(): void {
    clearTimeout(this.pollTimer)
    this.pollTimer = undefined
    if (!this.started || this.discovering || !this.isLeader()) return
    const wait = Math.max(0, this.lastAt + POLL_MS - this.now())
    this.pollTimer = setTimeout(() => {
      this.pollTimer = undefined
      void this.poll()
    }, wait)
  }

  /** Never more than one request in flight: a request made meanwhile runs once, after it. */
  private async poll(): Promise<void> {
    if (this.inFlight) {
      this.again = true
      return
    }
    const keys = this.wantedKeys()
    if (keys.length === 0) {
      this.schedule()
      return
    }
    this.inFlight = true
    clearTimeout(this.pollTimer)
    let result: LiveCounts | null = null
    try {
      result = await this.deps.fetch(keys)
    } catch {
      result = null
    }
    this.inFlight = false
    const at = this.now()
    // A failed read still waits a full interval: a struggling database is not polled harder.
    this.lastAt = at
    if (result) {
      this.merge(result)
      this.send({ t: 'counts', at, counts: result })
    }
    if (this.again && this.started) {
      this.again = false
      void this.poll()
      return
    }
    this.schedule()
  }

  private merge(next: LiveCounts): void {
    let changed = false
    for (const [k, v] of Object.entries(next) as Array<[LiveKey, number]>) {
      if (this.counts[k] !== v) changed = true
    }
    if (!changed && Object.keys(this.counts).length > 0) return
    this.counts = { ...this.counts, ...next }
    for (const listener of this.subscribers.keys()) listener(this.counts)
  }

  private readonly onMessage = (event: { data: unknown }): void => {
    const m = event.data as Message | null
    if (!m || typeof m !== 'object') return
    switch (m.t) {
      case 'alive': {
        if (m.id === this.deps.id) return
        this.peers.set(m.id, { keys: m.keys, visible: m.visible, seen: this.now() })
        if (m.hello) {
          // A new tab: tell it who is here, and hand it the counts so it does not fetch on open. Every tab
          // that has counts replies (the newcomer may already outrank the old leader); it keeps the newest.
          this.announce()
          if (Number.isFinite(this.lastAt))
            this.send({ t: 'counts', at: this.lastAt, counts: this.counts })
        }
        this.schedule()
        return
      }
      case 'bye':
        this.peers.delete(m.id)
        this.schedule()
        return
      case 'counts':
        this.lastAt = Math.max(this.lastAt, m.at)
        this.merge(m.counts)
        this.schedule()
        return
      case 'refresh':
        if (this.isLeader()) void this.poll()
        return
    }
  }
}
