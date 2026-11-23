import { describe, expect, it } from 'vitest'
import { activityLabel, deviceSub, signInLabel, whenLabel } from './labels'

/** Board 84's time words, in Asia/Dubai (UTC+4). */
const NOW = new Date('2026-11-23T06:00:00Z') // 10:00 in Dubai
const ago = (ms: number) => new Date(NOW.getTime() - ms)
const MIN = 60_000

describe('activityLabel', () => {
  it.each([
    [0, 'Active now'],
    [4 * MIN, 'Active now'],
    [12 * MIN, '12 min ago'],
    [3 * 60 * MIN, '3 h ago'],
    [30 * 60 * MIN, 'Yesterday'],
    [3 * 24 * 60 * MIN, '3 days ago'],
    [10 * 24 * 60 * MIN, '13 Nov'],
  ])('%i ms ago → %s', (ms, label) => {
    expect(activityLabel(ago(ms), NOW)).toBe(label)
  })

  it('reads "Active now" for this device whatever the stamp says', () => {
    expect(activityLabel(ago(40 * MIN), NOW, true)).toBe('Active now')
  })
})

describe('whenLabel and signInLabel', () => {
  it('says Today / Yesterday by the Dubai calendar, else the date', () => {
    expect(whenLabel(new Date('2026-11-23T04:41:00Z'), NOW)).toBe('Today 08:41')
    // 23:30 on the 22nd in Dubai is still yesterday, though it is the 22nd in UTC too.
    expect(whenLabel(new Date('2026-11-22T19:30:00Z'), NOW)).toBe('Yesterday 23:30')
    // 21:00 UTC on the 22nd is 01:00 on the 23rd in Dubai: today.
    expect(whenLabel(new Date('2026-11-22T21:00:00Z'), NOW)).toBe('Today 01:00')
    expect(whenLabel(new Date('2026-09-14T05:12:00Z'), NOW)).toBe('14 Sep 09:12')
  })

  it('joins when, method and city, skipping what is unknown', () => {
    const at = new Date('2026-11-23T04:41:00Z')
    expect(signInLabel({ at, method: 'google', city: 'Dubai' }, NOW)).toBe(
      'Today 08:41 · Google · Dubai'
    )
    expect(signInLabel({ at, method: 'password', city: null }, NOW)).toBe('Today 08:41 · Password')
    expect(deviceSub({ lastSeenAt: ago(12 * MIN), city: 'Sharjah', current: false }, NOW)).toBe(
      '12 min ago · Sharjah'
    )
  })
})
