import { describe, expect, it } from 'vitest'

import { stripBidTokens } from './bid-tokens'
import { splitNumberedItems, walkItemMarkers } from './item-markers'
import { collapseInlineWhitespace, normaliseBody, normaliseForParsing } from './normalise'
import { dropSelfRepeat, splitTitleItems } from './title-items'

/**
 * Every case below pins a trap measured on a real 9,707-message procurement
 * corpus. They are regression tests for known-wrong behaviour, not examples.
 */

describe('normaliseBody — trap 1: bare \\r line separators', () => {
  it('converts a bare \\r, which is what ProcureWare actually sends', () => {
    expect(normaliseBody('one\rtwo\rthree')).toBe('one\ntwo\nthree')
  })

  it('converts \\r\\n without leaving a stray blank line', () => {
    expect(normaliseBody('one\r\ntwo')).toBe('one\ntwo')
  })

  it('leaves \\n untouched', () => {
    expect(normaliseBody('one\ntwo')).toBe('one\ntwo')
  })

  it('handles a body mixing all three conventions', () => {
    expect(normaliseBody('a\r\nb\rc\nd')).toBe('a\nb\nc\nd')
  })

  it('without normalisation a bare-\\r body has no newlines at all — the failure this prevents', () => {
    const raw = 'BID NO: A6-1\rTITLE: PUMP\rCLOSING: 03/09/2026'
    expect(raw.split('\n')).toHaveLength(1)
    expect(normaliseBody(raw).split('\n')).toHaveLength(3)
  })
})

describe('collapseInlineWhitespace', () => {
  it('collapses spaces and tabs but preserves line structure', () => {
    expect(collapseInlineWhitespace('a  \t b\nc   d')).toBe('a b\nc d')
  })

  it('normaliseForParsing collapses blank-line runs and trims', () => {
    expect(normaliseForParsing('  a\r\r\r\rb  \r')).toBe('a\n\nb')
  })
})

describe('walkItemMarkers — trap 2: run-together numbered lists', () => {
  it('finds a marker mid-line, which line-splitting cannot', () => {
    const body = '1. GASKET SET - 4 Nos.2. SHAFT SEAL - 2 Nos.'
    expect(walkItemMarkers(body).map(m => m.index)).toEqual([1, 2])
  })

  it('rejects "1/2 INCH" — a slash is not marker punctuation', () => {
    expect(walkItemMarkers('VALVE 1/2 INCH BSP')).toEqual([])
  })

  it('rejects "R52.100" — 52 is not the next expected index', () => {
    expect(walkItemMarkers('PART R52.100 REPLACEMENT')).toEqual([])
  })

  it('requires strict monotonic succession, so an out-of-order number is skipped', () => {
    const body = '1. FIRST 7. NOISE 2. SECOND 3. THIRD'
    expect(walkItemMarkers(body).map(m => m.index)).toEqual([1, 2, 3])
  })

  it('accepts ")" as marker punctuation', () => {
    expect(walkItemMarkers('1) ALPHA 2) BETA').map(m => m.index)).toEqual([1, 2])
  })

  it('is not confused by a decimal quantity inside an item', () => {
    const body = '1. OIL SAE 15.40 GRADE 2. FILTER ELEMENT'
    expect(walkItemMarkers(body).map(m => m.index)).toEqual([1, 2])
  })

  it('is stateless across calls despite the module-level /g regex', () => {
    const body = '1. A 2. B'
    expect(walkItemMarkers(body)).toHaveLength(2)
    expect(walkItemMarkers(body)).toHaveLength(2)
  })
})

describe('splitNumberedItems', () => {
  it('splits a run-together list into verbatim item text', () => {
    const body = '1. GASKET SET - 4 Nos.2. SHAFT SEAL - 2 Nos.'
    expect(splitNumberedItems(body)).toEqual([
      { index: 1, text: 'GASKET SET - 4 Nos.' },
      { index: 2, text: 'SHAFT SEAL - 2 Nos.' },
    ])
  })

  it('returns nothing for a lone stray marker, so prose does not become an enquiry', () => {
    expect(splitNumberedItems('Please see clause 1. of the tender document')).toEqual([])
  })

  it('honours minItems:1 when the caller knows it is a list', () => {
    expect(splitNumberedItems('1. SOLE ITEM', { minItems: 1 })).toEqual([
      { index: 1, text: 'SOLE ITEM' },
    ])
  })
})

