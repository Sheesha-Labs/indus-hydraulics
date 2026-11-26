import 'server-only'
import {
  C38_FALLBACK_PCT,
  estimateSnapshot,
  supplierShortCode,
  type EstimateLine,
  type EstimateSnapshot,
  type LandedComponent,
  type LineStatus,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import type { OpsUser } from '../lib/access'
import { cache } from 'react'
import { getSetting } from '../server/settings/get'
import { qualificationView, type QualificationView } from './qualification'

/**
 * Board 05 · Enquiry Overview (S09-T03). Two reads: (1) the enquiry's lines with where each was sent, its
 * selected quote line and current landed cost, the RFQs and their recipients; (2) the last 20 activity events
 * with the actor's initials. Settings (margin and landed fallbacks) come from the settings cache.
 *
 * The data layer masks (CLAUDE.md §4.5): a Helper without canSeeMargins gets no cost, no best cost and no
 * estimate, whatever the component would do.
 */

export type LineChip =
  | 'Unallocated'
  | 'Awaiting'
  | 'Quoted'
  | 'On hold'
  | 'No source'
  | 'To follow'
  | 'Not quoted'
  | 'Regretted'
  | 'Cancelled'

export interface OverviewLine {
  id: string
  no: number
  clientPartNo: string | null
  description: string
  qty: string
  uom: string
  status: LineStatus
  chip: LineChip
  /** "Quoted · 2" shows the count. */
  quotedBy: number
  sentTo: string[]
  /** "$1,690 · ROT" (unit price in the quote currency and the supplier) — null when masked or unpriced. */
  bestCost: string | null
  confidence: 'sure' | 'likely' | 'unsure' | null
}

export interface OverviewRfq {
  ref: string
  lines: number
  /** Quoted when every live recipient quoted; Partial when some did; else the RFQ's own state. */
  status: 'Quoted' | 'Partial' | 'Sent' | 'Drafted' | 'Closed' | 'Withdrawn'
}

export interface OverviewActivity {
  id: string
  at: Date
  actor: 'assistant' | 'person' | 'system'
  initials: string | null
  text: string
  actionId: string | null
}

export interface EnquiryOverview {
  id: string
  ref: string
  version: number
  stage: string
  title: string
  clientRef: string | null
  deadline: Date | null
  decisionBy: Date | null
  ownerId: string | null
  lines: OverviewLine[]
  counts: { all: number; awaiting: number; multi: number }
  coverage: { quoted: number; total: number; segments: Array<'quoted' | 'awaiting' | 'other'>; note: string | null }
  /** null when masked for this viewer. */
  estimate: (EstimateSnapshot & { currency: 'AED' }) | null
  masked: boolean
  rfqs: OverviewRfq[]
  activity: OverviewActivity[]
  /** S08: the acknowledgement was skipped for this client, and why. */
  ackSkipped: { text: string; preferenceId: string | null } | null
  /** Unsure lines still asked in Review. */
  questions: number
  /** Board 167 / 171b: the quick read and the path cards while the path is open (S09-T06). */
  qualification: QualificationView | null
}

const CHIP: Record<LineStatus, LineChip> = {
  open: 'Unallocated',
  held: 'On hold',
  sourcing: 'Awaiting',
  quoted: 'Quoted',
  to_follow: 'To follow',
  not_quoted: 'Not quoted',
  no_source: 'No source',
  regretted: 'Regretted',
  cancelled: 'Cancelled',
}

const KIND: Record<string, LandedComponent> = {
  freight: 'freight',
  insurance: 'insurance',
  duty: 'duty',
  bank_charges: 'bank',
  inspection: 'inspection',
  packing: 'packing',
  other: 'other',
}

const MONEY_SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' }

function unitMoney(amount: Prisma.Decimal, currency: string): string {
  const n = Number(amount.toString())
  const digits = n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: n < 100 ? 2 : 0,
  })
  const sym = MONEY_SYMBOL[currency]
  return sym ? `${sym}${digits}` : `${currency} ${digits}`
}

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })
const fmtDay = (d: Date) => DAY.format(d).replace('Sept', 'Sep')

