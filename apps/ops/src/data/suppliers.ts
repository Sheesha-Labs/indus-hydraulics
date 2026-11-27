import 'server-only'
import {
  isSendableContact,
  looksLikePartNumber,
  maskedIban,
  medianDays,
  NOT_SELECTABLE,
  partNoNorm,
  RELIABILITY_MIN_REPLIES,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { cache } from 'react'
import { z } from 'zod'
import { countryWord } from './clients'

/**
 * Suppliers (S10-T03, boards 128, 129, 133). The list reads `ops.supplier_list_v`: one keyset page by name, the
 * tier counts in one grouped query, and a search that is a name or domain match OR a part number (the suppliers
 * who quoted it, or carry the brand). The profile reads the supplier with its contacts, documents, line cards and
 * bank summary in one query, then the section's own rows. Bank details are a name, "•••• 1234" and a status for the
 * Owner; the Helper sees the status only. No data function returns an IBAN.
 */

export const TIERS = ['contact_only', 'trial', 'approved', 'principal', 'blocked'] as const
export type Tier = (typeof TIERS)[number]
export const TIER_WORD: Record<Tier, string> = {
  contact_only: 'Contact only',
  trial: 'Trial',
  approved: 'Approved',
  principal: 'Principal',
  blocked: 'Blocked',
}
export const TIER_TONE: Record<Tier, 'n' | 'acc' | 'ok' | 'navy' | 'bad'> = {
  contact_only: 'n',
  trial: 'acc',
  approved: 'ok',
  principal: 'navy',
  blocked: 'bad',
}

export const SUPPLIER_TYPES = [
  'manufacturer',
  'principal',
  'oem',
  'distributor',
  'stockist',
  'trader',
  'local_shop',
  'forwarder',
  'marketplace',
  'unknown',
] as const
export const TYPE_WORD: Record<string, string> = {
  manufacturer: 'Manufacturer',
  principal: 'Principal',
  oem: 'OEM',
  distributor: 'Distributor',
  stockist: 'Stockist',
  trader: 'Trader',
  local_shop: 'Local shop',
  forwarder: 'Forwarder',
  marketplace: 'Marketplace',
  unknown: 'Unknown type',
}

/** Board 128's Region filter: a region is a set of countries. */
export const REGIONS: Record<string, { label: string; countries: string[] }> = {
  uae: { label: 'UAE', countries: ['AE'] },
  gcc: { label: 'Rest of GCC', countries: ['SA', 'QA', 'OM', 'KW', 'BH'] },
  europe: {
    label: 'Europe',
    countries: ['DE', 'IT', 'GB', 'FR', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'DK', 'NO', 'FI', 'PL', 'CZ', 'PT', 'IE'],
  },
  asia: { label: 'Asia', countries: ['CN', 'IN', 'JP', 'KR', 'SG', 'MY', 'TW', 'HK', 'TH', 'VN', 'ID', 'PK', 'TR'] },
  americas: { label: 'Americas', countries: ['US', 'CA', 'MX', 'BR', 'AR', 'CL'] },
}

const opt = <T extends z.ZodType>(t: T) => t.optional().catch(undefined)
const suppliersSchema = z.object({
  q: opt(z.string().trim().max(120)),
  tier: opt(z.enum(TIERS)),
  type: opt(z.enum(SUPPLIER_TYPES)),
  region: opt(z.enum(Object.keys(REGIONS) as [string, ...string[]])),
  trade: opt(z.uuid()),
  fast: opt(z.enum(['1'])),
  never: opt(z.enum(['1'])),
  view: z.enum(['all', 'proposed']).default('all').catch('all'),
  selected: opt(z.uuid()),
  cursor: opt(z.string().max(300)),
})
/** URL search params (a repeated key keeps its first value) → the validated board-128 state. */
export const suppliersSearchSchema = {
  parse(raw: Record<string, string | string[] | undefined>) {
    const flat = Object.fromEntries(
      Object.entries(raw).flatMap(([k, v]) => {
        const first = Array.isArray(v) ? v[0] : v
        return first === undefined || first === '' ? [] : [[k, first]]
      })
    )
    return suppliersSchema.parse(flat)
  },
}
export type SuppliersSearch = z.infer<typeof suppliersSchema>

export interface SupplierRow {
  id: string
  name: string
  type: string
  tier: Tier
  onboarding: string | null
  place: string
  categories: string
  rfqs: number
  reply: string | null
  median: string | null
  win: string | null
  last: string | null
  ccy: string | null
  flags: string[]
}

export interface SupplierList {
  rows: SupplierRow[]
  nextCursor: string | null
  tierCounts: Record<Tier, number>
  total: number
  /** "“6316-C3” matches 3 suppliers who quoted it: A, B, C" when the search reads as a part number. */
  partNote: string | null
  trades: Array<{ value: string; label: string }>
}

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })
const day = (d: Date) => DAY.format(d).replace('Sept', 'Sep')
const pct = (v: Prisma.Decimal | null) => (v === null ? null : `${Math.round(Number(v))}%`)

