import { describe, expect, it } from 'vitest'
import { C38_FALLBACK_PCT, estimateSnapshot, type EstimateDefaults } from './estimate'

const DEFAULTS: EstimateDefaults = { marginPct: '18', landedPct: C38_FALLBACK_PCT }

describe('estimateSnapshot (C38)', () => {
  it('one USD line on every fallback: landed = base + 10.5 %, sell at 18 %', () => {
    const s = estimateSnapshot({
      lines: [{ qty: '2', selected: { unitPrice: '100', currency: 'USD', fxToAed: '3.6725' } }],
      defaults: DEFAULTS,
    })
    expect(s).toEqual({
      pricedLines: 1,
      unpricedLines: 0,
      landedAed: '811.62',
      sellAed: '989.78',
      gpAed: '178.16',
      marginPct: '18.0',
      fallbackUsed: [
        'Freight at 4% default',
        'Insurance at 0.5% default',
        'Duty at 5% default',
        'Bank charges at 1% default',
      ],
    })
  })

  it('mixed currencies with locked FX, data and override components, a line margin and an unpriced line', () => {
    const s = estimateSnapshot({
      lines: [
        { qty: '2', selected: { unitPrice: '100', currency: 'USD', fxToAed: '3.6725' } },
        {
          qty: '10',
          marginPct: '25',
          selected: {
            unitPrice: '50',
            currency: 'EUR',
            fxToAed: '4.01',
            components: {
              freight: { basis: 'data', amountAed: '100' },
              duty: { basis: 'override', amountAed: '0' },
            },
          },
        },
        { qty: '4', selected: null },
      ],
      defaults: DEFAULTS,
    })
    expect(s).toMatchObject({
      pricedLines: 2,
      unpricedLines: 1,
      landedAed: '2946.70',
      sellAed: '3836.55',
      gpAed: '889.85',
      marginPct: '23.2',
    })
    // Line 1 still used every fallback; line 2 replaced freight and duty.
    expect(s.fallbackUsed).toEqual([
      'Freight at 4% default',
      'Insurance at 0.5% default',
      'Duty at 5% default',
      'Bank charges at 1% default',
    ])
  })

  it('names only the fallbacks that stood in, including a stored default_pct', () => {
    const s = estimateSnapshot({
      lines: [
        {
          qty: '1',
          selected: {
            unitPrice: '1000',
            currency: 'AED',
            fxToAed: '1',
            components: {
              freight: { basis: 'data', amountAed: '40' },
              insurance: { basis: 'default_pct', pct: '0.5' },
              duty: { basis: 'data', amountAed: '50' },
              bank: { basis: 'data', amountAed: '10' },
              inspection: { basis: 'data', amountAed: '25' },
              packing: { basis: 'default_pct', pct: '2' },
            },
          },
        },
      ],
      defaults: DEFAULTS,
    })
    // 1000 + 40 + 5 + 50 + 10 + 25 + 20 = 1150
    expect(s.landedAed).toBe('1150.00')
    expect(s.fallbackUsed).toEqual(['Insurance at 0.5% default'])
  })

  it('nothing priced: zeros and no margin', () => {
    expect(estimateSnapshot({ lines: [{ qty: '1' }], defaults: DEFAULTS })).toEqual({
      pricedLines: 0,
      unpricedLines: 1,
      landedAed: '0.00',
      sellAed: '0.00',
      gpAed: '0.00',
      marginPct: null,
      fallbackUsed: [],
    })
  })

  it('refuses a margin of 100 % or more', () => {
    expect(() =>
      estimateSnapshot({
        lines: [
          {
            qty: '1',
            marginPct: '100',
            selected: { unitPrice: '1', currency: 'AED', fxToAed: '1' },
          },
        ],
        defaults: DEFAULTS,
      })
    ).toThrow('margin must be below 100%')
  })
})
