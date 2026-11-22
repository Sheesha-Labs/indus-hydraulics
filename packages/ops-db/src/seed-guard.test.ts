import { describe, expect, it } from 'vitest'
import { databaseHost, decideLocalOnly, decideSeed } from './seed-guard'

const LOCAL = 'postgresql://postgres:postgres@localhost:54329/postgres'
const LOOPBACK = 'postgresql://postgres:postgres@127.0.0.1:54329/postgres'
const V6 = 'postgresql://postgres:postgres@[::1]:54329/postgres'
const REMOTE = 'postgresql://ops_app:x@db.example.test:6543/postgres'

describe('decideSeed', () => {
  it('allows local hosts, with or without demo people', () => {
    for (const url of [LOCAL, LOOPBACK, V6]) {
      expect(decideSeed(url, {})).toMatchObject({ ok: true, local: true, demo: false })
      expect(decideSeed(url, { SEED_DEMO: '1' })).toMatchObject({ ok: true, demo: true })
    }
  })

  it('refuses a hosted database by default', () => {
    expect(decideSeed(REMOTE, {})).toMatchObject({ ok: false })
  })

  it('allows a hosted database only with SEED_ALLOW_REMOTE=1 and SEED_DEMO unset', () => {
    expect(decideSeed(REMOTE, { SEED_ALLOW_REMOTE: '1' })).toMatchObject({ ok: true, demo: false })
    expect(decideSeed(REMOTE, { SEED_ALLOW_REMOTE: '1', SEED_DEMO: '1' })).toMatchObject({
      ok: false,
    })
    // Set at all, even to something else, counts as set.
    expect(decideSeed(REMOTE, { SEED_ALLOW_REMOTE: '1', SEED_DEMO: '0' })).toMatchObject({
      ok: false,
    })
    expect(decideSeed(REMOTE, { SEED_ALLOW_REMOTE: 'true' })).toMatchObject({ ok: false })
  })

  it('refuses a missing or unparsable URL and libpq host= overrides', () => {
    expect(decideSeed(undefined, {})).toMatchObject({ ok: false })
    expect(decideSeed('not a url', {})).toMatchObject({ ok: false })
    expect(decideSeed(`${LOCAL}?host=db.example.test`, { SEED_DEMO: '1' })).toMatchObject({
      ok: false,
    })
  })

  it('reads the host the URL connects to, not a lookalike in the credentials', () => {
    expect(databaseHost('postgresql://localhost:pw@db.example.test/postgres')).toBe(
      'db.example.test'
    )
    expect(decideSeed('postgresql://localhost:pw@db.example.test/postgres', {})).toMatchObject({
      ok: false,
    })
  })
})

describe('decideLocalOnly (parity seed)', () => {
  it('has no remote escape hatch', () => {
    expect(decideLocalOnly(LOCAL)).toMatchObject({ ok: true })
    expect(decideLocalOnly(REMOTE)).toMatchObject({ ok: false })
    expect(decideLocalOnly(`${LOCAL}?host=db.example.test`)).toMatchObject({ ok: false })
  })
})
