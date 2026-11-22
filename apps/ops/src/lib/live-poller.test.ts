import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DISCOVERY_MS,
  isLiveKey,
  LivePoller,
  PEER_TIMEOUT_MS,
  POLL_MS,
  type LiveChannel,
  type LiveCounts,
  type LiveKey,
  recordKeyFromSegments,
} from './live-poller'

let clock = 0

/** An in-memory BroadcastChannel: async delivery, never to the sender, as the browser does it. */
function makeBus() {
  const members = new Set<{ deliver: (data: unknown) => void }>()
  return {
    channel(): LiveChannel {
      const listeners = new Set<(event: { data: unknown }) => void>()
      const me = { deliver: (data: unknown) => listeners.forEach((l) => l({ data })) }
      members.add(me)
      return {
        postMessage(message) {
          const data = structuredClone(message)
          for (const m of members) if (m !== me) queueMicrotask(() => m.deliver(data))
        },
        addEventListener: (_type, l) => void listeners.add(l),
        removeEventListener: (_type, l) => void listeners.delete(l),
        close: () => void members.delete(me),
      }
    },
  }
}

async function flush(): Promise<void> {
  for (let i = 0; i < 10; i++) await Promise.resolve()
}

/** Move time forward in small steps so every timer fires at (about) its own moment. */
async function advance(ms: number): Promise<void> {
  const step = 250
  let t = 0
  do {
    const d = Math.min(step, ms - t)
    clock += d
    t += d
    vi.advanceTimersByTime(d)
    await flush()
    // Timers set by what just ran, due now (a poll scheduled with no wait).
    vi.advanceTimersByTime(0)
    await flush()
  } while (t < ms)
}

interface Tab {
  poller: LivePoller
  fetch: ReturnType<typeof vi.fn>
  seen: LiveCounts[]
  visible: { value: boolean }
}

function tab(
  id: string,
  opts: { channel?: LiveChannel | null; visible?: boolean; keys?: LiveKey[] } = {}
): Tab {
  const visible = { value: opts.visible ?? true }
  const fetch = vi.fn(
    async (keys: LiveKey[]) => Object.fromEntries(keys.map((k) => [k, 0])) as LiveCounts
  )
  const poller = new LivePoller({
    fetch,
    isVisible: () => visible.value,
    channel: opts.channel ?? null,
    id,
    now: () => clock,
  })
  const seen: LiveCounts[] = []
  poller.subscribe(opts.keys ?? ['today', 'review', 'mail'], (c) => seen.push(c))
  return { poller, fetch, seen, visible }
}

const started: LivePoller[] = []
function start(...tabs: Tab[]) {
  for (const t of tabs) {
    t.poller.start()
    started.push(t.poller)
  }
}

beforeEach(() => {
  clock = 1_000_000
  vi.useFakeTimers()
})

afterEach(() => {
  for (const p of started.splice(0)) p.stop()
  vi.useRealTimers()
})

describe('one tab', () => {
  it('polls at once, then every 30 s while visible', async () => {
    const a = tab('a')
    start(a)
    await advance(0)
    expect(a.fetch).toHaveBeenCalledTimes(1)
    expect(a.fetch).toHaveBeenLastCalledWith(['mail', 'review', 'today'])
    await advance(POLL_MS - 1000)
    expect(a.fetch).toHaveBeenCalledTimes(1)
    await advance(1000)
    expect(a.fetch).toHaveBeenCalledTimes(2)
    expect(a.seen.at(-1)).toEqual({ today: 0, review: 0, mail: 0 })
  })

  it('does not poll at all while the tab is hidden, and resumes when it is shown', async () => {
    const a = tab('a', { visible: false })
    start(a)
    await advance(4 * POLL_MS)
    expect(a.fetch).not.toHaveBeenCalled()
    a.visible.value = true
    a.poller.visibilityChanged()
    await advance(0)
    expect(a.fetch).toHaveBeenCalledTimes(1)
    a.visible.value = false
    a.poller.visibilityChanged()
    await advance(3 * POLL_MS)
    expect(a.fetch).toHaveBeenCalledTimes(1)
  })

  it('focus fetches at once, between intervals', async () => {
    const a = tab('a')
    start(a)
    await advance(5000)
    expect(a.fetch).toHaveBeenCalledTimes(1)
    a.poller.focused()
    await flush()
    expect(a.fetch).toHaveBeenCalledTimes(2)
    // The interval restarts from that read.
    await advance(POLL_MS - 1000)
    expect(a.fetch).toHaveBeenCalledTimes(2)
    await advance(1000)
    expect(a.fetch).toHaveBeenCalledTimes(3)
  })

  it('never has more than one request in flight; requests made meanwhile run once, after it', async () => {
    let release: (v: LiveCounts) => void = () => undefined
    const a = tab('a')
    a.fetch.mockImplementation(() => new Promise<LiveCounts>((r) => (release = r)))
    start(a)
    await advance(0)
    a.poller.requestFresh()
    a.poller.requestFresh()
    a.poller.focused()
    await flush()
    expect(a.fetch).toHaveBeenCalledTimes(1)
    release({ today: 2 })
    await flush()
    expect(a.fetch).toHaveBeenCalledTimes(2)
    release({ today: 3 })
    await flush()
    expect(a.fetch).toHaveBeenCalledTimes(2)
    expect(a.poller.latest.today).toBe(3)
  })

  it('keeps the last counts when a read fails, and waits a full interval before trying again', async () => {
    const a = tab('a')
    start(a)
    await advance(0)
    a.fetch.mockImplementationOnce(async () => null)
    await advance(POLL_MS)
    expect(a.fetch).toHaveBeenCalledTimes(2)
    expect(a.poller.latest).toEqual({ today: 0, review: 0, mail: 0 })
    await advance(POLL_MS - 1000)
    expect(a.fetch).toHaveBeenCalledTimes(2)
  })
})

