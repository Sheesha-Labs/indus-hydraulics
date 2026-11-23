import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_REVOCATION_TTL_MS, createRevocationCache } from './session-revocation'

/**
 * The proxy's revocation cache (S03-T02): at most one query per TTL per instance, a single refresh in
 * flight, and on a database error the previous set is kept until the next TTL.
 */
describe('createRevocationCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  function harness(initial: string[] = []) {
    const state = { revoked: initial, queries: 0, fail: false }
    const errors: unknown[] = []
    const cache = createRevocationCache({
      ttlMs: DEFAULT_REVOCATION_TTL_MS,
      load: async () => {
        state.queries += 1
        if (state.fail) throw new Error('pooler down')
        return [...state.revoked]
      },
      onError: (e) => errors.push(e),
    })
    return { state, cache, errors }
  }

  it('queries once, then serves every request from memory until the TTL passes', async () => {
    const { state, cache } = harness()
    for (let i = 0; i < 500; i++) await cache.isRevoked(`sid-${i}`)
    expect(state.queries).toBe(1)
    vi.advanceTimersByTime(DEFAULT_REVOCATION_TTL_MS - 1)
    await cache.isRevoked('sid-x')
    expect(state.queries).toBe(1)
    vi.advanceTimersByTime(1)
    await cache.isRevoked('sid-x')
    expect(state.queries).toBe(2)
  })

  it('shares one refresh between concurrent requests', async () => {
    const { state, cache } = harness()
    await Promise.all(Array.from({ length: 50 }, (_, i) => cache.isRevoked(`sid-${i}`)))
    expect(state.queries).toBe(1)
    expect(cache.refreshes).toBe(1)
  })

  it('sees a revocation after the next refresh, not before', async () => {
    const { state, cache } = harness()
    expect(await cache.isRevoked('sid-1')).toBe(false)
    state.revoked = ['sid-1']
    expect(await cache.isRevoked('sid-1')).toBe(false)
    vi.advanceTimersByTime(DEFAULT_REVOCATION_TTL_MS)
    expect(await cache.isRevoked('sid-1')).toBe(true)
    expect(await cache.isRevoked('sid-2')).toBe(false)
  })

  it('keeps the previous set on a database error, logs it, and waits a full TTL to retry', async () => {
    const { state, cache, errors } = harness(['sid-1'])
    expect(await cache.isRevoked('sid-1')).toBe(true)
    state.fail = true
    vi.advanceTimersByTime(DEFAULT_REVOCATION_TTL_MS)
    expect(await cache.isRevoked('sid-1')).toBe(true)
    expect(errors).toHaveLength(1)
    // The outage does not become one query per request.
    for (let i = 0; i < 20; i++) await cache.isRevoked('sid-1')
    expect(state.queries).toBe(2)
    state.fail = false
    state.revoked = []
    vi.advanceTimersByTime(DEFAULT_REVOCATION_TTL_MS)
    expect(await cache.isRevoked('sid-1')).toBe(false)
    expect(state.queries).toBe(3)
  })

  it('honours a shorter TTL (OPS_SESSION_REVOCATION_TTL_MS in tests)', async () => {
    let queries = 0
    const cache = createRevocationCache({
      ttlMs: 2000,
      load: async () => {
        queries += 1
        return []
      },
    })
    await cache.isRevoked('a')
    vi.advanceTimersByTime(2000)
    await cache.isRevoked('a')
    expect(queries).toBe(2)
  })
})
