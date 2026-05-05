import { describe, expect, test } from 'vitest'

import { computeVatRate } from './vat'

describe('computeVatRate — UAE FTA rule', () => {
  test('UAE ship-to → 5% by default', () => {
    const r = computeVatRate({ shipToCountryCode: 'AE' })
    expect(r.rate).toBe(5)
    expect(r.label).toBe('VAT @ 5%')
    expect(r.isExport).toBe(false)
  })

  test('UAE ship-to with explicit defaultRate from store settings', () => {
    const r = computeVatRate({ shipToCountryCode: 'AE', defaultRate: 5 })
    expect(r.rate).toBe(5)
    expect(r.label).toBe('VAT @ 5%')
  })

  test('country code is case-insensitive', () => {
    const lower = computeVatRate({ shipToCountryCode: 'ae' })
    const mixed = computeVatRate({ shipToCountryCode: 'Ae' })
    expect(lower.rate).toBe(5)
    expect(mixed.rate).toBe(5)
  })

  test('non-UAE ship-to → zero-rated export, no VAT line', () => {
    const oman = computeVatRate({ shipToCountryCode: 'OM' })
    expect(oman.rate).toBe(0)
    expect(oman.label).toBeUndefined()
    expect(oman.isExport).toBe(true)
  })

  test('matches the customer Q26386 to Oman precedent (no VAT line)', () => {
    const r = computeVatRate({ shipToCountryCode: 'OM', defaultRate: 5 })
    expect(r.rate).toBe(0)
    expect(r.label).toBeUndefined()
  })

  test('null/missing ship-to country → treated as non-UAE (zero-rated)', () => {
    expect(computeVatRate({ shipToCountryCode: null }).isExport).toBe(true)
    expect(computeVatRate({}).isExport).toBe(true)
  })
})

describe('computeVatRate — engineer override semantics', () => {
  test('explicit override wins over country inference (UAE)', () => {
    const r = computeVatRate({ shipToCountryCode: 'AE', override: 0 })
    expect(r.rate).toBe(0)
    expect(r.label).toBeUndefined()
    expect(r.isExport).toBe(false)
  })

  test('explicit override wins over country inference (non-UAE)', () => {
    const r = computeVatRate({ shipToCountryCode: 'IN', override: 18 })
    expect(r.rate).toBe(18)
    expect(r.label).toBe('VAT @ 18%')
    expect(r.isExport).toBe(false)
  })

  test('override of 0 produces no VAT line even when UAE', () => {
    const r = computeVatRate({ shipToCountryCode: 'AE', override: 0 })
    expect(r.rate).toBe(0)
    expect(r.label).toBeUndefined()
  })

  test('omitted override falls through to country rule', () => {
    expect(computeVatRate({ shipToCountryCode: 'AE' }).rate).toBe(5)
    expect(computeVatRate({ shipToCountryCode: 'OM' }).rate).toBe(0)
  })
})

describe('computeVatRate — defaultRate flexibility', () => {
  test('store can configure UAE default rate (e.g. future rate change)', () => {
    const r = computeVatRate({ shipToCountryCode: 'AE', defaultRate: 7.5 })
    expect(r.rate).toBe(7.5)
    expect(r.label).toBe('VAT @ 8%') // toFixed(0) rounds for label
  })
})
