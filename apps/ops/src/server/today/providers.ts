import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import type { OpsRole } from '../../lib/access-core'

/**
 * Today's section providers (S07-T06, D20). A provider declares ONE Prisma query and how to read it; the model
 * runs every provider's query in a single read transaction (an array, sequential on the one connection), so
 * Today stays within its query budget however many sprints add rows. Later sprints register their own (new
 * enquiries S08, captured quotes S15, suppliers past reply-by S12/S14, POs S22, payments S27, tenders S32)
 * without editing Today.
 */

export type TodaySection = 'came_in' | 'late' | 'done' | 'kpi' | 'this_week'

export interface TodayContext {
  userId: string
  role: OpsRole
  canSeeMargins: boolean
  now: Date
  /** 18:00 on the previous working day (Dubai). */
  since: Date
  startOfToday: Date
  endOfWeek: Date
  oneWorkingDayAgo: Date
}

export interface TodayRow {
  key: string
  title: string
  sub?: string | undefined
  /** A link and its word ("Open", "Mail", "Log"). */
  href?: string
  hrefLabel?: string
  mark?: 'ok' | 'warn' | 'bad' | 'n'
  /** For this_week: the day label. */
  day?: string
}

export interface TodayProvider<T = unknown> {
  section: TodaySection
  key: string
  /** Who sees it; omitted: everyone. */
  roles?: readonly OpsRole[]
  /** Supplier-side rows first for the Helper (board 178 Helper variant). */
  side?: 'client' | 'supplier' | 'both'
  query(ctx: TodayContext): Prisma.PrismaPromise<T>
  read(result: T, ctx: TodayContext): TodayRow[]
}

const PROVIDERS: TodayProvider[] = []

export function registerTodayProvider<T>(p: TodayProvider<T>): void {
  if (PROVIDERS.some((x) => x.key === p.key))
    throw new Error(`Today provider "${p.key}" registered twice`)
  PROVIDERS.push(p as TodayProvider)
}

/** The providers a user sees, in registration order; the Helper's supplier-side ones first. */
export function todayProviders(role: OpsRole): TodayProvider[] {
  const list = PROVIDERS.filter((p) => !p.roles || p.roles.includes(role))
  if (role !== 'helper') return list
  return [
    ...list.filter((p) => p.side === 'supplier'),
    ...list.filter((p) => p.side !== 'supplier'),
  ]
}

/** For tests: forget one provider. */
export function unregisterTodayProvider(key: string): void {
  const i = PROVIDERS.findIndex((p) => p.key === key)
  if (i >= 0) PROVIDERS.splice(i, 1)
}

const CLASS_WORD: Record<string, [string, string]> = {
  client_enquiry: ['new enquiry', 'new enquiries'],
  client_reply: ['client reply', 'client replies'],
  client_po: ['PO from a client', 'POs from clients'],
  supplier_quote: ['supplier quote', 'supplier quotes'],
  supplier_question: ['supplier question', 'supplier questions'],
  supplier_documents: ['supplier document', 'supplier documents'],
}

function mailRows(
  rows: Array<{
    id: string
    classification: string | null
    subject: string | null
    fromAddress: string
    threadId: string
  }>,
  classes: readonly string[]
): TodayRow[] {
  const out: TodayRow[] = []
  for (const cls of classes) {
    const list = rows.filter((r) => r.classification === cls)
    if (!list.length) continue
    const [one, many] = CLASS_WORD[cls] ?? [cls, cls]
    out.push({
      key: `mail:${cls}`,
      title: `${list.length} ${list.length === 1 ? one : many}`,
      sub: list
        .slice(0, 3)
        .map((m) => m.subject ?? m.fromAddress)
        .join(' · '),
      href: '/mail',
      hrefLabel: 'Mail',
      mark: cls === 'client_po' ? 'ok' : 'n',
    })
  }
  return out
}

const CLIENT_CLASSES = ['client_enquiry', 'client_reply', 'client_po'] as const
const SUPPLIER_CLASSES = ['supplier_quote', 'supplier_question', 'supplier_documents'] as const

const mailSelect = {
  id: true,
  classification: true,
  subject: true,
  fromAddress: true,
  threadId: true,
} as const

registerTodayProvider({
  section: 'came_in',
  key: 'mail.client',
  side: 'client',
  query: (ctx) =>
    opsDb.mailMessage.findMany({
      where: {
        direction: 'inbound',
        origin: 'live',
        receivedAt: { gte: ctx.since },
        classification: { in: [...CLIENT_CLASSES] },
      },
      orderBy: { receivedAt: 'desc' },
      take: 60,
      select: mailSelect,
    }),
  read: (rows) => mailRows(rows as never, CLIENT_CLASSES),
})

