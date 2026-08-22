import { describe, expect, it } from 'vitest'
import {
  HERO_GEO_CODES,
  HERO_GEO_FALLBACK_CODE,
  HERO_GEO_VARIANTS,
  HERO_LEAD_SUFFIX,
  heroGeoVariant,
  heroLeadFor,
  resolveHeroGeoCode,
} from './hero-geo'
import { MARKETS } from './markets'

const nameFor = (code: string) => MARKETS.find((m) => m.countryCode === code)?.name ?? code

describe('hero geo coverage', () => {
  /**
   * The guard that makes this list maintainable. Markets get added by whoever
   * is expanding the export lanes, not by whoever wrote the hero — so without
   * this, market 127 ships and its visitors quietly get the Dubai fallback
   * with nobody noticing for months.
   */
  it('has wording for every export market', () => {
    const covered = new Set(HERO_GEO_CODES)
    const missing = MARKETS.filter((m) => !covered.has(m.countryCode)).map((m) => `${m.countryCode} ${m.name}`)
    expect(missing, 'add these to HERO_GEO_VARIANTS, with the possessive written by hand').toEqual([])
  })

  it('covers home and the fallback on top of the markets', () => {
    expect(HERO_GEO_CODES).toContain('AE')
    expect(HERO_GEO_CODES).toContain(HERO_GEO_FALLBACK_CODE)
    // The UAE is home rather than an export market, so it is not in MARKETS.
    expect(MARKETS.some((m) => m.countryCode === 'AE')).toBe(false)
    expect(HERO_GEO_VARIANTS).toHaveLength(MARKETS.length + 2)
  })

  it('claims no country we do not actually ship to', () => {
    // The inverse of the coverage test. A variant with no market page behind
    // it is a claim with nothing supporting it.
    const markets = new Set(MARKETS.map((m) => m.countryCode))
    const unbacked = HERO_GEO_CODES.filter(
      (c) => c !== 'AE' && c !== HERO_GEO_FALLBACK_CODE && !markets.has(c),
    )
    expect(unbacked, 'these have hero wording but no /markets page').toEqual([])
  })

  it('has unique country codes', () => {
    expect(new Set(HERO_GEO_CODES).size).toBe(HERO_GEO_CODES.length)
  })

  it('uses ISO 3166-1 alpha-2 codes, so they match the geo header verbatim', () => {
    for (const v of HERO_GEO_VARIANTS) expect(v.code).toMatch(/^[A-Z]{2}$/)
  })
})

