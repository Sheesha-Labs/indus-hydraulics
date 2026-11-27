import 'server-only'
import {
  compactMoney,
  companyInitials,
  ENQUIRY_STAGE_DISPLAY,
  isSendableContact,
  QUOTATION_STATUS_WORD,
  type EnquiryStage,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { z } from 'zod'

/**
 * Clients (S10-T02, boards 11 and 12). The list reads `ops.client_stats_v` (ADR-04): one keyset page ranked by
 * enquiry flow (enquiries YTD, then the last RFQ) and the KPI totals in one grouped query. The profile: the client
 * with its profile, contacts and stats row, then the three lists, what they buy and lost reasons. Values are AED
 * (the view converts at each quotation's locked FX). A Helper without canSeeMargins gets no margin figure: masked
 * here, not in the page.
 */

export const CLIENT_FILTERS = ['all', 'active', 'credit_hold'] as const
export type ClientFilter = (typeof CLIENT_FILTERS)[number]

export const clientsSearchSchema = z.object({
  filter: z.enum(CLIENT_FILTERS).default('all').catch('all'),
  ccy: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional()
    .catch(undefined),
  cursor: z.string().max(200).optional().catch(undefined),
})
export type ClientsSearch = z.infer<typeof clientsSearchSchema>

export interface ClientRow {
  id: string
  name: string
  initials: string
  place: string | null
  industry: string | null
  enquiries: number
  leads: number
  rfqs: number
  quoted: string
  won: string
  win: string | null
  lastRfq: string | null
  creditHold: boolean
}

export interface ClientList {
  rows: ClientRow[]
  nextCursor: string | null
  kpis: { active: number; rfqsYtd: number; quotedYtd: string; wonYtd: string }
  total: number
}

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })
const day = (d: Date) => DAY.format(d).replace('Sept', 'Sep')
const aed = (v: Prisma.Decimal | string | number | null) => compactMoney(v === null ? '0' : String(v), 'AED') ?? 'AED 0'
const pct = (v: Prisma.Decimal | null, digits = 0) => (v === null ? null : `${Number(v).toFixed(digits)}%`)

/** Country codes we show as words; the rest print as the code. */
const COUNTRY: Record<string, string> = {
  AE: 'UAE',
  SA: 'KSA',
  QA: 'Qatar',
  OM: 'Oman',
  KW: 'Kuwait',
  BH: 'Bahrain',
  IN: 'India',
  CN: 'China',
  TR: 'Türkiye',
  DE: 'Germany',
  IT: 'Italy',
  GB: 'UK',
  US: 'USA',
}
export const countryWord = (c: string | null) => (c ? (COUNTRY[c] ?? c) : null)
export const placeOf = (city: string | null, country: string | null) =>
  [city, countryWord(country)].filter(Boolean).join(', ') || null

/** Cursor: "<enquiriesYtd>|<lastRfq ISO or ''>|<id>" for the enquiry-flow order. */
function decodeCursor(c: string | undefined) {
  if (!c) return null
  const [n, at, id] = c.split('|')
  if (!id || !/^\d+$/.test(n ?? '')) return null
  return { n: Number(n), at: at ? new Date(at) : null, id }
}

const PAGE = 50

