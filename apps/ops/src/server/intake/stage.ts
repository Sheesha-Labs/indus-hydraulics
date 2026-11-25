import 'server-only'
import { Prisma } from '@indus/ops-db'
import type { CandidateDraft } from './candidates'
import { saveSpans } from './spans'

/**
 * Writes an extraction's candidates into staging (S08-T02/T03). Idempotent per file: a replayed step finds the
 * candidates already there and writes nothing. Spans first (one createMany), then the candidates with the span ids
 * they stand on, then the file's counts. Never touches enquiry_line.
 */
export interface StageInput {
  batchId: string
  fileId: string | null
  actionId: string | null
  drafts: readonly CandidateDraft[]
}

export async function stageCandidates(
  tx: Prisma.TransactionClient,
  i: StageInput
): Promise<{ created: number; toCheck: number }> {
  if (i.fileId) {
    const already = await tx.intakeLineCandidate.count({ where: { fileId: i.fileId } })
    if (already) return { created: 0, toCheck: 0 }
  }
  const last = await tx.intakeLineCandidate.aggregate({
    where: { batchId: i.batchId },
    _max: { ord: true },
  })
  const base = last._max.ord ?? 0
  const all = i.drafts.flatMap((d) => d.spans)
  const ids = await saveSpans(all, tx)
  let at = 0
  const rows = i.drafts.map((d, k) => {
    const mine = ids.slice(at, at + d.spans.length)
    const fieldSpans: Record<string, string> = {}
    d.spans.forEach((s, j) => {
      if (!fieldSpans[s.field] || s.resolved === 'exact') fieldSpans[s.field] = mine[j]!
    })
    at += d.spans.length
    return {
      batchId: i.batchId,
      fileId: i.fileId,
      ord: base + k + 1,
      description: d.description,
      qty: d.qty === null ? null : new Prisma.Decimal(d.qty),
      qtyPrinted: d.qtyPrinted,
      uom: d.uom,
      uomRaw: d.uomRaw,
      uomMethod: d.uomMethod,
      partNo: d.partNo,
      partNoNorm: d.partNoNorm,
      make: d.make,
      spec: d.spec,
      certification: d.certification,
      clientRef: d.clientRef,
      notes: d.notes,
      confidence: d.confidence,
      reasons: d.reasons as Prisma.InputJsonValue,
      unsure: d.unsure ? (d.unsure as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      partId: d.partId,
      partMatch: d.partMatch,
      catalogueProductId: d.catalogueProductId,
      spanIds: mine,
      fieldSpans: fieldSpans as Prisma.InputJsonValue,
      sourcePage: d.sourcePage,
      sourceKind: d.sourceKind,
      sourceDetail: d.sourceDetail,
    }
  })
  if (rows.length) await tx.intakeLineCandidate.createMany({ data: rows })
  const toCheck = i.drafts.filter((d) => d.confidence !== 'sure').length
  if (i.fileId)
    await tx.intakeFile.update({
      where: { id: i.fileId },
      data: {
        status: 'ready',
        progressPct: 100,
        progressNote: null,
        linesFound: rows.length,
        linesToCheck: toCheck,
        ...(i.actionId ? { actionId: i.actionId } : {}),
      },
    })
  return { created: rows.length, toCheck }
}
