import { describe, expect, it } from 'vitest'

import { attributeReply, attributeSupplier } from './reply-attribution'

describe('attributeReply', () => {
  it('finds the reference our own RFQ template plants', () => {
    const r = attributeReply('Thank you for your enquiry.\n\nOur reference: ENQ-2026-0007\n\nPlease find our offer.')
    expect(r.enquiryCode).toBe('ENQ-2026-0007')
    expect(r.method).toBe('reference_token')
  })

  it('is case and spacing tolerant', () => {
    expect(attributeReply('re: enq 2026 0007').enquiryCode).toBe('ENQ-2026-0007')
    expect(attributeReply('ENQ20260007').enquiryCode).toBe('ENQ-2026-0007')
  })

  it('treats the same code quoted several times as one match', () => {
    const r = attributeReply('ENQ-2026-0007 ... quoted below ... ENQ-2026-0007')
    expect(r.enquiryCode).toBe('ENQ-2026-0007')
    expect(r.candidates).toHaveLength(1)
  })

  it('refuses to choose when a forwarded thread carries two references', () => {
    const r = attributeReply('ENQ-2026-0007 and also ENQ-2026-0011')
    expect(r.enquiryCode).toBeNull()
    expect(r.method).toBe('manual')
    expect(r.candidates).toEqual(['ENQ-2026-0007', 'ENQ-2026-0011'])
  })

  it('returns null when there is no reference at all', () => {
    expect(attributeReply('Please find attached our best price.').enquiryCode).toBeNull()
  })

  it('handles empty input without throwing', () => {
    expect(attributeReply('').enquiryCode).toBeNull()
  })

  it('does not match a malformed code', () => {
    expect(attributeReply('ENQ-26-7').enquiryCode).toBeNull()
  })
})

describe('attributeSupplier', () => {
  const candidates = [
    { id: 'a', name: 'Acme Valves GmbH', domain: 'acme-valves.de' },
    { id: 'b', name: 'Beta Fittings Ltd', domain: 'beta-fittings.co.uk' },
  ]

  it('matches on the sender domain', () => {
    const r = attributeSupplier({ rawText: 'From: m.schmidt@acme-valves.de', candidates })
    expect(r.supplierId).toBe('a')
    expect(r.method).toBe('reference_token')
  })

  it('refuses when two supplier domains appear', () => {
    const r = attributeSupplier({
      rawText: 'from m@acme-valves.de forwarded to s@beta-fittings.co.uk',
      candidates,
    })
    expect(r.supplierId).toBeNull()
  })

  it('falls back to a distinctive company name', () => {
    const r = attributeSupplier({ rawText: 'Regards, Acme Valves GmbH', candidates })
    expect(r.supplierId).toBe('a')
    expect(r.method).toBe('fuzzy')
  })

  it('ignores a name too short to be evidence', () => {
    const r = attributeSupplier({
      rawText: 'we are ktm',
      candidates: [{ id: 'x', name: 'KTM', domain: null }],
    })
    expect(r.supplierId).toBeNull()
  })

  it('returns null when nothing matches', () => {
    expect(attributeSupplier({ rawText: 'no clues here', candidates }).supplierId).toBeNull()
  })
})
