import { describe, it, expect } from 'vitest'
import { competitorBrandSlug, competitorMpnSlug, replacementUrlPath } from './slug'

describe('competitorBrandSlug', () => {
  it('lower-cases simple input', () => {
    expect(competitorBrandSlug('Parker')).toBe('parker')
  })

  it('collapses spaces and slashes to a single dash', () => {
    expect(competitorBrandSlug('Bosch / Rexroth')).toBe('bosch-rexroth')
  })

  it('strips leading and trailing dashes', () => {
    expect(competitorBrandSlug(' Eaton ')).toBe('eaton')
    expect(competitorBrandSlug('--Eaton--')).toBe('eaton')
  })

  it('handles diacritics by stripping them', () => {
    expect(competitorBrandSlug('Société Hydraulique')).toBe('societe-hydraulique')
  })

  it('returns empty string for null / undefined / empty', () => {
    expect(competitorBrandSlug(null)).toBe('')
    expect(competitorBrandSlug(undefined)).toBe('')
    expect(competitorBrandSlug('')).toBe('')
    expect(competitorBrandSlug('   ')).toBe('')
  })
})

describe('competitorMpnSlug', () => {
  it('lower-cases and dash-separates real-world MPNs', () => {
    expect(competitorMpnSlug('A10VSO 71/31R-VPA12N00')).toBe('a10vso-71-31r-vpa12n00')
    expect(competitorMpnSlug('PV16-T-1-2')).toBe('pv16-t-1-2')
    expect(competitorMpnSlug('T7B-B09 2R00 A100')).toBe('t7b-b09-2r00-a100')
  })

  it('collapses repeated dashes to a single dash', () => {
    expect(competitorMpnSlug('FOO---BAR')).toBe('foo-bar')
  })

  it('preserves digits', () => {
    expect(competitorMpnSlug('123/456')).toBe('123-456')
  })

  it('strips trailing trademark / asterisk', () => {
    expect(competitorMpnSlug('PV16™')).toBe('pv16')
    expect(competitorMpnSlug('PV16*')).toBe('pv16')
  })

  it('returns empty string for null / undefined', () => {
    expect(competitorMpnSlug(null)).toBe('')
    expect(competitorMpnSlug(undefined)).toBe('')
  })
})

describe('replacementUrlPath', () => {
  it('builds the canonical replacement URL', () => {
    expect(replacementUrlPath('Parker', 'PV16-T-1-2')).toBe('/replacement/parker/pv16-t-1-2')
  })

  it('returns null when either input would slug to empty', () => {
    expect(replacementUrlPath('', 'foo')).toBeNull()
    expect(replacementUrlPath('Parker', '')).toBeNull()
    expect(replacementUrlPath('***', 'foo')).toBeNull()
  })
})
