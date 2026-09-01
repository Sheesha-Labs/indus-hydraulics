import { describe, expect, it } from 'vitest'

import {
  applyMarkup,
  basketCoverage,
  computeLandedCost,
  rankOffers,
  resolveMarkupRule,
  type LandedCostInput,
  type SupplierOfferLine,
} from './offer-pricing'

function offer(over: Partial<SupplierOfferLine> = {}): SupplierOfferLine {
  return {
    supplierName: 'Acme',
    unitPrice: 100,
    currency: 'AED',
    incoterm: 'DDP',
    moq: null,
    leadTimeDays: 14,
    requestedQty: 10,
    ...over,
  }
}

function landedInput(over: Partial<LandedCostInput> = {}): LandedCostInput {
  return {
    offer: offer(),
    fxToAed: 1,
    fxAsOf: new Date('2026-09-01'),
    freightPerUnitAed: 0,
    dutyPct: 0,
    now: new Date('2026-09-01'),
    ...over,
  }
}

describe('landed cost — refuses to guess', () => {
  it('computes a simple DDP AED offer', () => {
    const r = computeLandedCost(landedInput())
    expect(r.perUnitAed).toBe(100)
    expect(r.totalAed).toBe(1000)
    expect(r.flags).toEqual([])
  })

  it('returns null when the Incoterm excludes freight and no freight is supplied', () => {
    const r = computeLandedCost(landedInput({ offer: offer({ incoterm: 'EXW' }), freightPerUnitAed: null }))
    expect(r.perUnitAed).toBeNull()
    expect(r.flags).toContain('freight_unknown')
  })

  it('returns null rather than treating an unknown duty as zero', () => {
    const r = computeLandedCost(landedInput({ offer: offer({ incoterm: 'CIF' }), dutyPct: null }))
    expect(r.perUnitAed).toBeNull()
    expect(r.flags).toContain('duty_unknown')
  })

  it('does not require freight for a CFR offer — it is already included', () => {
    const r = computeLandedCost(
      landedInput({ offer: offer({ incoterm: 'CFR' }), freightPerUnitAed: null, dutyPct: 5 }),
    )
    expect(r.flags).not.toContain('freight_unknown')
    expect(r.perUnitAed).toBe(105)
  })

  it('does not require duty for DDP — it is already included', () => {
    const r = computeLandedCost(landedInput({ offer: offer({ incoterm: 'DDP' }), dutyPct: null }))
    expect(r.flags).not.toContain('duty_unknown')
    expect(r.perUnitAed).toBe(100)
  })

  it('returns null when a non-AED offer has no FX rate', () => {
    const r = computeLandedCost(landedInput({ offer: offer({ currency: 'EUR' }), fxToAed: null }))
    expect(r.perUnitAed).toBeNull()
    expect(r.flags).toContain('fx_missing')
  })

  it('refuses a stale FX rate rather than quietly eating the margin', () => {
    const r = computeLandedCost(
      landedInput({
        offer: offer({ currency: 'EUR' }),
        fxToAed: 4,
        fxAsOf: new Date('2026-08-01'),
        now: new Date('2026-09-01'),
      }),
    )
    expect(r.perUnitAed).toBeNull()
    expect(r.flags).toContain('fx_stale')
  })

  it('never calls an AED offer stale — there is no rate to age', () => {
    const r = computeLandedCost(landedInput({ fxAsOf: null }))
    expect(r.flags).not.toContain('fx_stale')
    expect(r.perUnitAed).toBe(100)
  })

  it('flags a missing Incoterm rather than assuming one', () => {
    const r = computeLandedCost(landedInput({ offer: offer({ incoterm: null }) }))
    expect(r.perUnitAed).toBeNull()
    expect(r.flags).toContain('incoterm_unknown')
  })

  it('returns no_price for a line the supplier declined', () => {
    const r = computeLandedCost(landedInput({ offer: offer({ unitPrice: null }) }))
    expect(r.flags).toEqual(['no_price'])
  })
})

