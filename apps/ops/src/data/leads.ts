import 'server-only'
import {
  columnTotal,
  LEAD_SOURCE_WORD,
  LEAD_STAGE_WORD,
  type LeadSourceValue,
  type LeadStage,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { cache } from 'react'
import { decodeCursor, encodeCursor, PAGE_SIZE } from './pagination'

/**
 * Leads (S09-T05, boards 03 and 22). The list: one keyset page of 50 (newest first) and the chips' counts and
 * the open value in one grouped read. One lead: the lead with its lines, owner and contact, then its documents
 * (the intake files read into it) and its activity.
 */

export const LEAD_FILTERS = ['open', 'new', 'contacted', 'qualified', 'closed'] as const
export type LeadFilter = (typeof LEAD_FILTERS)[number]

export interface LeadRow {
  id: string
  ref: string
  title: string
  company: string | null
  contact: string | null
  source: string
  interest: string | null
  value: string | null
  stage: LeadStage
  stageWord: string
  nextAction: string | null
  owner: string | null
}

export interface LeadList {
  rows: LeadRow[]
  nextCursor: string | null
  counts: Record<LeadFilter, number>
  /** "$2.26M" across open leads, per currency. */
  openValue: string
}

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })
export const fmtDay = (d: Date) => DAY.format(d).replace('Sept', 'Sep')

const STAGES: Record<LeadFilter, LeadStage[]> = {
  open: ['new', 'contacted', 'qualified'],
  new: ['new'],
  contacted: ['contacted'],
  qualified: ['qualified'],
  closed: ['converted', 'dropped'],
}

function compact(amount: Prisma.Decimal | null, ccy: string | null): string | null {
  if (!amount) return null
  return columnTotal([{ amount: amount.toString(), currency: ccy ?? 'AED' }])
}

