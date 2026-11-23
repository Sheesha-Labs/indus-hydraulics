import { describe, expect, it } from 'vitest'
import { isDeskHours, type WeekendTable } from '../calendar/working-day'
import { evaluateMailboxHealth, pillForMailbox, type HealthFacts } from './mailbox-health'

const NOW = new Date('2026-11-23T06:00:00Z')
const min = (m: number) => new Date(NOW.getTime() - m * 60_000)
const facts = (over: Partial<HealthFacts>): HealthFacts => ({
  status: 'live',
  lastSuccessfulSyncAt: min(2),
  watchExpiresAt: new Date(NOW.getTime() + 6 * 86_400_000),
  watchError: null,
  dlqCount: null,
  heldForCap: 0,
  backfillPhase: null,
  now: NOW,
  ...over,
})

describe('mailbox health (decision table)', () => {
  it.each([
    ['healthy stays live', {}, 'live', 'live', []],
    [
      'behind after 30 min without a sync',
      { lastSuccessfulSyncAt: min(31) },
      'behind',
      'behind',
      ['no_sync'],
    ],
    ['never synced is behind', { lastSuccessfulSyncAt: null }, 'behind', 'behind', ['no_sync']],
    [
      '20 min: no flip either way',
      { status: 'behind', lastSuccessfulSyncAt: min(20) },
      'behind',
      'behind',
      [],
    ],
    [
      'back within 15 min → live',
      { status: 'behind', lastSuccessfulSyncAt: min(5) },
      'live',
      'live',
      [],
    ],
    [
      'a watch error is behind',
      { watchError: 'permission denied' },
      'behind',
      'behind',
      ['watch_error'],
    ],
    [
      'a watch expiring within 24 h is behind',
      { watchExpiresAt: new Date(NOW.getTime() + 3_600_000) },
      'behind',
      'behind',
      ['watch_expiring'],
    ],
    ['dead letters are behind', { dlqCount: 3 }, 'behind', 'behind', ['dlq']],
    [
      'held for the cap → limit reached',
      { heldForCap: 4 },
      'limit_reached',
      'limit_reached',
      ['cap'],
    ],
    ['limit clears → live', { status: 'limit_reached' }, 'live', 'live', []],
    [
      'limit reached cannot jump to behind',
      { status: 'limit_reached', lastSuccessfulSyncAt: min(40) },
      'behind',
      'limit_reached',
      ['no_sync'],
    ],
    [
      'backfill paused',
      { status: 'backfilling', backfillPhase: 'paused' },
      'backfill_paused',
      'backfill_paused',
      [],
    ],
    [
      'backfill running stays backfilling',
      { status: 'backfilling', backfillPhase: 'fetching' },
      'backfilling',
      'backfilling',
      [],
    ],
    ['backfill done → live', { status: 'backfilling', backfillPhase: 'done' }, 'live', 'live', []],
    [
      'live cannot go back to backfilling',
      { backfillPhase: 'fetching' },
      'backfilling',
      'live',
      [],
    ],
  ] as const)('%s', (_label, over, target, next, reasons) => {
    const v = evaluateMailboxHealth(facts(over as Partial<HealthFacts>))
    expect([v.target, v.next]).toEqual([target, next])
    expect(v.reasons).toEqual(reasons)
  })

  it.each([
    'disconnected',
    'token_expired',
    'revoked',
    'paused',
    'connecting',
    'resyncing',
  ] as const)('%s is left to its own path', (status) => {
    const v = evaluateMailboxHealth(
      facts({ status, lastSuccessfulSyncAt: min(500), heldForCap: 3 })
    )
    expect([v.target, v.next]).toEqual([status, status])
  })

  it('reports the lag in seconds', () => {
    expect(evaluateMailboxHealth(facts({ lastSuccessfulSyncAt: min(2) })).lagSeconds).toBe(120)
    expect(evaluateMailboxHealth(facts({ lastSuccessfulSyncAt: null })).lagSeconds).toBe(0)
  })

  it('pill colour per state', () => {
    expect(
      ['token_expired', 'revoked', 'disconnected'].map((s) => pillForMailbox(s as never))
    ).toEqual(['disconnected', 'disconnected', 'disconnected'])
    expect(['behind', 'limit_reached', 'resyncing'].map((s) => pillForMailbox(s as never))).toEqual(
      ['behind', 'behind', 'behind']
    )
    expect(pillForMailbox('paused')).toBe('paused')
    expect(pillForMailbox('live')).toBeNull()
    expect(pillForMailbox('backfill_paused')).toBeNull()
  })
})

describe('desk hours', () => {
  const WEEKENDS: WeekendTable = { default: [6, 0], byCountry: {} }
  const at = (iso: string) => new Date(iso)
  it.each([
    ['Monday 07:59 GST', '2026-11-23T03:59:00Z', false],
    ['Monday 08:00 GST', '2026-11-23T04:00:00Z', true],
    ['Monday 18:59 GST', '2026-11-23T14:59:00Z', true],
    ['Monday 19:00 GST', '2026-11-23T15:00:00Z', false],
    ['Saturday noon', '2026-11-21T08:00:00Z', false],
    ['a UAE holiday', '2026-12-02T08:00:00Z', false],
  ] as const)('%s → %s', (_label, iso, expected) => {
    expect(
      isDeskHours(
        at(iso),
        [{ country: 'AE', date: '2026-12-02', kind: 'public_holiday' }],
        WEEKENDS
      )
    ).toBe(expected)
  })
})
