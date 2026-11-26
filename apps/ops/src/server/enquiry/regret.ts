import 'server-only'
import { salutation, type DenyTerm } from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { enquiryDenyList } from '../identity/client-bound'
import { parseScopeVersion } from './choose-path'

/**
 * What a regret to the client is built from (S09-T06, board 168): the enquiry and the lines it regrets, the client's
 * thread in sales@, the signed-off-or-awaiting templates, the categories quoted in the last 12 months (for the
 * "glad to quote on" line), what suppliers said (for the reasons a person reads; never for the client) and the
 * deny list the reverse identifier check scans with.
 */

export type RegretReasonValue =
  'no_source_found' | 'deadline_too_short' | 'not_our_range' | 'client_unresponsive' | 'other'

export const REGRET_REASONS: ReadonlyArray<{ value: RegretReasonValue; label: string }> = [
  { value: 'no_source_found', label: 'No source found' },
  { value: 'deadline_too_short', label: 'Deadline too short' },
  { value: 'not_our_range', label: 'Not our range' },
  { value: 'client_unresponsive', label: 'Client unresponsive' },
  { value: 'other', label: 'Other' },
]

export interface RegretInput {
  enquiryId: string
  ref: string
  title: string
  clientName: string
  clientRef: string | null
  scope: 'whole' | 'lines'
  /** The regretted lines (scope lines) with a short description from the client's own words. */
  lines: Array<{ id: string; no: number; description: string }>
  /** Lines of the enquiry still being quoted (scope lines), for the card. */
  otherLines: number
  mailbox: { id: string; address: string } | null
  source: {
    threadId: string
    inSales: boolean
    rfcMessageId: string | null
    referencesRfcIds: string[]
    subject: string
    to: string
    quoted: string
    wrote: string
  } | null
  salutation: string
  templates: {
    whole: { subject: string; body: string } | null
    lines: { subject: string; body: string } | null
    glad: string | null
  }
  /** Top categories quoted in the last 12 months, lower case ("hydraulic hoses and fittings"). */
  categories: string[]
  /** For the card's reasons (internal): who declined, who did not reply, after how many chasers. */
  outcomes: {
    declined: string[]
    noReply: Array<{ name: string; chasers: number; rfqRef: string }>
    linesOutside: number[]
    workingDaysLeft: number | null
  }
  deadline: { label: string; daysEarly: number } | null
  deny: DenyTerm[]
  suggestedReason: RegretReasonValue
}

const DAY = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
})
const day = (d: Date) => DAY.format(d).replace('Sept', 'Sep')

