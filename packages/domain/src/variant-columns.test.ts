import { describe, it, expect } from 'vitest'
import {
  VARIANT_DIMENSION_COLUMNS,
  VARIANT_TEXT_COLUMNS,
  variantText,
  variantTextColumns,
  hasVariantEquivalents,
  variantBoreRange,
  variantDimensionColumns,
  variantDimensions,
  VARIANT_DIMENSION_COLUMNS as DIMS,
  variantEndColumns,
  variantEquivalentBrand,
  variantHoseLabel,
  variantSizeHeading,
  variantPortHeading,
  hasVariantPressures,
  hasVariantWeights,
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
    const cols = variantDimensionColumns([v({ dimensions: { B: 1, A: 2, W: 3, S2: 4, L: 5 } })])
    expect(cols.map((c) => c.key)).toEqual(['W', 'S2', 'A', 'B', 'L'])
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
  it('only claims a meaning for the columns whose source header states one', () => {
    // `OD` is printed "Tube O.D.", `W` is printed "W- HEX" / "W -NUT", and the
    // hammer union catalogue heads its two weld-prep columns "Weld Prep —
    // O.D. / I.D.". Every other letter is bare against a drawing we do not
    // have, so its help text points at the drawing instead of guessing. Adding
    // a key here without a printed header is how a made-up dimension meaning
    // reaches a customer.
    const guessed = VARIANT_DIMENSION_COLUMNS.filter(
      (c) => !c.help.includes('dimension drawing'),
    ).map((c) => c.key)
    expect(guessed).toEqual(['OD', 'weldPrepOd', 'weldPrepId', 'W'])
  })
})

