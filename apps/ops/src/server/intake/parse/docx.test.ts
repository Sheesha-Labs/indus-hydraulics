import { describe, expect, it } from 'vitest'
import { htmlToDocxText, parseDocx } from './docx'
import { fixture } from './fixtures'

describe('parseDocx', () => {
  it('paragraphs as lines and table rows with T/R/C coordinates', async () => {
    const doc = await parseDocx(fixture('table.docx'))
    if (doc.kind !== 'docx') throw new Error(doc.kind)
    expect(doc.text.split('\n')[0]).toBe(
      'Sample Client LLC requests a quotation for the items below.'
    )
    expect(doc.text).toContain(
      'T1R2\tC1:1\tC2:Ball valve 2" ANSI 300 RF\tC3:TEST-0001\tC4:10\tC5:NOS'
    )
    expect(doc.tables[0]!.rows).toHaveLength(4)
    expect(doc.text).toContain('Delivery required by 30 Oct 2026.')
  })
  it('entities and nested paragraphs in a cell', () => {
    const r = htmlToDocxText(
      '<p>A &amp; B</p><table><tr><td><p>x</p><p>y</p></td><td>2&quot;</td></tr></table>'
    )
    expect(r.text).toBe('A & B\nT1R1\tC1:x y\tC2:2"')
  })
  it('a non-document is unreadable', async () => {
    expect((await parseDocx(new TextEncoder().encode('x'))).kind).toBe('unreadable')
  })
})
