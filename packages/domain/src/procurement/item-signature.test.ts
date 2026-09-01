import { describe, expect, it } from 'vitest'

import { buildItemSignature, sameSignature } from './item-signature'

describe('buildItemSignature — canonicalisation', () => {
  it('collapses the same valve written two different ways', () => {
    expect(
      sameSignature(
        'GATE VALVE 6 INCH 300LB CAST STEEL FLANGED WITH 3.1 MTC',
        '6" 300# CAST STEEL GATE VALVE, FLANGED, EN 10204 3.1',
      ),
    ).toBe(true)
  })

  it('is order-insensitive on the commodity words', () => {
    expect(sameSignature('GATE VALVE', 'VALVE GATE')).toBe(true)
  })

  it('does NOT collapse two different sizes', () => {
    expect(sameSignature('GATE VALVE 6 INCH', 'GATE VALVE 8 INCH')).toBe(false)
  })

  it('does NOT collapse two different pressure classes', () => {
    expect(sameSignature('GATE VALVE 6" 150#', 'GATE VALVE 6" 300#')).toBe(false)
  })

  it('does NOT collapse two different materials', () => {
    expect(sameSignature('BALL VALVE SS316', 'BALL VALVE SS304')).toBe(false)
  })

  it('does NOT collapse a certified item with an uncertified one', () => {
    expect(sameSignature('FORGED FITTING 3.1 MTC', 'FORGED FITTING')).toBe(false)
  })
})

describe('buildItemSignature — size parsing', () => {
  it('normalises every inch spelling to one token', () => {
    for (const s of ['6"', '6 INCH', '6IN', '6 in', "6''"]) {
      expect(buildItemSignature(`GATE VALVE ${s}`).sizes).toEqual(['6in'])
    }
  })

  it('converts a simple fraction', () => {
    expect(buildItemSignature('NIPPLE 1/2"').sizes).toEqual(['0.5in'])
  })

  it('converts a mixed fraction', () => {
    expect(buildItemSignature('HOSE 1-1/2 INCH').sizes).toEqual(['1.5in'])
  })

  it('normalises MM and DN to the same metric token', () => {
    expect(buildItemSignature('FLANGE 150MM').sizes).toEqual(['150mm'])
    expect(buildItemSignature('FLANGE DN150').sizes).toEqual(['150mm'])
  })

  it('keeps both when an item states inch and metric', () => {
    expect(buildItemSignature('PIPE 6 INCH 150MM').sizes).toEqual(['150mm', '6in'])
  })
})

describe('buildItemSignature — pressure ratings', () => {
  it('normalises pound-class spellings', () => {
    for (const s of ['300LB', '300#', 'CLASS 300', '300 LBS', 'ANSI 300']) {
      expect(buildItemSignature(`VALVE ${s}`).ratings).toEqual(['class300'])
    }
  })

  it('normalises PN ratings', () => {
    expect(buildItemSignature('VALVE PN16').ratings).toEqual(['pn16'])
    expect(buildItemSignature('VALVE PN 16').ratings).toEqual(['pn16'])
  })
})

describe('buildItemSignature — materials and standards', () => {
  it('distinguishes 316 from 316L', () => {
    expect(buildItemSignature('FITTING SS316L').materials).toContain('ss316l')
    expect(buildItemSignature('FITTING SS 316').materials).toContain('ss316')
  })

  it('recognises 3.1 MTC by any spelling', () => {
    for (const s of ['3.1 MTC', 'EN 10204 3.1', 'MTC', 'EN10204']) {
      expect(buildItemSignature(`PLATE ${s}`).standards).toContain('en10204-3.1')
    }
  })

  it('separates 3.2 from 3.1', () => {
    expect(buildItemSignature('PLATE EN 10204 3.2').standards).toContain('en10204-3.2')
  })

  it('recognises IACS class approval', () => {
    expect(buildItemSignature('WIRE ROPE IACS CLASS APPROVED').standards).toContain('iacs')
  })
})

describe('buildItemSignature — commodity key hygiene', () => {
  it('drops stopwords and procurement filler', () => {
    expect(buildItemSignature('SUPPLY OF 10 NOS GASKET SET FOR MAIN PUMP').commodityKey).toBe(
      'gasket main pump',
    )
  })

  it('removes size, rating and material tokens from the commodity key', () => {
    const sig = buildItemSignature('GATE VALVE 6 INCH 300LB CAST STEEL')
    expect(sig.commodityKey).toBe('gate valve')
  })

  it('keeps an unrecognised token rather than dropping it — the conservative direction', () => {
    expect(buildItemSignature('WIDGET FLURBLE').commodityKey).toBe('flurble widget')
  })

  it('de-duplicates repeated words', () => {
    expect(buildItemSignature('PUMP PUMP SPARES').commodityKey).toBe('pump')
  })

  it('is case-insensitive', () => {
    expect(sameSignature('Gate Valve 6 Inch', 'GATE VALVE 6 INCH')).toBe(true)
  })
})

describe('buildItemSignature — hash stability', () => {
  it('is deterministic across calls', () => {
    const a = buildItemSignature('GATE VALVE 6 INCH 300LB')
    const b = buildItemSignature('GATE VALVE 6 INCH 300LB')
    expect(a.signatureHash).toBe(b.signatureHash)
  })

  it('produces an 8-character hex hash', () => {
    expect(buildItemSignature('ANYTHING').signatureHash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('handles an empty description without throwing', () => {
    const sig = buildItemSignature('')
    expect(sig.commodityKey).toBe('')
    expect(sig.signatureHash).toMatch(/^[0-9a-f]{8}$/)
  })
})
