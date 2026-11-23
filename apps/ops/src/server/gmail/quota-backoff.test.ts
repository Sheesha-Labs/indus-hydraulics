import { describe, expect, it } from 'vitest'
import { isRetriable, retryAfterMs, sendCall, withBackoff } from './backoff'
import { QuotaWaitTooLong } from './errors'
import { BUCKET_UNITS_PER_MINUTE, etaMinutes, TokenBucket } from './quota'

function fakeClock(start = 0) {
  let now = start
  const slept: number[] = []
  return {
    clock: {
      now: () => now,
      sleep: async (ms: number) => {
        slept.push(ms)
        now += ms
      },
    },
    advance: (ms: number) => {
      now += ms
    },
    slept,
  }
}

describe('quota buckets', () => {
  it('has the per-minute sizes of §1.12', () => {
    expect(BUCKET_UNITS_PER_MINUTE).toEqual({ live: 2500, backfill: 3000, send: 500 })
  })

  it('deducts, refills over time and waits inside the step when short', async () => {
    const { clock, advance, slept } = fakeClock()
    const bucket = new TokenBucket(600, clock)
    await bucket.take(600, 'x')
    expect(bucket.available()).toBe(0)
    advance(30_000)
    expect(bucket.available()).toBe(300)
    await bucket.take(400, 'x')
    expect(slept).toEqual([10_000])
  })

  it('throws QuotaWaitTooLong past 20 s so the Inngest step retries later', async () => {
    const { clock } = fakeClock()
    const bucket = new TokenBucket(60, clock)
    await bucket.take(60, 'x')
    await expect(bucket.take(30, 'x')).rejects.toBeInstanceOf(QuotaWaitTooLong)
  })

  it('gives the backfill ETA in whole minutes', () => {
    expect(etaMinutes(0)).toBe(0)
    expect(etaMinutes(3_000)).toBe(1)
    expect(etaMinutes(1_070_000)).toBe(357)
  })
})

describe('backoff', () => {
  it('classifies retriable errors', () => {
    expect(isRetriable({ status: 429 })).toBe(true)
    expect(isRetriable({ status: 500 })).toBe(true)
    expect(isRetriable({ status: 403, errors: [{ reason: 'userRateLimitExceeded' }] })).toBe(true)
    expect(isRetriable({ status: 403, errors: [{ reason: 'insufficientPermissions' }] })).toBe(
      false
    )
    expect(isRetriable({ status: 400 })).toBe(false)
    expect(isRetriable({ code: 'ECONNRESET' })).toBe(true)
  })

  it('honours Retry-After and caps each wait at 64 s, with full jitter otherwise', async () => {
    expect(retryAfterMs({ response: { headers: { 'retry-after': '3' } } })).toBe(3000)
    const waits: number[] = []
    let calls = 0
    await withBackoff(
      async () => {
        calls += 1
        if (calls < 4) throw Object.assign(new Error('unavailable'), { status: 503 })
        return 'ok'
      },
      { kind: 'read', sleep: async (ms) => void waits.push(ms), random: () => 0.999 }
    )
    expect(waits).toEqual([999, 1998, 3996])
  })

  it('a branded send cannot be retried (type-level), and runs once when called directly', async () => {
    let calls = 0
    const send = sendCall(async () => {
      calls += 1
      return 'sent'
    })
    // @ts-expect-error — withBackoff refuses a send (ADR-07: never retried)
    await withBackoff(send, { kind: 'read' })
    expect(calls).toBe(1)
  })
})