const PAGE = 50

export async function listSuppliers(params: SuppliersSearch): Promise<SupplierList> {
  const q = params.q?.trim() || null
  const asPart = q && looksLikePartNumber(q) ? partNoNorm(q) : null
  // The part-number arm: suppliers who quoted it (offered part number), or whose line card carries a brand equal to
  // the search. Raw SQL for the normalised comparison on an unindexed text column; bounded to 100 suppliers.
  const partMatches = asPart
    ? await opsDb.$queryRaw<Array<{ id: string; name: string }>>(Prisma.sql`
        SELECT DISTINCT c.id, c.name
          FROM ops.company c
         WHERE c."isSupplier" AND c."archivedAt" IS NULL AND c."mergedIntoId" IS NULL
           AND (EXISTS (SELECT 1 FROM ops.supplier_quote sq JOIN ops.supplier_quote_line l ON l."quoteId" = sq.id
                         WHERE sq."supplierId" = c.id
                           AND regexp_replace(upper(coalesce(l."offeredPartNo", '')), '[^A-Z0-9]', '', 'g') = ${asPart})
             OR EXISTS (SELECT 1 FROM ops.supplier_line_card lc
                         WHERE lc."supplierId" = c.id AND upper(coalesce(lc.brand, '')) = upper(${q})))
         ORDER BY c.name
         LIMIT 100`)
    : []

  const base: Prisma.SupplierListRowWhereInput[] = []
  if (params.view === 'proposed') base.push({ onboardingStatus: { in: [...NOT_SELECTABLE] } })
  if (params.tier) base.push({ tier: params.tier })
  if (params.type) base.push({ type: params.type })
  if (params.region) base.push({ country: { in: REGIONS[params.region]!.countries } })
  if (params.trade) base.push({ tradeIds: { has: params.trade } })
  if (params.fast) base.push({ medianReplyHours: { lte: 48 } })
  if (params.never) base.push({ rfqsAsked: { gt: 0 }, repliesCount: 0 })
  if (q) {
    const d = q.toLowerCase().replace(/^www\./, '')
    base.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { aliases: { has: q } },
        { primaryDomain: { contains: d } },
        { domains: { has: d } },
        ...(partMatches.length ? [{ companyId: { in: partMatches.map((m) => m.id) } }] : []),
      ],
    })
  }
  const where: Prisma.SupplierListRowWhereInput = base.length ? { AND: base } : {}
  const [name, id] = params.cursor?.split('\u0001') ?? []
  const after: Prisma.SupplierListRowWhereInput | null =
    name && id ? { OR: [{ name: { gt: name } }, { name, companyId: { gt: id } }] } : null

  const [rows, tiers, trades] = await Promise.all([
    opsDb.supplierListRow.findMany({
      where: after ? { AND: [where, after] } : where,
      orderBy: [{ name: 'asc' }, { companyId: 'asc' }],
      take: PAGE + 1,
    }),
    opsDb.supplierListRow.groupBy({ by: ['tier'], where, _count: { _all: true } }),
    opsDb.trade.findMany({
      where: { archivedAt: null, parentId: null },
      select: { id: true, name: true },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    }),
  ])
  const page = rows.slice(0, PAGE)
  const tierCounts = Object.fromEntries(TIERS.map((t) => [t, 0])) as Record<Tier, number>
  for (const g of tiers) tierCounts[g.tier as Tier] = g._count._all
  const last = rows.length > PAGE ? page[page.length - 1] : null

  return {
    rows: page.map((r) => {
      const flags: string[] = []
      if (r.bankChangePending) flags.push('Bank change pending')
      if (r.onboardingStatus && (NOT_SELECTABLE as readonly string[]).includes(r.onboardingStatus))
        flags.push('Proposed · not selectable')
      if (r.soonestExpiry && r.soonestExpiry.getTime() < Date.now()) flags.push('Certificate expired')
      if (r.bouncingContacts) flags.push('Bouncing')
      return {
        id: r.companyId,
        name: r.name,
        type: TYPE_WORD[r.type] ?? r.type,
        tier: r.tier as Tier,
        onboarding: r.onboardingStatus,
        place: [countryWord(r.country), r.city].filter(Boolean).join(' · ') || '—',
        categories: r.trades.slice(0, 3).join(' · ') || '—',
        rfqs: r.rfqsAsked,
        reply: r.rfqsAsked > 0 ? pct(r.replyRatePct) : null,
        median: medianDays(r.medianReplyHours === null ? null : Number(r.medianReplyHours)),
        win: pct(r.winSharePct),
        last: r.lastQuoteAt ? day(r.lastQuoteAt) : null,
        ccy: r.quotesCurrency,
        flags,
      }
    }),
    nextCursor: last ? `${last.name}\u0001${last.companyId}` : null,
    tierCounts,
    total: Object.values(tierCounts).reduce((a, b) => a + b, 0),
    partNote: asPart
      ? partMatches.length
        ? `“${q}” matches ${partMatches.length} supplier${partMatches.length === 1 ? '' : 's'} who quoted it or carry it: ${partMatches
            .slice(0, 4)
            .map((m) => m.name)
            .join(', ')}${partMatches.length > 4 ? ' …' : ''}`
        : `No supplier has quoted “${q}” yet`
      : null,
    trades: trades.map((t) => ({ value: t.id, label: t.name })),
  }
}

