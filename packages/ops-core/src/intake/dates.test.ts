import { describe, expect, it } from 'vitest'
import { dubaiEndOfDay, parsePrintedDate } from './dates'

const anchor = new Date('2026-11-25T08:00:00Z')

describe('parsePrintedDate', () => {
  it.each<[string, string | null, boolean]>([
    ['Closing date: 28 Sep 2026', '2026-09-28', false],
    ['28-Sep-26', '2026-09-28', false],
    ['September 28th, 2026', '2026-09-28', false],
    ['by 2026-12-03', '2026-12-03', false],
    ['28/09/2026', '2026-09-28', false],
    ['04/05/2026', '2026-05-04', true],
    ['12/25/2026', '2026-12-25', false],
    ['28.09.2026', '2026-09-28', false],
    ['10 Dec', '2026-12-10', false],
    ['10 Jan', '2027-01-10', false],
    ['31 Feb 2026', null, false],
    ['asap', null, false],
  ])('%s', (text, date, ambiguous) => {
    const r = parsePrintedDate(text, anchor)
    if (date === null) expect(r).toBeNull()
    else expect(r).toEqual({ date, ambiguous })
  })
  it('empty', () => expect(parsePrintedDate(null, anchor)).toBeNull())
  it('Dubai end of day', () =>
    expect(dubaiEndOfDay('2026-09-28').toISOString()).toBe('2026-09-28T14:00:00.000Z'))
})
