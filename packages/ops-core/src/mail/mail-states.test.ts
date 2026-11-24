import { describe, expect, it } from 'vitest'
import { boundedReturnDate, dominantScript, needsTranslation, shortDate } from './mail-states'

describe('mail states', () => {
  it.each([
    ['Please send your price for 20 sets of seal kits.', 'latin'],
    ['يرجى إرسال سعركم لعشرين طقم من أطقم الحشوات للأسطوانات الهيدروليكية', 'arabic'],
    ['请报价二十套液压缸密封件，交货地点巴士拉港口', 'chinese'],
    ['Просим выслать цену на двадцать комплектов уплотнений', 'cyrillic'],
    ['OK', 'latin'],
    ['Dear team, 请报价 please quote twenty seal kits for the cylinders, regards', 'latin'],
  ] as const)('%s → %s', (text, script) => {
    expect(dominantScript(text)).toBe(script)
    expect(needsTranslation(text)).toBe(script !== 'latin')
  })

  it('keeps a return date only between today and today + 120 days', () => {
    expect(boundedReturnDate('2026-12-01', '2026-11-24')).toBe('2026-12-01')
    expect(boundedReturnDate('2026-11-24', '2026-11-24')).toBe('2026-11-24')
    expect(boundedReturnDate('2026-11-23', '2026-11-24')).toBeNull()
    expect(boundedReturnDate('2027-04-01', '2026-11-24')).toBeNull()
    expect(boundedReturnDate('next week', '2026-11-24')).toBeNull()
    expect(boundedReturnDate(null, '2026-11-24')).toBeNull()
    expect(shortDate('2026-09-21')).toBe('21 Sep')
  })
})
