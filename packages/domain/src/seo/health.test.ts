import { describe, it, expect } from 'vitest'
import { scoreEntity, bandForScore } from './health'

const baseGood = {
  title: 'Parker 10643-6-6 Hydraulic Hose Fitting 3/8 NPT × -6',
  description:
    'Forged carbon steel hydraulic hose fitting, 3/8 in male NPT × -6 hose. 5800 PSI working pressure, in stock for next-day shipping across the catalogue.',
  focusKeyword: 'hydraulic hose fitting',
  url: '/p/parker-10643-6-6-hydraulic-hose-fitting',
  firstParagraph: 'this hydraulic hose fitting fits parker 482-series hose.',
  altCoverage: 1.0,
  internalIncoming: 4,
  internalOutgoing: 6,
  hasStructuredData: true,
  isIndexable: true,
  canonicalCorrect: true,
  ogComplete: true,
  readabilityFlesch: 65,
} as const

describe('scoreEntity', () => {
  it('scores 100 for an entity that passes every check', () => {
    const result = scoreEntity({ ...baseGood })
    expect(result.score).toBe(100)
    expect(result.breakdown.every((c) => c.pass)).toBe(true)
  })

  it('scores 0 when title and description are missing and core flags are off', () => {
    const result = scoreEntity({
      title: null,
      description: null,
      focusKeyword: null,
      url: null,
      hasStructuredData: false,
      isIndexable: false,
      canonicalCorrect: false,
      ogComplete: false,
    })
    expect(result.score).toBeLessThan(20)
  })

  it('flags titles outside the 30–60 char range', () => {
    const short = scoreEntity({ ...baseGood, title: 'Short' })
    expect(short.breakdown.find((c) => c.id === 'titleLength')?.pass).toBe(false)

    const long = scoreEntity({ ...baseGood, title: 'A'.repeat(80) })
    expect(long.breakdown.find((c) => c.id === 'titleLength')?.pass).toBe(false)
  })

  it('skips keyword checks when no focus keyword is set', () => {
    const result = scoreEntity({ ...baseGood, focusKeyword: null })
    expect(result.breakdown.find((c) => c.id === 'keywordInTitle')).toBeUndefined()
    expect(result.breakdown.find((c) => c.id === 'keywordInUrl')).toBeUndefined()
  })

  it('treats noindex as failing the indexable+canonical check', () => {
    const result = scoreEntity({ ...baseGood, isIndexable: false })
    const c = result.breakdown.find((c) => c.id === 'indexableAndCanonical')
    expect(c?.pass).toBe(false)
  })
})

describe('bandForScore', () => {
  it('returns good/warn/danger at thresholds', () => {
    expect(bandForScore(100)).toBe('good')
    expect(bandForScore(80)).toBe('good')
    expect(bandForScore(79)).toBe('warn')
    expect(bandForScore(50)).toBe('warn')
    expect(bandForScore(49)).toBe('danger')
    expect(bandForScore(0)).toBe('danger')
  })
})
