import { describe, expect, it } from 'vitest'
import {
  buildSpecFacets,
  countSelected,
  facetLabelKey,
  normaliseFacetValue,
  parseSpecFilter,
  productIdsMatching,
  pruneSpecFilter,
  serialiseSpecFilter,
  toggleSpecValue,
  type SpecFacetRow,
} from './spec-facets'

function rows(spec: Record<string, Record<string, string[]>>): SpecFacetRow[] {
  // { label: { value: [productId, …] } }
  const out: SpecFacetRow[] = []
  for (const [label, values] of Object.entries(spec)) {
    for (const [value, ids] of Object.entries(values)) {
      for (const productId of ids) out.push({ productId, label, value })
    }
  }
  return out
}

describe('normaliseFacetValue', () => {
  it('merges the separator and case variants the catalogue actually contains', () => {
    // Both spellings are live on BSP adapters today.
    expect(normaliseFacetValue('45 elbow')).toBe(normaliseFacetValue('45-elbow'))
    expect(normaliseFacetValue('90 Elbow')).toBe(normaliseFacetValue('90-elbow'))
  })

  it('does NOT merge values that merely look related', () => {
    // `bonded-seal` and `Bonded seal washer` also coexist. Deciding they are
    // the same option is a catalogue correction, not a display trick.
    expect(normaliseFacetValue('bonded-seal')).not.toBe(normaliseFacetValue('Bonded seal washer'))
  })
})

describe('buildSpecFacets', () => {
  it('keeps a spec that genuinely partitions the products', () => {
    const facets = buildSpecFacets(
      rows({ 'Body Configuration': { straight: ['a', 'b', 'c'], '90 elbow': ['d', 'e'] } }),
    )
    expect(facets).toHaveLength(1)
    expect(facets[0]!.key).toBe('body-configuration')
    expect(facets[0]!.values.map((v) => v.count)).toEqual([3, 2])
  })

  it('drops a single-value spec', () => {
    // `Max Working Pressure` on BSP adapters: one value across 44 products.
    expect(
      buildSpecFacets(rows({ 'Max Working Pressure': { 'up to 400 bar': ['a', 'b', 'c'] } })),
    ).toEqual([])
  })

  it('drops an identifier column masquerading as a spec', () => {
    // `Series` on quick couplers: 29 values across 29 products. Every option
    // would narrow the list to exactly one item.
    const identifier: Record<string, string[]> = {}
    for (let i = 0; i < 12; i += 1) identifier[`S-${i}`] = [`p${i}`]
    expect(buildSpecFacets(rows({ Series: identifier }))).toEqual([])
  })

  it('drops a spec where only one value groups anything', () => {
    const facets = buildSpecFacets(
      rows({ Mixed: { common: ['a', 'b', 'c'], one: ['d'], two: ['e'] } }),
    )
    expect(facets).toEqual([])
  })

  it('merges spelling variants into one option and labels it with the dominant spelling', () => {
    const facets = buildSpecFacets(
      rows({
        'Body Configuration': {
          '90-elbow': ['a', 'b', 'c'],
          '90 elbow': ['d'],
          straight: ['e', 'f'],
        },
      }),
    )
    const elbow = facets[0]!.values.find((v) => v.key === '90elbow')!
    expect(elbow.count).toBe(4)
    expect(elbow.label).toBe('90-elbow')
  })

  it('counts a product once even when it carries the same value twice', () => {
    const duplicated: SpecFacetRow[] = [
      { productId: 'a', label: 'Material', value: 'Steel' },
      { productId: 'a', label: 'Material', value: 'steel' },
      { productId: 'b', label: 'Material', value: 'Steel' },
      { productId: 'c', label: 'Material', value: 'Brass' },
      { productId: 'd', label: 'Material', value: 'Brass' },
    ]
    const steel = buildSpecFacets(duplicated)[0]!.values.find((v) => v.key === 'steel')!
    expect(steel.count).toBe(2)
  })

  it('drops a facet with more options than a panel can carry', () => {
    const many: Record<string, string[]> = {}
    for (let i = 0; i < 40; i += 1) many[`v${i}`] = [`p${i}a`, `p${i}b`]
    expect(buildSpecFacets(rows({ Wide: many }))).toEqual([])
  })

  it('ignores blank values', () => {
    expect(
      buildSpecFacets(rows({ Material: { '': ['a', 'b'], '  ': ['c'], Steel: ['d', 'e'] } })),
    ).toEqual([])
  })

  it('orders the most-partitioning facet first', () => {
    const facets = buildSpecFacets(
      rows({
        Narrow: { yes: ['a', 'b'], no: ['c', 'd'] },
        Wide: { one: ['a', 'b'], two: ['c', 'd'], three: ['e', 'f'] },
      }),
    )
    expect(facets.map((f) => f.label)).toEqual(['Wide', 'Narrow'])
  })
})

