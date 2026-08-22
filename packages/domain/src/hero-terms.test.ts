import { describe, expect, it } from 'vitest'
import { HERO_TERMS, HERO_TERM_DWELL_MS, HERO_TERM_FADE_MS } from './hero-terms'

describe('hero rotating terms', () => {
  it('leads with hydraulic hoses — the term that gets server-rendered and indexed', () => {
    // Position 0 is the only one a crawler reads and the only one a visitor
    // who does not linger sees. Changing it is a commercial decision, so it is
    // pinned here rather than left to whoever edits the array next.
    expect(HERO_TERMS[0]?.word).toBe('hydraulic hoses')
    expect(HERO_TERMS[0]?.href).toBe('/c/hydraulic-hoses')
  })

  it('stays short enough to read as a statement rather than a slot machine', () => {
    expect(HERO_TERMS.length).toBeGreaterThanOrEqual(3)
    expect(HERO_TERMS.length).toBeLessThanOrEqual(8)
  })

  it('points every term at a category route', () => {
    for (const t of HERO_TERMS) expect(t.href, `${t.word} → ${t.href}`).toMatch(/^\/c\/[a-z0-9-]+$/)
  })

  it('omits marine hoses — no category, no products, dropped 2026-08-22', () => {
    expect(HERO_TERMS.some((t) => /marine/i.test(t.word))).toBe(false)
  })

  it('has no duplicate word or destination', () => {
    expect(new Set(HERO_TERMS.map((t) => t.word)).size).toBe(HERO_TERMS.length)
    expect(new Set(HERO_TERMS.map((t) => t.href)).size).toBe(HERO_TERMS.length)
  })

  it('reads as a plural noun phrase, so it completes "…supplier of ___"', () => {
    for (const t of HERO_TERMS) {
      expect(t.word.trim(), 'leading or trailing space would show in the headline').toBe(t.word)
      expect(t.word, `"supplier of ${t.word}" must be grammatical`).toMatch(/s$/)
    }
  })

  it('finishes a full cycle in under twenty seconds', () => {
    expect(HERO_TERM_DWELL_MS * HERO_TERMS.length).toBeLessThan(20_000)
  })

  it('completes each fade well inside the dwell, so terms settle before swapping', () => {
    expect(HERO_TERM_FADE_MS * 2).toBeLessThan(HERO_TERM_DWELL_MS)
  })
})
