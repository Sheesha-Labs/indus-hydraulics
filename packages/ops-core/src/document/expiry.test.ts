import { describe, expect, it } from 'vitest'
import { daysLeft, dueReminders, newlyExpired, type ExpiringDocument } from './expiry'

const day = (m: number, d: number, y = 2026) => new Date(Date.UTC(y, m - 1, d))
const working = (d: Date) => d.getUTCDay() !== 5 && d.getUTCDay() !== 6 // Fri–Sat weekend
const opts = { thresholds: [60, 30, 7], isWorkingDay: working }
const doc = (p: Partial<ExpiringDocument> & { id: string }): ExpiringDocument => ({
  companyId: 'sup',
  kind: 'iso_certificate',
  expiresAt: null,
  archivedAt: null,
  remindersSentDays: [],
  createdAt: day(1, 1),
  ...p,
})

describe('document expiry reminders', () => {
  const today = day(11, 26) // Thursday
  it('counts days left', () => {
    expect(daysLeft(day(12, 26), today)).toBe(30)
  })

  it('fires each threshold once, the smallest due', () => {
    const r = dueReminders(
      [
        doc({ id: 'a', expiresAt: day(1, 25, 2027) }), // 60 days
        doc({ id: 'b', expiresAt: day(12, 16) }), // 20 days: 30 once
        doc({ id: 'c', expiresAt: day(12, 16), remindersSentDays: [30] }), // 30 sent, 7 not yet due
        doc({ id: 'd', expiresAt: day(12, 2), remindersSentDays: [60, 30] }), // 6 days: 7
        doc({ id: 'e', expiresAt: day(12, 2), remindersSentDays: [7] }), // all done
        doc({ id: 'f', expiresAt: day(6, 1, 2027) }), // far away
        doc({ id: 'g', expiresAt: day(11, 1) }), // already expired
        doc({ id: 'h', expiresAt: day(12, 2), companyId: null, kind: 'trade_licence' }), // Indus's own
      ],
      today,
      opts
    )
    expect(r.map((x) => [x.documentId, x.threshold, x.owner])).toEqual([
      ['a', 60, 'supplier'],
      ['b', 30, 'supplier'],
      ['d', 7, 'supplier'],
      ['h', 7, 'indus'],
    ])
  })

  it('skips archived and superseded documents', () => {
    const r = dueReminders(
      [
        doc({ id: 'old', expiresAt: day(12, 16), createdAt: day(1, 1) }),
        doc({
          id: 'new',
          expiresAt: day(12, 16).getTime() ? day(12, 16) : null,
          kind: 'atex_certificate',
        }),
        doc({
          id: 'renewed',
          expiresAt: day(12, 30),
          kind: 'iso_certificate',
          createdAt: day(6, 1),
          remindersSentDays: [60],
        }),
        doc({ id: 'gone', expiresAt: day(12, 10), archivedAt: day(11, 1), kind: 'nda' }),
      ],
      today,
      opts
    )
    expect(r.map((x) => x.documentId)).toEqual(['new'])
  })

  it('nothing on a weekend or holiday: the next working day sends it', () => {
    const friday = day(11, 27)
    expect(dueReminders([doc({ id: 'a', expiresAt: day(1, 25, 2027) })], friday, opts)).toEqual([])
    const sunday = day(11, 29)
    expect(
      dueReminders([doc({ id: 'a', expiresAt: day(1, 25, 2027) })], sunday, opts)[0]!.threshold
    ).toBe(60)
    const holiday = (d: Date) => working(d) && d.getTime() !== day(12, 2).getTime()
    expect(
      dueReminders([doc({ id: 'a', expiresAt: day(1, 31, 2027) })], day(12, 2), {
        ...opts,
        isWorkingDay: holiday,
      })
    ).toEqual([])
  })

  it('marks newly expired documents once', () => {
    expect(
      newlyExpired(
        [
          { ...doc({ id: 'x', expiresAt: day(11, 1) }), status: 'received' },
          { ...doc({ id: 'y', expiresAt: day(11, 1) }), status: 'expired' },
          { ...doc({ id: 'z', expiresAt: day(12, 1) }), status: 'received' },
        ],
        today
      )
    ).toEqual(['x'])
  })
})
