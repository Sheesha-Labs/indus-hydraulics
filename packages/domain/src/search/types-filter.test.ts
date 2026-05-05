import { describe, expect, test } from 'vitest'

import {
  SEARCH_TYPES,
  SEARCH_TYPE_LABELS,
  isTypeSelected,
  parseTypesParam,
  serializeTypesParam,
  toggleType,
  type SearchType,
} from './types-filter'

describe('parseTypesParam', () => {
  test('null/undefined/empty → all types (so unbookmarked URL still works)', () => {
    expect(parseTypesParam(null)).toEqual([...SEARCH_TYPES])
    expect(parseTypesParam(undefined)).toEqual([...SEARCH_TYPES])
    expect(parseTypesParam('')).toEqual([...SEARCH_TYPES])
    expect(parseTypesParam('   ')).toEqual([...SEARCH_TYPES])
  })

  test('single valid token', () => {
    expect(parseTypesParam('products')).toEqual(['products'])
    expect(parseTypesParam('articles')).toEqual(['articles'])
  })

  test('multiple valid tokens preserve order', () => {
    expect(parseTypesParam('articles,products')).toEqual(['articles', 'products'])
    expect(parseTypesParam('datasheets,articles,products')).toEqual([
      'datasheets',
      'articles',
      'products',
    ])
  })

  test('case-insensitive', () => {
    expect(parseTypesParam('PRODUCTS,Articles')).toEqual(['products', 'articles'])
  })

  test('whitespace-tolerant', () => {
    expect(parseTypesParam(' products , articles ')).toEqual(['products', 'articles'])
  })

  test('unknown tokens silently dropped', () => {
    expect(parseTypesParam('products,unknown,articles')).toEqual(['products', 'articles'])
    expect(parseTypesParam('drop_table,products')).toEqual(['products'])
  })

  test('all-unknown → all types (graceful fallback)', () => {
    expect(parseTypesParam('foo,bar,baz')).toEqual([...SEARCH_TYPES])
  })

  test('duplicates collapsed, first occurrence wins', () => {
    expect(parseTypesParam('products,articles,products')).toEqual(['products', 'articles'])
  })
})

describe('toggleType', () => {
  test('adding when missing appends', () => {
    expect(toggleType(['products'], 'articles')).toEqual(['products', 'articles'])
  })

  test('removing when present', () => {
    expect(toggleType(['products', 'articles'], 'products')).toEqual(['articles'])
  })

  test('removing the last selected → returns all (matches empty-param semantics)', () => {
    expect(toggleType(['products'], 'products')).toEqual([...SEARCH_TYPES])
  })

  test('toggling does not mutate the input', () => {
    const original: SearchType[] = ['products']
    toggleType(original, 'articles')
    expect(original).toEqual(['products'])
  })
})

describe('isTypeSelected', () => {
  test('positive case', () => {
    expect(isTypeSelected(['products', 'articles'], 'products')).toBe(true)
  })

  test('negative case', () => {
    expect(isTypeSelected(['products'], 'articles')).toBe(false)
  })

  test('empty list → false (defensive — should never happen in practice)', () => {
    expect(isTypeSelected([], 'products')).toBe(false)
  })
})

describe('serializeTypesParam', () => {
  test('full set → null (URL stays clean)', () => {
    expect(serializeTypesParam([...SEARCH_TYPES])).toBeNull()
  })

  test('full set in different order still → null', () => {
    expect(serializeTypesParam(['articles', 'datasheets', 'products'])).toBeNull()
  })

  test('subset → comma-joined', () => {
    expect(serializeTypesParam(['products', 'articles'])).toBe('products,articles')
  })

  test('single → single token', () => {
    expect(serializeTypesParam(['articles'])).toBe('articles')
  })
})

describe('SEARCH_TYPE_LABELS', () => {
  test('every search type has a human label', () => {
    for (const t of SEARCH_TYPES) {
      expect(SEARCH_TYPE_LABELS[t]).toBeTruthy()
    }
  })
})