registerTodayProvider({
  section: 'came_in',
  key: 'mail.supplier',
  side: 'supplier',
  query: (ctx) =>
    opsDb.mailMessage.findMany({
      where: {
        direction: 'inbound',
        origin: 'live',
        receivedAt: { gte: ctx.since },
        classification: { in: [...SUPPLIER_CLASSES] },
      },
      orderBy: { receivedAt: 'desc' },
      take: 60,
      select: mailSelect,
    }),
  read: (rows) => mailRows(rows as never, SUPPLIER_CLASSES),
})

/** S08-T06: enquiries created since the cut-off (from an email card or by a person), newest first. */
registerTodayProvider({
  section: 'came_in',
  key: 'enquiry.created',
  side: 'client',
  query: (ctx) =>
    opsDb.enquiry.findMany({
      where: { origin: 'ops', createdAt: { gte: ctx.since }, closedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        ref: true,
        title: true,
        client: { select: { name: true } },
        _count: { select: { lines: true } },
      },
    }),
  read: (rows) =>
    rows.length
      ? [
          {
            key: 'enquiry.created',
            title: `${rows.length} enquir${rows.length === 1 ? 'y' : 'ies'} created`,
            sub: rows
              .slice(0, 3)
              .map(
                (e) =>
                  `${e.ref} · ${e.client?.name ?? e.title} · ${e._count.lines} line${e._count.lines === 1 ? '' : 's'}`
              )
              .join(' · '),
            href: rows.length === 1 ? `/enquiries/${rows[0]!.ref}` : '/enquiries',
            hrefLabel: 'Open',
            mark: 'ok' as const,
          },
        ]
      : [],
})

