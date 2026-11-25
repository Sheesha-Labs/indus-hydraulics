import { describe, expect, it } from 'vitest'
import { fixture } from './fixtures'
import { parseBytes, sniff } from './index'

describe('sniff and parseBytes', () => {
  it.each([
    ['rfq-3-pages.pdf', 'pdf'],
    ['rfq.xlsx', 'xlsx'],
    ['rfq.xls', 'xls'],
    ['semicolons.csv', 'csv'],
    ['table.docx', 'docx'],
    ['scan-96dpi.jpg', 'image'],
    ['two-files.zip', 'zip'],
  ])('%s is %s by its bytes', async (name, kind) => {
    expect((await sniff(fixture(name), name)).kind).toBe(kind)
  })
  it('the extension does not decide: a PDF named .xlsx is a PDF', async () => {
    expect((await sniff(fixture('rfq-3-pages.pdf'), 'lines.xlsx')).kind).toBe('pdf')
  })
  it('binary with a .csv name is not text', async () => {
    expect((await sniff(new Uint8Array([0, 1, 2, 3, 0, 9]), 'x.csv')).kind).toBe('other')
  })
  it('legacy .doc asks for PDF or DOCX; pasted text is an email body', async () => {
    const ole = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0])
    expect(await parseBytes(ole, 'old.doc')).toMatchObject({
      kind: 'unsupported',
      ask: 'pdf_or_docx',
    })
    const pasted = await parseBytes(new TextEncoder().encode('Need 5 nos TEST-0009'), 'paste.txt')
    expect(pasted).toMatchObject({ kind: 'email', segments: [{ kind: 'fresh' }] })
  })
})
