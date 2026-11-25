import 'server-only'
import type { SourceSpanDraft, SpanSource } from '@indus/ops-ai'
import { opsDb, Prisma } from '@indus/ops-db'
import type { ParsedDocument } from './parse/types'

/**
 * Intake spans (S08-T01, ADR-12). The parsed document becomes the resolver's source shape, and resolved drafts
 * are saved in one createMany. `source_span` is append-only for ops_app (no UPDATE grant): a corrected value
 * gets a new span, never an edited one.
 */
type Db = Pick<Prisma.TransactionClient, 'sourceSpan'>

/** The resolver's view of a parsed file. Null for kinds that hold no evidence (zip, unsupported …). */
export function spanSourceOf(doc: ParsedDocument, sourceId: string): SpanSource | null {
  switch (doc.kind) {
    case 'pdf':
      return { kind: 'pdf', sourceId, hasTextLayer: doc.hasTextLayer, pages: doc.pages }
    case 'sheet':
      return { kind: 'sheet', sourceId, sheets: doc.grid.sheets }
    case 'docx':
      return { kind: 'docx', sourceId, text: doc.text }
    case 'image':
      return { kind: 'image', sourceId }
    case 'email':
      return { kind: 'email', sourceId, text: doc.text, textHash: doc.textHash }
    default:
      return null
  }
}

/** Saves drafts and returns their ids in input order. */
export async function saveSpans(
  drafts: readonly SourceSpanDraft[],
  db: Db = opsDb
): Promise<string[]> {
  if (!drafts.length) return []
  const rows = await db.sourceSpan.createManyAndReturn({
    data: drafts.map((d) => ({
      sourceKind: d.sourceKind,
      sourceId: d.sourceId,
      page: d.page,
      sheet: d.sheet,
      cellRef: d.cellRef,
      charStart: d.charStart,
      charEnd: d.charEnd,
      bbox: d.bbox ? (d.bbox as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      quote: d.quote,
      resolved: d.resolved,
      textHash: d.textHash,
    })),
    select: { id: true },
  })
  return rows.map((r) => r.id)
}
