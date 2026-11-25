import 'server-only'
import type { Box } from '@indus/ops-core'
import { opsDb, type $Enums } from '@indus/ops-db'
import { parseEmail } from '../server/intake/parse/email'
import { parseStoredFile } from '../server/intake/parse/index'
import type { ParsedDocument } from '../server/intake/parse/types'
import {
  continueBlocker,
  hasQuestion,
  countsOf,
  detectRevision,
  type ReviewCounts,
  type RevisionHit,
} from '../server/intake/review'
import type { PageGeometry } from '../server/intake/span-view'

/**
 * Board 15 · Review extracted lines (S08-T04) and the board 17 states inside it. Reads: the batch with its files,
 * lines and the spans they stand on (one query with include, one for spans), then the active file parsed once to
 * draw it (a PDF from its text layer, a sheet grid, an email or Word text, an image by URL), and the revision check.
 */
export type LineTone = 'ok' | 'warn' | 'bad' | 'info'

export interface ReviewLine {
  id: string
  ord: number
  version: number
  description: string
  partNo: string | null
  qty: string | null
  qtyPrinted: string | null
  uom: string | null
  spec: string | null
  confidence: $Enums.Confidence
  label: 'High' | 'Check' | 'Low' | 'Duplicate'
  tone: LineTone
  /** The line under the row: the first reason (or the duplicate note). */
  note: string | null
  unsure: {
    field: string
    question: string
    options: Array<{ value: string; label: string; sub?: string }>
  } | null
  handwriting: { printed: string; handwritten: string } | null
  decision: string
  sourceKind: string | null
  duplicateOf: {
    id: string
    ord: number
    page: number | null
    partNo: string | null
    description: string
    qty: string | null
    uom: string | null
  } | null
  fileId: string | null
  page: number | null
  /** Span per field, for Why? (sp_<id>) and the page boxes. */
  spans: Record<string, string>
  box: Box | null
  cellRef: string | null
  sheet: string | null
  charRange: [number, number] | null
  decidedBy: string | null
}

export interface ReviewFile {
  id: string
  name: string
  kind: string
  status: $Enums.IntakeFileStatus
  failureKind: string | null
  failureNote: string | null
  progressNote: string | null
  storedFileId: string | null
  mimeType: string | null
  pageCount: number | null
}

export type SourcePaneData =
  | { kind: 'pdf'; name: string; pages: PageGeometry[]; scanned: boolean }
  | { kind: 'image'; name: string; url: string }
  | {
      kind: 'sheet'
      name: string
      sheets: Array<{
        name: string
        hidden: boolean
        rows: Array<{ r: number; cells: Array<{ c: string; v: string; formula?: boolean }> }>
      }>
    }
  | {
      kind: 'text'
      name: string
      text: string
      ignored: Array<{ start: number; end: number; label: string }>
    }
  | { kind: 'none'; name: string; note: string }

export interface ReviewModel {
  batch: {
    id: string
    status: $Enums.IntakeBatchStatus
    source: $Enums.IntakeSource
    clientRef: string | null
    mailMessageId: string | null
    revisionIntent: { kind: 'revision' | 'new'; ref: string | null } | null
    enquiryRef: string | null
  }
  files: ReviewFile[]
  active: ReviewFile | null
  source: SourcePaneData
  lines: ReviewLine[]
  counts: ReviewCounts
  legend: { high: number; check: number; low: number; duplicate: number }
  blocker: string | null
  revision: RevisionHit | null
  /** Files still being read: Continue waits for them. */
  reading: number
}

const PDF_PAGE_LIMIT = 40

function toneOf(c: {
  confidence: $Enums.Confidence
  duplicateOfId: string | null
}): Pick<ReviewLine, 'label' | 'tone'> {
  if (c.duplicateOfId) return { label: 'Duplicate', tone: 'info' }
  if (c.confidence === 'sure') return { label: 'High', tone: 'ok' }
  if (c.confidence === 'likely') return { label: 'Check', tone: 'warn' }
  return { label: 'Low', tone: 'bad' }
}

/** "Quantity is handwritten: 8 or 10?" or a printed/handwritten doubt → the two readings board 17 offers. */
export function handwritingOf(
  unsure: ReviewLine['unsure'],
  qtyPrinted: string | null,
  reasons: string[]
): ReviewLine['handwriting'] {
  const text = [unsure?.question ?? '', ...reasons].join(' ')
  if (!/handwrit|crossed|struck/i.test(text)) return null
  const nums = [...(unsure?.question ?? '').matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => m[0])
  const printed = nums[0] ?? qtyPrinted ?? ''
  const handwritten = nums[1] ?? ''
  return printed && handwritten ? { printed, handwritten } : null
}

