import 'server-only'
import { PDFDocument } from 'pdf-lib'
import type { PageText, ParsedDocument, PdfTextItem } from './types'

/**
 * PDF (S08-T01, 08 §3). pdf-lib first: an encrypted file is reported as password-protected and never reaches
 * pdfjs. Then the pdfjs legacy build (no worker, no font faces, no eval) reads each page's text with its
 * position; positions are converted to PDF user units with the origin at the top-left, which is what the
 * review's highlight boxes use. A page with almost no text is a scan: the model reads the page image instead.
 */
const MIN_CHARS_PER_PAGE = 40

type PdfJs = typeof import('pdfjs-dist/legacy/build/pdf.mjs')
let pdfjsPromise: Promise<PdfJs> | null = null
function pdfjs(): Promise<PdfJs> {
  pdfjsPromise ??= import('pdfjs-dist/legacy/build/pdf.mjs')
  return pdfjsPromise
}

/** True when the file declares encryption (an owner or user password). */
export async function isEncryptedPdf(bytes: Uint8Array): Promise<boolean> {
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
    return doc.isEncrypted
  } catch {
    return false
  }
}

export async function parsePdf(bytes: Uint8Array): Promise<ParsedDocument> {
  let meta: PDFDocument
  try {
    meta = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
  } catch (e) {
    return {
      kind: 'unreadable',
      detail: `Not a readable PDF (${(e as Error).message.slice(0, 80)})`,
    }
  }
  if (meta.isEncrypted) return { kind: 'password_protected' }

  const lib = await pdfjs()
  const task = lib.getDocument({
    // pdfjs takes ownership of the buffer it is given.
    data: new Uint8Array(bytes),
    disableFontFace: true,
    isEvalSupported: false,
    useSystemFonts: false,
    verbosity: 0,
  })
  try {
    const doc = await task.promise
    const pages: PageText[] = []
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n)
      const viewport = page.getViewport({ scale: 1 })
      const content = await page.getTextContent()
      let text = ''
      const items: PdfTextItem[] = []
      for (const raw of content.items) {
        if (!('str' in raw)) continue
        const t = raw.transform as number[]
        const h = Math.abs(raw.height || t[3] || 0)
        const start = text.length
        text += raw.str
        items.push({
          str: raw.str,
          start,
          end: text.length,
          x: t[4] ?? 0,
          y: viewport.height - (t[5] ?? 0) - h,
          w: raw.width,
          h,
        })
        text += raw.hasEOL ? '\n' : ' '
      }
      pages.push({
        page: n,
        width: viewport.width,
        height: viewport.height,
        text: text.trimEnd(),
        items,
      })
      page.cleanup()
    }
    const chars = pages.reduce((s, p) => s + p.text.replace(/\s+/g, '').length, 0)
    return {
      kind: 'pdf',
      pageCount: doc.numPages,
      hasTextLayer: doc.numPages > 0 && chars / doc.numPages > MIN_CHARS_PER_PAGE,
      pages,
      encrypted: false,
      title: meta.getTitle() ?? null,
    }
  } catch (e) {
    const name = (e as Error).name
    if (name === 'PasswordException') return { kind: 'password_protected' }
    return { kind: 'unreadable', detail: `Could not read the PDF (${name})` }
  } finally {
    await task.destroy()
  }
}

export interface PdfChunk {
  /** 1-based page numbers of the original document this chunk covers. */
  pages: number[]
  bytes: Uint8Array
}

/**
 * Splits a long document into chunks of `pagesPerChunk` with `overlap` pages repeated, so a table that runs
 * across a boundary is seen whole by one call. Used for documents over 40 pages or over 20 MB.
 */
export async function chunkPdf(
  bytes: Uint8Array,
  { pagesPerChunk = 20, overlap = 1 }: { pagesPerChunk?: number; overlap?: number } = {}
): Promise<PdfChunk[]> {
  const src = await PDFDocument.load(bytes, { updateMetadata: false })
  const total = src.getPageCount()
  if (total <= pagesPerChunk) return [{ pages: range(1, total), bytes }]
  const out: PdfChunk[] = []
  for (let first = 0; first < total; first += pagesPerChunk - overlap) {
    const last = Math.min(total, first + pagesPerChunk)
    const doc = await PDFDocument.create()
    const idx = range(first, last - 1)
    for (const p of await doc.copyPages(src, idx)) doc.addPage(p)
    out.push({ pages: idx.map((i) => i + 1), bytes: await doc.save() })
    if (last === total) break
  }
  return out
}

/** Whether a PDF must be chunked before a model reads it. */
export function needsChunking(pageCount: number, sizeBytes: number): boolean {
  return pageCount > 40 || sizeBytes > 20 * 1024 * 1024
}

function range(from: number, to: number): number[] {
  const out: number[] = []
  for (let i = from; i <= to; i++) out.push(i)
  return out
}