describe('two tabs', () => {
  it('one poller: the leader fetches for both tabs’ keys and the follower only listens', async () => {
    const bus = makeBus()
    const a = tab('a', { channel: bus.channel() })
    const b = tab('b', { channel: bus.channel(), keys: ['today', 'record:ENQ-2026-0001'] })
    start(a, b)
    await advance(DISCOVERY_MS + 4 * POLL_MS)
    expect(b.fetch).not.toHaveBeenCalled()
    expect(a.fetch).toHaveBeenCalledTimes(5)
    expect(a.fetch).toHaveBeenLastCalledWith(['mail', 'record:ENQ-2026-0001', 'review', 'today'])
    expect(b.seen.at(-1)?.['record:ENQ-2026-0001']).toBe(0)
  })

  it('a tab opened later is handed the counts and does not fetch on open', async () => {
    const bus = makeBus()
    const b = tab('b', { channel: bus.channel() })
    start(b)
    await advance(DISCOVERY_MS + 1000)
    expect(b.fetch).toHaveBeenCalledTimes(1)
    // 'a' sorts first, so it becomes the leader, but the counts are fresh: nobody fetches yet.
    const a = tab('a', { channel: bus.channel() })
    start(a)
    await advance(DISCOVERY_MS + 1000)
    expect(a.fetch).not.toHaveBeenCalled()
    expect(b.fetch).toHaveBeenCalledTimes(1)
    expect(a.seen.at(-1)).toEqual({ today: 0, review: 0, mail: 0 })
    await advance(POLL_MS)
    expect(a.fetch.mock.calls.length + b.fetch.mock.calls.length).toBe(2)
  })

  it('a hidden leader hands over to the visible tab', async () => {
    const bus = makeBus()
    const a = tab('a', { channel: bus.channel() })
    const b = tab('b', { channel: bus.channel() })
    start(a, b)
    await advance(DISCOVERY_MS)
    expect(a.fetch).toHaveBeenCalledTimes(1)
    a.visible.value = false
    a.poller.visibilityChanged()
    await advance(2 * POLL_MS)
    expect(a.fetch).toHaveBeenCalledTimes(1)
    expect(b.fetch).toHaveBeenCalledTimes(2)
  })

  it('a closed leader hands over at once', async () => {
    const bus = makeBus()
    const a = tab('a', { channel: bus.channel() })
    const b = tab('b', { channel: bus.channel() })
    start(a, b)
    await advance(DISCOVERY_MS)
    expect(a.fetch).toHaveBeenCalledTimes(1)
    a.poller.stop()
    await advance(POLL_MS)
    expect(b.fetch).toHaveBeenCalledTimes(1)
  })

  it('a leader that vanishes without a goodbye is replaced after the peer timeout', async () => {
    const bus = makeBus()
    const muted = { value: false }
    const raw = bus.channel()
    const silent: LiveChannel = {
      ...raw,
      postMessage: (m) => {
        // eslint-disable-next-line unicorn/require-post-message-target-origin
        if (!muted.value) raw.postMessage(m)
      },
    }
    const a = tab('a', { channel: silent })
    const b = tab('b', { channel: bus.channel() })
    start(a, b)
    await advance(DISCOVERY_MS)
    expect(a.fetch).toHaveBeenCalledTimes(1)
    muted.value = true
    a.poller.stop()
    await advance(PEER_TIMEOUT_MS - 1000)
    expect(b.fetch).not.toHaveBeenCalled()
    await advance(POLL_MS)
    expect(b.fetch).toHaveBeenCalledTimes(1)
  })

  it('focus in a follower asks the leader for one fresh read', async () => {
    const bus = makeBus()
    const a = tab('a', { channel: bus.channel() })
    const b = tab('b', { channel: bus.channel() })
    start(a, b)
    await advance(DISCOVERY_MS + 5000)
    expect(a.fetch).toHaveBeenCalledTimes(1)
    b.poller.focused()
    await flush()
    expect(b.fetch).not.toHaveBeenCalled()
    expect(a.fetch).toHaveBeenCalledTimes(2)
  })
})

describe('keys', () => {
  it('accepts the badge keys and record keys only', () => {
    expect(
      ['today', 'review', 'mail', 'record:ENQ-2026-0001', 'record:INDUS/Q10001-R2'].every(isLiveKey)
    ).toBe(true)
    expect(
      ['counts.review', 'record:', 'record:a b', 'Today', `record:${'x'.repeat(65)}`].some(
        isLiveKey
      )
    ).toBe(false)
  })
})

describe('recordKeyFromSegments', () => {
  it('finds the open record under enquiries and orders only', () => {
    expect(recordKeyFromSegments(['enquiries', 'ENQ-2026-0001'])).toBe('record:ENQ-2026-0001')
    expect(recordKeyFromSegments(['enquiries', 'ENQ-2026-0001', 'tender', 'timeline'])).toBe(
      'record:ENQ-2026-0001'
    )
    expect(recordKeyFromSegments(['orders', 'SO-0001', 'documents'])).toBe('record:SO-0001')
    expect(recordKeyFromSegments(['enquiries', 'new'])).toBeNull()
    expect(recordKeyFromSegments(['enquiries'])).toBeNull()
    expect(recordKeyFromSegments(['today'])).toBeNull()
    expect(recordKeyFromSegments(['enquiries', '%E0%A4%A'])).toBeNull()
  })
})