export async function listClients(params: ClientsSearch): Promise<ClientList> {
  const where: Prisma.ClientStatsWhereInput = {
    ...(params.filter === 'active' ? { active: true } : {}),
    ...(params.filter === 'credit_hold' ? { creditHold: true } : {}),
    ...(params.ccy ? { quotingCurrency: params.ccy } : {}),
  }
  const c = decodeCursor(params.cursor)
  const after: Prisma.ClientStatsWhereInput | null = c
    ? {
        OR: [
          { enquiriesYtd: { lt: c.n } },
          {
            enquiriesYtd: c.n,
            ...(c.at
              ? { OR: [{ lastRfqAt: { lt: c.at } }, { lastRfqAt: null }, { lastRfqAt: c.at, companyId: { gt: c.id } }] }
              : { lastRfqAt: null, companyId: { gt: c.id } }),
          },
        ],
      }
    : null
  const [rows, [k]] = await Promise.all([
    opsDb.clientStats.findMany({
      where: after ? { AND: [where, after] } : where,
      orderBy: [{ enquiriesYtd: 'desc' }, { lastRfqAt: { sort: 'desc', nulls: 'last' } }, { companyId: 'asc' }],
      take: PAGE + 1,
    }),
    // The KPI row: one grouped read over the same view (a quoting-currency view narrows it too).
    opsDb.$queryRaw<Array<{ total: number; active: number; rfqs: number; quoted: string; won: string }>>(Prisma.sql`
      SELECT count(*)::int AS total, count(*) FILTER (WHERE active)::int AS active,
             coalesce(sum("rfqsYtd"), 0)::int AS rfqs,
             coalesce(sum("quotedYtdAed"), 0)::text AS quoted, coalesce(sum("wonYtdAed"), 0)::text AS won
        FROM ops.client_stats_v
       WHERE (${params.ccy ?? null}::text IS NULL OR "quotingCurrency" = ${params.ccy ?? null})`),
  ])
  const page = rows.slice(0, PAGE)
  const last = rows.length > PAGE ? page[page.length - 1] : null
  return {
    rows: page.map((r) => ({
      id: r.companyId,
      name: r.name,
      initials: companyInitials(r.name),
      place: placeOf(r.city, r.country),
      industry: r.industry,
      enquiries: r.enquiriesYtd,
      leads: r.leadsOpen,
      rfqs: r.rfqsYtd,
      quoted: aed(r.quotedYtdAed),
      won: aed(r.wonYtdAed),
      win: pct(r.winRatePct),
      lastRfq: r.lastRfqAt ? day(r.lastRfqAt) : null,
      creditHold: r.creditHold,
    })),
    nextCursor: last
      ? `${last.enquiriesYtd}|${last.lastRfqAt ? last.lastRfqAt.toISOString() : ''}|${last.companyId}`
      : null,
    kpis: {
      active: k?.active ?? 0,
      rfqsYtd: k?.rfqs ?? 0,
      quotedYtd: aed(k?.quoted ?? null),
      wonYtd: aed(k?.won ?? null),
    },
    total: k?.total ?? 0,
  }
}

// ── Board 12 ──────────────────────────────────────────────────────────────────────────────────────────────────

export interface ClientPage {
  id: string
  name: string
  updatedAt: string
  meta: string
  mergedInto: { id: string; name: string } | null
  aliases: string[]
  kpis: { rfqs: number; quoted: string; won: string; winRate: string | null; avgMargin: string | null }
  enquiries: Array<{ id: string; ref: string; title: string; lines: number; value: string | null; stage: string; stageTone: 'n' | 'acc' | 'ok' | 'warn' | 'bad'; date: string }>
  enquiryNote: string
  quotations: Array<{ id: string; number: string; title: string; date: string; total: string; margin: string | null; status: string; statusTone: 'n' | 'acc' | 'ok' | 'warn' | 'bad'; enquiryRef: string }>
  quotedNote: string
  leads: Array<{ id: string; ref: string; title: string; stage: string; value: string | null }>
  contacts: Array<{ id: string; name: string; email: string | null; phone: string | null; role: string | null; initials: string; preferred: boolean; sendable: boolean; sourceKind: string }>
  buys: Array<{ key: string; label: string; pct: number }>
  lostReasons: Array<{ label: string; count: number }>
  profile: {
    vendorCode: string | null
    quotingCurrency: string
    paymentTermsText: string | null
    vatTreatmentDefault: string | null
    termsPresetId: string | null
    followUpCadenceId: string | null
    partialFollowUp: string
    acknowledgeEnquiries: boolean
    creditHold: boolean
    creditHoldReason: string | null
    creditHoldSince: string | null
    updatedAt: string
  }
  options: {
    termsPresets: Array<{ value: string; label: string }>
    cadences: Array<{ value: string; label: string }>
  }
}

const STAGE_TONE: Record<EnquiryStage, ClientPage['enquiries'][number]['stageTone']> = {
  new: 'n',
  qualifying: 'n',
  sourcing: 'n',
  quotes_in: 'acc',
  pricing: 'acc',
  quoted: 'acc',
  negotiation: 'acc',
  won: 'ok',
  lost: 'bad',
  regretted: 'n',
  closed: 'n',
}

const LOST_WORD: Record<string, string> = {
  price: 'Price',
  lead_time: 'Lead time',
  specification: 'Specification',
  went_direct_to_oem: 'Went to the maker',
  no_decision: 'No decision',
  cancelled: 'Project cancelled',
  other: 'Other',
  no_source_found: 'We found no source',
  deadline_too_short: 'Deadline too short',
  not_our_range: 'Not our range',
  client_unresponsive: 'Client did not reply',
}