describe('landed cost — the money', () => {
  it('converts currency', () => {
    const r = computeLandedCost(landedInput({ offer: offer({ currency: 'EUR', unitPrice: 25 }), fxToAed: 4 }))
    expect(r.perUnitAed).toBe(100)
  })

  it('adds freight per unit', () => {
    const r = computeLandedCost(
      landedInput({ offer: offer({ incoterm: 'FOB' }), freightPerUnitAed: 10, dutyPct: 0 }),
    )
    expect(r.perUnitAed).toBe(110)
  })

  it('applies duty to goods value only, not to freight', () => {
    const r = computeLandedCost(
      landedInput({ offer: offer({ incoterm: 'FOB' }), freightPerUnitAed: 10, dutyPct: 5 }),
    )
    // goods 1000 + freight 100 + duty 50 = 1150 over 10 units
    expect(r.perUnitAed).toBe(115)
    expect(r.breakdown.dutyAed).toBe(50)
  })

  it('amortises MOQ waste over the quantity actually needed', () => {
    // Need 10, MOQ 100, at 100 each: we buy 100 but only 10 are wanted.
    const r = computeLandedCost(landedInput({ offer: offer({ moq: 100 }) }))
    expect(r.purchaseQty).toBe(100)
    expect(r.perUnitAed).toBe(1000)
    expect(r.flags).toContain('moq_exceeds_requirement')
    expect(r.breakdown.moqWasteAed).toBe(9000)
  })

  it('does not flag an MOQ we were going to exceed anyway', () => {
    const r = computeLandedCost(landedInput({ offer: offer({ moq: 5 }) }))
    expect(r.flags).not.toContain('moq_exceeds_requirement')
    expect(r.perUnitAed).toBe(100)
  })
})

describe('rankOffers', () => {
  function withLanded(o: SupplierOfferLine, perUnit: number | null) {
    return {
      offer: o,
      landed: {
        perUnitAed: perUnit,
        totalAed: perUnit == null ? null : perUnit * o.requestedQty,
        purchaseQty: o.requestedQty,
        flags: [],
        breakdown: { goodsAed: null, freightAed: null, dutyAed: null, moqWasteAed: null },
      },
    }
  }

  it('puts the cheapest landed cost first', () => {
    const ranked = rankOffers([
      withLanded(offer({ supplierName: 'Dear' }), 120),
      withLanded(offer({ supplierName: 'Cheap' }), 90),
    ])
    expect(ranked[0]!.offer.supplierName).toBe('Cheap')
  })

  it('lets lead time outweigh a small price gap when the caller says it should', () => {
    const ranked = rankOffers(
      [
        withLanded(offer({ supplierName: 'Slow', leadTimeDays: 60 }), 90),
        withLanded(offer({ supplierName: 'Fast', leadTimeDays: 7 }), 100),
      ],
      { leadTimeWeightAedPerDay: 1 },
    )
    expect(ranked[0]!.offer.supplierName).toBe('Fast')
  })

  it('ignores lead time entirely when unweighted', () => {
    const ranked = rankOffers([
      withLanded(offer({ supplierName: 'Slow', leadTimeDays: 60 }), 90),
      withLanded(offer({ supplierName: 'Fast', leadTimeDays: 7 }), 100),
    ])
    expect(ranked[0]!.offer.supplierName).toBe('Slow')
  })

  it('sorts incomparable offers last but keeps them', () => {
    const ranked = rankOffers([
      withLanded(offer({ supplierName: 'Unknown' }), null),
      withLanded(offer({ supplierName: 'Known' }), 100),
    ])
    expect(ranked.map((r) => r.offer.supplierName)).toEqual(['Known', 'Unknown'])
    expect(ranked[1]!.incomparable).toBe(true)
  })

  it('breaks ties deterministically by name', () => {
    const a = rankOffers([withLanded(offer({ supplierName: 'Zeta' }), 100), withLanded(offer({ supplierName: 'Alpha' }), 100)])
    expect(a[0]!.offer.supplierName).toBe('Alpha')
  })
})

