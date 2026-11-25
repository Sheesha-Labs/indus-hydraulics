import { describe, expect, it } from 'vitest'
import { detectTable, rowRanges, type GridRow } from './header-detect'
import { applyRemembered, byHeaderOf, headerSignature, inferMapping } from './column-infer'
import type { UomTable } from './uom'

const row = (r: number, cells: Record<string, string>, extra: Partial<GridRow> = {}): GridRow => ({
  r,
  cells: Object.entries(cells).map(([c, v]) => ({ c, v })),
  ...extra,
})

/** Merged title rows 1–3, header row 4, twelve lines, a blank, a totals row: board 35's shape, neutral names. */
const SHEET: GridRow[] = [
  { r: 1, cells: [{ c: 'A', v: 'SAMPLE VESSEL — SPARES (Q4)', merged: 'A1:F1' }] },
  { r: 2, cells: [{ c: 'A', v: 'Sample Client LLC · Ref SC-RFQ-0921', merged: 'A2:F2' }] },
  row(3, {}),
  row(4, { A: 'S/N', B: 'Description', C: 'Maker P/N', D: 'Qty', E: 'Unit', F: 'Remarks' }),
  ...Array.from({ length: 12 }, (_, i) =>
    row(5 + i, {
      A: String(i + 1),
      B: `Hydraulic hose item ${i + 1}`,
      ...(i === 11 ? {} : { C: `TEST-${100 + i}` }),
      D: String(2 + i),
      E: i % 2 ? 'NOS' : 'PCS',
      ...(i === 3 ? { F: 'As per sample' } : {}),
    })
  ),
  row(17, {}),
  {
    r: 18,
    cells: [
      { c: 'B', v: 'TOTAL ITEMS' },
      { c: 'D', v: '12', formula: true },
    ],
  },
]

const UOMS: UomTable = {
  codes: new Set(['EA', 'PR', 'SET', 'M']),
  aliases: new Map([
    ['NOS', 'EA'],
    ['PCS', 'EA'],
    ['PAIR', 'PR'],
  ]),
}

describe('detectTable', () => {
  it('finds the header under merged title rows and skips the totals row', () => {
    const t = detectTable(SHEET)!
    expect(t.headerRow).toBe(4)
    expect(t.dataRows).toEqual([5, 16])
    expect(t.lineRows).toHaveLength(12)
    expect(t.skipped).toEqual([
      { row: 1, why: 'merged_title' },
      { row: 2, why: 'merged_title' },
      { row: 3, why: 'blank' },
      { row: 17, why: 'blank' },
      { row: 18, why: 'totals' },
    ])
    expect(t.columns).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
  })

  it('reads subtotals, formula-only rows and hidden rows as skipped', () => {
    const t = detectTable([
      row(1, { A: 'Item', B: 'Description', C: 'Qty' }),
      row(2, { A: '1', B: 'Gasket', C: '4' }),
      row(3, { B: 'Sub-total', C: '4' }),
      { r: 4, cells: [{ c: 'C', v: '4', formula: true }] },
      row(5, { A: '2', B: 'Bolt', C: '8' }, { hidden: true }),
      row(6, { A: '3', B: 'Nut', C: '8' }),
    ])!
    expect(t.lineRows).toEqual([2, 6])
    expect(t.skipped.map((s) => s.why)).toEqual(['subtotal', 'totals', 'hidden'])
  })

  it('falls back to the first row of three text cells (a CSV with no header words)', () => {
    const t = detectTable([
      row(1, { A: 'Alpha', B: 'Beta', C: 'Gamma' }),
      row(2, { A: 'x', B: 'y', C: '3' }),
    ])!
    expect(t.headerRow).toBe(1)
  })

  it('returns null with no table', () => {
    expect(detectTable([row(1, { A: 'Just a note' })])).toBeNull()
    expect(detectTable([])).toBeNull()
  })

  it('a table with a header and nothing under it has no data rows', () => {
    expect(detectTable([row(1, { A: 'Item', B: 'Qty' })])!.dataRows).toBeNull()
  })

  it('groups rows into ranges', () => {
    expect(rowRanges([3, 1, 2, 7, 9, 10])).toBe('1–3, 7, 9–10')
    expect(rowRanges([])).toBe('')
  })
})

describe('inferMapping', () => {
  const header = SHEET[3]!.cells
  const samples = new Map<string, string[]>()
  for (const r of SHEET.slice(4, 16))
    for (const c of r.cells) samples.set(c.c, [...(samples.get(c.c) ?? []), c.v])

  it('maps every board-35 column', () => {
    const m = inferMapping(header, samples, UOMS)
    expect(m.map((g) => [g.c, g.target])).toEqual([
      ['A', 'line_no'],
      ['B', 'description'],
      ['C', 'part_no'],
      ['D', 'qty'],
      ['E', 'uom'],
      ['F', 'notes'],
    ])
    expect(m[2]!.sample).toBe('TEST-100')
  })

  it('gives each field to one column only and ignores the rest', () => {
    const m = inferMapping(
      [
        { c: 'A', v: 'Qty' },
        { c: 'B', v: 'Quantity' },
        { c: 'C', v: 'Colour' },
      ],
      new Map([
        ['A', ['1', '2']],
        ['B', ['3', '4']],
        ['C', ['red', 'blue']],
      ]),
      UOMS
    )
    expect(m.filter((g) => g.target === 'qty')).toHaveLength(1)
    expect(m.find((g) => g.c === 'C')!.target).toBe('ignore')
  })

  it('reads a qty column from its values when the header is unfamiliar', () => {
    const m = inferMapping(
      [
        { c: 'A', v: 'Particulars' },
        { c: 'B', v: 'Req' },
      ],
      new Map([
        ['A', ['Ball valve 2 inch class 300', 'Gate valve 4 inch']],
        ['B', ['10', '4 nos']],
      ]),
      UOMS
    )
    expect(m.map((g) => g.target)).toEqual(['description', 'qty'])
  })

  it('the signature survives reordered columns, and a remembered mapping applies by header', () => {
    const a = headerSignature([{ v: 'S/N' }, { v: 'Description' }, { v: 'Qty' }])
    const b = headerSignature([{ v: 'Qty' }, { v: 'S/N' }, { v: ' description ' }])
    expect(a).toBe(b)
    const guesses = inferMapping(header, samples, UOMS)
    const saved = byHeaderOf(guesses.map((g) => (g.c === 'F' ? { ...g, target: 'spec' } : g)))
    const reapplied = applyRemembered(guesses, { ...saved, other: 'bogus' })
    expect(reapplied.find((g) => g.c === 'F')!.target).toBe('spec')
    expect(applyRemembered(guesses, { remarks: 'bogus' }).find((g) => g.c === 'F')!.target).toBe(
      'notes'
    )
  })
})

describe('detectTable with a header row chosen by a person', () => {
  it('reads everything under the chosen row', () => {
    const t = detectTable(SHEET, { headerRow: 5 })!
    expect(t.headerRow).toBe(5)
    expect(t.lineRows[0]).toBe(6)
  })
})
