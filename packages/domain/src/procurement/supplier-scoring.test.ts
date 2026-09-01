import { describe, expect, it } from 'vitest'

import {
  contactabilityScore,
  geographyScore,
  missingCertifications,
  rankSuppliers,
  reachableCount,
  responsivenessScore,
  scoreSupplier,
  SCORING_WEIGHTS,
  type ScoringContext,
  type SupplierCandidate,
} from './supplier-scoring'

const CTX: ScoringContext = { requiredCertifications: [], destinationCountry: 'AE' }

function candidate(over: Partial<SupplierCandidate> = {}): SupplierCandidate {
  return {
    supplierId: null,
    name: 'Acme Valves',
    country: 'DE',
    fit: 0.8,
    isKnownSupplier: false,
    isAuthorizedDistributor: false,
    rfqsSent: 0,
    repliesReceived: 0,
    certifications: [],
    contact: { hasEmail: true, isRoleAddress: true, isGuessed: false, verified: false },
    ...over,
  }
}

describe('weights', () => {
  it('sum to 100 so a score reads as a percentage', () => {
    expect(Object.values(SCORING_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100)
  })
})

describe('certification is a hard filter, not a weighting', () => {
  it('disqualifies a supplier that cannot meet a required standard', () => {
    const r = scoreSupplier(candidate({ fit: 1, certifications: [] }), {
      ...CTX,
      requiredCertifications: ['en10204-3.1'],
    })
    expect(r.score).toBe(0)
    expect(r.disqualifiedFor).toEqual(['cannot certify en10204-3.1'])
  })

  it('a perfect-fit uncertified supplier still loses to a weak certified one', () => {
    const ctx = { ...CTX, requiredCertifications: ['iacs'] }
    const strong = scoreSupplier(candidate({ name: 'Strong', fit: 1, certifications: [] }), ctx)
    const weak = scoreSupplier(
      candidate({ name: 'Weak', fit: 0.2, certifications: ['iacs'] }),
      ctx,
    )
    expect(strong.score).toBe(0)
    expect(weak.score).toBeGreaterThan(0)
  })

  it('matches certifications case-insensitively', () => {
    expect(
      missingCertifications(candidate({ certifications: ['EN10204-3.1'] }), ['en10204-3.1']),
    ).toEqual([])
  })

  it('disqualifies nobody when the line requires nothing', () => {
    expect(missingCertifications(candidate(), [])).toEqual([])
  })

  it('reports every missing standard, not just the first', () => {
    const missing = missingCertifications(candidate({ certifications: ['iacs'] }), [
      'iacs',
      'en10204-3.1',
      'asme',
    ])
    expect(missing).toEqual(['en10204-3.1', 'asme'])
  })
})

describe('responsiveness is damped for small samples', () => {
  it('treats an untried supplier as neutral, not as zero', () => {
    expect(responsivenessScore(0, 0)).toBe(0.3)
  })

  it('ranks a long good record above a single lucky reply', () => {
    expect(responsivenessScore(10, 8)).toBeGreaterThan(responsivenessScore(1, 1))
  })

  it('never exceeds 1 even if replies somehow exceed sends', () => {
    expect(responsivenessScore(2, 99)).toBeLessThanOrEqual(1)
  })

  it('scores a supplier who never replies at zero', () => {
    expect(responsivenessScore(12, 0)).toBe(0)
  })
})

describe('geography', () => {
  it('scores the destination country highest', () => {
    expect(geographyScore('AE', 'AE')).toBe(1)
  })

  it('scores GCC neighbours above distant exporters', () => {
    expect(geographyScore('OM', 'AE')).toBeGreaterThan(geographyScore('CN', 'AE'))
  })

  it('is case-insensitive', () => {
    expect(geographyScore('ae', 'AE')).toBe(1)
  })

  it('gives an unknown country a neutral score rather than zero', () => {
    expect(geographyScore(null, 'AE')).toBe(0.3)
  })
})

describe('contactability — a guessed address is not a channel', () => {
  it('scores a guessed address at zero even though an email exists', () => {
    expect(
      contactabilityScore({
        hasEmail: true,
        isRoleAddress: false,
        isGuessed: true,
        verified: false,
      }),
    ).toBe(0)
  })

  it('scores no contact at zero', () => {
    expect(contactabilityScore(null)).toBe(0)
  })

  it('ranks a verified address above an unverified named one', () => {
    const verified = contactabilityScore({
      hasEmail: true, isRoleAddress: false, isGuessed: false, verified: true,
    })
    const named = contactabilityScore({
      hasEmail: true, isRoleAddress: false, isGuessed: false, verified: false,
    })
    expect(verified).toBeGreaterThan(named)
  })

  it('ranks a named address above a generic sales@ inbox', () => {
    const named = contactabilityScore({
      hasEmail: true, isRoleAddress: false, isGuessed: false, verified: false,
    })
    const role = contactabilityScore({
      hasEmail: true, isRoleAddress: true, isGuessed: false, verified: false,
    })
    expect(named).toBeGreaterThan(role)
  })
})

describe('relationship', () => {
  it('ranks an authorised distributor above a merely known supplier', () => {
    const a = scoreSupplier(candidate({ name: 'A', isAuthorizedDistributor: true }), CTX)
    const b = scoreSupplier(candidate({ name: 'B', isKnownSupplier: true }), CTX)
    expect(a.score).toBeGreaterThan(b.score)
  })

  it('ranks a known supplier above a cold candidate with identical fit', () => {
    const known = scoreSupplier(candidate({ name: 'Known', isKnownSupplier: true }), CTX)
    const cold = scoreSupplier(candidate({ name: 'Cold' }), CTX)
    expect(known.score).toBeGreaterThan(cold.score)
  })
})

describe('rankSuppliers', () => {
  it('drops disqualified candidates rather than padding the list', () => {
    const ranked = rankSuppliers(
      [
        candidate({ name: 'Certified', certifications: ['iacs'] }),
        candidate({ name: 'Uncertified', fit: 1 }),
      ],
      { ...CTX, requiredCertifications: ['iacs'] },
    )
    expect(ranked.map((r) => r.candidate.name)).toEqual(['Certified'])
  })

  it('returns fewer than the limit rather than inventing entries', () => {
    expect(rankSuppliers([candidate()], CTX, { limit: 10 })).toHaveLength(1)
  })

  it('honours the limit', () => {
    const many = Array.from({ length: 20 }, (_, i) => candidate({ name: `S${i}` }))
    expect(rankSuppliers(many, CTX, { limit: 10 })).toHaveLength(10)
  })

  it('breaks ties by name so the order is stable, not input-dependent', () => {
    const a = rankSuppliers([candidate({ name: 'Zeta' }), candidate({ name: 'Alpha' })], CTX)
    const b = rankSuppliers([candidate({ name: 'Alpha' }), candidate({ name: 'Zeta' })], CTX)
    expect(a.map((r) => r.candidate.name)).toEqual(b.map((r) => r.candidate.name))
    expect(a[0]!.candidate.name).toBe('Alpha')
  })

  it('can include disqualified candidates when explicitly asked, for review', () => {
    const ranked = rankSuppliers(
      [candidate({ name: 'Uncertified' })],
      { ...CTX, requiredCertifications: ['iacs'] },
      { includeDisqualified: true },
    )
    expect(ranked).toHaveLength(1)
    expect(ranked[0]!.disqualifiedFor).toHaveLength(1)
  })

  it('sorts strictly by score, best first', () => {
    const ranked = rankSuppliers(
      [
        candidate({ name: 'Low', fit: 0.1 }),
        candidate({ name: 'High', fit: 1, isAuthorizedDistributor: true }),
        candidate({ name: 'Mid', fit: 0.5 }),
      ],
      CTX,
    )
    expect(ranked.map((r) => r.candidate.name)).toEqual(['High', 'Mid', 'Low'])
  })
})

describe('reachableCount — the number that says whether research worked', () => {
  it('counts only candidates with a usable channel', () => {
    const ranked = rankSuppliers(
      [
        candidate({ name: 'Reachable' }),
        candidate({ name: 'NoContact', contact: null }),
        candidate({
          name: 'Guessed',
          contact: { hasEmail: true, isRoleAddress: true, isGuessed: true, verified: false },
        }),
      ],
      CTX,
    )
    expect(ranked).toHaveLength(3)
    expect(reachableCount(ranked)).toBe(1)
  })
})
