import 'server-only'

/**
 * Clocks (S06-T03): things that come due on their own — a Later card's time, and from later sprints reply-by,
 * revert-by, give-up. Each clock finds what is due (at most `batch` at a time) and fires each item.
 * ops.clocks.tick runs every registered clock every 15 minutes.
 */
export interface Clock<T> {
  key: string
  /** What is due now, oldest first, at most `limit`. */
  due(now: Date, limit: number): Promise<T[]>
  /** Fire one item; returns a short outcome for the run's log. */
  fire(item: T, now: Date): Promise<string>
}

const CLOCKS = new Map<string, Clock<unknown>>()

export function registerClock<T>(clock: Clock<T>): void {
  if (CLOCKS.has(clock.key) && CLOCKS.get(clock.key) !== (clock as Clock<unknown>))
    throw new Error(`Clock "${clock.key}" is registered twice`)
  CLOCKS.set(clock.key, clock as Clock<unknown>)
}

export function clockKeys(): string[] {
  return [...CLOCKS.keys()].sort()
}

export const CLOCK_BATCH = 200

/** Run one clock once: up to CLOCK_BATCH due items. */
export async function runClock(key: string, now = new Date()): Promise<Record<string, number>> {
  const clock = CLOCKS.get(key)
  if (!clock) return {}
  const items = await clock.due(now, CLOCK_BATCH)
  const outcomes: Record<string, number> = {}
  for (const item of items) {
    const o = await clock.fire(item, now)
    outcomes[o] = (outcomes[o] ?? 0) + 1
  }
  return outcomes
}
