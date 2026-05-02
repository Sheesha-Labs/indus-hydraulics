import { describe, it, expect } from 'vitest'
import { normaliseQuery, expandSynonyms, planSearch, buildTsQueryExpression } from './search-query'

describe('normaliseQuery', () => {
  it('lowercases, trims, collapses whitespace', () => {
    expect(normaliseQuery('  O-Ring   1/4  ')).toBe('o-ring 1/4')
  })
})

describe('expandSynonyms', () => {
  it('returns original when no group matches', () => {
    expect(expandSynonyms('hydraulic pump', [{ group: 'oring', terms: ['o-ring', 'oring'] }]))
      .toEqual(['hydraulic pump'])
  })

  it('expands when any token matches a group', () => {
    const out = expandSynonyms('o-ring kit', [
      { group: 'oring', terms: ['o-ring', 'oring', 'o ring'] },
    ])
    expect(out).toContain('o-ring')
    expect(out).toContain('oring')
    expect(out).toContain('o ring')
  })
})

describe('planSearch', () => {
  it('short-circuits to a redirect when normalised query matches', () => {
    const plan = planSearch({
      rawQuery: 'Hose Fitting',
      synonyms: [],
      redirects: [{ query: 'hose fitting', targetUrl: '/c/hose-fittings' }],
      boosts: [],
    })
    expect(plan).toEqual({ kind: 'redirect', targetUrl: '/c/hose-fittings' })
  })

  it('falls through to FTS when no redirect matches', () => {
    const plan = planSearch({
      rawQuery: 'parker 10643',
      synonyms: [],
      redirects: [{ query: 'something else', targetUrl: '/x' }],
      boosts: [],
    })
    expect(plan.kind).toBe('fts')
    if (plan.kind === 'fts') expect(plan.normalized).toBe('parker 10643')
  })

  it('returns an empty FTS plan for a blank query', () => {
    const plan = planSearch({ rawQuery: '   ', synonyms: [], redirects: [], boosts: [] })
    expect(plan.kind).toBe('fts')
    if (plan.kind === 'fts') expect(plan.tsqueryExpression).toBe('')
  })
})

describe('buildTsQueryExpression', () => {
  it('OR-joins single-token expansions', () => {
    expect(buildTsQueryExpression(['oring', 'o-ring'])).toBe('oring OR o-ring')
  })

  it('quotes multi-word phrases', () => {
    expect(buildTsQueryExpression(['hose fitting'])).toBe('"hose fitting"')
  })
})
