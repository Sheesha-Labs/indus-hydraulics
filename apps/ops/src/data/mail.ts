import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import {
  CLASS_LABEL,
  domainOf,
  folderFilter,
  gmailThreadUrl,
  MAIL_TYPES,
  rowType,
  threadTime,
  type MailClassValue,
  type MailFolderKey,
  type MailRowType,
  type MailTypeSlug,
} from '@indus/ops-core'
import type { AttachmentChipProps, MailRole, SanitizedHtml } from '@indus/ops-ui/mail'
import type { OpsUser } from '../lib/access-core'
import { readCounters } from '../server/assistant/live-counter'
import { readSanitizedBody, textToSanitizedHtml } from '../server/mail/body'
import { decodeCursor, keysetWhere, PAGE_SIZE, takePage } from './pagination'

/**
 * Page reads for Mail (S05-T05, board 91). Server-only; every function is at most two queries except
 * folderCounts and getThread, which say why in place.
 *
 *   listThreads   the folder's threads, newest first, keyset by (lastMessageAt, id), 50 a page
 *   folderCounts  board 91's rail: today's live mail by mailbox, type and status, and the open-work badges
 *   getThread     one conversation across both mailboxes, with bodies, attachments, links and what the
 *                 Assistant did
 */
export interface MailListParams {
  type?: MailTypeSlug | undefined
  q?: string | undefined
  cursor?: string | undefined
  /** "Show past mail": include backfilled history. */
  past?: boolean | undefined
}

export interface ThreadListRow {
  id: string
  from: string
  senderRole: MailRole
  company?: string
  time: string
  subject: string
  type?: MailRowType
  recordRef?: string
  assistantNote?: string
}

export interface ThreadPage {
  rows: ThreadListRow[]
  nextCursor: string | null
}