export async function listLeads(s: { filter: LeadFilter; cursor?: string | undefined }): Promise<LeadList> {
  const cursor = decodeCursor(s.cursor, 'createdAt', 'date')
  const rows = await opsDb.lead.findMany({
    where: {
      stage: { in: STAGES[s.filter] },
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: cursor.value } },
              { createdAt: cursor.value, id: { lt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: PAGE_SIZE + 1,
    select: {
      id: true,
      ref: true,
      title: true,
      name: true,
      companyName: true,
      company: { select: { name: true } },
      contact: { select: { name: true } },
      source: true,
      interest: true,
      estValue: true,
      estCurrency: true,
      stage: true,
      nextAction: true,
      nextActionAt: true,
      owner: { select: { initials: true } },
      createdAt: true,
    },
  })
  const page = rows.slice(0, PAGE_SIZE)
  const last = page.at(-1)
  const grouped = await opsDb.$queryRaw<
    Array<{ stage: LeadStage; currency: string | null; n: number; sum: Prisma.Decimal | null }>
  >(Prisma.sql`
    SELECT stage::text AS stage, "estCurrency" AS currency, count(*)::int AS n, sum("estValue") AS sum
      FROM ops.lead GROUP BY 1, 2`)
  const count = (f: LeadFilter) =>
    grouped.filter((g) => STAGES[f].includes(g.stage)).reduce((n, g) => n + g.n, 0)
  return {
    rows: page.map((l) => ({
      id: l.id,
      ref: l.ref,
      title: l.title ?? l.name,
      company: l.company?.name ?? l.companyName,
      contact: l.contact?.name ?? (l.company ? null : l.name),
      source: LEAD_SOURCE_WORD[l.source as LeadSourceValue],
      interest: l.interest,
      value: compact(l.estValue, l.estCurrency),
      stage: l.stage as LeadStage,
      stageWord: LEAD_STAGE_WORD[l.stage as LeadStage],
      nextAction: l.nextAction
        ? `${l.nextAction}${l.nextActionAt ? ` · ${fmtDay(l.nextActionAt)}` : ''}`
        : null,
      owner: l.owner?.initials ?? null,
    })),
    nextCursor:
      rows.length > PAGE_SIZE && last
        ? encodeCursor({ field: 'createdAt', value: last.createdAt, id: last.id })
        : null,
    counts: Object.fromEntries(LEAD_FILTERS.map((f) => [f, count(f)])) as LeadList['counts'],
    openValue: columnTotal(
      grouped
        .filter((g) => STAGES.open.includes(g.stage))
        .map((g) => ({ amount: g.sum?.toString() ?? null, currency: g.currency ?? 'AED' }))
    ),
  }
}

export interface LeadDetail {
  id: string
  ref: string
  version: number
  title: string
  name: string
  stage: LeadStage
  source: string
  companyId: string | null
  company: string | null
  contact: { name: string | null; role: string | null; email: string | null } | null
  owner: { id: string; name: string; initials: string } | null
  clientRef: string | null
  neededBy: Date | null
  estValue: string | null
  interest: string | null
  notes: string | null
  convertedEnquiryRef: string | null
  lines: Array<{
    id: string
    no: number
    description: string
    partNo: string | null
    qty: string | null
    uom: string | null
    specNotes: string | null
    trade: string | null
    tradeId: string | null
    sourcePage: number | null
    sourceDocumentId: string | null
    spanId: string | null
    version: number
  }>
  categories: Array<{ name: string; count: number }>
  /** The intake files read into this lead. */
  documents: Array<{ id: string; filename: string; kind: string; linesFound: number | null; linesKept: number; storedFileId: string | null }>
  provenance: { filename: string | null; by: string | null; at: Date | null } | null
}

export const getLead = cache(async (ref: string): Promise<LeadDetail | null> => {
  const l = await opsDb.lead.findUnique({
    where: { ref },
    select: {
      id: true,
      ref: true,
      version: true,
      title: true,
      name: true,
      stage: true,
      source: true,
      companyId: true,
      companyName: true,
      company: { select: { name: true } },
      contact: { select: { name: true, role: true, email: true } },
      email: true,
      owner: { select: { id: true, name: true, initials: true } },
      clientRef: true,
      neededBy: true,
      estValue: true,
      estCurrency: true,
      interest: true,
      notes: true,
      convertedEnquiry: { select: { ref: true } },
      lines: {
        orderBy: { no: 'asc' },
        select: {
          id: true,
          no: true,
          description: true,
          partNo: true,
          qty: true,
          uom: true,
          specNotes: true,
          trade: { select: { id: true, name: true } },
          sourcePage: true,
          sourceDocumentId: true,
          spanIds: true,
          version: true,
          confirmedAt: true,
          confirmedById: true,
        },
      },
    },
  })
  if (!l) return null
  const batches = await opsDb.intakeBatch.findMany({
    where: { leadId: l.id },
    select: {
      files: {
        select: {
          id: true,
          filename: true,
          kind: true,
          linesFound: true,
          storedFileId: true,
          _count: { select: { candidates: { where: { decision: { in: ['accepted', 'edited'] } } } } },
        },
      },
      confirmedAt: true,
      confirmedById: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  const files = batches.flatMap((b) => b.files)
  const trades = new Map<string, number>()
  for (const x of l.lines) if (x.trade) trades.set(x.trade.name, (trades.get(x.trade.name) ?? 0) + 1)
  const latest = batches[0]
  const by = latest?.confirmedById
    ? await opsDb.user.findUnique({ where: { id: latest.confirmedById }, select: { name: true } })
    : null
  return {
    id: l.id,
    ref: l.ref,
    version: l.version,
    title: l.title ?? l.name,
    name: l.name,
    stage: l.stage as LeadStage,
    source: LEAD_SOURCE_WORD[l.source as LeadSourceValue],
    companyId: l.companyId,
    company: l.company?.name ?? l.companyName,
    contact: l.contact ?? (l.email ? { name: l.name, role: null, email: l.email } : null),
    owner: l.owner,
    clientRef: l.clientRef,
    neededBy: l.neededBy,
    estValue: compact(l.estValue, l.estCurrency),
    interest: l.interest,
    notes: l.notes,
    convertedEnquiryRef: l.convertedEnquiry?.ref ?? null,
    lines: l.lines.map((x) => ({
      id: x.id,
      no: x.no,
      description: x.description,
      partNo: x.partNo,
      qty: x.qty ? x.qty.toString().replace(/\.0+$/, '') : null,
      uom: x.uom,
      specNotes: x.specNotes,
      trade: x.trade?.name ?? null,
      tradeId: x.trade?.id ?? null,
      sourcePage: x.sourcePage,
      sourceDocumentId: x.sourceDocumentId,
      spanId: x.spanIds[0] ?? null,
      version: x.version,
    })),
    categories: [...trades.entries()].map(([name, count]) => ({ name, count })),
    documents: files.map((f) => ({
      id: f.id,
      filename: f.filename,
      kind: f.kind,
      linesFound: f.linesFound,
      linesKept: f._count.candidates,
      storedFileId: f.storedFileId,
    })),
    provenance: latest
      ? {
          filename: latest.files[0]?.filename ?? null,
          by: by?.name ?? null,
          at: latest.confirmedAt,
        }
      : null,
  }
})

/** The lead's activity: its own events, newest first (board 22 rail and the Activity tab). */
export async function leadActivity(leadId: string, take = 20) {
  const rows = await opsDb.$queryRaw<
    Array<{ id: string; at: Date; note: string | null; field: string | null; before: unknown; after: unknown; initials: string | null }>
  >(Prisma.sql`
    SELECT a.id, a.at, a.note, a.field, a.before, a.after, u.initials
      FROM ops.activity_event a LEFT JOIN ops."user" u ON u.id = a."actorId"
     WHERE a."subjectType" = 'lead' AND a."subjectId" = ${leadId}::uuid
     ORDER BY a.at DESC LIMIT ${take}`)
  return rows
}

/** The rail's short feed: one line per event and when, "Today" for today (Dubai). */
export async function leadActivityFeed(
  leadId: string,
  text: (a: { field: string | null; before: unknown; after: unknown; note: string | null }) => string,
  take = 6
): Promise<Array<{ id: string; at: Date; text: string; when: string }>> {
  const today = fmtDay(new Date())
  return (await leadActivity(leadId, take)).map((a) => ({
    id: a.id,
    at: a.at,
    text: text(a),
    when: fmtDay(a.at) === today ? 'Today' : fmtDay(a.at),
  }))
}
