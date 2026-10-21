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
  variantPartNumberHeading,
  variantPortHeading,
  hasVariantPressures,
  hasVariantWeights,
  type VariantLike,
  variantTableKind,
  variantColumnUnit,
  QUALIFIER_LABELS,
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
    // O.D. / I.D.", and the US adapter catalogue heads its hex "Y HEX" / "Y1
    // HEX". The five hose columns are the same case: the hose
    // catalogue heads every one of them with what it is — "O.D (mm)", "Min
    // Burst Pressure (Bar)", "Vacuum", "Min Bend Radius (mm)", "Weight
    // (Kg/Mtr)" — so their help repeats the source rather than a legend.
    // Every other letter is bare against a drawing we do not have, so its help
    // text points at the drawing instead of guessing. Adding a key here
    // without a printed header is how a made-up dimension meaning reaches a
    // customer.
    const guessed = VARIANT_DIMENSION_COLUMNS.filter(
      (c) => !c.help.includes('dimension drawing'),
    ).map((c) => c.key)
    expect(guessed).toEqual([
      'OD',
      'hoseOD',
      'burstPressure',
      'vacuum',
      'bendRadius',
      'weightPerMetre',
      'tensileKg',
      'maxFlowLpm',
      'weldPrepOd',
      'weldPrepId',
      'W',
      'Y',
      'Y1',
      // Ratings and sizes for couplings, pumps, motors and cylinders: the
      // source heads each with what it is — "Cylinder Bore", "Cylinder Stroke
      // Ranges", "Pumps Displacement", "Pumps Max Pressure", "GPM", "Motor Max
      // Torque" — so, like the hose columns, the help repeats the header.
      'capacityTon',
      'boreIn',
      'rodIn',
      'strokeIn',
      'retractedIn',
      'extendedIn',
      'displacementCc',
      'displacementCuIn',
      'ratedPsi',
      'maxPsi',
      'contPsi',
      'flowGpm',
      'maxFlowGpm',
      'ratedRpm',
      'maxRpm',
      'torqueLbIn',
      'columnLoadLbs',
      // Gearbox and winch catalogues head these the same way — "Stages",
      // "T2max", "Line pull 1st layer", "Rope speed", "Rope diameter", "Rope
      // capacity", "Static braking torque", "Weight".
      'stages',
      'outputTorqueNm',
      'peakTorqueNm',
      'linePullDan',
      'ropeSpeed',
      'ropeDia',
      'ropeCapacityM',
      'brakeTorqueNm',
      'weightKg',
    ])
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
    expect(VARIANT_TEXT_COLUMNS.map((c) => c.key)).toEqual([
      'oRing', 'insideDia', 'wall', 'supply', 'item', 'half', 'bodySize', 'mount', 'shaft', 'ports', 'rotation', 'action', 'ratio',
      'systemType', 'lubricant', 'reservoir', 'pressureRatio', 'container', 'voltage', 'output', 'maxPressure', 'outletThread',
      'monitoring',
    ])
    for (const key of ['S1', 'S2'] as const) {
      const col = VARIANT_DIMENSION_COLUMNS.find((c) => c.key === key)!
      expect(col.help).toContain('dimension drawing')
    }
  })
})

describe('supply column', () => {
  it('shows how a hose row is supplied, and only when a row carries it', () => {
    const rows = [v({ dimensions: { supply: '50 ft box' } }), v({ dimensions: { supply: '100 ft coil' } })]
    expect(variantTextColumns(rows).map((c) => c.key)).toEqual(['supply'])
    expect(variantTextColumns([v({ dimensions: {} })])).toEqual([])
  })
})

