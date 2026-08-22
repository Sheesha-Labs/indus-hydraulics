import { describe, expect, it } from 'vitest'
import {
  HERO_GEO_CODES,
  HERO_GEO_FALLBACK_CODE,
  HERO_GEO_VARIANTS,
  heroGeoVariant,
  heroLeadFor,
  resolveHeroGeoCode,
} from './hero-geo'
import { MARKETS } from './markets'

describe('hero geo variants', () => {
  it('covers home plus the five GCC export markets, and a fallback', () => {
    expect(HERO_GEO_CODES).toEqual(['AE', 'SA', 'OM', 'QA', 'BH', 'KW', 'XX'])
  })

  it('has unique country codes', () => {
    expect(new Set(HERO_GEO_CODES).size).toBe(HERO_GEO_CODES.length)
  })

  it('uses ISO 3166-1 alpha-2 codes, so they match the geo header verbatim', () => {
    for (const v of HERO_GEO_VARIANTS) expect(v.code).toMatch(/^[A-Z]{2}$/)
  })

  it('names every export variant as a market we actually ship to', () => {
    // The UAE is home rather than an export market, and XX is not a country.
    const exported = HERO_GEO_VARIANTS.filter((v) => v.code !== 'AE' && v.code !== HERO_GEO_FALLBACK_CODE)
    const marketCodes = new Set(MARKETS.map((m) => m.countryCode))
    for (const v of exported) {
      expect(marketCodes.has(v.code), `${v.name} has a hero variant but no /markets page`).toBe(true)
    }
  })

  it('writes every possessive by hand, ending in an apostrophe-s', () => {
    // The whole reason this data exists rather than being generated: no rule
    // turns a country name into its possessive. A generated "The Oman's" would
    // ship in the largest text on the most visited page.
    for (const v of HERO_GEO_VARIANTS) {
      expect(v.possessive.length, `${v.code} has no possessive`).toBeGreaterThan(0)
      expect(v.possessive, `${v.code} possessive looks malformed`).toMatch(/’s$|'s$/)
    }
  })

  it('only prefixes "The" where the country name actually takes an article', () => {
    const withArticle = HERO_GEO_VARIANTS.filter((v) => /^The /.test(v.possessive)).map((v) => v.code)
    expect(withArticle).toEqual(['AE'])
  })

  it('reads correctly for every variant', () => {
    expect(HERO_GEO_VARIANTS.map((v) => heroLeadFor(v.code))).toEqual([
      "The UAE's premier supplier of",
      "Saudi Arabia's premier supplier of",
      "Oman's premier supplier of",
      "Qatar's premier supplier of",
      "Bahrain's premier supplier of",
      "Kuwait's premier supplier of",
      "Dubai's premier supplier of",
    ])
  })
})

describe('resolveHeroGeoCode', () => {
  it('accepts the header verbatim', () => {
    expect(resolveHeroGeoCode('SA')).toBe('SA')
  })

  it('accepts any casing, because the query override is typed by hand', () => {
    expect(resolveHeroGeoCode('sa')).toBe('SA')
    expect(resolveHeroGeoCode(' Om ')).toBe('OM')
  })

  it('falls back for a country we have no wording for', () => {
    expect(resolveHeroGeoCode('IN')).toBe(HERO_GEO_FALLBACK_CODE)
    expect(resolveHeroGeoCode('US')).toBe(HERO_GEO_FALLBACK_CODE)
  })

  it('takes the first value when a query param is repeated', () => {
    // `?geo=SA&geo=OM` arrives as an array. Before this was handled, the
    // .trim() below threw and took the whole homepage down with it.
    expect(resolveHeroGeoCode(['SA', 'OM'])).toBe('SA')
    expect(resolveHeroGeoCode(['zz', 'SA'])).toBe(HERO_GEO_FALLBACK_CODE)
    expect(resolveHeroGeoCode([])).toBe(HERO_GEO_FALLBACK_CODE)
    expect(heroLeadFor(['SA', 'OM'])).toBe("Saudi Arabia's premier supplier of")
  })

  it('falls back when the header is missing, empty or malformed', () => {
    // Absent locally, absent on any non-Vercel host, and absent whenever the
    // edge cannot place the address. This must never render a broken headline.
    for (const input of [null, undefined, '', '   ', 'ZZZ', '1', 'not-a-country']) {
      expect(resolveHeroGeoCode(input)).toBe(HERO_GEO_FALLBACK_CODE)
    }
  })
})

describe('heroLeadFor', () => {
  it('always returns a complete phrase, whatever it is given', () => {
    for (const input of [null, undefined, '', 'SA', 'zz', 'US']) {
      const lead = heroLeadFor(input)
      expect(lead).toMatch(/^\S.* premier supplier of$/)
      expect(lead).not.toMatch(/undefined|null/)
    }
  })

  it('gives an unknown country the Dubai line — the one Google indexes', () => {
    expect(heroLeadFor('US')).toBe("Dubai's premier supplier of")
    expect(heroLeadFor(null)).toBe("Dubai's premier supplier of")
  })
})

describe('heroGeoVariant', () => {
  it('never returns undefined', () => {
    for (const input of [null, 'SA', 'nonsense']) {
      expect(heroGeoVariant(input)).toBeDefined()
    }
  })
})