function messageWhere(folder: MailFolderKey, params: MailListParams): Prisma.MailMessageWhereInput {
  const f = folderFilter(folder)
  const classes = params.type ? MAIL_TYPES[params.type].classes : null
  const q = params.q?.trim().slice(0, 120)
  return {
    direction: f.direction,
    origin: params.past ? { in: ['live', 'backfill'] } : 'live',
    ...(f.handledState ? { handledState: f.handledState } : {}),
    ...(classes ? { classification: { in: [...classes] } } : {}),
    ...(f.senderRole === 'client'
      ? { classification: { in: ['client_enquiry', 'client_reply', 'client_po'] } }
      : f.senderRole === 'supplier'
        ? {
            classification: {
              in: ['supplier_quote', 'supplier_question', 'supplier_documents', 'supplier_price_list', 'supplier_other'],
            },
          }
        : {}),
    ...(q
      ? {
          OR: [
            { subject: { contains: q, mode: 'insensitive' } },
            { fromAddress: { contains: q, mode: 'insensitive' } },
            { fromName: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
}

function senderRoleOf(cls: MailClassValue, confidence: string | null, mailboxRole: string): MailRole {
  if (confidence === 'unsure') return 'Unknown'
  if (cls.startsWith('client_')) return 'Client'
  if (cls.startsWith('supplier_')) return 'Supplier'
  if (cls === 'unclassified') return 'Unknown'
  return mailboxRole === 'client' ? 'Client' : mailboxRole === 'supplier' ? 'Supplier' : 'Unknown'
}

/** Two queries: the page of threads (with each thread's newest matching message), then company names. */
export async function listThreads(
  folder: MailFolderKey,
  params: MailListParams,
  now = new Date()
): Promise<ThreadPage> {
  const f = folderFilter(folder)
  const match = messageWhere(folder, params)
  const cursor = decodeCursor(params.cursor, 'lastMessageAt', 'date')
  const threads = await opsDb.mailThread.findMany({
    where: {
      lastMessageAt: { not: null },
      ...(f.mailboxRole ? { mailbox: { role: f.mailboxRole } } : {}),
      messages: { some: match },
      ...keysetWhere('lastMessageAt', 'desc', cursor),
    },
    orderBy: [{ lastMessageAt: 'desc' }, { id: 'desc' }],
    take: PAGE_SIZE + 1,
    select: {
      id: true,
      lastMessageAt: true,
      subject: true,
      mailbox: { select: { role: true } },
      messages: {
        where: match,
        orderBy: { sentAt: 'desc' },
        take: 1,
        select: {
          fromName: true,
          fromAddress: true,
          subject: true,
          sentAt: true,
          classification: true,
          confidence: true,
          assistantNote: true,
          links: {
            where: { removedAt: null, enquiryId: { not: null } },
            take: 1,
            select: { enquiry: { select: { ref: true } } },
          },
        },
      },
    },
  })
  const page = takePage(threads, 'lastMessageAt', (t) => t.lastMessageAt as Date)
  const domains = [
    ...new Set(page.rows.map((t) => domainOf(t.messages[0]?.fromAddress ?? '')).filter((d): d is string => !!d)),
  ]
  const companies = domains.length
    ? await opsDb.company.findMany({
        where: { domains: { hasSome: domains } },
        select: { name: true, domains: true },
        take: 200,
      })
    : []
  const companyOf = (domain: string | null) =>
    domain ? (companies.find((c) => c.domains.includes(domain))?.name ?? domain) : undefined

  return {
    nextCursor: page.nextCursor,
    rows: page.rows.flatMap((t) => {
      const m = t.messages[0]
      if (!m) return []
      const cls = m.classification as MailClassValue
      const type = rowType(cls, m.confidence)
      const company = companyOf(domainOf(m.fromAddress))
      const recordRef = m.links[0]?.enquiry?.ref
      return [
        {
          id: t.id,
          from: m.fromName?.trim() || m.fromAddress,
          senderRole: senderRoleOf(cls, m.confidence, t.mailbox.role),
          ...(company ? { company } : {}),
          time: threadTime(m.sentAt, now),
          subject: m.subject ?? t.subject ?? '(no subject)',
          ...(type ? { type } : {}),
          ...(recordRef ? { recordRef } : {}),
          ...(m.assistantNote ? { assistantNote: m.assistantNote } : {}),
        },
      ]
    }),
  }
}

export interface FolderCounts {
  mailbox: { all: number; sales: number; purchase: number }
  status: { unsure: number; notLinked: number; needsYou: number; handled: number }
  type: Record<MailTypeSlug, number>
  today: number
  unsure: number
}

function startOfDubaiDay(now: Date): Date {
  const local = new Date(now.getTime() + 4 * 3_600_000)
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - 4 * 3_600_000)
}

/**
 * Board 91's rail. Three reads, one round each: today's live inbound mail grouped by mailbox, class,
 * confidence and handled state (one GROUP BY), the two mailboxes' roles, and the open-work live counters
 * (Unsure, Not linked and Needs you count every open item, not only today's).
 */
export async function folderCounts(now = new Date()): Promise<FolderCounts> {
  const [groups, mailboxes, open] = await Promise.all([
    opsDb.mailMessage.groupBy({
      by: ['mailboxId', 'classification', 'confidence', 'handledState'],
      where: { direction: 'inbound', origin: 'live', receivedAt: { gte: startOfDubaiDay(now) } },
      _count: { _all: true },
    }),
    opsDb.mailbox.findMany({ select: { id: true, role: true } }),
    readCounters(['mail.unsure', 'mail.not_linked', 'mail.needs_you']),
  ])
  const roleOf = new Map(mailboxes.map((m) => [m.id, m.role]))
  const type = Object.fromEntries(Object.keys(MAIL_TYPES).map((k) => [k, 0])) as Record<MailTypeSlug, number>
  let all = 0
  let sales = 0
  let purchase = 0
  let handled = 0
  for (const g of groups) {
    const n = g._count._all
    all += n
    const role = roleOf.get(g.mailboxId)
    if (role === 'client') sales += n
    if (role === 'supplier') purchase += n
    if (g.handledState === 'handled') handled += n
    if (g.confidence === 'unsure') continue
    for (const [slug, t] of Object.entries(MAIL_TYPES) as Array<[MailTypeSlug, (typeof MAIL_TYPES)[MailTypeSlug]]>) {
      if ((t.classes as readonly string[]).includes(g.classification)) type[slug] += n
    }
  }
  const unsure = open['mail.unsure'] ?? 0
  return {
    mailbox: { all, sales, purchase },
    status: {
      unsure,
      notLinked: open['mail.not_linked'] ?? 0,
      needsYou: open['mail.needs_you'] ?? 0,
      handled,
    },
    type,
    today: all,
    unsure,
  }
}

// ── One thread ───────────────────────────────────────────────────────────────────────────

export interface ThreadMessageView {
  id: string
  from: { name: string; address: string }
  mailbox: string
  to: string
  cc?: string
  time: string
  subject: string
  bodyHtml: SanitizedHtml
  attachments: AttachmentChipProps[]
}

export interface AssistantActionView {
  id: string
  ref: string
  time: string
  headline: string
  state: string
  surface: string
  actionKey: string
}

export interface ThreadView {
  id: string
  subject: string
  mailbox: { id: string; address: string; role: string }
  gmailUrl: string
  latest: {
    id: string
    classification: MailClassValue
    confidence: 'sure' | 'likely' | 'unsure' | null
    note: string | null
    type: MailRowType | null
    classLabel: string
    handledState: string
    from: { name: string | null; address: string }
    rfcMessageId: string | null
    referencesRfcIds: string[]
  }
  records: Array<{ subjectType: string; subjectId: string; label: string }>
  messages: ThreadMessageView[]
  earlier: number
  crossMailbox: string | null
  actions: AssistantActionView[]
  levelWord: string
}

/** Messages shown with their body; earlier ones collapse to "N earlier messages". */
export const SHOWN_MESSAGES = 6

const FILE_TYPE = (mime: string | null, name: string): AttachmentChipProps['fileType'] => {
  const n = name.toLowerCase()
  if (mime === 'application/pdf' || n.endsWith('.pdf')) return 'PDF'
  if (/\.(xlsx?|xlsm)$/.test(n)) return 'XLS'
  if (n.endsWith('.csv')) return 'CSV'
  if (/\.(docx?|rtf)$/.test(n)) return 'DOC'
  if ((mime ?? '').startsWith('image/')) return 'IMG'
  if (n.endsWith('.eml') || mime === 'message/rfc822') return 'MAIL'
  return 'DOC'
}

function sizeText(bytes: number | null, pages: number | null): string | undefined {
  if (pages) return `${pages} ${pages === 1 ? 'page' : 'pages'}`
  if (!bytes) return undefined
  return bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const MESSAGE_SELECT = {
  id: true,
  mailboxId: true,
  fromName: true,
  fromAddress: true,
  toAddresses: true,
  ccAddresses: true,
  subject: true,
  bodyText: true,
  sentAt: true,
  internalDate: true,
  direction: true,
  rfcMessageId: true,
  referencesRfcIds: true,
  inReplyToRfcId: true,
  classification: true,
  confidence: true,
  assistantNote: true,
  handledState: true,
  mailbox: { select: { address: true } },
  bodyHtmlFile: { select: { bucket: true, path: true } },
  attachments: {
    select: { id: true, filename: true, mimeType: true, sizeBytes: true, pageCount: true, fileId: true, extractionStatus: true },
  },
  links: {
    where: { removedAt: null },
    select: { subjectType: true, subjectId: true, enquiry: { select: { ref: true } } },
  },
} satisfies Prisma.MailMessageSelect

type MessageRow = Prisma.MailMessageGetPayload<{ select: typeof MESSAGE_SELECT }>

/**
 * Three reads: the thread with its messages (one query with includes), then in parallel the matching
 * messages in the OTHER mailbox (by Message-ID / References: a client's mail forwarded to the supplier side is
 * one conversation) and the Assistant's actions on all of them. Bodies come from storage, at most
 * SHOWN_MESSAGES of them.
 */
export async function getThread(threadId: string, user: OpsUser, now = new Date()): Promise<ThreadView | null> {
  void user
  const thread = await opsDb.mailThread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      gmailThreadId: true,
      subject: true,
      mailbox: { select: { id: true, address: true, role: true } },
      messages: { orderBy: { sentAt: 'asc' }, take: 200, select: MESSAGE_SELECT },
    },
  })
  if (!thread || thread.messages.length === 0) return null
  const own = thread.messages
  const ids = new Set(own.flatMap((m) => [m.rfcMessageId, m.inReplyToRfcId, ...m.referencesRfcIds]).filter((x): x is string => !!x))
  const [other, actions] = await Promise.all([
    ids.size
      ? opsDb.mailMessage.findMany({
          where: {
            mailboxId: { not: thread.mailbox.id },
            OR: [{ rfcMessageId: { in: [...ids] } }, { referencesRfcIds: { hasSome: [...ids] } }],
          },
          orderBy: { sentAt: 'asc' },
          take: 100,
          select: MESSAGE_SELECT,
        })
      : Promise.resolve([] as MessageRow[]),
    opsDb.assistantAction.findMany({
      where: { subjectType: 'mail_message', subjectId: { in: own.map((m) => m.id) } },
      orderBy: { createdAt: 'asc' },
      take: 50,
      select: { id: true, ref: true, createdAt: true, headline: true, state: true, surface: true, actionKey: true },
    }),
  ])

  const merged = [...own, ...other]
    .filter((m, i, all) => all.findIndex((x) => x.id === m.id) === i)
    .sort((a, b) => (a.internalDate ?? a.sentAt).getTime() - (b.internalDate ?? b.sentAt).getTime())
  const shown = merged.slice(-SHOWN_MESSAGES)
  const bodies = await Promise.all(
    shown.map(async (m) => (await readSanitizedBody(m.bodyHtmlFile)) ?? textToSanitizedHtml(m.bodyText ?? ''))
  )

  const latestInbound = [...own].reverse().find((m) => m.direction === 'inbound') ?? own[own.length - 1]!
  const cls = latestInbound.classification as MailClassValue
  const records = [
    ...new Map(
      merged
        .flatMap((m) => m.links)
        .map((l) => [`${l.subjectType}:${l.subjectId}`, { subjectType: l.subjectType, subjectId: l.subjectId, label: l.enquiry?.ref ?? l.subjectType.replace('_', ' ') }])
    ).values(),
  ]
  const mailboxes = [...new Set(merged.map((m) => m.mailbox.address))]
  const crossMailbox =
    other.length > 0
      ? `This conversation is in ${mailboxes.join(' and ')}; messages show which mailbox they came to.`
      : null

  return {
    id: thread.id,
    subject: latestInbound.subject ?? thread.subject ?? '(no subject)',
    mailbox: thread.mailbox,
    gmailUrl: gmailThreadUrl(thread.mailbox.address, thread.gmailThreadId),
    latest: {
      id: latestInbound.id,
      classification: cls,
      confidence: latestInbound.confidence,
      note: latestInbound.assistantNote,
      type: rowType(cls, latestInbound.confidence),
      classLabel: CLASS_LABEL[cls],
      handledState: latestInbound.handledState,
      from: { name: latestInbound.fromName, address: latestInbound.fromAddress },
      rfcMessageId: latestInbound.rfcMessageId,
      referencesRfcIds: latestInbound.referencesRfcIds,
    },
    records,
    earlier: merged.length - shown.length,
    crossMailbox,
    messages: shown.map((m, i) => ({
      id: m.id,
      from: { name: m.fromName?.trim() || m.fromAddress, address: m.fromAddress },
      mailbox: m.mailbox.address,
      to: m.toAddresses.join(', '),
      ...(m.ccAddresses.length ? { cc: m.ccAddresses.join(', ') } : {}),
      time: threadTime(m.sentAt, now),
      subject: m.subject ?? '',
      bodyHtml: bodies[i]!,
      attachments: m.attachments.map((a) => {
        const size = sizeText(a.sizeBytes, a.pageCount)
        return {
          fileType: FILE_TYPE(a.mimeType, a.filename),
          name: a.filename,
          ...(size ? { size } : {}),
          ...(a.fileId ? { href: `/api/files/${a.fileId}` } : { unavailable: true }),
        }
      }),
    })),
    actions: actions.map((a) => ({
      id: a.id,
      ref: a.ref,
      time: threadTime(a.createdAt, now),
      headline: a.headline,
      state: a.state,
      surface: a.surface,
      actionKey: a.actionKey,
    })),
    levelWord: 'Does it quietly',
  }
}

/** The two business mailboxes' addresses, for the rail and the composer ("sales@" / "purchase@" until connected). */
export async function mailboxAddresses(): Promise<{ sales: string; purchase: string }> {
  const rows = await opsDb.mailbox.findMany({
    where: { role: { in: ['client', 'supplier'] } },
    select: { address: true, role: true },
    orderBy: { createdAt: 'asc' },
  })
  const short = (a: string) => `${a.split('@')[0]}@`
  const sales = rows.find((r) => r.role === 'client')?.address
  const purchase = rows.find((r) => r.role === 'supplier')?.address
  return { sales: sales ? short(sales) : 'sales@', purchase: purchase ? short(purchase) : 'purchase@' }
}
