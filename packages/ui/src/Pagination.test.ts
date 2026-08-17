import { describe, expect, test } from 'vitest'
import { pageRange } from './Pagination'

/**
 * `pageRange` is the only pure logic in the overlay primitives, and it is the
 * one piece with a real failure mode: an off-by-one at either boundary shows a
 * page number twice, or drops one, and neither is visible without counting.
 *
 * The invariants below matter more than the exact windows. Any change to the
 * window size should keep all four holding.
 */

/** Every page number present, ascending, no repeats, no gaps that aren't '…'. */
function numbersOf(range: (number | '…')[]): number[] {
  return range.filter((p): p is number => typeof p === 'number')
}

describe('pageRange', () => {
  test('lists every page when the total fits the window', () => {
    expect(pageRange(1, 1)).toEqual([1])
    expect(pageRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  test('collapses the middle once past the threshold', () => {
    expect(pageRange(7, 42)).toEqual([1, '…', 5, 6, 7, 8, 9, '…', 42])
  })

  test('drops the leading ellipsis when the window already reaches page one', () => {
    // current=3 → start=2, which is adjacent to 1, so an ellipsis there would
    // be hiding nothing.
    expect(pageRange(3, 42)).toEqual([1, 2, 3, 4, 5, '…', 42])
    expect(pageRange(1, 42)).toEqual([1, 2, 3, '…', 42])
  })

  test('drops the trailing ellipsis when the window already reaches the last page', () => {
    expect(pageRange(40, 42)).toEqual([1, '…', 38, 39, 40, 41, 42])
    expect(pageRange(42, 42)).toEqual([1, '…', 40, 41, 42])
  })

  test('always includes the first page, the last page and the current page', () => {
    for (const total of [1, 7, 8, 42, 500]) {
      for (const current of [1, 2, 3, Math.ceil(total / 2), total - 1, total]) {
        if (current < 1 || current > total) continue
        const nums = numbersOf(pageRange(current, total))
        expect(nums).toContain(1)
        expect(nums).toContain(total)
        expect(nums).toContain(current)
      }
    }
  })

  test('never repeats a page and stays ascending', () => {
    for (const total of [1, 6, 7, 8, 9, 42, 500]) {
      for (let current = 1; current <= total; current++) {
        const nums = numbersOf(pageRange(current, total))
        expect(new Set(nums).size, `duplicate at page ${current} of ${total}`).toBe(nums.length)
        expect([...nums].sort((a, b) => a - b), `unsorted at ${current}/${total}`).toEqual(nums)
      }
    }
  })

  test('only ever elides a real gap', () => {
    // An '…' standing between consecutive numbers would be a lie.
    for (const total of [8, 9, 20, 42, 500]) {
      for (let current = 1; current <= total; current++) {
        const range = pageRange(current, total)
        range.forEach((entry, i) => {
          if (entry !== '…') return
          const before = range[i - 1]
          const after = range[i + 1]
          expect(typeof before).toBe('number')
          expect(typeof after).toBe('number')
          expect(
            (after as number) - (before as number),
            `empty ellipsis at ${current}/${total}`
          ).toBeGreaterThan(1)
        })
      }
    }
  })
})
