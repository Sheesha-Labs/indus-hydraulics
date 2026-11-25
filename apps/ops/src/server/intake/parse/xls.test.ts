import { describe, expect, it } from 'vitest'
import { fixture } from './fixtures'
import { parseXls } from './xls'

describe('parseXls (SheetJS in a worker)', () => {
  it('reads a BIFF8 workbook into the same grid shape', async () => {
    const doc = await parseXls(fixture('rfq.xls'))
    if (doc.kind !== 'sheet') throw new Error(JSON.stringify(doc))
    expect(doc.format).toBe('xls')
    expect(doc.text).toContain('R2\tA:1\tB:Ball valve 2" ANSI 300 RF\tC:TEST-0001\tD:10\tE:NOS')
  })

  it('a broken file asks for XLSX or PDF', async () => {
    const doc = await parseXls(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 1, 2, 3]))
    expect(doc).toMatchObject({ kind: 'unsupported', ask: 'xlsx_or_pdf' })
  })
})