describe('text columns', () => {
  it('reads a string dimension entry and ignores numbers', () => {
    expect(variantText({ oRing: '12.0×2.0', A: 26 }, 'oRing')).toBe('12.0×2.0')
    expect(variantText({ oRing: 26 }, 'oRing')).toBeNull()
    expect(variantText({ oRing: '  ' }, 'oRing')).toBeNull()
    expect(variantText(null, 'oRing')).toBeNull()
  })

  it('renders a text column only when some variant carries it', () => {
    expect(variantTextColumns([v()])).toEqual([])
    const cols = variantTextColumns([v(), v({ dimensions: { oRing: '9.25×1.78' } })])
    expect(cols.map((c) => c.key)).toEqual(['oRing'])
  })

  it('keeps a string entry out of the numeric columns', () => {
    // Both halves of the same jsonb blob — the numeric reader must not try to
    // coerce "12.0×2.0" into a millimetre figure.
    const dims = { A: 26, oRing: '12.0×2.0' }
    expect(variantDimensions(dims)).toEqual({ A: 26 })
    expect(variantDimensionColumns([v({ dimensions: dims })]).map((c) => c.key)).toEqual(['A'])
  })

  it('does not claim S1 or S2 mean across-flats', () => {
    expect(VARIANT_TEXT_COLUMNS.map((c) => c.key)).toEqual(['oRing'])
    for (const key of ['S1', 'S2'] as const) {
      const col = VARIANT_DIMENSION_COLUMNS.find((c) => c.key === key)!
      expect(col.help).toContain('dimension drawing')
    }
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

describe('variantEndColumns', () => {
  /** An adapter row: no hose bore, two or three threaded ends. */
  const a = (over: Partial<VariantLike> = {}): VariantLike => ({
    partNumber: 'IH-AD-MET-017-1418',
    hoseDash: null,
    hoseInch: null,
    hoseDn: null,
    portLabel: 'M14X1.5',
    port2Label: 'M18X1.5',
    dimensions: { L1: 30, S1: 17 },
    ...over,
  })

  it('is empty for a hose fitting, which keeps its single port column', () => {
    expect(variantEndColumns([v()])).toEqual([])
  })

  it('gives two columns to a two-ended adapter', () => {
    expect(variantEndColumns([a()]).map((c) => c.label)).toEqual(['End 1', 'End 2'])
  })

  it('adds a third only when some row carries a third end', () => {
    expect(variantEndColumns([a(), a({ port3Label: 'M22X1.5' })]).map((c) => c.label)).toEqual([
      'End 1',
      'End 2',
      'End 3',
    ])
  })

  it('numbers the ends rather than naming a seat the thread does not identify', () => {
    // 9/16"X18 is the same thread on a JIC 37 male, an ORFS male and an SAE
    // O-ring boss. Only the seat differs, and the seat is not in the table.
    const jicLike = a({ portLabel: '9/16"X18', port2Label: '9/16"X18' })
    for (const c of variantEndColumns([jicLike])) {
      expect(c.label).toMatch(/^End [123]$/)
      expect(c.help).not.toMatch(/JIC|ORFS|O-ring boss/i)
    }
  })
})

describe('published figures', () => {
  it('reports a weight or a pressure only when some row carries one', () => {
    expect(hasVariantWeights([v()])).toBe(false)
    expect(hasVariantPressures([v()])).toBe(false)
    expect(hasVariantWeights([v(), v({ weightG: 121 })])).toBe(true)
    expect(hasVariantPressures([v(), v({ pressureBar: 630 })])).toBe(true)
  })

  it('counts a zero, which is a figure, not an absence', () => {
    expect(hasVariantWeights([v({ weightG: 0 })])).toBe(true)
  })
})

describe('adapter dimension columns', () => {
  it('renders the numbered runs an adapter prints', () => {
    // An adapter has two or three ends, so it prints a length and an
    // across-flats for each. A key the module does not know is dropped
    // silently, which is how a whole column of the size table goes missing.
    const cols = variantDimensionColumns([
      { partNumber: 'x', dimensions: { L: 31, L1: 14, L2: 10.5, S1: 12 } },
      { partNumber: 'y', dimensions: { L3: 24.5, S2: 17, D1: 6 } },
    ])
    expect(cols.map((c) => c.key)).toEqual(['S1', 'S2', 'D1', 'L', 'L1', 'L2', 'L3'])
  })

  it('lists every key once, in one order', () => {
    const keys = DIMS.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('line-component columns', () => {
  // A hammer union is ordered by nominal line size and by pipe end, not by a
  // hose bore and a thread. Both headings are read off the data, because a
  // wrong one is a table a buyer misreads rather than an error anyone sees.
  const union = (portLabel: string, hoseInch: string) => ({
    partNumber: `IH-HU-${hoseInch}`,
    hoseInch,
    portLabel,
  })

  it('heads the size column "Nominal size" when no row carries a bore code', () => {
    expect(
      variantSizeHeading([union('2" butt weld, Sch XXS', '2"'), union('3" butt weld, Sch XXS', '3"')]),
    ).toBe('Nominal size')
  })

  it('still heads it "Hose bore" when a dash or DN is present', () => {
    expect(variantSizeHeading([{ partNumber: 'x', hoseDash: 8, hoseInch: '1/2"' }])).toBe('Hose bore')
    expect(variantSizeHeading([{ partNumber: 'x', hoseDn: 12, hoseInch: '1/2"' }])).toBe('Hose bore')
  })

  it('heads the port column "End connection" for pipe ends', () => {
    expect(
      variantPortHeading([union('2" butt weld, Sch 80', '2"'), union('3" LP thread (NPT)', '3"')]),
    ).toBe('End connection')
  })

  it('does not mistake a pipe end for a flange size', () => {
    // `3"` alone has no dash and no `M` prefix, so the flange branch would
    // claim it. The pipe-end branch has to run first.
    expect(variantPortHeading([union('4" socket weld', '4"')])).toBe('End connection')
  })

  it('leaves thread and flange headings alone', () => {
    expect(variantPortHeading([{ partNumber: 'x', portLabel: '9/16"-18' }])).toBe('Thread')
    expect(variantPortHeading([{ partNumber: 'x', portLabel: '3/4"' }])).toBe('Flange size')
  })

  it('renders the weld-prep columns a butt-weld union prints', () => {
    const cols = variantDimensionColumns([
      { partNumber: 'x', dimensions: { A: 95.25, B: 188, weldPrepOd: 63.5, weldPrepId: 31.75 } },
    ])
    expect(cols.map((c) => c.key)).toEqual(['weldPrepOd', 'weldPrepId', 'A', 'B'])
  })
})
