import 'server-only'
import {
  columnTotal,
  compactMoney,
  pipelineCoverage,
  pipelineMoves,
  PIPELINE_GROUPS,
  type EnquiryStage,
  type PipelineGroup,
  type PipelineGroupKey,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import type { EnquiriesSearch, EnquiryGroupParam } from '../app/(console)/enquiries/search-params'
import type { OpsUser } from '../lib/access'
import { decodeCursor, encodeCursor, PAGE_SIZE } from './pagination'

/**
 * Board 04 reads (S09-T02, ADR-04): the pipeline from `ops.enquiry_pipeline_v`, never a per-card fan-out.
 *   Board: (1) up to 50 cards per column (row_number per group, soonest deadline first), (2) count and value
 *          per column and currency, one grouped read.
 *   Table: (1) one keyset page of 50 on (sort value, id), (2) the filter chips' counts from
 *          `ops.enquiry_filter_counts_v`.
 * Values are the sell side (the quotation total or the estimate); a Helper without canSeeMargins sees none.
 */

export const CARDS_PER_COLUMN = 50

export interface PipelineCardData {
  id: string
  ref: string
  title: string
  clientName: string | null
  /** "3 Oct" (the client deadline) or null. */
  due: string | null
  /** Working-day tone is not needed here: the board shows the date only (board 04). */
  value: string | null
  cov: number
  covLabel: string
  ownerInitials: string | null
  stage: EnquiryStage
  version: number
  /** Columns the machine allows from here (drag and "Move to…"). */
  moves: PipelineGroupKey[]
  /** Quoted or in negotiation: "Won" goes through the PO check on the quotation tab. */
  canWin: boolean
}

export interface PipelineColumn {
  key: PipelineGroupKey
  label: string
  count: number
  total: string
  cards: PipelineCardData[]
}

interface ViewRow {
  id: string
  ref: string
  title: string
  clientName: string | null
  ownerInitials: string | null
  deadline: Date | null
  receivedAt: Date
  stage: EnquiryStage
  stageGroup: PipelineGroup
  value: Prisma.Decimal | null
  valueCurrency: string | null
  linesTotal: number
  linesSent: number
  linesQuoted: number
  quotationNumber: string | null
  quotationStatus: string | null
  quotationClientStatus: string | null
  clientPoRef: string | null
  version: number
  chosenPath: string | null
}

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })
const fmtDay = (d: Date) => DAY.format(d).replace('Sept', 'Sep')

const SENT_QUOTATION = new Set(['sent', 'viewed', 'evaluating'])

function seesValue(user: Pick<OpsUser, 'role' | 'canSeeMargins'>): boolean {
  return user.role === 'owner' || user.canSeeMargins
}

function ownerFilter(owner: string | undefined): Prisma.Sql {
  return owner ? Prisma.sql`AND lower(v."ownerInitials") = ${owner}` : Prisma.empty
}

function searchFilter(q: string | undefined): Prisma.Sql {
  if (!q) return Prisma.empty
  const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
  return Prisma.sql`AND (v.ref ILIKE ${like} OR v.title ILIKE ${like} OR v."clientName" ILIKE ${like})`
}

function toCard(r: ViewRow, user: Pick<OpsUser, 'role' | 'canSeeMargins'>): PipelineCardData {
  const cov = pipelineCoverage(r)
  return {
    id: r.id,
    ref: r.ref,
    title: r.title,
    clientName: r.clientName,
    due: r.deadline ? fmtDay(r.deadline) : null,
    value: seesValue(user) ? compactMoney(r.value?.toString() ?? null, r.valueCurrency) : null,
    cov: cov.pct,
    covLabel: cov.label,
    ownerInitials: r.ownerInitials,
    stage: r.stage,
    version: r.version,
    moves: pipelineMoves(r.stage, {
      chosenPath: r.chosenPath as never,
      hasSentQuotation: SENT_QUOTATION.has(r.quotationStatus ?? ''),
      orderCreated: r.clientPoRef !== null,
      actorRole: user.role,
    }),
    canWin: r.stage === 'quoted' || r.stage === 'negotiation',
  }
}

const COLUMNS = Prisma.sql`v.id, v.ref, v.title, v."clientName", v."ownerInitials", v.deadline, v."receivedAt",
  v.stage, v."stageGroup", v.value, v."valueCurrency", v."linesTotal", v."linesSent", v."linesQuoted",
  v."quotationNumber", v."quotationStatus", v."quotationClientStatus", v."clientPoRef", v.version, v."chosenPath"`