describe('lay-flat hose columns', () => {
  it('prints bore tolerance and wall as text and tensile strength as a hose column', () => {
    const rows = [
      v({ pressureBar: 21, dimensions: { insideDia: '39 +1.5', wall: '2.6', burstPressure: 63, weightPerMetre: 0.45, tensileKg: 5800 } }),
      v({ pressureBar: 85, dimensions: { insideDia: '76', wall: '5.5 ±0.5', burstPressure: 170, weightPerMetre: 1.55, tensileKg: 24000 } }),
    ]
    expect(variantTableKind(rows)).toBe('hose')
    expect(variantTextColumns(rows).map((c) => c.key)).toEqual(['insideDia', 'wall'])
    expect(variantDimensionColumns(rows).map((c) => c.key)).toEqual(['burstPressure', 'weightPerMetre', 'tensileKg'])
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

  it('reads a labelled flange as a flange size', () => {
    expect(variantPortHeading([v({ portLabel: '1/2" Code 61 flange' })])).toBe('Flange size')
  })

  it('reads a single tube end as a tube size, even with a hyphen in it', () => {
    expect(variantPortHeading([v({ portLabel: '1/16" tube' }), v({ portLabel: '6 mm tube (M12×1.5), L series' })])).toBe(
      'Tube size',
    )
    expect(variantPortHeading([v({ portLabel: '1/4" tube, push-in' }), v({ portLabel: '3/16" tube O.D. (JIC 3/8-24)' })])).toBe(
      'Tube size',
    )
  })

  it('gives any other non-thread end the neutral size heading, not a flange size', () => {
    expect(variantPortHeading([v({ portLabel: '3/16" SAE 45° flare' }), v({ portLabel: '1/8" plastic tube, 0.08" insert OD' })])).toBe(
      'Size',
    )
  })

  it('reads a gauge scale as a range', () => {
    expect(variantPortHeading([v({ portLabel: '0–160 psi' }), v({ portLabel: '30"Hg vac – 0 – 150 psi' })])).toBe('Range')
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

describe('hose size tables', () => {
  const hoseRow = (dn: number) => ({
    partNumber: `IH-IH-A190-${dn}`,
    hoseDn: dn,
    hoseInch: '3/4"',
    pressureBar: 20,
    dimensions: { hoseOD: 30, burstPressure: 60, bendRadius: 133, weightPerMetre: 0.6 },
  })

  it('renders a hose table in catalogue order, with its own units', () => {
    const cols = variantDimensionColumns([hoseRow(19)])
    expect(cols.map((c) => c.key)).toEqual(['hoseOD', 'burstPressure', 'bendRadius', 'weightPerMetre'])
    expect(cols.map((c) => c.unit)).toEqual(['mm', 'bar', 'mm', 'kg/m'])
  })

  it('adds the vacuum column only where the source publishes one', () => {
    const suction = { partNumber: 'x', dimensions: { hoseOD: 32, vacuum: 0.88, bendRadius: 114 } }
    expect(variantDimensionColumns([suction]).map((c) => c.key)).toContain('vacuum')
    expect(variantDimensionColumns([hoseRow(19)]).map((c) => c.key)).not.toContain('vacuum')
  })

  it('knows a hose from a fitting by its rows, not by a prop', () => {
    /*
      The footnotes differ, and one of them used to offer every size in 316
      stainless — nonsense on a rubber hose. Reading the kind off the data
      means a listing cannot get the wrong note because a page forgot to pass
      something.
    */
    expect(variantTableKind([hoseRow(19)])).toBe('hose')
    expect(
      variantTableKind([{ partNumber: 'y', hoseDash: 8, portLabel: '9/16"-18', dimensions: { A: 40, B: 22 } }]),
    ).toBe('fitting')
  })

  it('treats a row with no dimensions at all as a fitting', () => {
    expect(variantTableKind([{ partNumber: 'z' }])).toBe('fitting')
  })
})

describe('lifting tables', () => {
  const shackle = (over: Partial<VariantLike> = {}): VariantLike => ({
    partNumber: 'IH-LR-SH-G2130-075',
    dimensions: { size: '3/4″', wllT: 4.75, A: 31.8, B: 22.4, weightLbs: 2.8, pinDia: 22.4 },
    ...over,
  })

  it('is recognised by its load columns', () => {
    expect(variantTableKind([shackle()])).toBe('lifting')
  })

  it('is recognised by a size label alone', () => {
    expect(variantTableKind([{ partNumber: 'x', dimensions: { size: '6 mm', A: 3 } }])).toBe('lifting')
  })

  it('wins over hose detection when a chain row carries weight per metre', () => {
    const chain = { partNumber: 'IH-LR-CH-G80-10MM', dimensions: { size: '10 mm', wllKg: 3200, weightPerMetre: 2.22 } }
    expect(variantTableKind([chain])).toBe('lifting')
  })

  it('leaves hose and fitting tables alone', () => {
    expect(variantTableKind([v()])).toBe('fitting')
    expect(variantTableKind([{ partNumber: 'h', dimensions: { hoseOD: 19, weightPerMetre: 0.5 } }])).toBe('hose')
  })

  it('orders loads before geometry, letters and weight', () => {
    const cols = variantDimensionColumns([shackle()]).map((c) => c.key)
    expect(cols).toEqual(['wllT', 'pinDia', 'A', 'B', 'weightLbs'])
  })

  it('keeps each load in the unit it was rated in', () => {
    const cols = variantDimensionColumns([
      { partNumber: 'e', dimensions: { size: '1/4″ × 2″', wllLbs: 650, weightPer100Lbs: 6 } },
    ])
    expect(cols.map((c) => [c.key, c.unit])).toEqual([
      ['wllLbs', 'lbs'],
      ['weightPer100Lbs', 'lbs/100 pcs'],
    ])
  })

  it('puts size and grade in the leading text columns', () => {
    const cols = variantTextColumns([
      shackle({ dimensions: { size: '1/4″', grade: 'Alloy steel', wllLbs: 3500, ropeSize: '3/8″' } }),
    ])
    expect(cols.map((c) => [c.key, Boolean(c.lead)])).toEqual([
      ['size', true],
      ['grade', true],
      ['ropeSize', true],
    ])
  })

  it('never claims a meaning for a bare letter', () => {
    const letters = variantDimensionColumns([
      shackle({ dimensions: { size: '1″', wllT: 8.5, G: 1, K: 2, R: 3, X: 4, a: 5 } }),
    ]).filter((c) => c.key !== 'wllT')
    for (const c of letters) expect(c.help).toContain('dimension drawing')
  })

  it('drops an unknown key rather than printing it', () => {
    const cols = variantDimensionColumns([shackle({ dimensions: { size: '1″', wllT: 8.5, ZZ: 1 } })])
    expect(cols.map((c) => c.key)).toEqual(['wllT'])
  })

  it('splits a qualified load into its own column, after the plain one', () => {
    const cols = variantDimensionColumns([
      { partNumber: 'r', dimensions: { size: '12 mm', mblKn: 90, 'mblKn@g1770_fc': 80, 'mblKn@g1570_fc': 70 } },
    ])
    expect(cols.map((c) => [c.key, c.label, c.unit])).toEqual([
      ['mblKn', 'Min breaking load', 'kN'],
      ['mblKn@g1570_fc', 'Min breaking load, 1570 grade, fibre core', 'kN'],
      ['mblKn@g1770_fc', 'Min breaking load, 1770 grade, fibre core', 'kN'],
    ])
  })

  it('recognises a table whose only loads are qualified', () => {
    expect(variantTableKind([{ partNumber: 'c', dimensions: { 'proofKn@u2': 100, 'mblKn@u2': 140 } }])).toBe('lifting')
  })

  it('drops a qualifier it has no label for', () => {
    const cols = variantDimensionColumns([{ partNumber: 'r', dimensions: { size: '1 t', wllT: 1, 'wllT@nonsense': 2 } }])
    expect(cols.map((c) => c.key)).toEqual(['wllT'])
  })

  it('renders drawing letters the registry does not list, after the listed ones', () => {
    const cols = variantDimensionColumns([
      { partNumber: 'b', dimensions: { size: 'DN 200', wllKn: 72, A: 600, d1: 145, A1: 270, 'Ø1': 20, Lp: 18, t2: 9, weightKg: 181 } },
    ])
    expect(cols.map((c) => c.label)).toEqual(['WLL', 'A', 'A1', 'd1', 'L′', 't2', 'Ø1', 'Weight'])
    for (const c of cols.filter((x) => !['WLL', 'Weight'].includes(x.label))) expect(c.help).toContain('dimension drawing')
  })

  it('labels every qualifier the importer writes', () => {
    for (const label of Object.values(QUALIFIER_LABELS)) expect(label.length).toBeGreaterThan(1)
  })

  it('carries lashing capacity as its own column', () => {
    const cols = variantDimensionColumns([{ partNumber: 'l', dimensions: { size: '8 mm', lcKn: 50, mblKn: 100 } }])
    expect(cols.map((c) => [c.key, c.label])).toEqual([
      ['mblKn', 'Min breaking load'],
      ['lcKn', 'LC'],
    ])
  })

  it('renders a count with no unit', () => {
    const falls = variantDimensionColumns([{ partNumber: 'h', dimensions: { size: '2 t', wllT: 2, chainFalls: 2 } }])
    expect(falls.map((c) => variantColumnUnit(c))).toEqual(['t', null])
  })
})

describe('coupling and equipment ratings', () => {
  it('shows a coupling’s rating and flow in the units it is sold in, on a fitting table', () => {
    const rows: VariantLike[] = [
      { partNumber: 'FEM-501-8FP', portLabel: '1/2-14 NPSF', dimensions: { half: 'Coupler (female half)', bodySize: '1/2"', ratedPsi: 3625, flowGpm: 12 } },
      { partNumber: 'FEM-502-8FP', portLabel: '1/2-14 NPSF', dimensions: { half: 'Nipple (male half)', bodySize: '1/2"', ratedPsi: 3625 } },
    ]
    expect(variantTableKind(rows)).toBe('fitting')
    const cols = variantDimensionColumns(rows)
    expect(cols.map((c) => [c.key, c.label, variantColumnUnit(c)])).toEqual([
      ['ratedPsi', 'Rated pressure', 'psi'],
      ['flowGpm', 'Rated flow', 'GPM'],
    ])
    expect(cols[0]!.grouped).toBe(true)
    expect(variantTextColumns(rows).map((c) => c.key)).toEqual(['half', 'bodySize'])
  })

  it('reads a pump, motor or cylinder table as equipment, not a fitting', () => {
    expect(variantTableKind([{ partNumber: 'p', dimensions: { displacementCc: 19.5, maxPsi: 2500 } }])).toBe('equipment')
    expect(variantTableKind([{ partNumber: 'c', dimensions: { boreIn: 3, strokeIn: 24, rodIn: 1.5 } }])).toBe('equipment')
    expect(variantTableKind([{ partNumber: 'q', dimensions: { ratedPsi: 3000 } }])).toBe('fitting')
  })

  it('orders cylinder columns size first, ratings after', () => {
    const cols = variantDimensionColumns([
      { partNumber: 'c', dimensions: { ratedPsi: 3500, strokeIn: 24, boreIn: 2, rodIn: 1.25, retractedIn: 31, extendedIn: 55, columnLoadLbs: 8400 } },
    ])
    expect(cols.map((c) => c.key)).toEqual(['boreIn', 'rodIn', 'strokeIn', 'retractedIn', 'extendedIn', 'ratedPsi', 'columnLoadLbs'])
  })

  it('reads a gearbox or winch table as equipment and orders its ratings', () => {
    const gearbox: VariantLike[] = [
      { partNumber: 'IH-DO-RE-212', dimensions: { item: 'RE 212', ratio: '12.11 – 33.28', weightKg: 23, peakTorqueNm: 1780, outputTorqueNm: 680, stages: 2 } },
    ]
    expect(variantTableKind(gearbox)).toBe('equipment')
    expect(variantDimensionColumns(gearbox).map((c) => c.key)).toEqual(['stages', 'outputTorqueNm', 'peakTorqueNm', 'weightKg'])
    expect(variantTextColumns(gearbox).map((c) => c.key)).toEqual(['item', 'ratio'])

    const winch: VariantLike[] = [
      { partNumber: 'IH-DO-S-15', dimensions: { item: 'S15', linePullDan: 2000, ropeSpeed: 30, ropeDia: 10, ropeCapacityM: 95, displacementCc: 80, maxFlowLpm: 60 } },
    ]
    expect(variantTableKind(winch)).toBe('equipment')
    expect(variantDimensionColumns(winch).map((c) => [c.label, variantColumnUnit(c)])).toEqual([
      ['Max flow', 'L/min'],
      ['Displacement', 'cm³/rev'],
      ['Line pull, 1st layer', 'daN'],
      ['Rope speed, 1st layer', 'm/min'],
      ['Rope dia.', 'mm'],
      ['Rope capacity', 'm'],
    ])
  })

  it('reads a lubrication pump table as equipment and keeps its ratings as published', () => {
    const pump: VariantLike[] = [
      {
        partNumber: 'IH-BD-SFX23871',
        dimensions: {
          item: 'SFX23871 — 12 L SLR pump, 115 VAC',
          systemType: 'SLR',
          lubricant: 'Oil 20–1500 cSt',
          reservoir: '12L',
          voltage: '115VAC 1 phase 50/60 Hz',
          output: '250cc/min',
          maxPressure: '130 psi (9 bar)',
          outletThread: '1/4BSPP',
          monitoring: 'Level switch, pressure switch, gauge',
        },
      },
    ]
    expect(variantTableKind(pump)).toBe('equipment')
    expect(variantTextColumns(pump).map((c) => c.key)).toEqual([
      'item', 'systemType', 'lubricant', 'reservoir', 'voltage', 'output', 'maxPressure', 'outletThread', 'monitoring',
    ])
    const barrel: VariantLike[] = [{ partNumber: 'IH-BD-F531411', dimensions: { item: 'PM45 40:1', pressureRatio: '40:1', container: '400 lb drum' } }]
    expect(variantTableKind(barrel)).toBe('equipment')
    expect(variantTableKind([{ partNumber: 'x', dimensions: { item: 'Elbow', outletThread: '1/8NPT' } }])).toBe('fitting')
  })

  it('gives the row description its own leading column', () => {
    const cols = variantTextColumns([{ partNumber: '43200', dimensions: { item: 'Elbow, .38 in cone' } }])
    expect(cols.map((c) => [c.key, c.label, c.lead])).toEqual([['item', 'Description', true]])
  })
})

describe('variantPartNumberHeading', () => {
  const rows = (...partNumbers: string[]) => partNumbers.map((partNumber) => ({ partNumber }))
  const manntek = { slug: 'manntek', name: 'MannTek' }
  const parker = { slug: 'parker', name: 'Parker' }

  it('heads Indus numbers "Indus part no." even on a listing branded by the maker', () => {
    expect(variantPartNumberHeading(rows('IH-MNT-DCC-TU-025', 'IH-MNT-DCC-HU-025'), manntek)).toBe(
      'Indus part no.',
    )
    expect(variantPartNumberHeading(rows('IH-CGC-90-A-150'), { slug: 'sealfast', name: 'Sealfast' })).toBe(
      'Indus part no.',
    )
  })

  it('heads Indus numbers "Indus part no." on Indus and unbranded listings', () => {
    expect(variantPartNumberHeading(rows('IH-ST-9169-04-04-10'), { slug: 'indus', name: 'Indus' })).toBe(
      'Indus part no.',
    )
    expect(variantPartNumberHeading(rows('IH-LR-ST-SSSTTUST-012'), null)).toBe('Indus part no.')
  })

  it('matches the IH- prefix case-insensitively', () => {
    expect(variantPartNumberHeading(rows('ih-mnt-dcc-tu-025'), manntek)).toBe('Indus part no.')
  })

  it("names the maker when every row carries the maker's own code", () => {
    expect(variantPartNumberHeading(rows('15S26-10-10', '11356-12-12'), parker)).toBe('Parker part no.')
    expect(variantPartNumberHeading(rows('0306-03'), { slug: 'tompkins', name: 'Tompkins' })).toBe(
      'Tompkins part no.',
    )
  })

  it('does not treat IH appearing later in a maker code as an Indus number', () => {
    expect(variantPartNumberHeading(rows('HIH-100', '10IH-4'), parker)).toBe('Parker part no.')
  })

  it('falls back to "Part no." for a mixed set', () => {
    expect(variantPartNumberHeading(rows('IH-MNT-DCC-TU-025', '15S26-10-10'), parker)).toBe('Part no.')
  })

  it('falls back to "Part no." for maker codes with no maker to name', () => {
    expect(variantPartNumberHeading(rows('15S26-10-10'), null)).toBe('Part no.')
    expect(variantPartNumberHeading(rows('15S26-10-10'), { slug: 'indus', name: 'Indus' })).toBe('Part no.')
  })
})

describe('valve tables', () => {
  const row = (partNumber: string, dims: Record<string, string | number>): VariantLike => ({
    partNumber,
    hoseDash: null,
    hoseInch: null,
    hoseDn: null,
    portLabel: null,
    dimensions: dims,
  })
  const rows = [
    row('IH-PV-GTC-150-02', { size: '2"', dn: '50', pressureClass: 'Class 150', lRf: 178, lBw: 216, H: 381, W: 200, weightRfKg: 21, weightBwKg: 17 }),
    row('IH-PV-GTC-150-03', { size: '3"', dn: '80', pressureClass: 'Class 150', lRf: 203, lBw: 283, H: 432, W: 250, weightRfKg: 32, weightBwKg: 27 }),
  ]

  it('is read as a valve table even though the rows carry size, as rigging rows do', () => {
    expect(variantTableKind(rows)).toBe('valve')
  })

  it('leads with size, DN and class', () => {
    expect(variantTextColumns(rows).map((c) => c.key)).toEqual(['size', 'dn', 'pressureClass'])
    expect(variantTextColumns(rows).every((c) => c.lead)).toBe(true)
  })

  it('orders lengths, then drawing letters, then weights', () => {
    expect(variantDimensionColumns(rows).map((c) => c.key)).toEqual(['lRf', 'lBw', 'H', 'W', 'weightRfKg', 'weightBwKg'])
  })

  it('does not call a valve W a hex across flats', () => {
    const w = variantDimensionColumns(rows).find((c) => c.key === 'W')!
    expect(w.help).not.toMatch(/hex/i)
    expect(w.unit).toBe('mm')
  })

  it('leads with the valve type when one listing covers several types', () => {
    const mixed = [row('IH-PV-PSV-G-900-0200', { type: 'Gate', size: '2"', pressureClass: 'Class 900', lBw: 216 })]
    expect(variantTextColumns(mixed).map((c) => c.key)).toEqual(['type', 'size', 'pressureClass'])
  })

  it('leaves a table without valve keys alone', () => {
    expect(variantTableKind([row('IH-LR-X', { size: '1/2"', wllT: 2 })])).toBe('lifting')
  })
})
