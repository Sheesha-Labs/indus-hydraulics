import { describe, expect, it } from 'vitest'
import { fixture } from './fixtures'
import { chunkPdf, isEncryptedPdf, needsChunking, parsePdf } from './pdf'

describe('parsePdf', () => {
  it('reads every page with positioned text in top-left PDF units', async () => {
    const doc = await parsePdf(fixture('rfq-3-pages.pdf'))
    if (doc.kind !== 'pdf') throw new Error(doc.kind)
    expect(doc.pageCount).toBe(3)
    expect(doc.hasTextLayer).toBe(true)
    expect(doc.title).toBe('RFQ SC-1182')
    const p1 = doc.pages[0]!
    expect(p1.text).toContain('Closing date: 28 Sep 2026')
    const item = p1.items.find((i) => i.str === 'TEST-0001')!
    expect(p1.text.slice(item.start, item.end)).toBe('TEST-0001')
    // Drawn at y = 722 from the bottom of an 842-unit page: about 110 from the top.
    expect(item.y).toBeGreaterThan(100)
    expect(item.y).toBeLessThan(125)
    expect(item.x).toBeCloseTo(330, 0)
  })

  it('an encrypted file is password-protected and never reaches pdfjs', async () => {
    expect(await isEncryptedPdf(fixture('encrypted.pdf'))).toBe(true)
    expect(await parsePdf(fixture('encrypted.pdf'))).toEqual({ kind: 'password_protected' })
  })

  it('a scanned page has no text layer', async () => {
    const doc = await parsePdf(fixture('scanned.pdf'))
    expect(doc.kind === 'pdf' && doc.hasTextLayer).toBe(false)
  })

  it('garbage is unreadable', async () => {
    expect((await parsePdf(new TextEncoder().encode('not a pdf'))).kind).toBe('unreadable')
  })

  it('chunks long documents with one page of overlap', async () => {
    const chunks = await chunkPdf(fixture('rfq-3-pages.pdf'), { pagesPerChunk: 2, overlap: 1 })
    expect(chunks.map((c) => c.pages)).toEqual([
      [1, 2],
      [2, 3],
    ])
    expect(needsChunking(41, 1)).toBe(true)
    expect(needsChunking(10, 21 * 1024 * 1024)).toBe(true)
    expect(needsChunking(10, 1024)).toBe(false)
  })
})