// ── Board 129 ─────────────────────────────────────────────────────────────────────────────────────────────────

export const SECTIONS = ['overview', 'contacts', 'quotes', 'prices', 'orders', 'documents', 'notes', 'line-card'] as const
export type ProfileSection = (typeof SECTIONS)[number]

export interface SupplierHeader {
  id: string
  name: string
  type: string
  tier: Tier
  tierSince: string | null
  onboarding: string | null
  place: string
  website: string | null
  domain: string | null
  quotesIn: string | null
  usually: string | null
  aliases: string[]
  mergedFrom: Array<{ name: string; at: string }>
  blocked: { reason: string; note: string | null; at: string | null } | null
  trial: { used: number; limit: number; maxUsd: string } | null
  bankChangeAccountId: string | null
  version: number
}

export interface SupplierProfilePage {
  header: SupplierHeader
  carry: Array<{ key: string; label: string; value: number }>
  carryNote: string
  authorised: Array<{ id: string; mark: 'ok' | 'warn'; title: string; sub: string; href: string | null; hrefLabel: string }>
  reliability: { text: string; basis: string } | null
  reliabilityThin: boolean
  contacts: Array<{
    id: string
    name: string
    initials: string
    email: string | null
    phone: string | null
    role: string | null
    preferred: boolean
    sendable: boolean
    sourceKind: string
    sourceUrl: string | null
    status: string
    outOfOfficeUntil: string | null
  }>
  documents: Array<{ id: string; title: string; kind: string; status: string; expires: string | null; daysLeft: number | null; tone: 'ok' | 'warn' | 'bad' | 'n'; fileId: string | null }>
  bank: { name: string | null; masked: string | null; status: string; coolingOffUntil: string | null } | null
  screenedAt: string | null
  timezone: string | null
  stats: { rfqs: number; quotes: number; pos: number; replyRate: string | null; median: string | null }
}

