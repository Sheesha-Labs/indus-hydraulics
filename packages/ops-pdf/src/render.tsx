import { documentNumber, paginate, type DocumentData, type Letterhead } from '@indus/ops-core'
import { Document, renderToBuffer } from '@react-pdf/renderer'
import { registerFonts } from './fonts'
import EstimateLayout from './layouts/EstimateLayout'
import HouseLayout from './layouts/HouseLayout'
import type { PdfAssets } from './parts'

/**
 * DocumentData → PDF bytes (S11-T02, ADR-14, C2). Render only: no database, no storage, no network. The
 * caller resolves the letterhead (Settings › Company) and its images (logo, signature, stamp from the
 * ops-company bucket) and stores the result (the documents service, S11-T04).
 *
 * Metadata carries the document number and title and Indus's legal name only: never a client or supplier
 * name (a supplier document's file must not name the client, and the reverse).
 */
export interface RenderOptions {
  /** "DRAFT" across every page: previews only, never an issued document. */
  draft?: boolean
}

export function pdfTitle(data: DocumentData): string {
  const no = data.layout === 'estimate' ? documentNumber(data.no, data.revision) : data.no
  return `${no} · ${data.title}`
}

export async function renderDocumentPdf(
  data: DocumentData,
  letterhead: Letterhead,
  assets: PdfAssets = {},
  opts: RenderOptions = {}
): Promise<Uint8Array> {
  registerFonts()
  const draft = opts.draft ?? false
  // Explicit pages from the shared pagination: the screen draws the same pages (S11-T03).
  const pages =
    data.layout === 'estimate'
      ? paginate(data).map((p) => (
          <EstimateLayout
            key={p.page}
            page={p}
            letterhead={letterhead}
            assets={assets}
            draft={draft}
          />
        ))
      : paginate(data).map((p) => (
          <HouseLayout
            key={p.page}
            page={p}
            letterhead={letterhead}
            assets={assets}
            draft={draft}
          />
        ))
  const buffer = await renderToBuffer(
    <Document
      title={pdfTitle(data)}
      author={letterhead.legalName}
      subject=""
      keywords=""
      creator="Indus Operations"
      producer="Indus Operations"
      language="en"
    >
      {pages}
    </Document>
  )
  return new Uint8Array(buffer)
}
