import { describe, expect, it } from 'vitest'
import { MARKETS, marketBySlug, marketCountryCodes, marketNames, marketsOrdered } from './markets'

describe('export markets', () => {
  it('covers the five GCC lanes we ship on a recurring basis', () => {
    expect(MARKETS).toHaveLength(5)
    expect(marketsOrdered().map((m) => m.slug)).toEqual([
      'saudi-arabia',
      'oman',
      'qatar',
      'bahrain',
      'kuwait',
    ])
  })

  it('has unique slugs, positions and country codes', () => {
    expect(new Set(MARKETS.map((m) => m.slug)).size).toBe(MARKETS.length)
    expect(new Set(MARKETS.map((m) => m.position)).size).toBe(MARKETS.length)
    expect(new Set(MARKETS.map((m) => m.countryCode)).size).toBe(MARKETS.length)
  })

  it('uses kebab-case slugs so they are valid URL segments', () => {
    for (const m of MARKETS) expect(m.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })

  it('uses ISO 3166-1 alpha-2 country codes', () => {
    for (const m of MARKETS) expect(m.countryCode).toMatch(/^[A-Z]{2}$/)
  })

  it('gives every market substantive content rather than a stub', () => {
    for (const m of MARKETS) {
      expect(m.intro.length, m.slug).toBeGreaterThan(120)
      expect(m.summary.length, m.slug).toBeGreaterThan(60)
      expect(m.routes.length, m.slug).toBeGreaterThan(0)
      expect(m.incoterms.length, m.slug).toBeGreaterThan(0)
      expect(m.conformity.length, m.slug).toBeGreaterThan(0)
      expect(m.leadTime.length, m.slug).toBeGreaterThan(0)
    }
  })

  it('never claims premises abroad', () => {
    // There is one verified office and it is in Dubai. site-locations.ts warns
    // that asserting an unverified location risks a false-business-presence
    // penalty, and a market page is the easiest place to slip.
    const prose = MARKETS.flatMap((m) => [m.summary, m.intro]).join(' ')
    expect(prose).not.toMatch(/\bour (branch|office|depot|premises|warehouse in)\b/i)
    expect(prose).not.toMatch(/\bbranch in\b/i)
    expect(prose).not.toMatch(/\bbased in\b/i)
  })

  it('never claims local stock — stock is in Dubai', () => {
    const prose = MARKETS.flatMap((m) => [m.summary, m.intro]).join(' ')
    expect(prose).not.toMatch(/\b(local|in-country|locally held) stock\b/i)
    expect(prose).not.toMatch(/\bstocked in (saudi|oman|qatar|bahrain|kuwait)\b/i)
  })

  it('publishes no response-time commitment', () => {
    // Lead times live in `leadTime`, hedged with "typically". Prose must not
    // turn that into an hours-based promise an assistant repeats back.
    const prose = MARKETS.flatMap((m) => [m.summary, m.intro]).join(' ')
    expect(prose).not.toMatch(/\b\d+\s*(?:-|\s)?(?:minute|hour|hr)s?\b/i)
    expect(prose).not.toMatch(/\b24\/7\b/)
  })

  it('hedges every lead time rather than committing to one', () => {
    for (const m of MARKETS) expect(m.leadTime.toLowerCase(), m.slug).toMatch(/typically|approx/)
  })

  it('gives each market its own opening paragraph', () => {
    // Five pages differing only by a swapped country name is the doorway
    // pattern the competitor teardown flagged. Intros must not be clones.
    const intros = MARKETS.map((m) => m.intro.replace(new RegExp(m.name, 'gi'), '__MARKET__'))
    expect(new Set(intros).size).toBe(MARKETS.length)
  })

  it('carries enough market-specific prose to survive the shared catalogue block', () => {
    // The rendered page is mostly the category section list, which is the same
    // on all five. Measured before `context` existed, the pages were 96.4%
    // identical to each other — the shape Google indexes once and filters.
    // This is the counterweight, so it has to be substantial, not a sentence.
    for (const m of MARKETS) {
      expect(m.context.body.length, m.slug).toBeGreaterThan(400)
      expect(m.context.heading.length, m.slug).toBeGreaterThan(10)
    }
  })

  it('shares no sentence between any two markets', () => {
    // A cheap proxy for the duplicate-content risk: if two markets reuse a
    // sentence, the differentiating copy is drifting back toward a template.
    const seen = new Map<string, string>()
    for (const m of MARKETS) {
      const prose = `${m.intro} ${m.context.body}`.replace(new RegExp(m.name, 'gi'), '__MARKET__')
      for (const raw of prose.split(/(?<=\.)\s+/)) {
        const sentence = raw.trim().toLowerCase()
        if (sentence.length < 40) continue
        const owner = seen.get(sentence)
        expect(owner, `"${sentence.slice(0, 60)}…" appears on both ${owner} and ${m.slug}`).toBeUndefined()
        seen.set(sentence, m.slug)
      }
    }
  })

  it('resolves by slug and returns undefined for an unknown one', () => {
    expect(marketBySlug('oman')?.name).toBe('Oman')
    expect(marketBySlug('iraq')).toBeUndefined()
    // A UAE emirate is a service area, not an export market.
    expect(marketBySlug('dubai')).toBeUndefined()
  })

  it('exposes names and country codes in display order', () => {
    expect(marketNames()[0]).toBe('Saudi Arabia')
    expect(marketCountryCodes()).toEqual(['SA', 'OM', 'QA', 'BH', 'KW'])
  })
})
