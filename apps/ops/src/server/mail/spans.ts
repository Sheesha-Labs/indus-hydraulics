import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { locateQuote } from '@indus/ops-core'

/**
 * Email source spans (S05-T04, ADR-12): each verbatim quote a model cited is resolved against the stored
 * body text and saved as an `ops.source_span`. Why? (S06) highlights resolved spans; an unresolved quote is
 * stored too (so the log shows what the model claimed) but its reason is dropped from the proposal.
 */
export interface ResolvedQuote {
  quote: string
  spanId: string
  resolved: 'exact' | 'fuzzy' | 'unresolved'
}

type Db = Pick<Prisma.TransactionClient, 'sourceSpan'>

/** Pure part, for verify: which quotes resolve against `text`. */
export function resolveQuotes(text: string, quotes: readonly string[]) {
  return quotes.map((quote) => ({ quote, ...locateQuote(text, quote) }))
}

/** Writes one span per quote for a message and returns their ids, in input order. */
export async function saveEmailSpans(
  messageId: string,
  textHash: string | null,
  text: string,
  quotes: readonly string[],
  db: Db = opsDb
): Promise<ResolvedQuote[]> {
  const out: ResolvedQuote[] = []
  for (const r of resolveQuotes(text, quotes)) {
    const row = await db.sourceSpan.create({
      data: {
        sourceKind: 'email',
        sourceId: messageId,
        textHash,
        quote: r.quote.slice(0, 2_000),
        resolved: r.resolved,
        ...(r.resolved === 'unresolved' ? {} : { charStart: r.charStart, charEnd: r.charEnd }),
      },
      select: { id: true },
    })
    out.push({ quote: r.quote, spanId: row.id, resolved: r.resolved })
  }
  return out
}
