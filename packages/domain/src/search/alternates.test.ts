import { describe, expect, test } from 'vitest'

import {
  ALTERNATES_RESULT_THRESHOLD,
  MAX_ALTERNATES,
  proposeAlternates,
  type AlternateSynonymGroup,
} from './alternates'

const synGroup = (...terms: string[]): AlternateSynonymGroup => ({ group: terms[0]!, terms })

describe('proposeAlternates — threshold', () => {
  test('returns nothing when result count is above threshold', () => {
    const out = proposeAlternates({
      query: 'pump',
      synonyms: [synGroup('pump', 'pumps', 'pumping')],
      redirects: [],
      resultCount: ALTERNATES_RESULT_THRESHOLD + 1,
    })
    expect(out).toEqual([])
  })

  test('returns alternates exactly at threshold', () => {
    const out = proposeAlternates({
      query: 'pump',
      synonyms: [synGroup('pump', 'pumps')],
      redirects: [],
      resultCount: ALTERNATES_RESULT_THRESHOLD,
    })
    expect(out).toHaveLength(1)
  })

  test('returns alternates with zero results', () => {
    const out = proposeAlternates({
      query: 'pump',
      synonyms: [synGroup('pump', 'pumps', 'pumping')],
      redirects: [],
      resultCount: 0,
    })
    expect(out.length).toBeGreaterThan(0)
  })
})

describe('proposeAlternates — synonym source', () => {
  test('expands a single-term match', () => {
    const out = proposeAlternates({
      query: 'pump',
      synonyms: [synGroup('pump', 'pumps', 'pumping')],
      redirects: [],
      resultCount: 0,
    })
    expect(out.map((a) => a.query)).toEqual(['pumps', 'pumping'])
    expect(out.every((a) => a.source === 'synonym')).toBe(true)
  })

  test('matches via tokenized whitespace', () => {
    const out = proposeAlternates({
      query: 'a10vso pump',
      synonyms: [synGroup('pump', 'pumps')],
      redirects: [],
      resultCount: 0,
    })
    expect(out.map((a) => a.query)).toEqual(['pumps'])
  })

  test('case-insensitive', () => {
    const out = proposeAlternates({
      query: 'PUMP',
      synonyms: [synGroup('pump', 'pumps')],
      redirects: [],
      resultCount: 0,
    })
    expect(out.map((a) => a.query)).toEqual(['pumps'])
  })

  test('does not echo the user query back', () => {
    const out = proposeAlternates({
      query: 'pump',
      synonyms: [synGroup('pump', 'pumps')],
      redirects: [],
      resultCount: 0,
    })
    expect(out.map((a) => a.query)).not.toContain('pump')
  })

  test('skips groups that do not match', () => {
    const out = proposeAlternates({
      query: 'valve',
      synonyms: [synGroup('pump', 'pumps')],
      redirects: [],
      resultCount: 0,
    })
    expect(out).toEqual([])
  })
})

describe('proposeAlternates — redirect source', () => {
  test('substring match adds redirect alternate', () => {
    const out = proposeAlternates({
      query: 'best pump for me',
      synonyms: [],
      redirects: [{ query: 'best pump', targetUrl: '/c/pumps' }],
      resultCount: 0,
    })
    expect(out).toEqual([{ query: 'best pump', source: 'redirect' }])
  })

  test('identity match skipped', () => {
    const out = proposeAlternates({
      query: 'best pump',
      synonyms: [],
      redirects: [{ query: 'best pump', targetUrl: '/c/pumps' }],
      resultCount: 0,
    })
    expect(out).toEqual([])
  })

  test('non-substring rule skipped', () => {
    const out = proposeAlternates({
      query: 'pump',
      synonyms: [],
      redirects: [{ query: 'best pump for engineers', targetUrl: '/c/pumps' }],
      resultCount: 0,
    })
    expect(out).toEqual([])
  })

  test('multiple redirects, dedup by lowered query', () => {
    const out = proposeAlternates({
      query: 'best valve and bearing',
      synonyms: [],
      redirects: [
        { query: 'best valve', targetUrl: '/c/valves' },
        { query: 'BEST VALVE', targetUrl: '/c/valves2' },
      ],
      resultCount: 0,
    })
    // Same case-folded key — only the first survives.
    expect(out).toHaveLength(1)
  })

  test('empty redirect query skipped', () => {
    const out = proposeAlternates({
      query: 'pump',
      synonyms: [],
      redirects: [{ query: '', targetUrl: '/c/pumps' }],
      resultCount: 0,
    })
    expect(out).toEqual([])
  })
})

describe('proposeAlternates — combined sources', () => {
  test('synonyms come before redirects', () => {
    const out = proposeAlternates({
      query: 'pump',
      synonyms: [synGroup('pump', 'pumps')],
      redirects: [{ query: 'pump', targetUrl: '/c/pumps' }],
      resultCount: 0,
    })
    expect(out[0]!.source).toBe('synonym')
  })

  test('synonym alternate dedupes against later redirect', () => {
    const out = proposeAlternates({
      query: 'best pumps',
      synonyms: [synGroup('pumps', 'pump')],
      redirects: [{ query: 'pump', targetUrl: '/c/pumps' }],
      resultCount: 0,
    })
    // Synonym promoted "pump" first; redirect "pump" should be skipped.
    expect(out.filter((a) => a.query.toLowerCase() === 'pump')).toHaveLength(1)
  })

  test('cap at MAX_ALTERNATES', () => {
    const bigGroup = synGroup('a', 'b', 'c', 'd', 'e', 'f')
    const out = proposeAlternates({
      query: 'a',
      synonyms: [bigGroup],
      redirects: [],
      resultCount: 0,
    })
    expect(out.length).toBeLessThanOrEqual(MAX_ALTERNATES)
    expect(out).toHaveLength(MAX_ALTERNATES)
  })
})

describe('proposeAlternates — defensive', () => {
  test('empty query returns nothing', () => {
    expect(
      proposeAlternates({ query: '', synonyms: [], redirects: [], resultCount: 0 }),
    ).toEqual([])
    expect(
      proposeAlternates({ query: '   ', synonyms: [], redirects: [], resultCount: 0 }),
    ).toEqual([])
  })

  test('no synonyms or redirects → empty', () => {
    expect(
      proposeAlternates({ query: 'pump', synonyms: [], redirects: [], resultCount: 0 }),
    ).toEqual([])
  })
})
