import {
  buildQuotation,
  createClientSafeQuotation,
  type DocumentData,
  type Letterhead,
} from '@indus/ops-core'
import * as F from '@indus/ops-core/src/document/__fixtures__/inputs'
import { describe, expect, it } from 'vitest'
import { NEUTRAL_LETTERHEAD, renderFixtures } from './__fixtures__/documents'
import { renderDocumentPdf } from './render'

/**
 * The PDF renderer (S11-T02): every kind renders, paginates with "Page n of N" on every page, repeats the line
 * table's header on page 2, prints the "-R2" label, carries "DRAFT" only when asked, keeps client and supplier
 * names out of the metadata, and embeds Geist (and Instrument Serif where a house title is drawn).
 */

type Pdf = { pages: string[]; info: Record<string, unknown> }

async function read(bytes: Uint8Array): Promise<Pdf> {
  const lib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await lib.getDocument({
    data: new Uint8Array(bytes),
    disableFontFace: true,
    isEvalSupported: false,
    useSystemFonts: false,
    verbosity: 0,
  }).promise
  const pages: string[] = []
  for (let n = 1; n <= doc.numPages; n++) {
    const tc = await (await doc.getPage(n)).getTextContent()
    pages.push(tc.items.map((i) => ('str' in i ? i.str : '')).join(''))
  }
  const info = (await doc.getMetadata()).info as Record<string, unknown>
  await doc.destroy()
  return { pages, info }
}

const latin1 = (b: Uint8Array) => Buffer.from(b).toString('latin1')

describe('renderDocumentPdf', () => {
  const fixtures = renderFixtures()

  it('renders every kind with "Page n of N" on each page and clean metadata', async () => {
    for (const f of fixtures) {
      const bytes = await renderDocumentPdf(f.data, f.letterhead, {}, { draft: f.draft ?? false })
      const pdf = await read(bytes)
      expect(pdf.pages.length, f.name).toBeGreaterThan(0)
      pdf.pages.forEach((text, i) =>
        expect(text, `${f.name} page ${i + 1}`).toContain(`Page ${i + 1} of ${pdf.pages.length}`)
      )
      expect(pdf.info.Author).toBe('Example Trading LLC')
      expect(pdf.info.Subject ?? '').toBe('')
      const meta = JSON.stringify(pdf.info).toLowerCase()
      expect(meta).not.toContain('sample client')
      expect(meta).not.toContain('example valve')
      expect(String(pdf.info.Title)).toMatch(/·/)
    }
  }, 60_000)

  it('the C37 quotation: -R2, the total, two pages, Draft only on the preview', async () => {
    const issued = fixtures.find((f) => f.name === 'quotation-c37')!
    const pdf = await read(await renderDocumentPdf(issued.data, issued.letterhead))
    const all = pdf.pages.join('\n')
    expect(pdf.pages).toHaveLength(2)
    expect(all).toContain('INDUS/Q10001-R2')
    expect(all).toContain('157,587.08')
    expect(all).toContain('Not quoted · Discontinued by the maker')
    expect(all).not.toContain('DRAFT')
    expect(pdf.info.Title).toBe('INDUS/Q10001-R2 · QUOTATION')
    const preview = fixtures.find((f) => f.name === 'quotation-draft')!
    const draft = await read(
      await renderDocumentPdf(preview.data, preview.letterhead, {}, { draft: true })
    )
    expect(draft.pages.every((p) => p.includes('DRAFT'))).toBe(true)
  }, 30_000)

  it('a long table repeats its header on the next page, with the number in the running header', async () => {
    const lines = Array.from({ length: 40 }, (_, i) => ({ ...F.C37_LINES[i % 10]!, lineNo: i + 1 }))
    const data: DocumentData = buildQuotation(
      createClientSafeQuotation({ ...F.QUOTATION, lines }),
      F.CTX
    )
    const pdf = await read(await renderDocumentPdf(data, NEUTRAL_LETTERHEAD))
    expect(pdf.pages.length).toBeGreaterThanOrEqual(2)
    expect(pdf.pages[1]).toContain('Item & description')
    expect(pdf.pages[1]).toContain('QUOTATION # INDUS/Q10001-R2')
    expect(pdf.pages[0]).not.toContain('QUOTATION # INDUS/Q10001-R2')
  }, 30_000)

  it('embeds Geist, and Instrument Serif for the house titles; no other family', async () => {
    const oa = fixtures.find((f) => f.name === 'oa')!
    const raw = latin1(await renderDocumentPdf(oa.data, oa.letterhead))
    const families = [...raw.matchAll(/\/BaseFont\s*\/[A-Z]{6}\+([A-Za-z-]+)/g)].map((m) => m[1])
    expect(families.some((f) => f!.startsWith('Geist'))).toBe(true)
    expect(families.some((f) => f!.startsWith('InstrumentSerif'))).toBe(true)
    expect(families.every((f) => /^(Geist|InstrumentSerif)/.test(f!))).toBe(true)
  }, 30_000)

  it('renders the 12-line quotation in under 1.5 s once warm', async () => {
    const q = fixtures.find((f) => f.name === 'quotation-c37')!
    await renderDocumentPdf(q.data, q.letterhead)
    const t = performance.now()
    await renderDocumentPdf(q.data, q.letterhead)
    expect(performance.now() - t).toBeLessThan(1500)
  }, 30_000)

  it('draws a bank gap, not an empty block, when no bank lines are confirmed', async () => {
    const oa = fixtures.find((f) => f.name === 'oa')!
    const noBank: Letterhead = { ...oa.letterhead, bank: { lines: [] } }
    const pdf = await read(await renderDocumentPdf(oa.data, noBank))
    expect(pdf.pages[0]).toContain('Bank details to follow')
  }, 30_000)
})