const DATE = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short', year: 'numeric' })
const date = (d: Date) => DATE.format(d).replace('Sept', 'Sep')

const DOC_KIND_WORD: Record<string, string> = {
  trade_licence: 'Trade licence',
  vat_certificate: 'VAT certificate',
  iso_certificate: 'ISO certificate',
  atex_certificate: 'ATEX certificate',
  api_licence: 'API licence',
  approval: 'Product approval',
  bank_letter: 'Bank letter',
  company_profile: 'Company profile',
  past_performance_letter: 'Past performance letter',
  insurance: 'Insurance',
  code_of_conduct: 'Code of conduct',
  nda: 'NDA',
  ownership_declaration: 'Ownership declaration',
  other: 'Other document',
}
export const docKindWord = (k: string) => DOC_KIND_WORD[k] ?? k

/** Days from today (Dubai) to a date column, negative when past. */
export function daysUntil(d: Date, now = new Date()): number {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - today) / 86_400_000)
}

export async function getSupplierProfile(
  id: string,
  viewer: { role: 'owner' | 'helper' }
): Promise<SupplierProfilePage | null> {
  const c = await opsDb.company.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
      website: true,
      primaryDomain: true,
      aliases: true,
      isSupplier: true,
      mergedFrom: { select: { name: true, updatedAt: true } },
      supplierProfile: true,
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
          sourceUrl: true,
          status: true,
          bouncedAt: true,
          outOfOfficeUntil: true,
        },
      },
      complianceDocs: {
        where: { archivedAt: null },
        orderBy: [{ expiresAt: { sort: 'asc', nulls: 'last' } }],
        select: { id: true, title: true, kind: true, status: true, expiresAt: true, fileId: true },
      },
      lineCards: {
        orderBy: [{ timesQuoted: 'desc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          brand: true,
          authorised: true,
          evidenceUrl: true,
          verifiedAt: true,
          timesQuoted: true,
          status: true,
          learned: true,
          trade: { select: { name: true } },
        },
      },
      bankAccounts: {
        where: { supersededAt: null },
        orderBy: { createdAt: 'desc' },
        select: { id: true, bankName: true, ibanLast4: true, status: true, coolingOffUntil: true, verifiedAt: true },
      },
      screenings: { orderBy: { checkedAt: 'desc' }, take: 1, select: { checkedAt: true } },
    },
  })
  if (!c || !c.isSupplier || !c.supplierProfile) return null
  const p = c.supplierProfile
  const now = new Date()

  const pending = c.bankAccounts.find((b) => b.status === 'pending_verification')
  const live = c.bankAccounts.find((b) => b.status === 'verified') ?? pending ?? c.bankAccounts[0] ?? null
  const carryRows = c.lineCards.filter((l) => l.status !== 'not_carried')
  const carry = carryRows
    .filter((l) => l.trade || l.brand)
    .slice(0, 6)
    .map((l) => ({ key: l.id, label: l.trade?.name ?? l.brand ?? '—', value: Math.max(l.timesQuoted, 0) }))

  return {
    header: {
      id: c.id,
      name: c.name,
      type: TYPE_WORD[p.type] ?? p.type,
      tier: p.tier as Tier,
      tierSince: p.tierSince ? date(p.tierSince) : null,
      onboarding: p.onboardingStatus,
      place: [countryWord(c.country), c.city].filter(Boolean).join(' · '),
      website: c.website,
      domain: c.primaryDomain,
      quotesIn: p.quotesCurrency,
      usually: p.usualIncoterm ? [p.usualIncoterm, p.usualIncotermPlace].filter(Boolean).join(' ') : null,
      aliases: c.aliases,
      mergedFrom: c.mergedFrom.map((m) => ({ name: m.name, at: date(m.updatedAt) })),
      blocked:
        p.tier === 'blocked'
          ? { reason: (p.blockReason ?? 'other').replace(/_/g, ' '), note: p.blockNote, at: p.blockedAt ? date(p.blockedAt) : null }
          : null,
      trial:
        p.tier === 'trial'
          ? { used: p.trialPosUsed, limit: p.trialPoLimit, maxUsd: `${p.trialPoMaxCurrency} ${Number(p.trialPoMaxAmount).toLocaleString('en-US')}` }
          : null,
      bankChangeAccountId: pending?.id ?? null,
      version: p.version,
    },
    carry,
    carryNote: p.rfqsAsked ? `learned from ${p.rfqsAsked} RFQs` : 'from the line card',
    authorised: c.lineCards
      .filter((l) => l.brand && (l.authorised || l.evidenceUrl))
      .map((l) => ({
        id: l.id,
        mark: l.authorised && l.verifiedAt ? ('ok' as const) : ('warn' as const),
        title: `${l.brand}${l.trade ? ` · ${l.trade.name}` : ''}${l.authorised ? '' : ' · claims authorisation'}`,
        sub:
          l.authorised && l.verifiedAt
            ? `Listed on the maker's distributor locator, checked ${date(l.verifiedAt)}`
            : 'Not confirmed on the maker’s locator',
        href: l.evidenceUrl,
        hrefLabel: l.authorised ? 'Locator page' : 'Their page',
      })),
    reliability:
      p.reliabilitySummary && p.repliesCount >= RELIABILITY_MIN_REPLIES
        ? (() => {
            const [text, basis] = p.reliabilitySummary.split('\n')
            return { text: text ?? '', basis: basis ?? '' }
          })()
        : null,
    reliabilityThin: p.repliesCount < RELIABILITY_MIN_REPLIES,
    contacts: c.contacts.map((k) => ({
      id: k.id,
      name: k.name ?? k.email ?? 'Unnamed contact',
      initials: (k.name ?? k.email ?? '?')
        .split(/[\s.@]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]!.toUpperCase())
        .join(''),
      email: k.email,
      phone: k.phone,
      role: k.role,
      preferred: k.isPreferred,
      sendable: isSendableContact({ ...k, archivedAt: null }),
      sourceKind: k.sourceKind,
      sourceUrl: k.sourceUrl,
      status: k.status,
      outOfOfficeUntil: k.outOfOfficeUntil && k.outOfOfficeUntil >= now ? date(k.outOfOfficeUntil) : null,
    })),
    documents: c.complianceDocs.map((d) => {
      const left = d.expiresAt ? daysUntil(d.expiresAt, now) : null
      return {
        id: d.id,
        title: d.title,
        kind: docKindWord(d.kind),
        status: d.status,
        expires: d.expiresAt ? date(d.expiresAt) : null,
        daysLeft: left,
        tone: left === null ? 'n' : left < 0 ? 'bad' : left <= 30 ? 'warn' : 'ok',
        fileId: d.fileId,
      }
    }),
    bank: live
      ? {
          name: viewer.role === 'owner' ? live.bankName : null,
          masked: viewer.role === 'owner' ? maskedIban(live.ibanLast4) : null,
          status:
            live.status === 'pending_verification'
              ? 'Bank change pending'
              : live.status === 'verified'
                ? live.coolingOffUntil && live.coolingOffUntil > now
                  ? 'Verified · cooling-off'
                  : 'Verified'
                : live.status === 'rejected'
                  ? 'Rejected'
                  : 'Superseded',
          coolingOffUntil: live.coolingOffUntil && live.coolingOffUntil > now ? live.coolingOffUntil.toISOString() : null,
        }
      : null,
    screenedAt: c.screenings[0] ? date(c.screenings[0].checkedAt) : null,
    timezone: p.timezone,
    stats: {
      rfqs: p.rfqsAsked,
      quotes: p.quotesCount,
      pos: p.posCount,
      replyRate: p.rfqsAsked ? pct(p.replyRatePct) : null,
      median: medianDays(p.medianReplyHours === null ? null : Number(p.medianReplyHours)),
    },
  }
}