export async function gatherRegret(
  enquiryId: string,
  sourceVersion: string | number,
  now = new Date()
): Promise<RegretInput> {
  const { scope, lineNos } = parseScopeVersion(sourceVersion)
  const e = await opsDb.enquiry.findUniqueOrThrow({
    where: { id: enquiryId },
    select: {
      id: true,
      ref: true,
      title: true,
      clientRef: true,
      deadline: true,
      contactId: true,
      fitNotes: true,
      client: { select: { name: true } },
      lines: {
        where: { status: { not: 'cancelled' } },
        orderBy: { no: 'asc' },
        select: { id: true, no: true, description: true, status: true },
      },
      intakeBatches: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: {
          mailMessage: {
            select: {
              threadId: true,
              rfcMessageId: true,
              referencesRfcIds: true,
              subject: true,
              fromAddress: true,
              fromName: true,
              bodyText: true,
              sentAt: true,
              mailboxId: true,
              mailbox: { select: { role: true } },
            },
          },
        },
      },
      rfqs: {
        select: {
          ref: true,
          recipients: {
            select: { status: true, chasersSent: true, supplier: { select: { name: true } } },
          },
        },
      },
    },
  })
  const m = e.intakeBatches[0]?.mailMessage ?? null
  const yearAgo = new Date(now.getTime() - 365 * 86_400_000)
  const [sales, contact, tpls, categories, deny] = await Promise.all([
    m?.mailbox.role === 'client'
      ? opsDb.mailbox.findUnique({
          where: { id: m.mailboxId },
          select: { id: true, address: true },
        })
      : opsDb.mailbox.findFirst({
          where: { role: 'client', status: 'live' },
          orderBy: { createdAt: 'asc' },
          select: { id: true, address: true },
        }),
    e.contactId
      ? opsDb.contact.findUnique({
          where: { id: e.contactId },
          select: { salutation: true, firstName: true, name: true, email: true },
        })
      : null,
    opsDb.emailTemplate.findMany({
      where: {
        key: { in: ['client_regret_whole', 'client_regret_lines', 'client_regret_glad_line'] },
      },
      select: { key: true, subjectTemplate: true, bodyTemplate: true },
    }),
    opsDb.$queryRaw<Array<{ name: string }>>(Prisma.sql`
      SELECT t.name, count(*) AS n
        FROM ops.quotation_line ql
        JOIN ops.quotation q ON q.id = ql."quotationId"
        JOIN ops.enquiry_line el ON el.id = ql."enquiryLineId"
        LEFT JOIN ops.trade_group tg ON tg.id = el."tradeGroupId"
        LEFT JOIN ops.part p ON p.id = el."partId"
        JOIN ops.trade t ON t.id = coalesce(tg."tradeId", p."tradeId")
       WHERE q.status IN ('sent', 'viewed', 'evaluating', 'won', 'lost')
         AND q."createdAt" >= ${yearAgo}
       GROUP BY t.name
       ORDER BY n DESC, t.name
       LIMIT 4`),
    enquiryDenyList(e.id),
  ])
  const tpl = (k: string) => tpls.find((t) => t.key === k) ?? null
  const picked = scope === 'lines' ? e.lines.filter((l) => lineNos.includes(l.no)) : []
  const recipients = e.rfqs.flatMap((r) => r.recipients.map((x) => ({ ...x, rfqRef: r.ref })))
  const declined = [
    ...new Set(recipients.filter((r) => r.status === 'regretted').map((r) => r.supplier.name)),
  ]
  const noReply = recipients
    .filter((r) => r.status === 'no_reply' || (r.status === 'sent' && r.chasersSent >= 2))
    .map((r) => ({ name: r.supplier.name, chasers: r.chasersSent, rfqRef: r.rfqRef }))
  const outside = ((e.fitNotes as { outsideNos?: number[] } | null)?.outsideNos ?? []).filter(
    (n) => (scope === 'whole' ? true : lineNos.includes(n))
  )
  const daysLeft = e.deadline
    ? Math.floor((e.deadline.getTime() - now.getTime()) / 86_400_000)
    : null
  const suggestedReason: RegretReasonValue =
    declined.length || e.lines.some((l) => l.status === 'no_source')
      ? 'no_source_found'
      : outside.length
        ? 'not_our_range'
        : daysLeft !== null && daysLeft <= 1
          ? 'deadline_too_short'
          : 'other'
  const to = (contact?.email ?? m?.fromAddress ?? '').toLowerCase()
  return {
    enquiryId: e.id,
    ref: e.ref,
    title: e.title,
    clientName: e.client?.name ?? 'the client',
    clientRef: e.clientRef,
    scope,
    lines: picked.map((l) => ({ id: l.id, no: l.no, description: short(l.description) })),
    otherLines: scope === 'lines' ? e.lines.length - picked.length : 0,
    mailbox: sales,
    source: m
      ? {
          threadId: m.threadId,
          inSales: m.mailbox.role === 'client',
          rfcMessageId: m.rfcMessageId,
          referencesRfcIds: m.referencesRfcIds,
          subject: m.subject ?? '',
          to,
          quoted: (m.bodyText ?? '').replace(/\s+/g, ' ').trim().slice(0, 160),
          wrote: `On ${day(m.sentAt)}, ${m.fromName ?? m.fromAddress} wrote:`,
        }
      : null,
    salutation: salutation(contact ?? (m ? { name: m.fromName } : null)),
    templates: {
      whole: tpl('client_regret_whole')
        ? {
            subject: tpl('client_regret_whole')!.subjectTemplate,
            body: tpl('client_regret_whole')!.bodyTemplate,
          }
        : null,
      lines: tpl('client_regret_lines')
        ? {
            subject: tpl('client_regret_lines')!.subjectTemplate,
            body: tpl('client_regret_lines')!.bodyTemplate,
          }
        : null,
      glad: tpl('client_regret_glad_line')?.bodyTemplate ?? null,
    },
    categories: categories.map((c) => c.name.toLowerCase()),
    outcomes: { declined, noReply, linesOutside: outside, workingDaysLeft: daysLeft },
    deadline: e.deadline ? { label: day(e.deadline), daysEarly: daysLeft ?? 0 } : null,
    deny,
    suggestedReason,
  }
}

/** The client's own words for a line, cut at a word near 60 characters, first letter lower-cased mid-sentence. */
function short(d: string): string {
  const one = d.replace(/\s+/g, ' ').trim()
  const cut = one.length <= 60 ? one : `${one.slice(0, 60).replace(/\s+\S*$/, '')}…`
  return cut.charAt(0).toLowerCase() + cut.slice(1)
}

/** "line 14, the final drive gearbox assembly" · "lines 12 and 13" · "lines 3, 5 and 9". */
export function linesSentence(lines: ReadonlyArray<{ no: number; description: string }>): string {
  if (lines.length === 1) return `line ${lines[0]!.no}, ${lines[0]!.description}`
  const nos = lines.map((l) => l.no)
  return `lines ${nos.slice(0, -1).join(', ')} and ${nos.at(-1)}`
}

/** "hydraulic hoses and fittings, seals, bearings and valves". */
export function categoryList(c: readonly string[]): string {
  return c.length <= 1 ? (c[0] ?? '') : `${c.slice(0, -1).join(', ')} and ${c.at(-1)}`
}
