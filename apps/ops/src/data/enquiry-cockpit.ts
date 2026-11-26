import 'server-only'
import {
  resolveEnquiryHeader,
  resolveHeaderState,
  workingDaysBetween,
  wallTime,
  type EnquiryHeaderCounts,
  type EnquiryStage,
  type EnquiryTab,
  type HeaderMeta,
  type HolidayRow,
  type RecordHeaderState,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { cache } from 'react'
import { getSetting } from '../server/settings/get'

/**
 * The enquiry cockpit read (S09-T01, 05 §6.2): the record layout and every tab page share it through React
 * cache(), so a request reads the enquiry once. Two statements, whatever the tab:
 *   (a) the enquiry with client, contact, owner, line counts by status, open client questions, RFQs sent,
 *       quotes captured, the order, the client thread and the AE holidays up to the deadline;
 *   (b) the last three done Assistant actions and the number of proposals waiting.
 * The header (stage track, CTA, chip, did, need) comes from resolveEnquiryHeader for the tab shown.
 */

export interface CockpitViewer {
  role: 'owner' | 'helper'
  canSeeMargins: boolean
}

export interface EnquiryCockpit {
  id: string
  ref: string
  version: number
  stage: EnquiryStage
  isTender: boolean
  title: string
  clientId: string | null
  clientName: string | null
  contactName: string | null
  ownerId: string | null
  ownerInitials: string | null
  clientRef: string | null
  receivedAt: Date
  deadline: Date | null
  revertBy: Date | null
  decisionBy: Date | null
  chosenPath: string | null
  threadId: string | null
  orderRef: string | null
  counts: EnquiryHeaderCounts
  pending: number
  done: string[]
  /** The deadline in working days from today (AE calendar), null without a deadline. */
  workingDaysLeft: number | null
  viewer: CockpitViewer
  /** The header for one tab (the CTA can differ by tab). */
  header: (tab: EnquiryTab) => RecordHeaderState
}

interface RowA {
  id: string
  ref: string
  version: number
  stage: EnquiryStage
  isTender: boolean
  title: string
  clientId: string | null
  clientName: string | null
  contactName: string | null
  ownerId: string | null
  ownerInitials: string | null
  clientRef: string | null
  receivedAt: Date
  deadline: Date | null
  revertBy: Date | null
  decisionBy: Date | null
  chosenPath: string | null
  threadId: string | null
  orderRef: string | null
  linesTotal: number
  held: number
  noSource: number
  toFollow: number
  rfqsSent: number
  quotesCaptured: number
  openQuestions: number
  questionLines: number
  holidays: HolidayRow[] | null
}

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })
export const fmtDay = (d: Date) => DAY.format(d).replace('Sept', 'Sep')

const cal = (d: Date) => {
  const w = wallTime(d, 'Asia/Dubai')
  return { year: w.year, month: w.month, day: w.day }
}

async function readA(ref: string): Promise<RowA | null> {
  const rows = await opsDb.$queryRaw<RowA[]>(Prisma.sql`
    SELECT e.id, e.ref, e.version, e.stage::text AS stage, e."isTender", e.title,
           e."clientId", c.name AS "clientName", ct.name AS "contactName",
           e."ownerId", u.initials AS "ownerInitials", e."clientRef", e."receivedAt", e.deadline,
           e."revertBy", e."decisionBy", e."chosenPath"::text AS "chosenPath",
           (SELECT t.id FROM ops.mail_thread t JOIN ops.mailbox m ON m.id = t."mailboxId"
             WHERE t."enquiryId" = e.id ORDER BY (m.role = 'client') DESC, t."lastMessageAt" DESC NULLS LAST
             LIMIT 1) AS "threadId",
           (SELECT o.ref FROM ops."order" o WHERE o."enquiryId" = e.id ORDER BY o."createdAt" LIMIT 1) AS "orderRef",
           l.total AS "linesTotal", l.held, l."noSource", l."toFollow",
           (SELECT count(*)::int FROM ops.supplier_rfq r WHERE r."enquiryId" = e.id AND r.status IN ('sent', 'closed')) AS "rfqsSent",
           (SELECT count(*)::int FROM ops.supplier_quote q WHERE q."enquiryId" = e.id AND q.status = 'confirmed') AS "quotesCaptured",
           q.open AS "openQuestions", q.lines AS "questionLines",
           (SELECT json_agg(json_build_object('country', h.country, 'date', to_char(h.date, 'YYYY-MM-DD'),
                                              'kind', h.kind, 'hoursStart', h."hoursStart", 'hoursEnd', h."hoursEnd"))
              FROM ops.holiday h
             WHERE h.country = 'AE' AND e.deadline IS NOT NULL
               AND h.date BETWEEN (now() - interval '2 days')::date AND (e.deadline + interval '1 day')::date) AS holidays
      FROM ops.enquiry e
      LEFT JOIN ops.company c ON c.id = e."clientId"
      LEFT JOIN ops.contact ct ON ct.id = e."contactId"
      LEFT JOIN ops."user" u ON u.id = e."ownerId"
      CROSS JOIN LATERAL (
        SELECT count(*)::int AS total,
               count(*) FILTER (WHERE el.status = 'held')::int AS held,
               count(*) FILTER (WHERE el.status = 'no_source')::int AS "noSource",
               count(*) FILTER (WHERE el.status = 'to_follow')::int AS "toFollow"
          FROM ops.enquiry_line el WHERE el."enquiryId" = e.id) l
      CROSS JOIN LATERAL (
        SELECT count(*)::int AS open, count(DISTINCT cq."lineId")::int AS lines
          FROM ops.client_question cq WHERE cq."enquiryId" = e.id AND cq.status = 'sent') q
     WHERE e.ref = ${ref}`)
  return rows[0] ?? null
}

