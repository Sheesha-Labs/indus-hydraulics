import { describe, expect, it } from 'vitest'
import { fixture } from './fixtures'
import { parseCellRef } from './sheet-text'
import { parseXlsx } from './xlsx'

describe('parseXlsx', () => {
  it('coordinates, merged titles, hidden column and sheet, formula results', async () => {
    const doc = await parseXlsx(fixture('rfq.xlsx'))
    if (doc.kind !== 'sheet') throw new Error(doc.kind)
    expect(doc.format).toBe('xlsx')
    const rfq = doc.grid.sheets[0]!
    expect(rfq.name).toBe('RFQ')
    expect(rfq.rows[0]!.cells[0]).toEqual({ c: 'A', v: 'Sample Client LLC', merged: 'A1:F1' })
    // Merged ranges keep only their top-left cell.
    expect(rfq.rows[0]!.cells).toHaveLength(1)
    const header = rfq.rows.find((r) => r.r === 4)!
    expect(header.cells.find((c) => c.c === 'D')).toMatchObject({
      v: 'Internal code',
      hidden: true,
    })
    const total = rfq.rows.find((r) => r.r === 11)!
    expect(total.cells.find((c) => c.c === 'E')).toEqual({ c: 'E', v: '190', formula: true })
    expect(doc.grid.sheets[1]).toMatchObject({ name: 'Notes', hidden: true })
    expect(doc.text).toContain('--- SHEET: RFQ ---')
    expect(doc.text).toContain('--- SHEET: Notes (hidden) ---')
    expect(doc.text).toContain(
      'R5\tA:1\tB:Ball valve 2" ANSI 300 RF\tC:TEST-0001\tD(hidden):IC-900\tE:10\tF:NOS'
    )
    expect(doc.text).toContain('A:Sample Client LLC [merged A1:F1]')
    expect(doc.chunks).toHaveLength(2)
  })

  it('a non-workbook is unreadable', async () => {
    expect((await parseXlsx(new TextEncoder().encode('nope'))).kind).toBe('unreadable')
  })

  it('cell references', () => {
    expect(parseCellRef('ab12')).toEqual({ c: 'AB', r: 12 })
    expect(parseCellRef('12AB')).toBeNull()
  })
})
