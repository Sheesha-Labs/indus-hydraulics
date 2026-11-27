import 'server-only'
import {
  computeSupplierStats,
  RELIABILITY_MIN_REPLIES,
  statsMovedMaterially,
  type SupplierStats,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'

/**
 * The nightly supplier figures (S10-T03, ops.supplier.stats): pages of 200 suppliers, one read query per page (the
 * rows each figure needs, as JSON per supplier) and one update transaction per page. A supplier whose figures moved
 * materially (reply rate ±10 points, median ±24 h, a new PO) and who has 3 or more replies is returned so the job
 * can ask for a fresh reliability paragraph.
 *
 * On-time POs (decision): the PO has no delivered-at column yet (S24/S26 add the receipt), so "on time" is a PO at
 * ready or later whose current ready date is on or before the promised one.
 */
export const STATS_PAGE = 200

interface Row {
  id: string
  before: {
    replyRatePct: string | null
    medianReplyHours: string | null
    posCount: number
    repliesCount: number
  }
  recipients: Array<{ sentAt: string | null; repliedAt: string | null; status: string }> | null
  quotes: Array<{ receivedAt: string; linesAsked: number; linesQuoted: number }> | null
  quoteLines: number
  selectedOnWon: number
  pos: Array<{ promised: string | null; current: string | null; status: string }> | null
}

const DONE = new Set(['ready', 'inspected', 'shipped', 'delivered', 'invoiced', 'closed'])
const d = (s: string | null) => (s ? new Date(s) : null)

export interface StatsPageResult {
  processed: number
  nextCursor: string | null
  summarise: string[]
}

/** One page after `cursor` (a supplier id; '' for the first page). */
export async function refreshSupplierStatsPage(
  cursor: string,
  now = new Date()
): Promise<StatsPageResult> {
  const rows = await opsDb.$queryRaw<Row[]>(Prisma.sql`
    SELECT c.id,
           json_build_object('replyRatePct', sp."replyRatePct", 'medianReplyHours', sp."medianReplyHours",
                             'posCount', sp."posCount", 'repliesCount', sp."repliesCount") AS before,
           (SELECT json_agg(json_build_object('sentAt', r."sentAt", 'repliedAt', r."repliedAt", 'status', r.status))
              FROM ops.supplier_rfq_recipient r WHERE r."supplierId" = c.id) AS recipients,
           (SELECT json_agg(json_build_object(
                     'receivedAt', q."receivedAt",
                     'linesQuoted', (SELECT count(*) FROM ops.supplier_quote_line l WHERE l."quoteId" = q.id),
                     'linesAsked', coalesce((SELECT count(*) FROM ops.supplier_rfq_line rl WHERE rl."rfqId" = q."rfqId"), 0)))
              FROM ops.supplier_quote q
             WHERE q."supplierId" = c.id AND q.status NOT IN ('rejected', 'duplicate', 'superseded')) AS quotes,
           (SELECT count(*)::int FROM ops.supplier_quote_line l JOIN ops.supplier_quote q ON q.id = l."quoteId"
             WHERE q."supplierId" = c.id AND q.status NOT IN ('rejected', 'duplicate', 'superseded')) AS "quoteLines",
           (SELECT count(*)::int FROM ops.enquiry_line el
              JOIN ops.supplier_quote_line l ON l.id = el."selectedQuoteLineId"
              JOIN ops.supplier_quote q ON q.id = l."quoteId"
              JOIN ops.enquiry e ON e.id = el."enquiryId"
             WHERE q."supplierId" = c.id AND e.stage = 'won') AS "selectedOnWon",
           (SELECT json_agg(json_build_object('promised', p."readyDatePromised", 'current', p."readyDateCurrent",
                                              'status', p.status))
              FROM ops.supplier_po p WHERE p."supplierId" = c.id) AS pos
      FROM ops.company c
      JOIN ops.supplier_profile sp ON sp."companyId" = c.id
     WHERE c."mergedIntoId" IS NULL AND c."archivedAt" IS NULL
       AND (${cursor} = '' OR c.id > ${cursor || '00000000-0000-0000-0000-000000000000'}::uuid)
     ORDER BY c.id
     LIMIT ${STATS_PAGE}`)

  const computed: Array<{ id: string; s: SupplierStats; moved: boolean }> = rows.map((r) => {
    const s = computeSupplierStats({
      recipients: (r.recipients ?? []).map((x) => ({
        sentAt: d(x.sentAt),
        repliedAt: d(x.repliedAt),
        status: x.status,
      })),
      quotes: (r.quotes ?? []).map((q) => ({
        receivedAt: new Date(q.receivedAt),
        linesAsked: Number(q.linesAsked),
        linesQuoted: Number(q.linesQuoted),
      })),
      quoteLines: r.quoteLines,
      selectedOnWon: r.selectedOnWon,
      pos: (r.pos ?? []).map((p) => ({
        promisedDate: d(p.promised),
        deliveredAt: DONE.has(p.status) ? d(p.current) : null,
        status: p.status,
      })),
    })
    const before = {
      replyRatePct: r.before.replyRatePct === null ? null : Number(r.before.replyRatePct),
      medianReplyHours:
        r.before.medianReplyHours === null ? null : Number(r.before.medianReplyHours),
      posCount: r.before.posCount,
    }
    return { id: r.id, s, moved: statsMovedMaterially(before, s) }
  })

  if (computed.length)
    await opsDb.$transaction(
      computed.map(({ id, s }) =>
        opsDb.supplierProfile.update({
          where: { companyId: id },
          data: {
            rfqsAsked: s.rfqsAsked,
            repliesCount: s.replies,
            quotesCount: s.quotes,
            regretsCount: s.regrets,
            replyRatePct: s.replyRatePct,
            medianReplyHours: s.medianReplyHours,
            linesQuotedPct: s.linesQuotedPct,
            winSharePct: s.winSharePct,
            onTimePct: s.onTimePct,
            posCount: s.posCount,
            lastQuoteAt: s.lastQuoteAt,
            reliabilityAt: now,
          },
        })
      )
    )

  return {
    processed: computed.length,
    nextCursor: computed.length === STATS_PAGE ? computed[computed.length - 1]!.id : null,
    summarise: computed
      .filter((c) => c.moved && c.s.replies >= RELIABILITY_MIN_REPLIES)
      .map((c) => c.id),
  }
}
