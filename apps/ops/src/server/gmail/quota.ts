/**
 * Gmail quota buckets (S04-T03, 08-map-integrations §1.12). Google allows 6,000 units a minute per user per
 * project; Ops splits each mailbox's minute into three buckets so a backfill never starves live sync:
 *
 *   live      2,500 units/min   history.list, messages.get for new mail, getProfile, watch
 *   backfill  3,000 units/min   past-mail import
 *   send        500 units/min   messages.send, messages.modify, labels.create
 *
 * The bucket lives in the process. Serverless instances do not share it, so the real cross-instance bound is
 * the Inngest concurrency key (mailboxId · 1 for sync, backfill and send): at most one instance draws from a
 * mailbox's bucket of a kind at a time. No database round trip per call.
 */
export type GmailBudget = 'live' | 'backfill' | 'send'

export const BUCKET_UNITS_PER_MINUTE: Record<GmailBudget, number> = {
  live: 2_500,
  backfill: 3_000,
  send: 500,
}

/** Unit cost of each allow-listed call (Google's table, checked 20 Nov 2026). */
export const UNIT_COST = {
  'history.list': 2,
  'messages.list': 5,
  'messages.get.metadata': 20,
  'messages.get.minimal': 20,
  'messages.get.full': 60,
  'messages.get.raw': 60,
  'messages.attachments.get': 20,
  'threads.get.metadata': 40,
  'threads.get.minimal': 40,
  'threads.get.full': 120,
  'messages.send': 100,
  'messages.modify': 5,
  'labels.list': 1,
  'labels.create': 5,
  watch: 100,
  stop: 1,
  getProfile: 1,
  'settings.sendAs.list': 1,
  'settings.sendAs.get': 1,
} as const

export type UnitCostKey = keyof typeof UNIT_COST

/** The longest a step waits for its bucket before handing back to Inngest (QuotaWaitTooLong). */
export const MAX_WAIT_MS = 20_000

type Clock = { now: () => number; sleep: (ms: number) => Promise<void> }
const realClock: Clock = {
  now: () => Date.now(),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}

export class TokenBucket {
  private tokens: number
  private updatedAt: number

  constructor(
    readonly capacityPerMinute: number,
    private readonly clock: Clock = realClock
  ) {
    this.tokens = capacityPerMinute
    this.updatedAt = clock.now()
  }

  private refill() {
    const now = this.clock.now()
    const elapsed = Math.max(0, now - this.updatedAt)
    this.tokens = Math.min(
      this.capacityPerMinute,
      this.tokens + (elapsed * this.capacityPerMinute) / 60_000
    )
    this.updatedAt = now
  }

  /** Milliseconds until `units` are available (0 when they are now). */
  waitFor(units: number): number {
    this.refill()
    if (this.tokens >= units) return 0
    return Math.ceil(((units - this.tokens) * 60_000) / this.capacityPerMinute)
  }

  /**
   * Take `units`, sleeping inside the step when the bucket is short, up to `maxWaitMs`. Longer than that throws
   * QuotaWaitTooLong (the caller's Inngest step retries later). A cost above the capacity is clamped so one
   * expensive call can always run on a full bucket.
   */
  async take(units: number, label: string, maxWaitMs = MAX_WAIT_MS): Promise<void> {
    const cost = Math.min(units, this.capacityPerMinute)
    const wait = this.waitFor(cost)
    if (wait > maxWaitMs) {
      const { QuotaWaitTooLong } = await import('./errors')
      throw new QuotaWaitTooLong(label, wait)
    }
    if (wait > 0) {
      await this.clock.sleep(wait)
      this.refill()
    }
    this.tokens -= cost
  }

  /** Units available right now (for tests and the health view). */
  available(): number {
    this.refill()
    return Math.floor(this.tokens)
  }
}

const buckets = new Map<string, TokenBucket>()

/** The per-instance bucket for a mailbox and budget. */
export function bucketFor(mailboxId: string, budget: GmailBudget): TokenBucket {
  const key = `${mailboxId}:${budget}`
  let bucket = buckets.get(key)
  if (!bucket) {
    bucket = new TokenBucket(BUCKET_UNITS_PER_MINUTE[budget])
    buckets.set(key, bucket)
  }
  return bucket
}

/** Test hook: forget every bucket. */
export function resetBuckets(): void {
  buckets.clear()
}

/**
 * Minutes to spend `remainingUnits` from a full-rate bucket (C33: the backfill shows a live ETA, never a
 * promised "about 2 hours"). Rounded up; 0 when nothing is left.
 */
export function etaMinutes(remainingUnits: number, budget: GmailBudget = 'backfill'): number {
  if (remainingUnits <= 0) return 0
  return Math.ceil(remainingUnits / BUCKET_UNITS_PER_MINUTE[budget])
}
