import {
  buildQuotation,
  createClientSafeQuotation,
  paginate,
  type DocumentData,
  type Letterhead,
} from '@indus/ops-core'
import * as F from '@indus/ops-core/src/document/__fixtures__/inputs'
import { NEUTRAL_LETTERHEAD, renderFixtures } from '@indus/ops-core/src/document/__fixtures__/kinds'
import { renderDocumentPdf } from '@indus/ops-pdf'
import { DocumentPages } from '@indus/ops-ui/document'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

/**
 * Screen ↔ PDF text parity (S11-T03, ADR-14). For every kind, the HTML pages (DocumentPages) and the PDF pages
 * (renderDocumentPdf) are paginated identically and carry the same text on each page, compared as the multiset
 * of its characters (whitespace aside): DOM order and PDF reading order legitimately differ where blocks sit
 * side by side, and pdfjs returns letter-spaced labels glyph by glyph, but nothing may be missing, extra or on
 * another page. On a failure the word-level difference is printed. Case is ignored: eyebrows and table headers are uppercased by
 * CSS on screen and drawn uppercase in the PDF (and the Draft overlay reads "Draft" / "DRAFT").
 */

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;| /g, ' ')
}

const tokens = (text: string) =>
  text
    .replace(/ /g, ' ')
    .split(/\s+/)
    // Labels are uppercased by CSS on screen and drawn uppercase in the PDF: compare case-insensitively.
    .map((t) => t.toLowerCase())
    .filter(Boolean)
    .sort()

function htmlPages(data: DocumentData, letterhead: Letterhead, draft: boolean): string[][] {
  const html = renderToStaticMarkup(
    <DocumentPages
      data={data}
      letterhead={letterhead}
      scale="full"
      {...(draft ? { stamp: 'Draft' as const } : {})}
    />
  )
  return html
    .split(/<article\b[^>]*>/)
    .slice(1)
    .map((page) => tokens(decode(page.replace(/<[^>]+>/g, ' '))))
}

async function pdfPages(bytes: Uint8Array): Promise<string[][]> {
  const lib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await lib.getDocument({
    data: new Uint8Array(bytes),
    disableFontFace: true,
    isEvalSupported: false,
    useSystemFonts: false,
    verbosity: 0,
  }).promise
  const out: string[][] = []
  for (let n = 1; n <= doc.numPages; n++) {
    const tc = await (await doc.getPage(n)).getTextContent()
    // Letter-spaced labels come back glyph by glyph: join items as pdfjs spaced them, breaking at line ends.
    out.push(
      tokens(tc.items.map((i) => ('str' in i ? i.str + (i.hasEOL ? ' ' : '') : ' ')).join(''))
    )
  }
  await doc.destroy()
  return out
}

function diff(a: string[], b: string[]): { onlyScreen: string[]; onlyPdf: string[] } {
  const count = new Map<string, number>()
  for (const t of a) count.set(t, (count.get(t) ?? 0) + 1)
  const onlyPdf: string[] = []
  for (const t of b) {
    const n = count.get(t) ?? 0
    if (n > 0) count.set(t, n - 1)
    else onlyPdf.push(t)
  }
  const onlyScreen = [...count].flatMap(([t, n]) => new Array<string>(n).fill(t))
  return { onlyScreen, onlyPdf }
}

const long = buildQuotation(
  createClientSafeQuotation({
    ...F.QUOTATION,
    lines: Array.from({ length: 40 }, (_, i) => ({ ...F.C37_LINES[i % 12]!, lineNo: i + 1 })),
  }),
  F.CTX
)

describe('document parity: screen and PDF', () => {
  const cases = [
    ...renderFixtures().map((f) => ({
      name: f.name,
      data: f.data,
      letterhead: f.letterhead,
      draft: f.draft ?? false,
    })),
    { name: 'quotation-40-lines', data: long, letterhead: NEUTRAL_LETTERHEAD, draft: false },
  ]
  for (const c of cases) {
    it(`${c.name}: same pages, same words on each page`, async () => {
      const screen = htmlPages(c.data, c.letterhead, c.draft)
      const pdf = await pdfPages(
        await renderDocumentPdf(c.data, c.letterhead, {}, { draft: c.draft })
      )
      expect(screen.length).toBe(paginate(c.data).length)
      expect(pdf.length).toBe(screen.length)
      screen.forEach((words, i) => {
        // Characters, not words: letter-spaced labels come back from pdfjs as single letters.
        const chars = (ws: string[]) => ws.join('').split('').sort().join('')
        const d = diff(words, pdf[i]!)
        expect(
          chars(pdf[i]!),
          `${c.name} page ${i + 1} differs: ${JSON.stringify(d).slice(0, 600)}`
        ).toBe(chars(words))
      })
    }, 60_000)
  }
})
