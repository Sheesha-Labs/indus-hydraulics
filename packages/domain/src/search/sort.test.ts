import { describe, expect, test } from 'vitest'

import {
  SORT_LABELS,
  SORT_MODES,
  parseSortParam,
  sortToOrderBy,
  type SortMode,
} from './sort'

describe('parseSortParam', () => {
  test('null/undefined/empty → relevance', () => {
    expect(parseSortParam(undefined)).toBe('relevance')
    expect(parseSortParam(null)).toBe('relevance')
    expect(parseSortParam('')).toBe('relevance')
  })

  test('valid sort modes round-trip', () => {
    for (const mode of SORT_MODES) {
      expect(parseSortParam(mode)).toBe(mode)
    }
  })

  test('arbitrary garbage → relevance', () => {
    expect(parseSortParam('drop_table')).toBe('relevance')
    expect(parseSortParam('PRICE_ASC')).toBe('relevance') // case-sensitive
    expect(parseSortParam('relevance ')).toBe('relevance')
  })
})

describe('SORT_LABELS', () => {
  test('every SortMode has a label', () => {
    for (const mode of SORT_MODES) {
      expect(SORT_LABELS[mode]).toBeTruthy()
    }
  })
})

describe('sortToOrderBy', () => {
  test('relevance → null (caller sorts in JS by FTS score)', () => {
    expect(sortToOrderBy('relevance')).toBeNull()
  })

  test('price_asc → listPrice asc nulls last + id asc', () => {
    expect(sortToOrderBy('price_asc')).toEqual([
      { listPrice: { sort: 'asc', nulls: 'last' } },
      { id: 'asc' },
    ])
  })

  test('price_desc → listPrice desc nulls last + id asc', () => {
    expect(sortToOrderBy('price_desc')).toEqual([
      { listPrice: { sort: 'desc', nulls: 'last' } },
      { id: 'asc' },
    ])
  })

  test('price sorts always send null prices to the bottom regardless of direction', () => {
    const asc = sortToOrderBy('price_asc') as Array<Record<string, unknown>>
    const desc = sortToOrderBy('price_desc') as Array<Record<string, unknown>>
    expect((asc[0]!.listPrice as { nulls: string }).nulls).toBe('last')
    expect((desc[0]!.listPrice as { nulls: string }).nulls).toBe('last')
  })

  test('newest → updatedAt desc + id asc', () => {
    expect(sortToOrderBy('newest')).toEqual([{ updatedAt: 'desc' }, { id: 'asc' }])
  })

  test('name_asc / name_desc → title order + id asc tiebreaker', () => {
    expect(sortToOrderBy('name_asc')).toEqual([{ title: 'asc' }, { id: 'asc' }])
    expect(sortToOrderBy('name_desc')).toEqual([{ title: 'desc' }, { id: 'asc' }])
  })

  test('every non-relevance mode includes a stable id tiebreaker', () => {
    for (const mode of SORT_MODES) {
      if (mode === 'relevance') continue
      const order = sortToOrderBy(mode as SortMode) as Array<Record<string, unknown>>
      const last = order[order.length - 1]
      expect(last).toEqual({ id: 'asc' })
    }
  })
})