const LIVE_RFQ = ['draft', 'awaiting_approval', 'scheduled', 'sent', 'closed'] as const

export async function getEnquiryOverview(
  ref: string,
  user: Pick<OpsUser, 'role' | 'canSeeMargins'>
): Promise<EnquiryOverview | null> {
  const seesCost = user.role === 'owner' || user.canSeeMargins
  const e = await opsDb.enquiry.findUnique({
    where: { ref },
    select: {
      id: true,
      ref: true,
      version: true,
      stage: true,
      title: true,
      clientRef: true,
      deadline: true,
      decisionBy: true,
      ownerId: true,
      receivedAt: true,
      createdAt: true,
      chosenPath: true,
      suggestedPath: true,
      pathChosenAt: true,
      legitimacyNotes: true,
      fitNotes: true,
      effortNotes: true,
      client: { select: { primaryDomain: true, website: true } },
      intakeBatches: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { mailMessage: { select: { threadId: true } } },
      },
      actions: {
        where: { actionKey: 'qualify_enquiry' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { state: true, failureReason: true, createdAt: true },
      },
      lines: {
        orderBy: { no: 'asc' },
        select: {
          id: true,
          no: true,
          clientPartNo: true,
          description: true,
          qty: true,
          uom: true,
          status: true,
          quotedByCount: true,
          extractionConfidence: true,
          tradeGroup: { select: { trade: { select: { defaultMarginPct: true } } } },
          rfqLines: {
            where: { droppedAt: null, rfq: { status: { in: [...LIVE_RFQ] } } },
            select: {
              rfq: {
                select: {
                  recipients: {
                    where: { status: { notIn: ['withdrawn'] } },
                    select: { status: true, lastChasedAt: true, supplier: { select: { name: true } } },
                  },
                },
              },
            },
          },
          selectedQuoteLine: {
            select: {
              unitPrice: true,
              quote: { select: { currency: true, fxRateToAed: true, supplier: { select: { name: true } } } },
              landedCosts: {
                where: { isCurrent: true },
                take: 1,
                select: {
                  supplierUnitPrice: true,
                  supplierCurrency: true,
                  fxRateToAed: true,
                  components: { select: { kind: true, basis: true, amountAed: true, pct: true } },
                },
              },
            },
          },
        },
      },
      rfqs: {
        where: { status: { in: [...LIVE_RFQ, 'withdrawn'] } },
        orderBy: { createdAt: 'asc' },
        select: {
          ref: true,
          status: true,
          _count: { select: { lines: true } },
          recipients: { where: { status: { not: 'withdrawn' } }, select: { status: true } },
        },
      },
      activity: {
        where: { field: 'acknowledgement' },
        orderBy: { at: 'desc' },
        take: 1,
        select: { note: true },
      },
      _count: {
        select: {
          actions: {
            where: { actionKey: 'resolve_extracted_line', state: { in: ['proposed', 'later'] } },
          },
        },
      },
    },
  })
  if (!e) return null

  const activity = await opsDb.$queryRaw<
    Array<{ id: string; at: Date; actorKind: string; initials: string | null; field: string | null; before: unknown; after: unknown; note: string | null; actionId: string | null }>
  >(Prisma.sql`
    SELECT a.id, a.at, a."actorKind"::text AS "actorKind", u.initials, a.field, a.before, a.after, a.note, a."actionId"
      FROM ops.activity_event a
      LEFT JOIN ops."user" u ON u.id = a."actorId"
     WHERE a."enquiryId" = ${e.id}::uuid AND (a.sensitive = false OR ${seesCost})
     ORDER BY a.at DESC
     LIMIT 20`)

  const live = e.lines.filter((l) => l.status !== 'cancelled')
  const lines: OverviewLine[] = e.lines.map((l) => {
    const suppliers = [
      ...new Set(l.rfqLines.flatMap((r) => r.rfq.recipients.map((x) => supplierShortCode(x.supplier.name)))),
    ]
    const sel = l.selectedQuoteLine
    const chip: LineChip = l.status === 'open' && suppliers.length > 0 ? 'Awaiting' : CHIP[l.status]
    return {
      id: l.id,
      no: l.no,
      clientPartNo: l.clientPartNo,
      description: l.description,
      qty: l.qty.toString().replace(/\.0+$/, ''),
      uom: l.uom,
      status: l.status,
      chip,
      quotedBy: l.quotedByCount,
      sentTo: suppliers,
      bestCost:
        seesCost && sel?.unitPrice && sel.quote.currency
          ? `${unitMoney(sel.unitPrice, sel.quote.currency)} · ${supplierShortCode(sel.quote.supplier.name)}`
          : null,
      confidence: l.extractionConfidence,
    }
  })

  const quoted = live.filter((l) => l.status === 'quoted' || l.status === 'to_follow').length
  const awaitingLines = lines.filter((l) => l.chip === 'Awaiting')
  let note: string | null = null
  const firstAwaiting = awaitingLines[0]
  if (firstAwaiting) {
    const src = e.lines.find((x) => x.id === firstAwaiting.id)!
    const waiting = src.rfqLines.flatMap((r) =>
      r.rfq.recipients.filter((x) =>
        ['sent', 'opened', 'auto_reply', 'partial_quote', 'replied_question'].includes(x.status)
      )
    )
    const names = [...new Set(waiting.map((w) => w.supplier.name))]
    const chased = waiting
      .map((w) => w.lastChasedAt)
      .filter((d): d is Date => !!d)
      .sort((a, b) => b.getTime() - a.getTime())[0]
    note =
      `Line ${firstAwaiting.no} awaiting ${names.length ? names.join(', ') : 'suppliers'}.` +
      (chased ? ` Chase sent ${fmtDay(chased)}.` : '')
  }

  let estimate: EnquiryOverview['estimate'] = null
  if (seesCost) {
    const [pricing, landed] = await Promise.all([getSetting('pricing.defaults'), getSetting('landed.defaults')])
    const est: EstimateLine[] = live.map((l) => {
      const sel = l.selectedQuoteLine
      const lc = sel?.landedCosts[0]
      const trade = l.tradeGroup?.trade?.defaultMarginPct
      const price = lc?.supplierUnitPrice ?? sel?.unitPrice
      const currency = lc?.supplierCurrency ?? sel?.quote.currency
      const fx = lc?.fxRateToAed ?? sel?.quote.fxRateToAed
      return {
        qty: l.qty.toString(),
        ...(trade ? { marginPct: trade.toString() } : {}),
        selected:
          price && currency && fx
            ? {
                unitPrice: price.toString(),
                currency,
                fxToAed: fx.toDecimalPlaces(4).toString(),
                ...(lc
                  ? {
                      components: Object.fromEntries(
                        lc.components.map((c) => [
                          KIND[c.kind],
                          c.basis === 'default_pct' && c.pct
                            ? { basis: 'default_pct' as const, pct: c.pct.toString() }
                            : { basis: c.basis === 'override' ? ('override' as const) : ('data' as const), amountAed: c.amountAed.toString() },
                        ])
                      ),
                    }
                  : {}),
              }
            : null,
      }
    })
    estimate = {
      ...estimateSnapshot({
        lines: est,
        defaults: {
          marginPct: String(pricing.marginPct),
          landedPct: {
            freight: String(landed.freightPct ?? C38_FALLBACK_PCT.freight),
            insurance: String(landed.insurancePct ?? C38_FALLBACK_PCT.insurance),
            duty: String(landed.dutyPct ?? C38_FALLBACK_PCT.duty),
            bank: String(landed.bankPct ?? C38_FALLBACK_PCT.bank),
          },
        },
      }),
      currency: 'AED',
    }
  }

  const rfqs: OverviewRfq[] = e.rfqs.map((r) => {
    const n = r.recipients.length
    const q = r.recipients.filter((x) => x.status === 'quoted').length
    const partial = r.recipients.filter((x) => x.status === 'partial_quote').length
    const status: OverviewRfq['status'] =
      r.status === 'withdrawn'
        ? 'Withdrawn'
        : n > 0 && q === n
          ? 'Quoted'
          : q + partial > 0
            ? 'Partial'
            : r.status === 'sent'
              ? 'Sent'
              : r.status === 'closed'
                ? 'Closed'
                : 'Drafted'
    return { ref: r.ref, lines: r._count.lines, status }
  })

  return {
    id: e.id,
    ref: e.ref,
    version: e.version,
    stage: e.stage,
    title: e.title,
    clientRef: e.clientRef,
    deadline: e.deadline,
    decisionBy: e.decisionBy,
    ownerId: e.ownerId,
    lines,
    counts: {
      all: lines.length,
      awaiting: awaitingLines.length,
      multi: lines.filter((l) => l.quotedBy > 1).length,
    },
    coverage: {
      quoted,
      total: live.length,
      segments: live.map((l) =>
        l.status === 'quoted' || l.status === 'to_follow'
          ? 'quoted'
          : lines.find((x) => x.id === l.id)!.chip === 'Awaiting'
            ? 'awaiting'
            : 'other'
      ),
      note,
    },
    estimate,
    masked: !seesCost,
    rfqs,
    activity: activity.map((a) => ({
      id: a.id,
      at: a.at,
      actor: a.actorKind === 'assistant' ? 'assistant' : a.actorKind === 'user' ? 'person' : 'system',
      initials: a.initials,
      text: activityText(a),
      actionId: a.actionId,
    })),
    ackSkipped: e.activity[0]?.note
      ? {
          text: e.activity[0].note.replace(/ · preference [0-9a-f-]{36}$/, ''),
          preferenceId: /preference ([0-9a-f-]{36})$/.exec(e.activity[0].note)?.[1] ?? null,
        }
      : null,
    questions: e._count.actions,
    qualification: qualificationView({
      ref: e.ref,
      stage: e.stage,
      receivedAt: e.receivedAt,
      createdAt: e.createdAt,
      deadline: e.deadline,
      chosenPath: e.chosenPath,
      suggestedPath: e.suggestedPath,
      pathChosenAt: e.pathChosenAt,
      legitimacyNotes: e.legitimacyNotes,
      fitNotes: e.fitNotes,
      effortNotes: e.effortNotes,
      lineNos: live.map((l) => l.no),
      sourceThreadId: e.intakeBatches[0]?.mailMessage?.threadId ?? null,
      read: e.actions[0] ?? null,
      domain: e.client?.primaryDomain ?? hostOf(e.client?.website ?? null),
    }),
  }
}

