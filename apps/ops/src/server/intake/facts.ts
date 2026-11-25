import 'server-only'
import type { Prisma } from '@indus/ops-db'
import { dubaiEndOfDay } from '@indus/ops-core'

/**
 * Document-level facts an extraction found (client ref, closing date, terms), written onto the batch only where
 * the batch has none yet: a person's value, or an earlier file's, is never overwritten by a later file.
 */
export interface BatchFacts {
  clientRef: string | null
  deadline: { date: string; ambiguous: boolean; quote: string } | null
  terms: Record<string, { text: string; quote: string }> | null
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
  if (facts.terms) {
    const merged = { ...facts.terms, ...((b.terms as Record<string, unknown> | null) ?? {}) }
    if (facts.deadline)
      merged.closingDate = {
        text: facts.deadline.date,
        quote: facts.deadline.quote,
        ambiguous: facts.deadline.ambiguous,
      }
    data.terms = merged as Prisma.InputJsonValue
  }
  if (Object.keys(data).length)
    await tx.intakeBatch.update({
      where: { id: batchId },
      data: { ...data, version: { increment: 1 } },
    })
}
