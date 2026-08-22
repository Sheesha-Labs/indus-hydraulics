import { describe, it, expect } from 'vitest'
import {
  VARIANT_DIMENSION_COLUMNS,
  hasVariantEquivalents,
  variantBoreRange,
  variantDimensionColumns,
  variantDimensions,
  variantEquivalentBrand,
  variantHoseLabel,
  variantPortHeading,
  type VariantLike,
} from './variant-columns'

const v = (over: Partial<VariantLike> = {}): VariantLike => ({
  partNumber: 'IH-CF43-JICF-90-0808',
  hoseDash: 8,
  hoseInch: '1/2"',
  hoseDn: 12,
  portLabel: '3/4"-16',
  dimensions: { W: 22.2, A: 54, B: 23, E: 28 },
  ...over,
})

describe('variantDimensions', () => {
  it('coerces numeric strings and drops anything that is not a number', () => {
    expect(variantDimensions({ A: 51, B: '30', C: 'n/a', D: null })).toEqual({ A: 51, B: 30 })
  })

  it('returns an empty record for null, arrays and scalars', () => {
    expect(variantDimensions(null)).toEqual({})
    expect(variantDimensions([1, 2])).toEqual({})
    expect(variantDimensions('A')).toEqual({})
  })
})

describe('variantDimensionColumns', () => {
  it('keeps canonical order regardless of key order in the payload', () => {
    const cols = variantDimensionColumns([v({ dimensions: { B: 1, A: 2, W: 3 } })])
    expect(cols.map((c) => c.key)).toEqual(['W', 'A', 'B'])
  })

  it('drops columns no variant populates', () => {
    const cols = variantDimensionColumns([v({ dimensions: { A: 1, B: 2, H: 3 } })])
    expect(cols.map((c) => c.key)).toEqual(['A', 'B', 'H'])
  })

  it('unions across variants so a partially-filled column still renders', () => {
    const cols = variantDimensionColumns([
      v({ dimensions: { A: 1 } }),
      v({ partNumber: 'x', dimensions: { F: 2 } }),
    ])
    expect(cols.map((c) => c.key)).toEqual(['A', 'F'])
  })

  it('drops an unknown key rather than rendering a raw json name at a customer', () => {
    const cols = variantDimensionColumns([v({ dimensions: { A: 1, ZZ: 9 } })])
    expect(cols.map((c) => c.key)).toEqual(['A'])
  })

  it('returns nothing when there are no variants', () => {
    expect(variantDimensionColumns([])).toEqual([])
  })
})

describe('VARIANT_DIMENSION_COLUMNS', () => {
  it('only claims a meaning for the two columns whose source header states one', () => {
    const guessed = VARIANT_DIMENSION_COLUMNS.filter(
      (c) => !c.help.includes('dimension drawing'),
    ).map((c) => c.key)
    expect(guessed).toEqual(['OD', 'W'])
  })
})

describe('variantPortHeading', () => {
  it('reads inch threads with a pitch as threads', () => {
    expect(variantPortHeading([v({ portLabel: '1/4"-18' }), v({ portLabel: '1.1/16"-12' })])).toBe(
      'Thread',
    )
  })

  it('reads BSP and metric threads as threads', () => {
    expect(variantPortHeading([v({ portLabel: 'G1/2"-14' }), v({ portLabel: 'M18X1.5' })])).toBe(
      'Thread',
    )
  })

  it('reads bare inch fractions as flange sizes', () => {
    expect(variantPortHeading([v({ portLabel: '3/4"' }), v({ portLabel: '1.1/4"' })])).toBe(
      'Flange size',
    )
  })

  it('falls back to the neutral heading on a mixed or empty set', () => {
    expect(variantPortHeading([v({ portLabel: '3/4"' }), v({ portLabel: 'M18X1.5' })])).toBe('Port')
    expect(variantPortHeading([])).toBe('Port')
    expect(variantPortHeading([v({ portLabel: null })])).toBe('Port')
  })
})

describe('equivalents', () => {
  it('detects a competitor equivalent on any row', () => {
    expect(hasVariantEquivalents([v(), v({ competitorMpn: '10643-8-8' })])).toBe(true)
    expect(hasVariantEquivalents([v()])).toBe(false)
  })

  it('names the brand only when every row that has one agrees', () => {
    expect(
      variantEquivalentBrand([
        v({ competitorBrand: 'Parker', competitorMpn: 'a' }),
        v({ competitorBrand: 'Parker', competitorMpn: 'b' }),
        v(),
      ]),
    ).toBe('Parker')
    expect(
      variantEquivalentBrand([
        v({ competitorBrand: 'Parker', competitorMpn: 'a' }),
        v({ competitorBrand: 'Eaton', competitorMpn: 'b' }),
      ]),
    ).toBeNull()
    expect(variantEquivalentBrand([v()])).toBeNull()
  })
})

describe('variantHoseLabel', () => {
  it('zero-pads the dash and joins the parts it has', () => {
    expect(variantHoseLabel(v())).toBe('-08 · 1/2" · DN12')
    expect(variantHoseLabel(v({ hoseDn: null }))).toBe('-08 · 1/2"')
    expect(variantHoseLabel(v({ hoseDash: null, hoseInch: null, hoseDn: null }))).toBeNull()
  })

  it('does not pad a dash that is already two digits', () => {
    expect(variantHoseLabel(v({ hoseDash: 32, hoseInch: '2"', hoseDn: 50 }))).toBe('-32 · 2" · DN50')
  })
})

describe('variantBoreRange', () => {
  it('formats the span in the same shape as the nominal_size_range spec', () => {
    expect(variantBoreRange([v({ hoseDash: 4 }), v({ hoseDash: 24 }), v({ hoseDash: 8 })])).toBe(
      '-04 to -24',
    )
  })

  it('collapses a single-size family to one dash', () => {
    expect(variantBoreRange([v({ hoseDash: 12 })])).toBe('-12')
  })

  it('is null when no variant carries a bore', () => {
    expect(variantBoreRange([v({ hoseDash: null })])).toBeNull()
    expect(variantBoreRange([])).toBeNull()
  })
})
