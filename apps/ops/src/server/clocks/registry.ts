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
  /**
   * S06-T08: what this clock will do next on one record, for the Assistant panel's "Doing now" ("Tomorrow
   * 09:00 Third chaser to …"). Given the record's actions the panel already read, so it adds no query; a clock
   * that needs its own rows reads them here and says so in its comment (the panel's budget is three).
   */
  describeUpcoming?(
    record: UpcomingRecord,
    loaded: UpcomingLoaded
  ): UpcomingItem[] | Promise<UpcomingItem[]>
}

export interface UpcomingRecord {
  subjectType: string
  subjectId: string
  enquiryId: string | null
}

export interface UpcomingLoaded {
  actions: ReadonlyArray<{
    id: string
    ref: string
    state: string
    headline: string
    laterUntil: Date | null
  }>
}

export interface UpcomingItem {
  key: string
  at: Date
  text: string
}

const CLOCKS = new Map<string, Clock<unknown>>()

export function registerClock<T>(clock: Clock<T>): void {
  if (CLOCKS.has(clock.key) && CLOCKS.get(clock.key) !== (clock as Clock<unknown>))
    throw new Error(`Clock "${clock.key}" is registered twice`)
  CLOCKS.set(clock.key, clock as Clock<unknown>)
}

/** Every registered clock's next items for a record, soonest first. */
export async function upcomingFor(
  record: UpcomingRecord,
  loaded: UpcomingLoaded,
  limit = 5
): Promise<UpcomingItem[]> {
  const all: UpcomingItem[] = []
  for (const c of CLOCKS.values()) {
    if (c.describeUpcoming) all.push(...(await c.describeUpcoming(record, loaded)))
  }
  return all.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, limit)
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
