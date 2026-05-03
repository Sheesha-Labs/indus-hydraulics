import { db } from '@indus/db'

/**
 * Next quote number in the INDUS/Q{N} sequence.
 *
 * Picks up where the customer's existing Zoho quotes left off (Q26386 was
 * the most recent at migration time, so first quote we issue is Q26387).
 * If you ever import Zoho history into the Quote table, set BASE = 0.
 *
 * Race-condition note: not atomic. Two concurrent sends could pick the same
 * number. Acceptable for current volume; revisit with a Postgres sequence
 * if multiple engineers ever issue quotes simultaneously.
 */
const ZOHO_BASE = 26386

export type NewQuoteCode =
  | { kind: 'new'; code: string; revision: 1 }
  | { kind: 'revision'; code: string; revision: number; ofCode: string }

export async function nextQuoteCodeForRfq(rfqId: string): Promise<NewQuoteCode> {
  const previous = await db.quote.findMany({
    where: { rfqId },
    select: { code: true, revision: true },
    orderBy: { revision: 'desc' },
    take: 1,
  })

  if (previous.length > 0) {
    const last = previous[0]!
    const baseCode = last.code.replace(/-R\d+$/, '')
    const nextRev = last.revision + 1
    return { kind: 'revision', code: `${baseCode}-R${nextRev}`, revision: nextRev, ofCode: last.code }
  }

  const total = await db.quote.count()
  const n = ZOHO_BASE + total + 1
  return { kind: 'new', code: `INDUS/Q${n}`, revision: 1 }
}

/**
 * Filename-safe slug for storage path: "INDUS/Q26387" -> "INDUS-Q26387".
 */
export function quoteCodeToSlug(code: string): string {
  return code.replace(/[^A-Za-z0-9_-]+/g, '-')
}