export async function getClientPage(
  id: string,
  viewer: { role: 'owner' | 'helper'; canSeeMargins: boolean }
): Promise<ClientPage | null> {
  const yearAgo = new Date(Date.now() - 365 * 86_400_000)
  // Query 1: the company with its profile, contacts and the three lists (10 each).
  const c = await opsDb.company.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
      industry: true,
      aliases: true,
      isClient: true,
      updatedAt: true,
      mergedInto: { select: { id: true, name: true } },
      clientProfile: true,
      contacts: {
        where: { archivedAt: null },
        orderBy: [{ isPreferred: 'desc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isPreferred: true,
          sourceKind: true,
          status: true,
          bouncedAt: true,
        },
      },
      enquiries: {
        orderBy: { receivedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          ref: true,
          title: true,
          stage: true,
          receivedAt: true,
          estValueMax: true,
          estCurrency: true,
          lostReason: true,
          _count: { select: { lines: true } },
        },
      },
      quotations: {
        where: { sentAt: { not: null } },
        orderBy: { sentAt: 'desc' },
        take: 10,
        select: {
          id: true,
          number: true,
          sentAt: true,
          total: true,
          currency: true,
          marginPct: true,
          status: true,
          enquiry: { select: { ref: true, title: true } },
        },
      },
      leads: {
        where: { stage: { in: ['new', 'contacted', 'qualified'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, ref: true, title: true, name: true, stage: true, estValue: true, estCurrency: true },
      },
    },
  })
  if (!c || !c.isClient || !c.clientProfile) return null
  const p = c.clientProfile
  const enquiries = c.enquiries
  const quotations = c.quotations
  const leads = c.leads

  // Query 2: the stats row, what they buy (enquiry lines by trade, 12 months: the part's trade, else the trade
  // group's), lost and regret reasons (12 months), open/closed counts and the form's options, as one JSON row.
  // Raw SQL because these are aggregates across joins that Prisma cannot express in one statement.
  const [agg] = await opsDb.$queryRaw<
    Array<{
      stats: { rfqsYtd: number; quotedYtdAed: string; wonYtdAed: string; winRatePct: string | null; avgMarginWonPct: string | null } | null
      buys: Array<{ id: string; name: string; n: number }> | null
      lost: Array<{ k: string; n: number }> | null
      open: number
      closed: number
      presets: Array<{ id: string; name: string }> | null
      cadences: Array<{ id: string; name: string }> | null
    }>
  >(Prisma.sql`
    SELECT
      (SELECT json_build_object('rfqsYtd', s."rfqsYtd", 'quotedYtdAed', s."quotedYtdAed", 'wonYtdAed', s."wonYtdAed",
                                'winRatePct', s."winRatePct", 'avgMarginWonPct', s."avgMarginWonPct")
         FROM ops.client_stats_v s WHERE s."companyId" = ${id}::uuid)                               AS stats,
      (SELECT json_agg(b ORDER BY b.n DESC, b.name) FROM (
         SELECT t.id, t.name, count(*)::int AS n
           FROM ops.enquiry_line l
           JOIN ops.enquiry e ON e.id = l."enquiryId"
           LEFT JOIN ops.part pt ON pt.id = l."partId"
           LEFT JOIN ops.trade_group g ON g.id = l."tradeGroupId"
           JOIN ops.trade t ON t.id = coalesce(pt."tradeId", g."tradeId")
          WHERE e."clientId" = ${id}::uuid AND e."receivedAt" >= ${yearAgo}
          GROUP BY t.id, t.name ORDER BY n DESC, t.name LIMIT 6) b)                                 AS buys,
      (SELECT json_agg(r) FROM (
         SELECT coalesce(e."lostReason"::text, e."regretReason"::text) AS k, count(*)::int AS n
           FROM ops.enquiry e
          WHERE e."clientId" = ${id}::uuid AND e."receivedAt" >= ${yearAgo}
            AND (e."lostReason" IS NOT NULL OR e."regretReason" IS NOT NULL)
          GROUP BY 1) r)                                                                          AS lost,
      (SELECT count(*)::int FROM ops.enquiry e WHERE e."clientId" = ${id}::uuid
          AND e.stage NOT IN ('won', 'lost', 'regretted', 'closed'))                              AS open,
      (SELECT count(*)::int FROM ops.enquiry e WHERE e."clientId" = ${id}::uuid
          AND e.stage IN ('won', 'lost', 'regretted', 'closed'))                                  AS closed,
      (SELECT json_agg(x ORDER BY x.name) FROM (SELECT id, name FROM ops.terms_preset WHERE "archivedAt" IS NULL) x) AS presets,
      (SELECT json_agg(x ORDER BY x.name) FROM (SELECT id, name FROM ops.follow_up_cadence) x)     AS cadences`)
  const statsRow = agg?.stats ?? null
  const stats = statsRow
    ? {
        rfqsYtd: statsRow.rfqsYtd,
        quotedYtdAed: statsRow.quotedYtdAed,
        wonYtdAed: statsRow.wonYtdAed,
        winRatePct: statsRow.winRatePct === null ? null : new Prisma.Decimal(statsRow.winRatePct),
        avgMarginWonPct: statsRow.avgMarginWonPct === null ? null : new Prisma.Decimal(statsRow.avgMarginWonPct),
      }
    : null
  const buys = agg?.buys ?? []
  const lost = agg?.lost ?? []
  const presets = agg?.presets ?? []
  const cadences = agg?.cadences ?? []
  const totalBuys = buys.reduce((s, b) => s + Number(b.n), 0)
  const lostMap = new Map(lost.map((g) => [g.k, g.n]))
  const open = agg?.open ?? 0
  const closed = agg?.closed ?? 0
  const since = p.clientSince ? p.clientSince.getUTCFullYear() : null
  const meta = [
    c.industry,
    placeOf(c.city, c.country),
    since ? `Client since ${since}` : null,
    p.vendorCode ? `Vendor code ${p.vendorCode}` : null,
    p.paymentTermsText ? `Payment ${p.paymentTermsText}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const showMargin = viewer.role === 'owner' || viewer.canSeeMargins

  return {
    id: c.id,
    name: c.name,
    updatedAt: c.updatedAt.toISOString(),
    meta,
    mergedInto: c.mergedInto,
    aliases: c.aliases,
    kpis: {
      rfqs: stats?.rfqsYtd ?? 0,
      quoted: aed(stats?.quotedYtdAed ?? null),
      won: aed(stats?.wonYtdAed ?? null),
      winRate: pct(stats?.winRatePct ?? null),
      avgMargin: showMargin ? pct(stats?.avgMarginWonPct ?? null, 1) : null,
    },
    enquiries: enquiries.map((e) => ({
      id: e.id,
      ref: e.ref,
      title: e.title,
      lines: e._count.lines,
      value: e.estValueMax ? compactMoney(String(e.estValueMax), e.estCurrency ?? 'USD') : null,
      stage:
        e.stage === 'lost' && e.lostReason
          ? `Lost · ${(LOST_WORD[e.lostReason] ?? 'other').toLowerCase()}`
          : ENQUIRY_STAGE_DISPLAY[e.stage],
      stageTone: STAGE_TONE[e.stage],
      date: day(e.receivedAt),
    })),
    enquiryNote: `${open} open · ${closed} closed`,
    quotations: quotations.map((q) => ({
      id: q.id,
      number: q.number ?? 'Draft',
      title: q.enquiry.title,
      date: q.sentAt ? day(q.sentAt) : '',
      total: compactMoney(String(q.total), q.currency) ?? '',
      margin: showMargin && q.marginPct !== null ? `${Number(q.marginPct).toFixed(1)}%` : null,
      status: QUOTATION_STATUS_WORD[q.status],
      statusTone: q.status === 'won' ? 'ok' : q.status === 'lost' ? 'bad' : q.status === 'superseded' || q.status === 'cancelled' ? 'n' : 'acc',
      enquiryRef: q.enquiry.ref,
    })),
    quotedNote: `${aed(stats?.quotedYtdAed ?? null)} quoted YTD`,
    leads: leads.map((l) => ({
      id: l.id,
      ref: l.ref,
      title: l.title ?? l.name,
      stage: l.stage,
      value: l.estValue ? compactMoney(String(l.estValue), l.estCurrency ?? 'USD') : null,
    })),
    contacts: c.contacts.map((k) => ({
      id: k.id,
      name: k.name ?? k.email ?? 'Unnamed contact',
      email: k.email,
      phone: k.phone,
      role: k.role,
      initials: companyInitials(k.name ?? k.email ?? '?'),
      preferred: k.isPreferred,
      sendable: isSendableContact({ ...k, archivedAt: null }),
      sourceKind: k.sourceKind,
    })),
    buys: buys.map((b) => ({
      key: b.id,
      label: b.name,
      pct: totalBuys ? Math.round((Number(b.n) / totalBuys) * 100) : 0,
    })),
    lostReasons: [...lostMap.entries()]
      .map(([k, n]) => ({ label: LOST_WORD[k] ?? 'Other', count: n }))
      .sort((a, b) => b.count - a.count),
    profile: {
      vendorCode: p.vendorCode,
      quotingCurrency: p.quotingCurrency,
      paymentTermsText: p.paymentTermsText,
      vatTreatmentDefault: p.vatTreatmentDefault,
      termsPresetId: p.termsPresetId,
      followUpCadenceId: p.followUpCadenceId,
      partialFollowUp: p.partialFollowUp,
      acknowledgeEnquiries: p.acknowledgeEnquiries,
      creditHold: p.creditHold,
      creditHoldReason: p.creditHoldReason,
      creditHoldSince: p.creditHoldSince ? day(p.creditHoldSince) : null,
      updatedAt: p.updatedAt.toISOString(),
    },
    options: {
      termsPresets: presets.map((t) => ({ value: t.id, label: t.name })),
      cadences: cadences.map((t) => ({ value: t.id, label: t.name })),
    },
  }
}