export async function listPipeline(
  s: Pick<EnquiriesSearch, 'owner' | 'q'>,
  user: Pick<OpsUser, 'role' | 'canSeeMargins'>
): Promise<PipelineColumn[]> {
  const cards = await opsDb.$queryRaw<ViewRow[]>(Prisma.sql`
    SELECT * FROM (
      SELECT ${COLUMNS},
             row_number() OVER (PARTITION BY v."stageGroup"
                                ORDER BY v.deadline ASC NULLS LAST, v."receivedAt" DESC, v.id) AS rn
        FROM ops.enquiry_pipeline_v v
       WHERE v."stageGroup" <> 'ended' ${ownerFilter(s.owner)} ${searchFilter(s.q)}
    ) x
    WHERE x.rn <= ${CARDS_PER_COLUMN}
    ORDER BY x.deadline ASC NULLS LAST, x."receivedAt" DESC, x.id`)
  const totals = await opsDb.$queryRaw<
    Array<{ stageGroup: string; currency: string | null; n: number; sum: Prisma.Decimal | null }>
  >(Prisma.sql`
    SELECT v."stageGroup", v."valueCurrency" AS currency, count(*)::int AS n, sum(v.value) AS sum
      FROM ops.enquiry_pipeline_v v
     WHERE v."stageGroup" <> 'ended' ${ownerFilter(s.owner)} ${searchFilter(s.q)}
     GROUP BY 1, 2`)
  return PIPELINE_GROUPS.map((g) => {
    const rows = totals.filter((t) => t.stageGroup === g.key)
    return {
      key: g.key,
      label: g.label,
      count: rows.reduce((n, t) => n + t.n, 0),
      total: seesValue(user)
        ? columnTotal(rows.map((t) => ({ amount: t.sum?.toString() ?? null, currency: t.currency })))
        : '',
      cards: cards.filter((c) => c.stageGroup === g.key).map((c) => toCard(c, user)),
    }
  })
}

export interface EnquiryTableRow extends PipelineCardData {
  stageGroup: PipelineGroup
  linesTotal: number
  received: string
}

export interface EnquiryTablePage {
  rows: EnquiryTableRow[]
  nextCursor: string | null
  counts: Record<EnquiryGroupParam | 'all', number>
}

const SORT_EXPR: Record<EnquiriesSearch['sort'], { sql: Prisma.Sql; kind: 'date' | 'number' }> = {
  // NULL deadlines and values sort as if far away / zero, so the keyset never meets a NULL.
  deadline: { sql: Prisma.sql`coalesce(v.deadline, 'infinity'::timestamptz)`, kind: 'date' },
  received: { sql: Prisma.sql`v."receivedAt"`, kind: 'date' },
  value: { sql: Prisma.sql`coalesce(v.value, -1)`, kind: 'number' },
}

export async function listEnquiries(
  s: EnquiriesSearch,
  user: Pick<OpsUser, 'role' | 'canSeeMargins'>
): Promise<EnquiryTablePage> {
  // A Helper without the flag cannot sort by value: they cannot see it.
  const sortKey = s.sort === 'value' && !seesValue(user) ? 'deadline' : s.sort
  const sort = SORT_EXPR[sortKey]
  const cursor = decodeCursor(s.cursor, sortKey, sort.kind)
  const cmp = s.dir === 'asc' ? Prisma.sql`>` : Prisma.sql`<`
  const dir = s.dir === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`
  // 'infinity' cannot ride in a cursor as a Date: a null-deadline row's sort value is the far future.
  const FAR = new Date('9999-12-31T00:00:00Z')
  const keyset = cursor
    ? sort.kind === 'date'
      ? Prisma.sql`AND (least(${sort.sql}, ${FAR}::timestamptz), v.id) ${cmp} (${cursor.value as Date}::timestamptz, ${cursor.id}::uuid)`
      : Prisma.sql`AND (${sort.sql}, v.id) ${cmp} (${cursor.value as number}::numeric, ${cursor.id}::uuid)`
    : Prisma.empty
  const sortValue = sort.kind === 'date' ? Prisma.sql`least(${sort.sql}, ${FAR}::timestamptz)` : sort.sql
  const stage = s.stage ? Prisma.sql`AND v."stageGroup" = ${s.stage}` : Prisma.empty
  const rows = await opsDb.$queryRaw<Array<ViewRow & { sortValue: Date | Prisma.Decimal }>>(Prisma.sql`
    SELECT ${COLUMNS}, ${sortValue} AS "sortValue"
      FROM ops.enquiry_pipeline_v v
     WHERE true ${stage} ${ownerFilter(s.owner)} ${searchFilter(s.q)} ${keyset}
     ORDER BY ${sortValue} ${dir}, v.id ${dir}
     LIMIT ${PAGE_SIZE + 1}`)
  const page = rows.slice(0, PAGE_SIZE)
  const last = page.at(-1)
  const nextCursor =
    rows.length > PAGE_SIZE && last
      ? encodeCursor({
          field: sortKey,
          value: last.sortValue instanceof Date ? last.sortValue : Number(last.sortValue.toString()),
          id: last.id,
        })
      : null
  const countRows = await opsDb.$queryRaw<Array<{ stageGroup: string; n: number }>>(Prisma.sql`
    SELECT c."stageGroup", sum(c.n)::int AS n
      FROM ops.enquiry_filter_counts_v c
      LEFT JOIN ops."user" u ON u.id = c."ownerId"
     WHERE ${s.owner ? Prisma.sql`lower(u.initials) = ${s.owner}` : Prisma.sql`true`}
     GROUP BY 1`)
  const counts = Object.fromEntries(
    (['all', 'enquiry', 'sourcing', 'quotes_in', 'quoted', 'negotiation', 'won', 'ended'] as const).map(
      (k) => [k, k === 'all' ? countRows.reduce((n, r) => n + r.n, 0) : (countRows.find((r) => r.stageGroup === k)?.n ?? 0)]
    )
  ) as EnquiryTablePage['counts']
  return {
    rows: page.map((r) => ({
      ...toCard(r, user),
      stageGroup: r.stageGroup,
      linesTotal: r.linesTotal,
      received: fmtDay(r.receivedAt),
    })),
    nextCursor,
    counts,
  }
}