function hostOf(website: string | null): string | null {
  if (!website) return null
  try {
    return new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`).hostname
  } catch {
    return null
  }
}

const FIELD_WORD: Record<string, string> = {
  stage: 'Stage',
  status: 'Status',
  title: 'Title',
  clientRef: 'Client ref',
  deadline: 'Client deadline',
  decisionBy: 'Decision by',
  ownerId: 'Owner',
  revertBy: 'Revert by',
}

/** One line per event: the note when there is one, else "<Field>: before → after". */
export function activityText(a: { field: string | null; before: unknown; after: unknown; note: string | null }): string {
  if (a.note) return a.note
  const f = a.field ? (FIELD_WORD[a.field] ?? a.field) : 'Changed'
  const v = (x: unknown) => (x === null || x === undefined || x === '' ? '—' : typeof x === 'string' ? x : JSON.stringify(x))
  return a.before === undefined && a.after === undefined ? f : `${f}: ${v(a.before)} → ${v(a.after)}`
}

/** Board 05 owner select: the active team (KB and AB), cached for the request. */
export const activeOwners = cache(() =>
  opsDb.user.findMany({
    where: { status: 'active', role: { in: ['owner', 'helper'] } },
    orderBy: [{ role: 'asc' }, { initials: 'asc' }],
    select: { id: true, initials: true, name: true },
  })
)
