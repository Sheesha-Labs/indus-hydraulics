import 'server-only'
import type { Prisma } from '@indus/ops-db'
import { dubaiEndOfDay } from '@indus/ops-core'

/**
 * Document-level facts an extraction found (client ref, closing date, terms), written onto the batch only where
 * the batch has none yet: a person's value, or an earlier file's, is never overwritten by a later file.
 */
export interface BatchFacts {
  clientRef: string | null
  deadline: { date: string; ambiguous: boolean; quote: string; page?: number | null } | null
  terms: Record<string, { text: string; quote: string }> | null
  /** v2 (S09-T04): the enquiring company as printed on its letterhead, stamp or signature. */
  issuer?: { name: string; quote: string; page: number | null } | null
}

export async function applyBatchFacts(
  tx: Prisma.TransactionClient,
  batchId: string,
  facts: BatchFacts
): Promise<void> {
  const b = await tx.intakeBatch.findUniqueOrThrow({
    where: { id: batchId },
    select: { clientRef: true, deadline: true, terms: true },
  })
  const data: Prisma.IntakeBatchUpdateInput = {}
  if (!b.clientRef && facts.clientRef) data.clientRef = facts.clientRef
  if (!b.deadline && facts.deadline && !facts.deadline.ambiguous)
    data.deadline = dubaiEndOfDay(facts.deadline.date)
  // Terms, the closing date's evidence and the issuer ride in `terms`; an earlier value is kept.
  if (facts.terms || facts.deadline || facts.issuer) {
    const prior = (b.terms as Record<string, unknown> | null) ?? {}
    const merged: Record<string, unknown> = { ...(facts.terms ?? {}), ...prior }
    if (facts.deadline && !prior.closingDate)
      merged.closingDate = {
        text: facts.deadline.date,
        quote: facts.deadline.quote,
        ambiguous: facts.deadline.ambiguous,
        page: facts.deadline.page ?? null,
      }
    if (facts.issuer && !prior.issuer)
      merged.issuer = {
        text: facts.issuer.name,
        quote: facts.issuer.quote,
        page: facts.issuer.page,
      }
    data.terms = merged as Prisma.InputJsonValue
  }
  if (Object.keys(data).length)
    await tx.intakeBatch.update({
      where: { id: batchId },
      data: { ...data, version: { increment: 1 } },
    })
}