/** S08-T07: acknowledgements that left today, with the promise they made. */
registerTodayProvider({
  section: 'done',
  key: 'enquiry.acknowledged',
  query: (ctx) =>
    opsDb.outboundEmail.findMany({
      where: { kind: 'client_acknowledgement', status: 'sent', sentAt: { gte: ctx.since } },
      orderBy: { sentAt: 'desc' },
      take: 20,
      select: {
        id: true,
        sentAt: true,
        enquiry: { select: { ref: true, revertBy: true, client: { select: { name: true } } } },
      },
    }),
  read: (rows) =>
    rows.flatMap((r) =>
      r.enquiry
        ? [
            {
              key: `ack:${r.id}`,
              title: `Acknowledged ${r.enquiry.client?.name ?? r.enquiry.ref}${
                r.enquiry.revertBy
                  ? ` · revert by ${new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' }).format(r.enquiry.revertBy).replace('Sept', 'Sep')}`
                  : ''
              }`,
              sub: r.enquiry.ref,
              href: `/enquiries/${r.enquiry.ref}`,
              hrefLabel: 'Open',
              mark: 'ok' as const,
            },
          ]
        : []
    ),
})

registerTodayProvider({
  section: 'late',
  key: 'review.waiting',
  query: (ctx) =>
    opsDb.assistantAction.count({
      where: { surface: 'review', state: 'proposed', createdAt: { lt: ctx.oneWorkingDayAgo } },
    }),
  read: (n) =>
    n
      ? [
          {
            key: 'review.waiting',
            title: `${n} ${n === 1 ? 'card has' : 'cards have'} waited more than a working day`,
            sub: 'In Review, oldest first',
            href: '/review',
            hrefLabel: 'Review',
            mark: 'warn',
          },
        ]
      : [],
})

registerTodayProvider({
  section: 'late',
  key: 'review.later',
  query: (ctx) =>
    opsDb.assistantAction.count({
      where: { surface: 'review', state: 'later', laterUntil: { lt: ctx.now } },
    }),
  read: (n) =>
    n
      ? [
          {
            key: 'review.later',
            title: `${n} Later ${n === 1 ? 'item is' : 'items are'} due again`,
            href: '/review',
            hrefLabel: 'Review',
            mark: 'warn',
          },
        ]
      : [],
})

registerTodayProvider({
  section: 'late',
  key: 'outbound.stuck',
  query: () =>
    opsDb.outboundEmail.groupBy({
      by: ['status'],
      where: { status: { in: ['held', 'waiting_for_mailbox', 'unknown'] } },
      orderBy: { status: 'asc' },
      _count: { _all: true },
    }),
  read: (groups) => {
    const n = (s: string) =>
      (groups as Array<{ status: string; _count: { _all: number } }>).find((g) => g.status === s)
        ?._count._all ?? 0
    const out: TodayRow[] = []
    if (n('unknown'))
      out.push({
        key: 'outbound.unknown',
        title: `${n('unknown')} sent with an unknown result`,
        sub: 'Check before anything is sent again',
        href: '/review',
        hrefLabel: 'Review',
        mark: 'bad',
      })
    if (n('waiting_for_mailbox'))
      out.push({
        key: 'outbound.mailbox',
        title: `${n('waiting_for_mailbox')} waiting for a mailbox`,
        href: '/settings/mailboxes',
        hrefLabel: 'Open',
        mark: 'warn',
      })
    if (n('held'))
      out.push({
        key: 'outbound.held',
        title: `${n('held')} held for the send window or the daily cap`,
        href: '/review',
        hrefLabel: 'Review',
        mark: 'n',
      })
    return out
  },
})

registerTodayProvider({
  section: 'late',
  key: 'tasks.overdue',
  query: (ctx) =>
    opsDb.task.findMany({
      where: {
        status: 'open',
        dueAt: { lt: ctx.now },
        ...(ctx.role === 'helper' ? { assigneeId: ctx.userId } : {}),
      },
      orderBy: { dueAt: 'asc' },
      take: 5,
      select: { id: true, title: true, dueAt: true },
    }),
  read: (rows) =>
    (rows as Array<{ id: string; title: string; dueAt: Date | null }>).map((t) => ({
      key: `task:${t.id}`,
      title: t.title,
      sub: t.dueAt
        ? `Due ${t.dueAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Dubai' })}`
        : undefined,
      href: '/tasks',
      hrefLabel: 'Open',
      mark: 'warn' as const,
    })),
})

registerTodayProvider({
  section: 'late',
  key: 'mailbox.behind',
  query: (ctx) =>
    opsDb.mailbox.findMany({
      where: {
        OR: [
          { status: 'behind' },
          {
            status: 'live',
            syncState: { lastSuccessfulSyncAt: { lt: new Date(ctx.now.getTime() - 30 * 60_000) } },
          },
        ],
      },
      select: { address: true },
    }),
  read: (rows) =>
    (rows as Array<{ address: string }>).map((m) => ({
      key: `behind:${m.address}`,
      title: `${m.address.split('@')[0]}@ is behind`,
      sub: 'New mail may take longer to appear',
      href: '/settings/mailboxes',
      hrefLabel: 'Open',
      mark: 'warn' as const,
    })),
})

const DONE_WORD: Record<string, string> = {
  classify_mail: 'Classified',
  link_mail: 'Linked',
  label_gmail: 'Labelled',
  ack_email: 'Acknowledged',
  chase_suppliers: 'Chased',
  send_supplier_rfqs: 'Sent RFQs',
  capture_supplier_quotes: 'Captured',
}

function sentence(key: string): string {
  const t = key.replaceAll('_', ' ')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

registerTodayProvider({
  section: 'done',
  key: 'assistant.done',
  query: (ctx) =>
    opsDb.assistantAction.groupBy({
      by: ['actionKey'],
      where: { state: 'done', doneAt: { gte: ctx.startOfToday } },
      orderBy: { actionKey: 'asc' },
      _count: { _all: true },
    }),
  read: (groups) =>
    (groups as Array<{ actionKey: string; _count: { _all: number } }>)
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, 8)
      .map((g) => ({
        key: `done:${g.actionKey}`,
        title: `${DONE_WORD[g.actionKey] ?? sentence(g.actionKey)} · ${g._count._all}`,
        href: `/assistant/log?action=${g.actionKey}`,
        hrefLabel: 'Log',
        mark: 'ok' as const,
      })),
})

registerTodayProvider({
  section: 'this_week',
  key: 'tasks.week',
  query: (ctx) =>
    opsDb.task.findMany({
      where: {
        status: 'open',
        dueAt: { gte: ctx.startOfToday, lte: ctx.endOfWeek },
        ...(ctx.role === 'helper' ? { assigneeId: ctx.userId } : {}),
      },
      orderBy: { dueAt: 'asc' },
      take: 8,
      select: { id: true, title: true, dueAt: true },
    }),
  read: (rows) =>
    (rows as Array<{ id: string; title: string; dueAt: Date | null }>).map((t) => ({
      key: `week:${t.id}`,
      title: t.title,
      day: t.dueAt
        ? t.dueAt.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            timeZone: 'Asia/Dubai',
          })
        : '',
      href: '/tasks',
    })),
})