async function sourceOf(
  file: ReviewFile | null,
  mail: { bodyText: string | null; bodyTextHash: string | null; subject: string | null } | null
): Promise<{ pane: SourcePaneData; doc: ParsedDocument | null }> {
  if (!file)
    return { pane: { kind: 'none', name: '', note: 'No file in this intake yet.' }, doc: null }
  if (file.kind === 'email') {
    if (!mail)
      return {
        pane: { kind: 'none', name: file.name, note: 'The email is no longer stored.' },
        doc: null,
      }
    const doc = parseEmail(mail)
    if (doc.kind !== 'email')
      return { pane: { kind: 'none', name: file.name, note: 'The email has no text.' }, doc: null }
    return {
      pane: {
        kind: 'text',
        name: file.name,
        text: doc.text,
        ignored: doc.segments
          .filter((s) => s.kind === 'quoted_reply' || s.kind === 'signature')
          .map((s) => ({
            start: s.start,
            end: s.end,
            label: s.kind === 'signature' ? 'Signature' : 'Ignored · earlier reply',
          })),
      },
      doc,
    }
  }
  if (!file.storedFileId)
    return { pane: { kind: 'none', name: file.name, note: 'The file is missing.' }, doc: null }
  if (file.mimeType?.startsWith('image/'))
    return {
      pane: { kind: 'image', name: file.name, url: `/api/files/${file.storedFileId}` },
      doc: null,
    }
  const stored = await opsDb.storedFile.findUnique({
    where: { id: file.storedFileId },
    select: { bucket: true, path: true, filename: true },
  })
  if (!stored)
    return { pane: { kind: 'none', name: file.name, note: 'The file is missing.' }, doc: null }
  const doc = await parseStoredFile(stored)
  switch (doc.kind) {
    case 'pdf':
      return {
        pane: {
          kind: 'pdf',
          name: file.name,
          scanned: !doc.hasTextLayer,
          pages: doc.pages.slice(0, PDF_PAGE_LIMIT).map((p) => ({
            page: p.page,
            width: p.width,
            height: p.height,
            items: p.items.map((i) => ({ x: i.x, y: i.y, w: i.w, h: i.h, str: i.str })),
            box: null,
            scanned: !doc.hasTextLayer,
          })),
        },
        doc,
      }
    case 'sheet':
      return {
        pane: {
          kind: 'sheet',
          name: file.name,
          sheets: doc.grid.sheets.map((s) => ({
            name: s.name,
            hidden: s.hidden,
            rows: s.rows.slice(0, 600).map((r) => ({
              r: r.r,
              cells: r.cells.map((c) => ({
                c: c.c,
                v: c.v,
                ...(c.formula ? { formula: true } : {}),
              })),
            })),
          })),
        },
        doc,
      }
    case 'docx':
      return { pane: { kind: 'text', name: file.name, text: doc.text, ignored: [] }, doc }
    case 'email':
      return { pane: { kind: 'text', name: file.name, text: doc.text, ignored: [] }, doc }
    default:
      return {
        pane: {
          kind: 'none',
          name: file.name,
          note: 'detail' in doc ? doc.detail : 'This file could not be drawn.',
        },
        doc,
      }
  }
}

