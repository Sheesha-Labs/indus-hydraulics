import 'server-only'
import { sourceWindow, type Box } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { parseStoredFile } from './parse/index'
import type { ParsedDocument } from './parse/types'

/**
 * What Why? and board 15 draw for a span in a stored file (S08-T04): the PDF page with the span's box, the sheet
 * rows around the cited cell, the Word text around the quote, or the image. One query for the files, one parse per
 * file, however many spans point into it.
 */
export interface PageGeometry {
  page: number
  width: number
  height: number
  items: Array<{ x: number; y: number; w: number; h: number; str: string }>
  box: Box | null
  scanned: boolean
}

export interface SheetWindow {
  name: string
  cell: string | null
  rows: Array<{ r: number; cells: Array<{ c: string; v: string }> }>
}

export interface FileSpanContext {
  fileName: string
  fileId: string
  kind: 'pdf' | 'sheet' | 'docx' | 'image' | 'email' | 'other'
  page?: PageGeometry
  sheet?: SheetWindow
  text?: { text: string; match: string; matchAt: number; paragraph: number }
  imageUrl?: string
}

export interface SpanRow {
  id: string
  sourceKind: string
  sourceId: string
  page: number | null
  sheet: string | null
  cellRef: string | null
  charStart: number | null
  charEnd: number | null
  bbox: unknown
  quote: string
  resolved: string
}

export function pageGeometry(
  doc: Extract<ParsedDocument, { kind: 'pdf' }>,
  n: number,
  box: Box | null
): PageGeometry | null {
  const p = doc.pages.find((x) => x.page === n)
  if (!p) return null
  return {
    page: n,
    width: p.width,
    height: p.height,
    items: p.items.map((i) => ({ x: i.x, y: i.y, w: i.w, h: i.h, str: i.str })),
    box,
    scanned: !doc.hasTextLayer,
  }
}

export function sheetWindow(
  doc: Extract<ParsedDocument, { kind: 'sheet' }>,
  sheet: string | null,
  cell: string | null,
  radius = 4
): SheetWindow | null {
  const s = doc.grid.sheets.find((x) => x.name === sheet) ?? doc.grid.sheets[0]
  if (!s) return null
  const r = cell ? Number(cell.replace(/^[A-Z]+/, '')) : (s.rows[0]?.r ?? 1)
  return { name: s.name, cell, rows: s.rows.filter((row) => Math.abs(row.r - r) <= radius) }
}

function asBox(v: unknown): Box | null {
  const b = v as Partial<Box> | null
  return b &&
    typeof b.x === 'number' &&
    typeof b.y === 'number' &&
    typeof b.w === 'number' &&
    typeof b.h === 'number'
    ? { x: b.x, y: b.y, w: b.w, h: b.h }
    : null
}

/** Contexts for spans in stored files (email spans are drawn from the message, not here). */
export async function fileSpanContexts(
  spans: readonly SpanRow[]
): Promise<Map<string, FileSpanContext>> {
  const out = new Map<string, FileSpanContext>()
  const fileSpans = spans.filter((s) => s.sourceKind !== 'email')
  if (!fileSpans.length) return out
  const files = await opsDb.storedFile.findMany({
    where: { id: { in: [...new Set(fileSpans.map((s) => s.sourceId))] }, purgedAt: null },
    select: { id: true, bucket: true, path: true, filename: true },
  })
  for (const f of files) {
    let doc: ParsedDocument
    try {
      doc = await parseStoredFile(f)
    } catch {
      continue
    }
    for (const s of fileSpans.filter((x) => x.sourceId === f.id)) {
      const base = { fileName: f.filename, fileId: f.id }
      if (doc.kind === 'pdf') {
        const g = pageGeometry(doc, s.page ?? 1, asBox(s.bbox))
        out.set(s.id, { ...base, kind: 'pdf', ...(g ? { page: g } : {}) })
      } else if (doc.kind === 'sheet') {
        const w = sheetWindow(doc, s.sheet, s.cellRef)
        out.set(s.id, { ...base, kind: 'sheet', ...(w ? { sheet: w } : {}) })
      } else if (doc.kind === 'docx' || doc.kind === 'email') {
        const w =
          s.charStart !== null && s.charEnd !== null
            ? sourceWindow(doc.text, s.charStart, s.charEnd)
            : null
        out.set(s.id, { ...base, kind: doc.kind, ...(w ? { text: w } : {}) })
      } else if (doc.kind === 'image') {
        out.set(s.id, { ...base, kind: 'image', imageUrl: `/api/files/${f.id}` })
      } else out.set(s.id, { ...base, kind: 'other' })
    }
  }
  return out
}
