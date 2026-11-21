import { describe, expect, test } from 'vitest'
import { OPS_CONNECTION_LIMIT, OPS_POOL_TIMEOUT, buildDatasourceUrl } from './datasource-url'

/**
 * The Ops datasource URL (architecture C3, ADR-04). Same behaviour as packages/db's helper,
 * plus the Ops defaults: one connection per instance and a 20 s pool wait, unless the URL or
 * an override says otherwise. These test the real function, with env passed in.
 */

const POOLER = 'postgresql://ops_app:pw@host:6543/postgres?pgbouncer=true'
const BUILD = 'phase-production-build'

const params = (env: NodeJS.ProcessEnv) => {
  const out = buildDatasourceUrl(env)
  return out ? new URL(out).searchParams : null
}

describe('ops datasource url', () => {
  test('the Ops defaults are 1 connection and a 20 s pool timeout', () => {
    expect(OPS_CONNECTION_LIMIT).toBe(1)
    expect(OPS_POOL_TIMEOUT).toBe(20)
  })

  test('a bare pooler URL gets connection_limit=1 and pool_timeout=20', () => {
    const p = params({ DATABASE_URL: POOLER })!
    expect(p.get('connection_limit')).toBe('1')
    expect(p.get('pool_timeout')).toBe('20')
    expect(p.get('pgbouncer')).toBe('true')
  })

  test('values already on the URL win over the defaults', () => {
    const p = params({ DATABASE_URL: `${POOLER}&connection_limit=2&pool_timeout=5` })!
    expect(p.get('connection_limit')).toBe('2')
    expect(p.get('pool_timeout')).toBe('5')
  })

  test('DATABASE_CONNECTION_LIMIT overrides the URL at request time', () => {
    const p = params({ DATABASE_URL: POOLER, DATABASE_CONNECTION_LIMIT: '3' })!
    expect(p.get('connection_limit')).toBe('3')
    expect(p.get('pool_timeout')).toBe('20')
  })

  test('the build phase widens the timeout to 60 s', () => {
    const p = params({ DATABASE_URL: POOLER, NEXT_PHASE: BUILD })!
    expect(p.get('pool_timeout')).toBe('60')
    expect(p.get('connection_limit')).toBe('1')
  })

  test('the build caps the pool and the cap only ever lowers', () => {
    expect(
      params({ DATABASE_URL: POOLER, DATABASE_CONNECTION_LIMIT: '10', NEXT_PHASE: BUILD })!.get(
        'connection_limit'
      )
    ).toBe('4')
    expect(params({ DATABASE_URL: POOLER, NEXT_PHASE: BUILD })!.get('connection_limit')).toBe('1')
  })

  test('DATABASE_BUILD_CONNECTION_LIMIT overrides the cap; junk falls back to it', () => {
    const base = { DATABASE_URL: POOLER, DATABASE_CONNECTION_LIMIT: '10', NEXT_PHASE: BUILD }
    expect(params({ ...base, DATABASE_BUILD_CONNECTION_LIMIT: '6' })!.get('connection_limit')).toBe(
      '6'
    )
    for (const bad of ['abc', '0', '-2', '']) {
      expect(
        params({ ...base, DATABASE_BUILD_CONNECTION_LIMIT: bad })!.get('connection_limit')
      ).toBe('4')
    }
  })

  test('DATABASE_POOL_TIMEOUT overrides the build default', () => {
    const p = params({ DATABASE_URL: POOLER, NEXT_PHASE: BUILD, DATABASE_POOL_TIMEOUT: '120' })!
    expect(p.get('pool_timeout')).toBe('120')
  })

  test('an explicit pool_timeout survives the build phase', () => {
    const p = params({ DATABASE_URL: `${POOLER}&pool_timeout=5`, NEXT_PHASE: BUILD })!
    expect(p.get('pool_timeout')).toBe('5')
  })

  test('a missing DATABASE_URL returns undefined', () => {
    expect(buildDatasourceUrl({})).toBeUndefined()
    expect(buildDatasourceUrl({ NEXT_PHASE: BUILD })).toBeUndefined()
  })

  test('a malformed DATABASE_URL falls back rather than throwing', () => {
    expect(buildDatasourceUrl({ DATABASE_URL: 'not a url' })).toBeUndefined()
  })
})
