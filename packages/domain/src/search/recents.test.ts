import { describe, expect, test } from 'vitest'

import {
  MAX_QUERY_LEN,
  MAX_RECENT_QUERIES,
  MIN_QUERY_LEN,
  pushRecentQuery,
  removeRecentQuery,
  sanitiseRecents,
} from './recents'

describe('pushRecentQuery — happy path', () => {
  test('first push prepends to empty list', () => {
    expect(pushRecentQuery([], 'pump')).toEqual(['pump'])
  })

  test('subsequent push prepends to front', () => {
    expect(pushRecentQuery(['pump'], 'valve')).toEqual(['valve', 'pump'])
  })

  test('preserves trim when pushing', () => {
    expect(pushRecentQuery([], '  axial pump  ')).toEqual(['axial pump'])
  })
})

describe('pushRecentQuery — dedup', () => {
  test('duplicate (case-insensitive) is removed and re-prepended', () => {
    expect(pushRecentQuery(['pump', 'valve', 'hose'], 'PUMP')).toEqual([
      'PUMP',
      'valve',
      'hose',
    ])
  })

  test('exact-match duplicate moves to front', () => {
    expect(pushRecentQuery(['pump', 'valve'], 'pump')).toEqual(['pump', 'valve'])
  })

  test('preserves new casing on dedup', () => {
    expect(pushRecentQuery(['Pump'], 'pUMP')).toEqual(['pUMP'])
  })
})

describe('pushRecentQuery — capping', () => {
  test('caps at MAX_RECENT_QUERIES', () => {
    const start = ['aa', 'bb', 'cc', 'dd', 'ee']
    expect(start).toHaveLength(MAX_RECENT_QUERIES)
    const next = pushRecentQuery(start, 'ff')
    expect(next).toHaveLength(MAX_RECENT_QUERIES)
    expect(next?.[0]).toBe('ff')
    expect(next).not.toContain('ee') // oldest evicted
  })

  test('dedup before cap — push existing token does not evict another', () => {
    const next = pushRecentQuery(['aa', 'bb', 'cc', 'dd', 'ee'], 'cc')
    expect(next).toEqual(['cc', 'aa', 'bb', 'dd', 'ee'])
  })
})

describe('pushRecentQuery — rejection', () => {
  test('empty / whitespace-only → null', () => {
    expect(pushRecentQuery([], '')).toBeNull()
    expect(pushRecentQuery([], '   ')).toBeNull()
  })

  test('too short → null', () => {
    expect(pushRecentQuery([], 'a')).toBeNull()
  })

  test('exactly MIN_QUERY_LEN is accepted', () => {
    const min = 'a'.repeat(MIN_QUERY_LEN)
    expect(pushRecentQuery([], min)).toEqual([min])
  })

  test('too long → null', () => {
    const over = 'a'.repeat(MAX_QUERY_LEN + 1)
    expect(pushRecentQuery([], over)).toBeNull()
  })

  test('exactly MAX_QUERY_LEN is accepted', () => {
    const exact = 'a'.repeat(MAX_QUERY_LEN)
    expect(pushRecentQuery([], exact)).toEqual([exact])
  })
})

describe('pushRecentQuery — immutability', () => {
  test('does not mutate the input array', () => {
    const original = ['pump']
    pushRecentQuery(original, 'valve')
    expect(original).toEqual(['pump'])
  })
})

describe('sanitiseRecents — defensive parse', () => {
  test('non-array → empty', () => {
    expect(sanitiseRecents(null)).toEqual([])
    expect(sanitiseRecents(undefined)).toEqual([])
    expect(sanitiseRecents('pump')).toEqual([])
    expect(sanitiseRecents({ a: 1 })).toEqual([])
  })

  test('array of valid strings preserved', () => {
    expect(sanitiseRecents(['pump', 'valve'])).toEqual(['pump', 'valve'])
  })

  test('drops non-strings', () => {
    expect(sanitiseRecents(['pump', 1, null, { a: 1 }, 'valve'])).toEqual(['pump', 'valve'])
  })

  test('drops out-of-bounds strings', () => {
    expect(sanitiseRecents(['', 'a', 'pump', 'a'.repeat(MAX_QUERY_LEN + 1)])).toEqual(['pump'])
  })

  test('dedupes case-insensitive', () => {
    expect(sanitiseRecents(['pump', 'PUMP', 'valve'])).toEqual(['pump', 'valve'])
  })

  test('caps at MAX_RECENT_QUERIES', () => {
    const big = Array.from({ length: 20 }, (_, i) => `term-${i}`)
    expect(sanitiseRecents(big)).toHaveLength(MAX_RECENT_QUERIES)
  })

  test('trims entries on read', () => {
    expect(sanitiseRecents(['  pump  '])).toEqual(['pump'])
  })
})

describe('removeRecentQuery', () => {
  test('removes case-insensitive match', () => {
    expect(removeRecentQuery(['pump', 'valve'], 'PUMP')).toEqual(['valve'])
  })

  test('no-op when not present', () => {
    expect(removeRecentQuery(['pump'], 'nonexistent')).toEqual(['pump'])
  })

  test('does not mutate input', () => {
    const original = ['pump', 'valve']
    removeRecentQuery(original, 'pump')
    expect(original).toEqual(['pump', 'valve'])
  })

  test('handles empty list', () => {
    expect(removeRecentQuery([], 'pump')).toEqual([])
  })
})
