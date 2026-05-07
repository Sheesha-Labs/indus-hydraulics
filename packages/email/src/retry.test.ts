import { describe, expect, test } from 'vitest'

import { isEligibleForRetry, MAX_RETRIES, RETRY_BACKOFF_MS } from './retry'

const NOW = new Date('2026-05-05T12:00:00Z')

function ago(ms: number): Date {
  return new Date(NOW.getTime() - ms)
}

describe('retry backoff schedule', () => {
  test('three retries, then dead_letter', () => {
    expect(MAX_RETRIES).toBe(3)
    expect(RETRY_BACKOFF_MS).toHaveLength(3)
  })

  test('schedule is monotonic — each retry waits longer than the last', () => {
    for (let i = 1; i < RETRY_BACKOFF_MS.length; i++) {
      expect(RETRY_BACKOFF_MS[i]!).toBeGreaterThan(RETRY_BACKOFF_MS[i - 1]!)
    }
  })

  test('first retry: ≥5 min, second: ≥30 min, third: ≥3 hours', () => {
    expect(RETRY_BACKOFF_MS[0]).toBe(5 * 60 * 1000)
    expect(RETRY_BACKOFF_MS[1]).toBe(30 * 60 * 1000)
    expect(RETRY_BACKOFF_MS[2]).toBe(3 * 60 * 60 * 1000)
  })
})

describe('isEligibleForRetry — first retry (retryCount=0)', () => {
  test('uses attemptedAt when lastAttemptAt is null', () => {
    expect(isEligibleForRetry(0, ago(6 * 60 * 1000), null, NOW)).toBe(true)
    expect(isEligibleForRetry(0, ago(4 * 60 * 1000), null, NOW)).toBe(false)
  })

  test('exactly at the 5-minute threshold is eligible', () => {
    expect(isEligibleForRetry(0, ago(5 * 60 * 1000), null, NOW)).toBe(true)
  })

  test('1 minute before threshold is ineligible', () => {
    expect(isEligibleForRetry(0, ago(4 * 60 * 1000), null, NOW)).toBe(false)
  })
})

describe('isEligibleForRetry — second retry (retryCount=1)', () => {
  test('uses lastAttemptAt, requires 30-minute wait', () => {
    expect(isEligibleForRetry(1, ago(60 * 60 * 1000), ago(31 * 60 * 1000), NOW)).toBe(true)
    expect(isEligibleForRetry(1, ago(60 * 60 * 1000), ago(29 * 60 * 1000), NOW)).toBe(false)
  })

  test('attemptedAt does not satisfy the wait if lastAttemptAt is recent', () => {
    expect(isEligibleForRetry(1, ago(60 * 60 * 1000), ago(2 * 60 * 1000), NOW)).toBe(false)
  })
})

describe('isEligibleForRetry — third retry (retryCount=2)', () => {
  test('requires 3-hour wait from lastAttemptAt', () => {
    expect(isEligibleForRetry(2, ago(24 * 60 * 60 * 1000), ago(3 * 60 * 60 * 1000), NOW)).toBe(true)
    expect(isEligibleForRetry(2, ago(24 * 60 * 60 * 1000), ago(2.5 * 60 * 60 * 1000), NOW)).toBe(
      false,
    )
  })
})

describe('isEligibleForRetry — terminal states', () => {
  test('retryCount=3 is dead_letter — never eligible', () => {
    expect(isEligibleForRetry(3, ago(24 * 60 * 60 * 1000), ago(24 * 60 * 60 * 1000), NOW)).toBe(
      false,
    )
  })

  test('retryCount=4+ never eligible (defensive)', () => {
    expect(isEligibleForRetry(99, ago(99 * 60 * 60 * 1000), null, NOW)).toBe(false)
  })
})
