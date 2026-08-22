import { describe, expect, test } from 'vitest'
import { buildDatasourceUrl } from './datasource-url'

/**
 * The build-phase pool timeout.
 *
 * `next build` static-generates across 9 worker PROCESSES, each with its own
 * PrismaClient and its own pool. That over-subscribes one pgbouncer, workers
 * queue past Prisma's 10s default `pool_timeout`, and the build dies with
 * P2024 — observed on roughly every other run.
 *
 * The scoping is the whole point of the fix and is what these pin: the timeout
 * widens for the BUILD only. At request time a 60s wait for a connection is a
 * hung page, and failing fast is correct.
 *
 * `buildDatasourceUrl` takes env as an argument precisely so this can test the
 * real function rather than a copy of it — a test that reimplements the logic
 * it is checking passes happily while the shipped code does something else.
 */

const BASE = 'postgresql://u:p@host:6543/postgres?pgbouncer=true&connection_limit=1'

const params = (env: NodeJS.ProcessEnv) => {
  const out = buildDatasourceUrl(env)
  return out ? new URL(out).searchParams : null
}

const BUILD = 'phase-production-build'

describe('datasource url', () => {
  test('request time is untouched — no pool_timeout is added', () => {
    const p = params({ DATABASE_URL: BASE, DATABASE_CONNECTION_LIMIT: '10' })!
    expect(p.get('pool_timeout')).toBeNull()
    expect(p.get('connection_limit')).toBe('10')
  })

  test('the build phase widens the timeout', () => {
    const p = params({ DATABASE_URL: BASE, DATABASE_CONNECTION_LIMIT: '10', NEXT_PHASE: BUILD })!
    expect(p.get('pool_timeout')).toBe('60')
  })

  /**
   * The build's connection FOOTPRINT, which is a different failure from the
   * timeout above and is not fixed by it.
   *
   * 9 build workers each hold their own pool. At the request-time limit of 10
   * that is 90 client connections per build against a pooler capped at 200 for
   * the whole project, so two concurrent builds sit at 180 and a third is
   * refused outright with EMAXCONN — refused, not queued, so no pool_timeout
   * helps. Capping the build pool at 4 puts five builds inside the cap.
   */
  test('the build caps the pool below the request-time limit', () => {
    const p = params({ DATABASE_URL: BASE, DATABASE_CONNECTION_LIMIT: '10', NEXT_PHASE: BUILD })!
    expect(p.get('connection_limit')).toBe('4')
  })

  test('request time keeps the full pool — the cap is build-only', () => {
    const p = params({ DATABASE_URL: BASE, DATABASE_CONNECTION_LIMIT: '10' })!
    expect(p.get('connection_limit')).toBe('10')
  })

  test('the cap only ever lowers', () => {
    // A URL already asking for fewer keeps its own number. Raising it would be
    // this fix causing the exhaustion it exists to prevent.
    const p = params({ DATABASE_URL: BASE, NEXT_PHASE: BUILD })!
    expect(p.get('connection_limit')).toBe('1')
  })

  test('DATABASE_BUILD_CONNECTION_LIMIT overrides the cap', () => {
    const p = params({
      DATABASE_URL: BASE,
      DATABASE_CONNECTION_LIMIT: '10',
      NEXT_PHASE: BUILD,
      DATABASE_BUILD_CONNECTION_LIMIT: '6',
    })!
    expect(p.get('connection_limit')).toBe('6')
  })

  test('a junk override falls back to the default, it does not disable the cap', () => {
    // Failing OPEN here would restore the 90-connections-per-build footprint
    // from a dashboard typo, and nothing would report it — the build would just
    // start dying again whenever two ran together.
    for (const bad of ['abc', '0', '-2', '']) {
      const p = params({
        DATABASE_URL: BASE,
        DATABASE_CONNECTION_LIMIT: '10',
        NEXT_PHASE: BUILD,
        DATABASE_BUILD_CONNECTION_LIMIT: bad,
      })!
      expect(p.get('connection_limit')).toBe('4')
    }
  })

  test('an explicit pool_timeout on the URL is never overwritten', () => {
    const p = params({ DATABASE_URL: `${BASE}&pool_timeout=5`, NEXT_PHASE: BUILD })!
    expect(p.get('pool_timeout')).toBe('5')
  })

  test('DATABASE_POOL_TIMEOUT overrides the default', () => {
    const p = params({ DATABASE_URL: BASE, NEXT_PHASE: BUILD, DATABASE_POOL_TIMEOUT: '120' })!
    expect(p.get('pool_timeout')).toBe('120')
  })

  test('the build phase applies even with no connection-limit override', () => {
    // This case previously returned undefined, so the build silently ran on
    // Prisma's 10s default — which is the failure being fixed.
    const p = params({ DATABASE_URL: BASE, NEXT_PHASE: BUILD })!
    expect(p.get('pool_timeout')).toBe('60')
    expect(p.get('connection_limit')).toBe('1') // left as the URL had it
  })

  test('no override and no build phase returns undefined', () => {
    expect(buildDatasourceUrl({ DATABASE_URL: BASE })).toBeUndefined()
  })

  test('a missing DATABASE_URL returns undefined rather than a broken URL', () => {
    expect(buildDatasourceUrl({ NEXT_PHASE: BUILD })).toBeUndefined()
  })

  test('a malformed DATABASE_URL falls back rather than throwing', () => {
    expect(buildDatasourceUrl({ DATABASE_URL: 'not a url', NEXT_PHASE: BUILD })).toBeUndefined()
  })

  test('a non-build NEXT_PHASE does not trigger the widening', () => {
    // next dev / next start set other phases; only the build over-subscribes.
    const p = params({ DATABASE_URL: BASE, DATABASE_CONNECTION_LIMIT: '10', NEXT_PHASE: 'phase-development-server' })!
    expect(p.get('pool_timeout')).toBeNull()
  })
})
