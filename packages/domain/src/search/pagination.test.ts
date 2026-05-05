import { describe, expect, test } from 'vitest'

import {
  MAX_PAGES,
  PAGE_SIZE,
  buildPageNumbers,
  parsePageParam,
  totalPageCount,
} from './pagination'

describe('parsePageParam', () => {
  test('missing / null / undefined → 1', () => {
    expect(parsePageParam(undefined)).toBe(1)
    expect(parsePageParam(null)).toBe(1)
    expect(parsePageParam('')).toBe(1)
  })

  test('valid integer string → that number', () => {
    expect(parsePageParam('1')).toBe(1)
    expect(parsePageParam('5')).toBe(5)
    expect(parsePageParam('25')).toBe(25)
  })

  test('non-numeric → 1 (defensive)', () => {
    expect(parsePageParam('abc')).toBe(1)
    expect(parsePageParam('1.5xyz')).toBe(1) // parseInt would return 1, but we want defensive — actually parseInt('1.5xyz', 10) = 1
  })

  test('zero or negative → 1', () => {
    expect(parsePageParam('0')).toBe(1)
    expect(parsePageParam('-1')).toBe(1)
    expect(parsePageParam('-9999')).toBe(1)
  })

  test('overflow → MAX_PAGES (25)', () => {
    expect(parsePageParam('26')).toBe(MAX_PAGES)
    expect(parsePageParam('999999')).toBe(MAX_PAGES)
  })

  test('decimal-like inputs use integer floor', () => {
    expect(parsePageParam('3.7')).toBe(3) // parseInt floors
  })
})

describe('totalPageCount', () => {
  test('zero results → 0 pages', () => {
    expect(totalPageCount(0)).toBe(0)
  })

  test('one result → 1 page', () => {
    expect(totalPageCount(1)).toBe(1)
  })

  test('exact page-size boundary → exact count', () => {
    expect(totalPageCount(PAGE_SIZE)).toBe(1)
    expect(totalPageCount(PAGE_SIZE * 2)).toBe(2)
  })

  test('one over page boundary → next page', () => {
    expect(totalPageCount(PAGE_SIZE + 1)).toBe(2)
  })

  test('cap at MAX_PAGES even with many results', () => {
    expect(totalPageCount(PAGE_SIZE * 100)).toBe(MAX_PAGES)
  })
})

describe('buildPageNumbers — small page counts', () => {
  test('zero pages → empty array', () => {
    expect(buildPageNumbers(1, 0)).toEqual([])
  })

  test('1 page → [1]', () => {
    expect(buildPageNumbers(1, 1)).toEqual([1])
  })

  test('7 pages → render all (no ellipsis)', () => {
    expect(buildPageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  test('5 pages with current at end → render all', () => {
    expect(buildPageNumbers(5, 5)).toEqual([1, 2, 3, 4, 5])
  })
})

describe('buildPageNumbers — large with ellipses', () => {
  test('current at start → ellipsis on right side only', () => {
    expect(buildPageNumbers(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20])
    expect(buildPageNumbers(3, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20])
  })

  test('current at end → ellipsis on left side only', () => {
    expect(buildPageNumbers(20, 20)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20])
    expect(buildPageNumbers(18, 20)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20])
  })

  test('current in middle → ellipsis on both sides', () => {
    expect(buildPageNumbers(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20])
  })

  test('boundary current=4 — still treated as start', () => {
    expect(buildPageNumbers(4, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20])
  })

  test('boundary current=5 — middle case', () => {
    expect(buildPageNumbers(5, 20)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 20])
  })
})

describe('buildPageNumbers — defensive', () => {
  test('current page above total → clamps to last (no negative entries)', () => {
    const tokens = buildPageNumbers(99, 20)
    // current=99 clamps to 20 → end-case slice
    expect(tokens).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20])
  })

  test('current page below 1 → clamps to 1 → start-case slice', () => {
    expect(buildPageNumbers(0, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20])
    expect(buildPageNumbers(-5, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20])
  })
})