describe('basketCoverage', () => {
  const lines = [
    { offers: [offer({ supplierName: 'Full' }), offer({ supplierName: 'Partial' })] },
    { offers: [offer({ supplierName: 'Full' }), offer({ supplierName: 'Partial', unitPrice: null })] },
    { offers: [offer({ supplierName: 'Full' })] },
  ]

  it('counts a supplier that quoted every line', () => {
    expect(basketCoverage('Full', lines)).toEqual({ quoted: 3, total: 3, pct: 100 })
  })

  it('does not count a line the supplier declined', () => {
    expect(basketCoverage('Partial', lines)).toEqual({ quoted: 1, total: 3, pct: 33 })
  })

  it('handles a supplier that quoted nothing', () => {
    expect(basketCoverage('Absent', lines).quoted).toBe(0)
  })
})

describe('markup vs margin — the conflation that eats profit', () => {
  it('a 30% markup yields a 23.08% margin, not 30%', () => {
    const p = applyMarkup(100, { mode: 'percentage', value: 30 })
    expect(p.sellPerUnitAed).toBe(130)
    expect(p.markupPct).toBe(30)
    expect(p.marginPct).toBe(23.08)
  })

  it('a 30% TARGET MARGIN prices higher than a 30% markup', () => {
    const margin = applyMarkup(100, { mode: 'target_margin', value: 30 })
    const markup = applyMarkup(100, { mode: 'percentage', value: 30 })
    expect(margin.sellPerUnitAed).toBe(142.86)
    expect(margin.sellPerUnitAed).toBeGreaterThan(markup.sellPerUnitAed)
  })

  it('a target margin actually achieves the margin asked for', () => {
    expect(applyMarkup(100, { mode: 'target_margin', value: 30 }).marginPct).toBe(30)
  })

  it('applies an absolute uplift', () => {
    const p = applyMarkup(100, { mode: 'absolute', value: 30 })
    expect(p.sellPerUnitAed).toBe(130)
    expect(p.profitPerUnitAed).toBe(30)
  })

  it('refuses a 100% target margin instead of returning Infinity', () => {
    expect(() => applyMarkup(100, { mode: 'target_margin', value: 100 })).toThrow()
    expect(() => applyMarkup(100, { mode: 'target_margin', value: 150 })).toThrow()
  })

  it('rejects a negative cost rather than pricing from it', () => {
    expect(() => applyMarkup(-5, { mode: 'percentage', value: 30 })).toThrow()
  })

  it('handles a zero cost without dividing by zero', () => {
    const p = applyMarkup(0, { mode: 'absolute', value: 50 })
    expect(p.sellPerUnitAed).toBe(50)
    expect(p.markupPct).toBe(0)
  })
})

describe('resolveMarkupRule precedence', () => {
  const fallback = { mode: 'percentage' as const, value: 10 }

  it('prefers a line override above all', () => {
    expect(
      resolveMarkupRule({
        line: { mode: 'absolute', value: 1 },
        quote: { mode: 'absolute', value: 2 },
        category: { mode: 'absolute', value: 3 },
        fallback,
      }).value,
    ).toBe(1)
  })

  it('falls through line to quote to category to default', () => {
    expect(resolveMarkupRule({ quote: { mode: 'absolute', value: 2 }, fallback }).value).toBe(2)
    expect(resolveMarkupRule({ category: { mode: 'absolute', value: 3 }, fallback }).value).toBe(3)
    expect(resolveMarkupRule({ fallback }).value).toBe(10)
  })

  it('treats null the same as absent', () => {
    expect(resolveMarkupRule({ line: null, quote: null, category: null, fallback }).value).toBe(10)
  })
})