/** One read per request for the layout and its page (React cache). */
export const supplierProfileOnce = cache(getSupplierProfile)

/** The 360 preview on board 128 (`?selected=`): the profile's header, carry, tier and contacts. */
export async function getSupplierPreview(id: string, viewer: { role: 'owner' | 'helper' }) {
  const page = await getSupplierProfile(id, viewer)
  if (!page) return null
  return { header: page.header, carry: page.carry, contacts: page.contacts.slice(0, 3), stats: page.stats }
}

/** Board 129 "Recent": the supplier's latest quotes and POs (the overview's second read). */
export async function supplierRecent(id: string) {
  const [quotes, pos] = await Promise.all([
    opsDb.supplierQuote.findMany({
      where: { supplierId: id, status: { notIn: ['rejected', 'duplicate'] } },
      orderBy: { receivedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        supplierRef: true,
        receivedAt: true,
        currency: true,
        totalAmount: true,
        enquiry: { select: { ref: true, stage: true } },
        _count: { select: { lines: true } },
      },
    }),
    opsDb.supplierPo.findMany({
      where: { supplierId: id, status: { notIn: ['draft', 'cancelled'] } },
      orderBy: { createdAt: 'desc' },
      take: 2,
      select: { id: true, number: true, status: true, readyDatePromised: true, readyDateCurrent: true, createdAt: true },
    }),
  ])
  return [
    ...quotes.map((q) => ({
      key: q.id,
      at: q.receivedAt,
      mark: (q.enquiry.stage === 'won' ? 'ok' : 'n') as 'ok' | 'n' | 'warn',
      title: `${q.supplierRef ?? 'Quote'} · ${q._count.lines} line${q._count.lines === 1 ? '' : 's'}${
        q.totalAmount ? ` · ${q.currency ?? ''} ${Number(q.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : ''
      }`,
      sub: `${date(q.receivedAt)} · ${q.enquiry.ref}${q.enquiry.stage === 'won' ? ' · won' : ''}`,
      href: `/enquiries/${q.enquiry.ref}`,
      hrefLabel: 'RFQ',
    })),
    ...pos.map((p) => {
      const late =
        p.readyDatePromised && p.readyDateCurrent ? daysUntil(p.readyDateCurrent) - daysUntil(p.readyDatePromised) : 0
      return {
        key: p.id,
        at: p.createdAt,
        mark: (late > 0 ? 'warn' : 'n') as 'ok' | 'n' | 'warn',
        title: `${p.number ?? 'PO'}${late > 0 ? ` ready ${late} days late` : ` · ${p.status.replace(/_/g, ' ')}`}`,
        sub: date(p.createdAt),
        href: null,
        hrefLabel: 'Order',
      }
    }),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 4)
}

/** Board 129 "Notes and lessons": active lessons scoped to this supplier, newest first. */
export async function supplierLessons(id: string) {
  const rows = await opsDb.lesson.findMany({
    where: { companyId: id, active: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, text: true, createdAt: true },
  })
  return rows.map((r) => ({ id: r.id, text: r.text, at: date(r.createdAt) }))
}

/** Board 128 saved views: the person's own saved searches for this page (none are seeded). */
export async function supplierViews(userId: string) {
  const rows = await opsDb.savedSearch.findMany({
    where: { userId, structured: { path: ['page'], equals: 'suppliers' } },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true, queryText: true },
  })
  return rows
}
