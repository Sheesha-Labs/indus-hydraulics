import { describe, it, expect } from 'vitest'
import {
  deriveCategoryFocusKeyword,
  isSpecificKeyword,
  weighCategoryKeyword,
  CATEGORY_KEYWORD_MIN_WEIGHT,
} from './focus-keyword'
import { scoreEntity } from './health'

describe('isSpecificKeyword', () => {
  it('accepts multi-word phrases', () => {
    expect(isSpecificKeyword('composite hoses')).toBe(true)
    expect(isSpecificKeyword('dry disconnect couplings')).toBe(true)
  })

  it('rejects a bare head noun', () => {
    // These are the words a category is filed under, not queries. Left
    // unchecked the scorer prefers them, because they appear everywhere.
    expect(isSpecificKeyword('hoses')).toBe(false)
    expect(isSpecificKeyword('adapters')).toBe(false)
    expect(isSpecificKeyword('ram')).toBe(false)
    expect(isSpecificKeyword('kill')).toBe(false)
  })

  it('accepts a single token carrying a standard number', () => {
    expect(isSpecificKeyword('en14420-5')).toBe(true)
    expect(isSpecificKeyword('din-2353')).toBe(true)
  })

  it('rejects empty and whitespace', () => {
    expect(isSpecificKeyword('')).toBe(false)
    expect(isSpecificKeyword('   ')).toBe(false)
  })
})

describe('weighCategoryKeyword', () => {
  it('matches a spaced keyword against a hyphenated slug', () => {
    const w = weighCategoryKeyword('composite hoses', 'composite-hoses', 'Composite Hoses')
    expect(w.inUrl).toBe(true)
    expect(w.inTitle).toBe(true)
    expect(w.weight).toBe(CATEGORY_KEYWORD_MIN_WEIGHT)
  })

  it('is case-insensitive on both sides', () => {
    expect(weighCategoryKeyword('BUTTERFLY VALVES', 'butterfly-valves', 'Butterfly Valves').weight).toBe(
      CATEGORY_KEYWORD_MIN_WEIGHT,
    )
  })

  it('scores a keyword absent from the title below the bar', () => {
    // Slug and title disagree: "bsp adapters" vs "BSP Hydraulic Adapters".
    const w = weighCategoryKeyword('bsp adapters', 'bsp-adapters', 'BSP Hydraulic Adapters — BSPP & BSPT')
    expect(w.inUrl).toBe(true)
    expect(w.inTitle).toBe(false)
    expect(w.weight).toBeLessThan(CATEGORY_KEYWORD_MIN_WEIGHT)
  })
})

describe('deriveCategoryFocusKeyword', () => {
  it('prefers the specific phrase over the generic tail', () => {
    const got = deriveCategoryFocusKeyword('composite-hoses', 'Composite Hoses', 'Composite Hoses')
    expect(got?.keyword).toBe('composite hoses')
  })

  it('returns null when slug and title share no specific phrase', () => {
    // `bop-annular` titled "Annular Blowout Preventers" — the bop- prefix is
    // internal taxonomy, not search language, so nothing qualifies.
    expect(deriveCategoryFocusKeyword('bop-annular', 'Annular', 'Annular Blowout Preventers')).toBeNull()
  })

  it('never returns a bare head noun even when it would score full marks', () => {
    const got = deriveCategoryFocusKeyword('abrasive-hoses', 'Abrasive Hoses', 'Abrasive & Material Handling Hoses')
    expect(got?.keyword).not.toBe('hoses')
  })

  it('every keyword it returns clears both applicable checks', () => {
    const cases: [string, string, string][] = [
      ['composite-hoses', 'Composite Hoses', 'Composite Hoses'],
      ['butterfly-valves', 'Butterfly Valves', 'Butterfly Valves — Wafer & Lugged'],
      ['crimp-ferrules', 'Crimp Ferrules', 'Hydraulic Hose Crimp Ferrules'],
    ]
    for (const [slug, name, title] of cases) {
      const got = deriveCategoryFocusKeyword(slug, name, title)
      expect(got, slug).not.toBeNull()
      expect(got!.weight, slug).toBe(CATEGORY_KEYWORD_MIN_WEIGHT)
      expect(got!.inTitle, slug).toBe(true)
      expect(got!.inUrl, slug).toBe(true)
    }
  })

  it('raises the health score rather than lowering it', () => {
    // The whole point of the min-weight gate. Score the same category with and
    // without the derived keyword, using the input shape the category call
    // sites actually build.
    const slug = 'composite-hoses'
    const title = 'Composite Hoses'
    const base = {
      title,
      description: 'Composite hoses for chemical and fuel transfer.',
      url: `/${slug}`,
      hasStructuredData: true,
      isIndexable: true,
      canonicalCorrect: true,
      ogComplete: false,
    }
    const without = scoreEntity({ ...base, focusKeyword: null }).score
    const derived = deriveCategoryFocusKeyword(slug, 'Composite Hoses', title)
    const with_ = scoreEntity({ ...base, focusKeyword: derived!.keyword }).score
    expect(with_).toBeGreaterThan(without)
  })

  it('a mismatched keyword would lower the score — the case the gate prevents', () => {
    const base = {
      title: 'Composite Hoses',
      description: 'Composite hoses for chemical and fuel transfer.',
      url: '/composite-hoses',
      hasStructuredData: true,
      isIndexable: true,
      canonicalCorrect: true,
      ogComplete: false,
    }
    const without = scoreEntity({ ...base, focusKeyword: null }).score
    const mismatched = scoreEntity({ ...base, focusKeyword: 'hydraulic adapters' }).score
    expect(mismatched).toBeLessThan(without)
  })
})
