import { describe, expect, it } from 'vitest'
import {
  fxSentence,
  hardMinSentence,
  moneyFieldErrors,
  parsePercent,
  roundingSentence,
  vatRateLabels,
  type PricingDefaults,
} from './money-defaults'

const PRICING: PricingDefaults = {
  marginPct: 18,
  floorPct: 12,
  hardMinPct: 5,
  rounding: { stepAed: 5, above: { thresholdAed: 5000, stepAed: 10 } },
  priceGuardPct: 25,
}

describe('Setup 4 validation (board 82)', () => {
  it('accepts the seeded defaults', () => {
    expect(moneyFieldErrors('pricing.defaults', PRICING)).toEqual({})
  })

  it('refuses a floor above the default margin', () => {
    expect(moneyFieldErrors('pricing.defaults', { ...PRICING, marginPct: 10 })).toEqual({
      floorPct: 'The floor cannot be above the default margin.',
    })
  })

  it('refuses a hard minimum above the floor', () => {
    expect(moneyFieldErrors('pricing.defaults', { ...PRICING, floorPct: 4 })).toEqual({
      hardMinPct: 'The hard minimum cannot be above the floor.',
    })
  })

  it('accepts floor equal to margin and hard minimum equal to floor', () => {
    expect(
      moneyFieldErrors('pricing.defaults', {
        ...PRICING,
        marginPct: 12,
        floorPct: 12,
        hardMinPct: 12,
      })
    ).toEqual({})
  })

  it('refuses a percentage that is not a number', () => {
    expect(
      Object.keys(moneyFieldErrors('pricing.defaults', { ...PRICING, marginPct: Number.NaN }))
    ).toEqual(['marginPct'])
    expect(parsePercent('18 %')).toBe(18)
    expect(parsePercent('')).toBeNaN()
    expect(parsePercent('abc')).toBeNaN()
  })

  it('needs a quotation currency and a default among them', () => {
    expect(
      moneyFieldErrors('currency', { book: 'AED', quotation: [], defaultQuotation: 'AED' })
    ).toMatchObject({ quotation: 'Choose at least one quotation currency.' })
    expect(
      moneyFieldErrors('currency', { book: 'AED', quotation: ['EUR'], defaultQuotation: 'AED' })
    ).toEqual({ defaultQuotation: 'The default must be one of the quotation currencies.' })
  })

  it('needs both printed VAT wordings', () => {
    expect(
      moneyFieldErrors('vat', {
        standardRatePct: 5,
        localWording: ' ',
        exportWording: 'Zero-rated export',
      })
    ).toEqual({ localWording: 'Write the wording.' })
  })
})

describe('Setup 4 read-only lines', () => {
  it('renders the rounding rule (C13)', () => {
    expect(roundingSentence(PRICING.rounding)).toBe(
      'Round unit prices up to AED 5, and to AED 10 above AED 5,000'
    )
  })

  it('renders the hard minimum (C12)', () => {
    expect(hardMinSentence(PRICING)).toBe('The Assistant never proposes a line below 5%.')
  })

  it('renders the FX source and first fetch time (C32)', () => {
    expect(
      fxSentence({
        source: 'CBUAE',
        fetchTimes: ['06:00', '08:00', '10:00'],
        timezone: 'Asia/Dubai',
        lockAt: 'capture',
        repriceThresholdPct: 2,
      })
    ).toBe('Central Bank of the UAE · daily 06:00')
  })

  it('renders the two VAT rates', () => {
    expect(vatRateLabels({ standardRatePct: 5, localWording: 'a', exportWording: 'b' })).toEqual({
      local: '5% on local supply',
      exports: '0% on exports',
    })
  })
})