describe('the URL round-trip', () => {
  it('survives a value containing a comma and a label containing a slash', () => {
    // `JIS 30° cone (60° included), BSP thread` and `Figure / Pressure Series`
    // are both live. Raw text in the URL would split on the comma and lose half
    // the selection, silently.
    const facets = buildSpecFacets(
      rows({
        'Figure / Pressure Series': {
          'JIS 30° cone (60° included), BSP thread': ['a', 'b'],
          'Plain end': ['c', 'd'],
        },
      }),
    )
    const facet = facets[0]!
    const value = facet.values.find((v) => v.label.startsWith('JIS'))!
    const url = serialiseSpecFilter(toggleSpecValue(new Map(), facet.key, value.key))!
    expect(url).not.toContain(',')
    expect(url).not.toContain('/')

    const parsed = parseSpecFilter(url)
    expect(productIdsMatching(
      rows({
        'Figure / Pressure Series': {
          'JIS 30° cone (60° included), BSP thread': ['a', 'b'],
          'Plain end': ['c', 'd'],
        },
      }),
      parsed,
    )).toEqual(new Set(['a', 'b']))
  })

  it('round-trips several facets', () => {
    let filter = toggleSpecValue(new Map(), 'body-configuration', 'straight')
    filter = toggleSpecValue(filter, 'body-configuration', '90elbow')
    filter = toggleSpecValue(filter, 'port-a-sealing', 'orb')
    const url = serialiseSpecFilter(filter)!
    expect(url).toBe('body-configuration:90elbow,straight;port-a-sealing:orb')
    const parsed = parseSpecFilter(url)
    expect(parsed.get('body-configuration')).toEqual(new Set(['straight', '90elbow']))
    expect(countSelected(parsed)).toBe(3)
  })

  it('is undefined when nothing is selected', () => {
    expect(serialiseSpecFilter(new Map())).toBeUndefined()
    expect(serialiseSpecFilter(toggleSpecValue(toggleSpecValue(new Map(), 'a', 'b'), 'a', 'b'))).toBeUndefined()
  })

  it('ignores malformed input rather than throwing', () => {
    expect(parseSpecFilter(undefined).size).toBe(0)
    expect(parseSpecFilter('').size).toBe(0)
    expect(parseSpecFilter('garbage').size).toBe(0)
    expect(parseSpecFilter(':novalue').size).toBe(0)
    expect(parseSpecFilter('label:').size).toBe(0)
  })

  it('toggling off removes the facet entirely', () => {
    const on = toggleSpecValue(new Map(), 'material', 'steel')
    expect(toggleSpecValue(on, 'material', 'steel').size).toBe(0)
  })

  it('does not mutate the filter it was given', () => {
    const original = toggleSpecValue(new Map(), 'material', 'steel')
    toggleSpecValue(original, 'material', 'brass')
    expect(original.get('material')).toEqual(new Set(['steel']))
  })
})

describe('pruneSpecFilter', () => {
  it('drops a selection the category no longer offers', () => {
    // A bookmarked URL outlives the value it names. Left in place it matches
    // nothing, so the page reads "0 products" with a filter the reader cannot
    // find in the panel to switch off.
    const facets = buildSpecFacets(rows({ Material: { Steel: ['a', 'b'], Brass: ['c', 'd'] } }))
    const filter = parseSpecFilter('material:steel,unobtainium;ghost-facet:x')
    const pruned = pruneSpecFilter(filter, facets)
    expect(pruned.size).toBe(1)
    expect(pruned.get('material')).toEqual(new Set(['steel']))
  })
})

describe('productIdsMatching', () => {
  const data = rows({
    'Body Configuration': { straight: ['a', 'b'], '90 elbow': ['c', 'd'] },
    'Port A Sealing': { orb: ['a', 'c'], 'bonded seal': ['b', 'd'] },
  })

  it('is null when nothing is selected, so the caller skips filtering', () => {
    expect(productIdsMatching(data, new Map())).toBeNull()
  })

  it('ORs values inside one facet', () => {
    expect(productIdsMatching(data, parseSpecFilter('body-configuration:straight,90elbow'))).toEqual(
      new Set(['a', 'b', 'c', 'd']),
    )
  })

  it('ANDs across facets', () => {
    expect(
      productIdsMatching(data, parseSpecFilter('body-configuration:straight;port-a-sealing:orb')),
    ).toEqual(new Set(['a']))
  })

  it('returns empty when the combination matches nothing', () => {
    expect(
      productIdsMatching(data, parseSpecFilter('body-configuration:straight;port-a-sealing:nothing')),
    ).toEqual(new Set())
  })

  it('matches on the normalised value, so a spelling variant still filters', () => {
    const mixed = rows({ 'Body Configuration': { '90-elbow': ['a'], '90 elbow': ['b'], straight: ['c', 'd'] } })
    expect(productIdsMatching(mixed, parseSpecFilter('body-configuration:90elbow'))).toEqual(
      new Set(['a', 'b']),
    )
  })
})

describe('facetLabelKey', () => {
  it('makes a URL-safe key from a label with punctuation', () => {
    expect(facetLabelKey('Figure / Pressure Series')).toBe('figure-pressure-series')
    expect(facetLabelKey('Flush Face / No-Spill')).toBe('flush-face-no-spill')
    expect(facetLabelKey('Port A Thread')).toBe('port-a-thread')
  })
})
