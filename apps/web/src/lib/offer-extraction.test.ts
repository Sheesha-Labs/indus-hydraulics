import { describe, expect, it } from 'vitest'

import { keepOnlyEvidencedLines } from './offer-extraction'

/**
 * The evidence gate. A hallucinated price reaches a customer quote before any
 * human sees it, so a row whose sourceQuote is not actually in the reply is
 * dropped — the JSON schema can require a string but cannot require a TRUE one.
 */

const REPLY = `Dear Indus,

Thank you for enquiry ENQ-2026-0007.

1. Gate valve 6" 300lb cast steel — EUR 1.234,56 each, MOQ 5, 4 weeks
2. Blind flange 4" — we cannot supply this item

Prices FOB Hamburg, valid 30 days.`

function line(over: Record<string, unknown> = {}) {
  return {
    description: 'Gate valve 6" 300lb',
    kind: 'quoted',
    unitPriceRaw: '1.234,56',
    qtyRaw: null,
    moqRaw: '5',
    totalRaw: null,
    leadTimeDays: 28,
    sourceQuote: 'EUR 1.234,56 each, MOQ 5, 4 weeks',
    ...over,
  }
}

describe('evidence gate', () => {
  it('keeps a row whose quote really appears in the reply', () => {
    const { kept, dropped } = keepOnlyEvidencedLines([line()], REPLY)
    expect(kept).toHaveLength(1)
    expect(dropped).toBe(0)
  })

  it('drops a row whose quote was invented', () => {
    const { kept, dropped } = keepOnlyEvidencedLines(
      [line({ sourceQuote: 'EUR 999,00 each — special discount' })],
      REPLY,
    )
    expect(kept).toEqual([])
    expect(dropped).toBe(1)
  })

  it('tolerates re-wrapped whitespace, which mail clients always do', () => {
    const { kept } = keepOnlyEvidencedLines(
      [line({ sourceQuote: 'EUR   1.234,56\n  each,  MOQ 5, 4 weeks' })],
      REPLY,
    )
    expect(kept).toHaveLength(1)
  })

  it('drops a row with no quote at all', () => {
    expect(keepOnlyEvidencedLines([line({ sourceQuote: '' })], REPLY).kept).toEqual([])
  })

  it('drops a row with a uselessly short quote', () => {
    expect(keepOnlyEvidencedLines([line({ sourceQuote: 'a' })], REPLY).kept).toEqual([])
  })

  it('keeps the good rows and drops only the bad ones', () => {
    const { kept, dropped } = keepOnlyEvidencedLines(
      [line(), line({ sourceQuote: 'not in the reply anywhere' })],
      REPLY,
    )
    expect(kept).toHaveLength(1)
    expect(dropped).toBe(1)
  })
})

describe('normalisation', () => {
  it('preserves raw money strings rather than parsing them here', () => {
    expect(keepOnlyEvidencedLines([line()], REPLY).kept[0]!.unitPriceRaw).toBe('1.234,56')
  })

  it('keeps a declined line, since a stated "cannot supply" is information', () => {
    const { kept } = keepOnlyEvidencedLines(
      [line({ kind: 'declined', unitPriceRaw: null, sourceQuote: 'we cannot supply this item' })],
      REPLY,
    )
    expect(kept[0]!.kind).toBe('declined')
  })

  it('falls back to "quoted" for an unrecognised kind rather than trusting it', () => {
    expect(keepOnlyEvidencedLines([line({ kind: 'substitute' })], REPLY).kept[0]!.kind).toBe('quoted')
  })

  it('nulls a non-numeric lead time instead of coercing it', () => {
    expect(keepOnlyEvidencedLines([line({ leadTimeDays: '4 weeks' })], REPLY).kept[0]!.leadTimeDays).toBeNull()
  })
})

describe('hostile input', () => {
  it('returns nothing for a non-array', () => {
    expect(keepOnlyEvidencedLines(null, REPLY).kept).toEqual([])
    expect(keepOnlyEvidencedLines('nope', REPLY).kept).toEqual([])
  })

  it('skips nulls and primitives without throwing', () => {
    const { kept, dropped } = keepOnlyEvidencedLines([null, 42, 'x', line()], REPLY)
    expect(kept).toHaveLength(1)
    expect(dropped).toBe(3)
  })
})