describe('stripBidTokens — trap 3: tokens glued to the title', () => {
  it('splits a bid number glued to a title with no separator', () => {
    expect(stripBidTokens('A6-Y260603007EYE DROP')).toEqual({
      title: 'EYE DROP',
      bidNo: 'A6-Y260603007',
      revision: null,
    })
  })

  it('splits a revision token glued to a title', () => {
    expect(stripBidTokens('RF2FOR DOCK PUMP ROOM')).toEqual({
      title: 'FOR DOCK PUMP ROOM',
      bidNo: null,
      revision: 'RF2',
    })
  })

  it('strips both, with the punctuation pass between them', () => {
    const r = stripBidTokens('A6-Y260603007-R2ACTUAL TITLE')
    expect(r.bidNo).toBe('A6-Y260603007')
    expect(r.revision).toBe('R2')
    expect(r.title).toBe('ACTUAL TITLE')
  })

  it('does NOT eat the leading R of an ordinary word', () => {
    expect(stripBidTokens('REPAIR OF PUMP').title).toBe('REPAIR OF PUMP')
  })

  it('does NOT maul a title beginning RFQ', () => {
    const r = stripBidTokens('RFQ FOR HYDRAULIC HOSE')
    expect(r.title).toBe('RFQ FOR HYDRAULIC HOSE')
    expect(r.revision).toBeNull()
  })

  it('accepts bare RF when followed by a non-letter', () => {
    expect(stripBidTokens('RF - DOCK PUMP').revision).toBe('RF')
  })

  it('recognises CLONE as a revision token', () => {
    expect(stripBidTokens('CLONE2WELDING RODS').revision).toBe('CLONE2')
  })

  it('never returns an empty title', () => {
    expect(stripBidTokens('A6-Y260603007').title).toBe('A6-Y260603007')
  })

  it('leaves an ordinary title completely alone', () => {
    expect(stripBidTokens('SUPPLY OF GATE VALVES')).toEqual({
      title: 'SUPPLY OF GATE VALVES',
      bidNo: null,
      revision: null,
    })
  })
})

describe('dropSelfRepeat / splitTitleItems — trap 4: items packed into the title', () => {
  it('collapses an exact word-level self-repeat', () => {
    expect(dropSelfRepeat('PUMP SPARES PUMP SPARES')).toBe('PUMP SPARES')
  })

  it('leaves a non-repeating phrase alone', () => {
    expect(dropSelfRepeat('PUMP SPARES FOR DOCK')).toBe('PUMP SPARES FOR DOCK')
  })

  it('is case-insensitive when comparing halves', () => {
    expect(dropSelfRepeat('Pump Spares PUMP SPARES')).toBe('PUMP SPARES')
  })

  it('splits a packed title on repeated QTY markers', () => {
    const title = 'GASKET SET QTY = 4 PC SHAFT SEAL QTY = 2 PC'
    expect(splitTitleItems(title)).toEqual([
      { index: 1, description: 'GASKET SET', qty: 4, unit: 'PC', sourceKind: 'title' },
      { index: 2, description: 'SHAFT SEAL', qty: 2, unit: 'PC', sourceKind: 'title' },
    ])
  })

  it('de-duplicates the repeated bid name before item one', () => {
    const title = 'PUMP SPARES PUMP SPARES QTY = 4 PC SHAFT SEAL QTY = 2 PC'
    const items = splitTitleItems(title)
    expect(items[0]!.description).toBe('PUMP SPARES')
    expect(items).toHaveLength(2)
  })

  it('strips a known title prefix from the first description', () => {
    const title = 'DOCK OVERHAUL GASKET SET QTY = 4 PC'
    expect(splitTitleItems(title, { titlePrefix: 'DOCK OVERHAUL' })[0]!.description).toBe('GASKET SET')
  })

  it('returns [] for an ordinary title, signalling "not a packed list"', () => {
    expect(splitTitleItems('SUPPLY OF GATE VALVES')).toEqual([])
  })

  it('accepts NOS and SET units and a colon separator', () => {
    const items = splitTitleItems('BEARING QTY: 6 NOS COUPLING QTY = 1 SET')
    expect(items.map(i => [i.qty, i.unit])).toEqual([[6, 'NOS'], [1, 'SET']])
  })

  it('is stateless across calls', () => {
    const t = 'A QTY = 1 PC B QTY = 2 PC'
    expect(splitTitleItems(t)).toHaveLength(2)
    expect(splitTitleItems(t)).toHaveLength(2)
  })
})