async function readB(enquiryId: string): Promise<{ pending: number; done: string[] }> {
  const rows = await opsDb.$queryRaw<Array<{ pending: number; done: string[] | null }>>(Prisma.sql`
    SELECT (SELECT count(*)::int FROM ops.assistant_action a
             WHERE a."enquiryId" = ${enquiryId}::uuid AND a.state IN ('proposed', 'later')
               -- Only Review cards wait for a person here: the quick read (hint) shows on its own card.
               AND a.surface = 'review') AS pending,
           (SELECT array_agg(d.headline) FROM (
              SELECT a.headline FROM ops.assistant_action a
               WHERE a."enquiryId" = ${enquiryId}::uuid AND a.state = 'done'
               ORDER BY coalesce(a."decidedAt", a."updatedAt") DESC LIMIT 3) d) AS done`)
  return { pending: rows[0]?.pending ?? 0, done: rows[0]?.done ?? [] }
}

function deadlineMeta(a: RowA, left: number | null): HeaderMeta {
  if (!a.deadline) return { label: 'Client deadline', value: 'Not stated' }
  const when = fmtDay(a.deadline)
  if (left === null || left < 0) return { label: 'Client deadline', value: `${when} · passed`, tone: 'bad' }
  return {
    label: 'Client deadline',
    value: `${when} · ${left} working day${left === 1 ? '' : 's'} left`,
    ...(left <= 2 ? { tone: 'bad' as const } : {}),
  }
}

async function load(ref: string, role: CockpitViewer['role'], canSeeMargins: boolean): Promise<EnquiryCockpit | null> {
  const a = await readA(ref)
  if (!a) return null
  const [b, weekends] = await Promise.all([readB(a.id), getSetting('calendar.country_weekends')])
  const now = new Date()
  const left = a.deadline
    ? a.deadline.getTime() < now.getTime()
      ? -1
      : workingDaysBetween(cal(now), cal(a.deadline), 'AE', a.holidays ?? [], weekends)
    : null
  const counts: EnquiryHeaderCounts = {
    linesTotal: a.linesTotal,
    held: a.held,
    noSource: a.noSource,
    toFollow: a.toFollow,
    rfqsSent: a.rfqsSent,
    quotesCaptured: a.quotesCaptured,
    openQuestions: a.openQuestions,
    questionLines: a.questionLines,
  }
  const meta: readonly [HeaderMeta, HeaderMeta, HeaderMeta, HeaderMeta] = [
    { label: 'Client', value: a.clientName ?? 'Not set' },
    { label: 'Client ref', value: a.clientRef ?? '—' },
    { label: 'Received', value: fmtDay(a.receivedAt) },
    deadlineMeta(a, left),
  ]
  const header = (tab: EnquiryTab): RecordHeaderState => {
    const r = resolveEnquiryHeader({
      id: a.id,
      ref: a.ref,
      stage: a.stage,
      tab,
      counts,
      done: b.done,
      pending: b.pending,
      viewerRole: role,
      orderRef: a.orderRef,
    })
    return resolveHeaderState({
      kind: a.isTender ? 'tender' : 'enquiry',
      ref: a.ref,
      clientName: a.clientName ?? 'Client not set',
      clientHref: a.clientId ? `/clients/${a.clientId}` : '/clients',
      title: a.title,
      meta,
      stage: a.stage,
      ...(r.chip ? { chip: r.chip } : {}),
      cta: r.cta,
      did: r.did,
      needCount: r.need?.count ?? 0,
      needHref: r.need?.href,
      needLink: r.need?.label ? { href: r.need.href, label: r.need.label } : undefined,
      ...(a.threadId ? { threadHref: `/mail/all/${a.threadId}` } : {}),
    })
  }
  return {
    id: a.id,
    ref: a.ref,
    version: a.version,
    stage: a.stage,
    isTender: a.isTender,
    title: a.title,
    clientId: a.clientId,
    clientName: a.clientName,
    contactName: a.contactName,
    ownerId: a.ownerId,
    ownerInitials: a.ownerInitials,
    clientRef: a.clientRef,
    receivedAt: a.receivedAt,
    deadline: a.deadline,
    revertBy: a.revertBy,
    decisionBy: a.decisionBy,
    chosenPath: a.chosenPath,
    threadId: a.threadId,
    orderRef: a.orderRef,
    counts,
    pending: b.pending,
    done: b.done,
    workingDaysLeft: left,
    viewer: { role, canSeeMargins: role === 'owner' || canSeeMargins },
    header,
  }
}

/** One read per request per viewer (React cache keys on the primitive arguments). */
export const getEnquiryCockpit = cache(
  (ref: string, role: CockpitViewer['role'] = 'helper', canSeeMargins = false) =>
    load(ref, role, canSeeMargins)
)
