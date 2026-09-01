import { describe, expect, it } from 'vitest'

import { domainOf, MAX_CANDIDATES_PER_ITEM, normaliseCandidates } from './supplier-research'

/**
 * `normaliseCandidates` is the gate that keeps hallucinated suppliers out of a
 * real RFQ. The JSON schema marks evidenceUrl required, but a required string
 * can still be empty and "the model was told to" is not a guarantee — so the
 * rules are enforced here and tested here.
 */

function candidate(over: Record<string, unknown> = {}) {
  return {
    name: 'Acme Valves GmbH',
    country: 'DE',
    website: 'https://acme-valves.de',
    kind: 'manufacturer',
    fit: 0.9,
    certifications: ['EN10204-3.1'],
    evidenceUrl: 'https://acme-valves.de/products/gate-valves',
    evidenceSnippet: 'Gate valves in cast steel, 2" to 24", with EN 10204 3.1 certification.',
    ...over,
  }
}

describe('the evidence rule', () => {
  it('accepts a candidate with a real URL and a snippet', () => {
    expect(normaliseCandidates([candidate()])).toHaveLength(1)
  })

  it('drops a candidate with no evidence URL', () => {
    expect(normaliseCandidates([candidate({ evidenceUrl: undefined })])).toEqual([])
  })

  it('drops a candidate whose evidence URL is empty', () => {
    expect(normaliseCandidates([candidate({ evidenceUrl: '' })])).toEqual([])
  })

  it('drops a candidate whose evidence URL is not http(s)', () => {
    expect(normaliseCandidates([candidate({ evidenceUrl: 'acme-valves.de' })])).toEqual([])
    expect(normaliseCandidates([candidate({ evidenceUrl: 'file:///etc/passwd' })])).toEqual([])
  })

  it('drops a candidate with no supporting snippet', () => {
    expect(normaliseCandidates([candidate({ evidenceSnippet: '   ' })])).toEqual([])
  })

  it('drops a nameless candidate', () => {
    expect(normaliseCandidates([candidate({ name: '' })])).toEqual([])
  })
})

describe('normalisation', () => {
  it('derives the domain from the website', () => {
    expect(normaliseCandidates([candidate()])[0]!.domain).toBe('acme-valves.de')
  })

  it('strips www', () => {
    expect(domainOf('https://www.example.com/path')).toBe('example.com')
  })

  it('returns null rather than guessing on unparseable input', () => {
    expect(domainOf('not a url at all !!')).toBeNull()
    expect(domainOf(null)).toBeNull()
  })

  it('lowercases certification tokens so they match the scorer', () => {
    expect(normaliseCandidates([candidate()])[0]!.certifications).toEqual(['en10204-3.1'])
  })

  it('rejects a country code that is not two letters rather than inventing one', () => {
    expect(normaliseCandidates([candidate({ country: 'Germany' })])[0]!.country).toBeNull()
  })

  it('falls back to a conservative fit when the model omits or breaks it', () => {
    expect(normaliseCandidates([candidate({ fit: 'high' })])[0]!.fit).toBe(0.3)
    expect(normaliseCandidates([candidate({ fit: NaN })])[0]!.fit).toBe(0.3)
  })

  it('clamps fit into 0-1', () => {
    expect(normaliseCandidates([candidate({ fit: 5 })])[0]!.fit).toBe(1)
    expect(normaliseCandidates([candidate({ fit: -2 })])[0]!.fit).toBe(0)
  })

  it('falls back to "unknown" for an unrecognised kind', () => {
    expect(normaliseCandidates([candidate({ kind: 'foundry' })])[0]!.kind).toBe('unknown')
  })

  it('truncates a runaway snippet', () => {
    const long = 'x'.repeat(2000)
    expect(normaliseCandidates([candidate({ evidenceSnippet: long })])[0]!.evidenceSnippet)
      .toHaveLength(500)
  })
})

describe('deduplication and caps', () => {
  it('de-duplicates on domain, not on name', () => {
    const out = normaliseCandidates([
      candidate({ name: 'Acme Valves GmbH' }),
      candidate({ name: 'ACME VALVES' }), // same website
    ])
    expect(out).toHaveLength(1)
  })

  it('de-duplicates on name when no website is given', () => {
    const out = normaliseCandidates([
      candidate({ website: null }),
      candidate({ website: null }),
    ])
    expect(out).toHaveLength(1)
  })

  it('keeps two genuinely different companies', () => {
    const out = normaliseCandidates([
      candidate({ name: 'Acme', website: 'https://acme.de' }),
      candidate({ name: 'Beta', website: 'https://beta.it' }),
    ])
    expect(out).toHaveLength(2)
  })

  it('enforces the per-item cap', () => {
    const many = Array.from({ length: 25 }, (_, i) =>
      candidate({ name: `Supplier ${i}`, website: `https://supplier-${i}.com` }),
    )
    expect(normaliseCandidates(many)).toHaveLength(MAX_CANDIDATES_PER_ITEM)
  })
})

describe('hostile input', () => {
  it('returns an empty list for a non-array', () => {
    expect(normaliseCandidates(null)).toEqual([])
    expect(normaliseCandidates({ candidates: [] })).toEqual([])
    expect(normaliseCandidates('nope')).toEqual([])
  })

  it('skips malformed entries without discarding the good ones', () => {
    const out = normaliseCandidates([null, 'garbage', 42, candidate()])
    expect(out).toHaveLength(1)
  })

  it('never emits a contact field — the schema has none on purpose', () => {
    const out = normaliseCandidates([candidate({ email: 'sales@acme-valves.de' })])
    expect(out[0]).not.toHaveProperty('email')
  })
})
