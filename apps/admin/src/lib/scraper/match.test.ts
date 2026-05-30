import { describe, it, expect } from 'vitest'
import { matchTextToOption, scorePair, normalise } from './match'

describe('normalise', () => {
  it('lowercases + strips punctuation', () => {
    expect(normalise('Bosch-Rexroth!')).toBe('bosch rexroth')
  })
  it('collapses whitespace', () => {
    expect(normalise('  Bosch   Rexroth  ')).toBe('bosch rexroth')
  })
  it('strips diacritics', () => {
    expect(normalise('Café-Société')).toBe('cafe societe')
  })
})

describe('scorePair', () => {
  it('returns 100 on exact match', () => {
    expect(scorePair('bosch rexroth', 'bosch rexroth')).toBe(100)
  })
  it('scores substring-containment highly', () => {
    // "bosch rexroth" inside "bosch rexroth gmbh"
    const s = scorePair('bosch rexroth gmbh', 'bosch rexroth')
    expect(s).toBeGreaterThanOrEqual(85)
    expect(s).toBeLessThan(100)
  })
  it('scores token overlap', () => {
    // "parker hannifin" vs "parker industrial fittings" share "parker"
    const s = scorePair('parker hannifin', 'parker industrial fittings')
    expect(s).toBeGreaterThan(0)
    expect(s).toBeLessThan(80)
  })
  it('returns 0 for fully disjoint strings', () => {
    expect(scorePair('foo bar', 'baz qux')).toBe(0)
  })
})

describe('matchTextToOption', () => {
  const brands = [
    { id: 'b1', name: 'Bosch Rexroth' },
    { id: 'b2', name: 'Parker Hannifin' },
    { id: 'b3', name: 'HYDAC' },
    { id: 'b4', name: 'Yuken' },
  ]

  it('picks the exact brand', () => {
    expect(matchTextToOption('Bosch Rexroth', brands)?.id).toBe('b1')
  })
  it('matches a noisy variation', () => {
    expect(matchTextToOption('Bosch Rexroth GmbH', brands)?.id).toBe('b1')
  })
  it('matches case-insensitively', () => {
    expect(matchTextToOption('bosch rexroth', brands)?.id).toBe('b1')
  })
  it('strips punctuation and diacritics', () => {
    expect(matchTextToOption('Bosch-Rexroth!', brands)?.id).toBe('b1')
  })
  it('returns null when no candidate clears the threshold', () => {
    expect(matchTextToOption('Random Vendor Co', brands)).toBeNull()
  })
  it('returns null for empty/missing input', () => {
    expect(matchTextToOption('', brands)).toBeNull()
    expect(matchTextToOption(null, brands)).toBeNull()
    expect(matchTextToOption(undefined, brands)).toBeNull()
  })
  it('picks the best score when multiple candidates partially match', () => {
    const opts = [
      { id: 'a', name: 'Axial Piston Pumps' },
      { id: 'b', name: 'Axial Piston Motors' },
    ]
    const r = matchTextToOption('Axial Piston Pumps', opts)
    expect(r?.id).toBe('a')
  })
})