describe('hero geo wording', () => {
  it('ends every possessive in an apostrophe, singular or plural', () => {
    for (const v of HERO_GEO_VARIANTS) {
      expect(v.possessive, `${v.code} ${nameFor(v.code)}`).toMatch(/(’s|'s|s’|s')$/)
    }
  })

  it('uses the bare apostrophe only for genuinely plural country names', () => {
    // "The United States'" is right; "Laos'" is not — Laos is singular and
    // takes the full 's, as do Belarus, Cyprus and Honduras.
    const bare = HERO_GEO_VARIANTS.filter((v) => /s'$/.test(v.possessive)).map((v) => v.code)
    expect(bare.sort()).toEqual(['NL', 'PH', 'US'])
  })

  it('prefixes "The" only where the country name takes an article', () => {
    const withArticle = HERO_GEO_VARIANTS.filter((v) => /^The /.test(v.possessive)).map((v) => v.code)
    expect(withArticle.sort()).toEqual(['AE', 'CD', 'CI', 'DO', 'GB', 'NL', 'PH', 'US'])
  })

  it('keeps the headline short enough to stay a headline', () => {
    // The lead renders at clamp(38px, 5vw, 56px) in a ~700px column. Past
    // roughly 45 characters it takes a third line and stops reading as one.
    for (const v of HERO_GEO_VARIANTS) {
      const lead = `${v.possessive} ${HERO_LEAD_SUFFIX}`
      expect(lead.length, `${v.code} ${nameFor(v.code)}: "${lead}"`).toBeLessThanOrEqual(45)
    }
  })

  it('spells out the short forms chosen for the unwieldy official names', () => {
    const p = (code: string) => HERO_GEO_VARIANTS.find((v) => v.code === code)?.possessive
    expect(p('CD')).toBe("The DRC's")
    expect(p('CG')).toBe("Congo-Brazzaville's")
    expect(p('GB')).toBe("The UK's")
    // CD and CG must stay visibly distinct — neighbouring countries whose
    // official names differ by three words.
    expect(p('CD')).not.toBe(p('CG'))
  })

  it('reads correctly for a sample spanning every rule', () => {
    expect(heroLeadFor('AE')).toBe("The UAE's premier supplier of")
    expect(heroLeadFor('SA')).toBe("Saudi Arabia's premier supplier of")
    expect(heroLeadFor('CI')).toBe("The Ivory Coast's premier supplier of")
    expect(heroLeadFor('US')).toBe("The United States' premier supplier of")
    expect(heroLeadFor('NL')).toBe("The Netherlands' premier supplier of")
    expect(heroLeadFor('PH')).toBe("The Philippines' premier supplier of")
    expect(heroLeadFor('LA')).toBe("Laos's premier supplier of")
    expect(heroLeadFor('BY')).toBe("Belarus's premier supplier of")
    expect(heroLeadFor('GB')).toBe("The UK's premier supplier of")
    expect(heroLeadFor('CD')).toBe("The DRC's premier supplier of")
  })

  it('never renders a double article or a stray space', () => {
    for (const v of HERO_GEO_VARIANTS) {
      const lead = heroLeadFor(v.code)
      expect(lead, v.code).not.toMatch(/\bthe\s+[Tt]he\b/i)
      expect(lead, v.code).not.toMatch(/\s{2}/)
      expect(lead, v.code).toBe(lead.trim())
      // markets.ts stores the article lower-case inside the name ("the
      // Netherlands"); it must be capitalised when it opens the headline.
      expect(lead, v.code).not.toMatch(/^the /)
    }
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
    // Not export markets, so deliberately uncovered.
    expect(resolveHeroGeoCode('CN')).toBe(HERO_GEO_FALLBACK_CODE)
    expect(resolveHeroGeoCode('IN')).toBe(HERO_GEO_FALLBACK_CODE)
  })

  it('takes the first value when a query param is repeated', () => {
    // `?geo=SA&geo=OM` arrives as an array. Before this was handled, the
    // .trim() threw and took the whole homepage down with it.
    expect(resolveHeroGeoCode(['SA', 'OM'])).toBe('SA')
    expect(resolveHeroGeoCode(['zz', 'SA'])).toBe(HERO_GEO_FALLBACK_CODE)
    expect(resolveHeroGeoCode([])).toBe(HERO_GEO_FALLBACK_CODE)
    expect(heroLeadFor(['SA', 'OM'])).toBe("Saudi Arabia's premier supplier of")
  })

  it('falls back when the header is missing, empty or malformed', () => {
    for (const input of [null, undefined, '', '   ', 'ZZZ', '1', 'not-a-country']) {
      expect(resolveHeroGeoCode(input)).toBe(HERO_GEO_FALLBACK_CODE)
    }
  })
})

describe('heroLeadFor', () => {
  it('always returns a complete phrase, whatever it is given', () => {
    for (const input of [null, undefined, '', 'SA', 'zz', 'CN']) {
      const lead = heroLeadFor(input)
      expect(lead).toMatch(/^\S.* premier supplier of$/)
      expect(lead).not.toMatch(/undefined|null/)
    }
  })

  it('gives an uncovered country the Dubai line — the one Google indexes', () => {
    expect(heroLeadFor('CN')).toBe("Dubai's premier supplier of")
    expect(heroLeadFor(null)).toBe("Dubai's premier supplier of")
  })

  it('produces a distinct line for every country', () => {
    // Two countries sharing a possessive would mean one of them is mislabelled.
    const leads = HERO_GEO_VARIANTS.map((v) => v.possessive)
    expect(new Set(leads).size).toBe(leads.length)
  })
})

describe('heroGeoVariant', () => {
  it('never returns undefined', () => {
    for (const input of [null, 'SA', 'nonsense']) {
      expect(heroGeoVariant(input)).toBeDefined()
    }
  })
})