export async function getReview(
  batchId: string,
  fileId: string | null
): Promise<ReviewModel | null> {
  const b = await opsDb.intakeBatch.findUnique({
    where: { id: batchId },
    select: {
      id: true,
      status: true,
      source: true,
      clientRef: true,
      mailMessageId: true,
      revisionIntent: true,
      enquiry: { select: { ref: true } },
      mailMessage: { select: { bodyText: true, bodyTextHash: true, subject: true } },
      files: {
        where: { status: { not: 'removed' }, kind: { not: 'zip' } },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          filename: true,
          kind: true,
          status: true,
          failureKind: true,
          failureNote: true,
          progressNote: true,
          storedFileId: true,
          pageCount: true,
          storedFile: { select: { mimeType: true } },
        },
      },
      candidates: {
        where: { decision: { notIn: ['removed', 'merged'] } },
        orderBy: { ord: 'asc' },
        select: {
          id: true,
          ord: true,
          version: true,
          fileId: true,
          description: true,
          partNo: true,
          qty: true,
          qtyPrinted: true,
          uom: true,
          spec: true,
          confidence: true,
          reasons: true,
          unsure: true,
          decision: true,
          duplicateOfId: true,
          fieldSpans: true,
          spanIds: true,
          sourcePage: true,
          sourceKind: true,
          decidedById: true,
        },
      },
    },
  })
  if (!b) return null
  const files: ReviewFile[] = b.files.map((f) => ({
    id: f.id,
    name: f.filename,
    kind: f.kind,
    status: f.status,
    failureKind: f.failureKind,
    failureNote: f.failureNote,
    progressNote: f.progressNote,
    storedFileId: f.storedFileId,
    mimeType: f.storedFile?.mimeType ?? null,
    pageCount: f.pageCount,
  }))
  const active =
    files.find((f) => f.id === fileId) ??
    files.find((f) => f.status === 'ready') ??
    files[0] ??
    null
  const spanIds = [...new Set(b.candidates.flatMap((c) => c.spanIds))]
  const [spans, users, { pane }] = await Promise.all([
    spanIds.length
      ? opsDb.sourceSpan.findMany({
          where: { id: { in: spanIds } },
          select: {
            id: true,
            page: true,
            bbox: true,
            cellRef: true,
            sheet: true,
            charStart: true,
            charEnd: true,
            resolved: true,
          },
        })
      : Promise.resolve([]),
    opsDb.user.findMany({ select: { id: true, initials: true } }),
    sourceOf(active, b.mailMessage),
  ])
  const spanById = new Map(spans.map((s) => [s.id, s]))
  const who = new Map(users.map((u) => [u.id, u.initials]))
  const byId = new Map(b.candidates.map((c) => [c.id, c]))
  const lines: ReviewLine[] = b.candidates.map((c) => {
    const fieldSpans = (c.fieldSpans as Record<string, string> | null) ?? {}
    const main = spanById.get(fieldSpans.description ?? '') ?? spanById.get(c.spanIds[0] ?? '')
    const all = c.spanIds
      .map((id) => spanById.get(id))
      .filter((s): s is NonNullable<typeof s> => !!s && s.page === main?.page)
    const boxes = all.map((s) => s.bbox as Box | null).filter((x): x is Box => !!x)
    const box = boxes.length
      ? (() => {
          const x0 = Math.min(...boxes.map((x) => x.x))
          const y0 = Math.min(...boxes.map((x) => x.y))
          const x1 = Math.max(...boxes.map((x) => x.x + x.w))
          const y1 = Math.max(...boxes.map((x) => x.y + x.h))
          return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
        })()
      : null
    const reasons = ((c.reasons as string[] | null) ?? []).filter(
      (r) => !/^(Decided|Typed) by /.test(r)
    )
    const unsure = hasQuestion(c.unsure) ? (c.unsure as ReviewLine['unsure']) : null
    const dup = c.duplicateOfId ? byId.get(c.duplicateOfId) : undefined
    const decidedBy =
      ((c.reasons as string[] | null) ?? []).find((r) => /^(Decided|Typed) by /.test(r)) ??
      (c.decidedById ? `Decided by ${who.get(c.decidedById) ?? '?'}` : null)
    return {
      id: c.id,
      ord: c.ord,
      version: c.version,
      description: c.description,
      partNo: c.partNo,
      qty: c.qty ? c.qty.toString() : null,
      qtyPrinted: c.qtyPrinted,
      uom: c.uom,
      spec: c.spec,
      confidence: c.confidence,
      ...toneOf(c),
      note: dup
        ? `Same as line ${dup.ord}${dup.sourcePage ? ` · page ${dup.sourcePage}` : ''}`
        : c.decision === 'pending' && c.confidence !== 'sure'
          ? (reasons[0] ?? unsure?.question ?? null)
          : null,
      unsure: c.decision === 'pending' || unsure ? unsure : null,
      handwriting: unsure ? handwritingOf(unsure, c.qtyPrinted, reasons) : null,
      decision: c.decision,
      sourceKind: c.sourceKind,
      duplicateOf: dup
        ? {
            id: dup.id,
            ord: dup.ord,
            page: dup.sourcePage,
            partNo: dup.partNo,
            description: dup.description,
            qty: dup.qty?.toString() ?? null,
            uom: dup.uom,
          }
        : null,
      fileId: c.fileId,
      page: main?.page ?? c.sourcePage,
      spans: fieldSpans,
      box,
      cellRef: main?.cellRef ?? null,
      sheet: main?.sheet ?? null,
      charRange:
        main && main.charStart !== null && main.charEnd !== null
          ? [main.charStart, main.charEnd]
          : null,
      decidedBy: c.decision === 'pending' ? null : decidedBy,
    }
  })
  const counts = countsOf(b.candidates)
  const reading = files.filter((f) => f.status === 'queued' || f.status === 'extracting').length
  const live = lines
  const intent = b.revisionIntent as { kind: 'revision' | 'new'; ref: string | null } | null
  return {
    batch: {
      id: b.id,
      status: b.status,
      source: b.source,
      clientRef: b.clientRef,
      mailMessageId: b.mailMessageId,
      revisionIntent: intent ? { kind: intent.kind, ref: intent.ref ?? null } : null,
      enquiryRef: b.enquiry?.ref ?? null,
    },
    files,
    active,
    source: pane,
    lines,
    counts,
    legend: {
      high: live.filter((l) => l.label === 'High').length,
      check: live.filter((l) => l.label === 'Check').length,
      low: live.filter((l) => l.label === 'Low').length,
      duplicate: live.filter((l) => l.label === 'Duplicate').length,
    },
    blocker: reading ? 'A file is still being read.' : continueBlocker(counts),
    revision: b.status === 'open' && !intent ? await detectRevision(b.id) : null,
    reading,
  }
}
