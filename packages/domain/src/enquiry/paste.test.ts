import { describe, expect, it } from 'vitest'

import { extractFromPaste, PASTE_EXTRACTOR_VERSION } from './paste'

describe('extractFromPaste', () => {
  it('extracts a run-together numbered list, the dominant real shape', () => {
    const r = extractFromPaste({
      rawText: '1. GASKET SET FOR MAIN PUMP - 4 Nos.2. SHAFT SEAL 60MM - 2 Nos.',
      title: 'A6-Y260603007PUMP OVERHAUL SPARES',
    })

    expect(r.bidNo).toBe('A6-Y260603007')
    expect(r.title).toBe('PUMP OVERHAUL SPARES')
    expect(r.lines).toHaveLength(2)
    expect(r.lines[0]).toMatchObject({
      position: 1,
      description: 'GASKET SET FOR MAIN PUMP',
      qty: 4,
      unit: 'NOS',
      sourceKind: 'body',
    })
    expect(r.lines[1]).toMatchObject({ description: 'SHAFT SEAL 60MM', qty: 2 })
  })

  it('survives a body that uses bare \\r, which would otherwise be one line', () => {
    const r = extractFromPaste({ rawText: '1. VALVE SEAT - 2 Nos.\r2. O-RING KIT - 5 Nos.\r' })
    expect(r.lines.map(l => l.description)).toEqual(['VALVE SEAT', 'O-RING KIT'])
  })

  it('keeps sourceText verbatim even though the description is cleaned', () => {
    const r = extractFromPaste({ rawText: '1. BEARING SKF 6205 - 10 Nos.2. GREASE - 2 KG' })
    expect(r.lines[0]!.description).toBe('BEARING SKF 6205')
    expect(r.lines[0]!.sourceText).toBe('BEARING SKF 6205 - 10 Nos.')
  })

  it('does not read a dimension as a quantity', () => {
    const r = extractFromPaste({ rawText: '1. GATE VALVE 6 INCH 300LB FLANGED 2. BLIND FLANGE 4 INCH' })
    expect(r.lines[0]!.qty).toBeNull()
    expect(r.lines[0]!.flags).toContain('qty_not_stated')
    expect(r.lines[0]!.description).toBe('GATE VALVE 6 INCH 300LB FLANGED')
  })

  it('takes the trailing quantity, not a size earlier in the description', () => {
    const r = extractFromPaste({ rawText: '1. HOSE 2 INCH X 10 MTR ASSEMBLY - 6 Nos.2. CLAMP - 12 Nos.' })
    expect(r.lines[0]!.qty).toBe(6)
    expect(r.lines[0]!.unit).toBe('NOS')
  })

  it('captures certification requirements', () => {
    const r = extractFromPaste({ rawText: '1. FORGED FITTING WITH 3.1 MTC - 4 Nos.2. PLAIN NIPPLE - 2 Nos.' })
    expect(r.lines[0]!.certification).toBe('3.1 MTC')
    expect(r.lines[1]!.certification).toBeNull()
  })

  it('captures IACS class approval', () => {
    const r = extractFromPaste({ rawText: '1. WIRE ROPE IACS CLASS APPROVED - 2 Nos.2. SHACKLE - 4 Nos.' })
    expect(r.lines[0]!.certification).toContain('IACS')
  })

  it('captures an explicit part number', () => {
    const r = extractFromPaste({ rawText: '1. FILTER ELEMENT P/N: HC9600FKS8H - 6 Nos.2. SEAL KIT - 1 Set' })
    expect(r.lines[0]!.partNumber).toBe('HC9600FKS8H')
  })

  it('falls back to title-packed items when the body has none', () => {
    const r = extractFromPaste({
      rawText: 'Please log in to the portal to view the item list.',
      title: 'DOCK SPARES GASKET SET QTY = 4 PC SHAFT SEAL QTY = 2 PC',
    })
    expect(r.lines).toHaveLength(2)
    // Conservative on purpose: with items packed into the title there is no way
    // to know where the bid name ends and item one begins, so the leading words
    // stay in the description for a human to trim. Over-including is recoverable;
    // silently eating part of a spec is not.
    expect(r.lines[0]).toMatchObject({ description: 'DOCK SPARES GASKET SET', qty: 4, sourceKind: 'title' })
    expect(r.lines[1]).toMatchObject({ description: 'SHAFT SEAL', qty: 2 })
    expect(r.lines[0]!.flags).toContain('title_sourced')
  })

  it('returns zero lines for a portal-login enquiry — a legitimate outcome, not an error', () => {
    const r = extractFromPaste({
      rawText: 'You have been invited to bid. Log in to view details.',
      title: 'SUPPLY OF ASSORTED VALVES',
    })
    expect(r.lines).toEqual([])
    expect(r.title).toBe('SUPPLY OF ASSORTED VALVES')
  })

  it('does not manufacture a line from prose containing "clause 1."', () => {
    const r = extractFromPaste({ rawText: 'Refer to clause 1. of the attached tender conditions.' })
    expect(r.lines).toEqual([])
  })

  it('renumbers positions contiguously from 1', () => {
    const r = extractFromPaste({ rawText: '1. A ITEM - 1 Nos.2. B ITEM - 2 Nos.3. C ITEM - 3 Nos.' })
    expect(r.lines.map(l => l.position)).toEqual([1, 2, 3])
  })

  it('falls back to the first body line for the title when none is given', () => {
    const r = extractFromPaste({ rawText: 'RF2FOR DOCK PUMP ROOM\n1. PUMP - 1 Nos.2. SEAL - 2 Nos.' })
    expect(r.title).toBe('FOR DOCK PUMP ROOM')
    expect(r.revision).toBe('RF2')
  })

  it('stamps the extractor version so rows can be re-run later', () => {
    expect(extractFromPaste({ rawText: 'x' }).extractorName).toBe(PASTE_EXTRACTOR_VERSION)
  })

  it('flags a suspiciously short description', () => {
    const r = extractFromPaste({ rawText: '1. NUT - 4 Nos.2. LONGER DESCRIPTION HERE - 1 Nos.' })
    expect(r.lines[0]!.flags).toContain('description_very_short')
    expect(r.lines[1]!.flags).not.toContain('description_very_short')
  })

  it('handles a decimal quantity written with a comma', () => {
    const r = extractFromPaste({ rawText: '1. HYDRAULIC OIL - 2,5 LTR2. FILTER - 1 Nos.' })
    expect(r.lines[0]!.qty).toBe(2.5)
  })

  it('never returns a line with empty sourceText, which the DB CHECK forbids', () => {
    const r = extractFromPaste({ rawText: '1.   2. REAL ITEM - 1 Nos.' })
    for (const line of r.lines) expect(line.sourceText.length).toBeGreaterThan(0)
  })
})
