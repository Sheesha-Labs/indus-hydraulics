import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import {
  ageText,
  domainOf,
  familyOf,
  FAMILY_LABEL,
  isBatchableFamily,
  REVIEW_FAMILIES,
  type ReviewFamily,
} from '@indus/ops-core'
import type { OpsUser } from '../lib/access-core'
import type { ReviewSearch } from '../lib/review-params'
import { actionDefinition } from '../server/assistant/registry'
import { toProposalCardData, type ProposalCardData } from './proposal-mapper'

// Definitions say which actions batch; they register themselves on import.
import '../server/assistant/actions'

/**
 * Board 104's reads (S06-T02). The queue is one query over open Review cards (proposed, and Later whose time
 * has come) with their definitions; the groups' labels need the mail subjects and the senders' companies (two
 * small reads); the receipt and "Done for you today" one each. Grouping, filters and sorting run in memory:
 * the queue is short.
 */
export interface ReviewCard extends ProposalCardData {
  family: ReviewFamily
  familyLabel: string
  batchable: boolean
  groupKey: string
  /** The compact row's second line. */
  sub: string
  age: string
  /** Board 110: this card replaced an older one (redraft, or a reply superseding a chaser). */
  supersedes: { headline: string; reason: string; at: string } | null
  /** Board 110: the card came back from Later. */
  backFromLater: string | null
}

/** Board 110: an approved send that needs a person, or an outbound_attention card. */
export interface AttentionItem {
  actionId: string
  ref: string
  headline: string
  kind: 'failed' | 'unknown' | 'paused' | 'waiting_mailbox' | 'held'
  reason: string
  mailbox: string | null
  verbs: Array<'retry' | 'copy' | 'mark_sent' | 'fix_mailbox' | 'cancel'>
}

export interface ReviewGroup {
  key: string
  label: string
  sub: string | null
  href: string | null
  cards: ReviewCard[]
}

export interface ReviewReceipt {
  actionId: string
  ref: string
  headline: string
  state: string
  detail: string
  undoRemainingMs: number
}

export interface ReviewQueue {
  /** Board 110: sends that went wrong or wait, above the cards. */
  attention: AttentionItem[]
  total: number
  oldest: string | null
  counts: Record<ReviewFamily | 'all', number>
  groups: ReviewGroup[]
  /** The expanded card: ?card=, else the first. */
  expandedRef: string | null
  receipt: ReviewReceipt | null
  records: Array<{ value: string; label: string }>
}

const SELECT = {
  include: {
    def: { select: { label: true, lockedLevel: true } },
    decidedBy: { select: { initials: true, name: true } },
    enquiry: { select: { id: true, ref: true, title: true, client: { select: { name: true } } } },
  },
} as const

type Row = Prisma.AssistantActionGetPayload<typeof SELECT>

const MAX = 300

function firstLine(text: string | undefined, max = 110): string {
  if (!text) return ''
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

export async function listReviewQueue(
  user: Pick<OpsUser, 'id' | 'role' | 'canSeeMargins'>,
  search: ReviewSearch,
  now = new Date()
): Promise<ReviewQueue> {
  const rows = await opsDb.assistantAction.findMany({
    where: {
      surface: 'review',
      OR: [{ state: 'proposed' }, { state: 'later', laterUntil: { lte: now } }],
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: MAX,
    ...SELECT,
  })
  // A card asked for by ?card= that is past the cap (a long queue) is still opened.
  if (search.card && !rows.some((r) => r.ref === search.card)) {
    const one = await opsDb.assistantAction.findFirst({
      where: {
        ref: search.card,
        surface: 'review',
        OR: [{ state: 'proposed' }, { state: 'later', laterUntil: { lte: now } }],
      },
      ...SELECT,
    })
    if (one) rows.push(one)
  }

  // Mail subjects for the group labels: the messages and threads the cards are about, then their senders' companies.
  const msgIds = rows.filter((r) => r.subjectType === 'mail_message' && r.subjectId).map((r) => r.subjectId!)
  const threadIds = rows.filter((r) => r.subjectType === 'mail_thread' && r.subjectId).map((r) => r.subjectId!)
  const mail =
    msgIds.length || threadIds.length
      ? await opsDb.mailMessage.findMany({
          where: {
            OR: [
              ...(msgIds.length ? [{ id: { in: msgIds } }] : []),
              ...(threadIds.length ? [{ threadId: { in: threadIds }, direction: 'inbound' as const }] : []),
            ],
          },
          orderBy: { sentAt: 'desc' },
          take: 500,
          select: { id: true, threadId: true, fromName: true, fromAddress: true, subject: true },
        })
      : []
  const domains = [...new Set(mail.map((m) => domainOf(m.fromAddress)).filter((d): d is string => !!d))]
  const companies = domains.length
    ? await opsDb.company.findMany({
        where: { domains: { hasSome: domains } },
        select: { name: true, domains: true },
        take: 200,
      })
    : []
  const companyOf = (address: string) => {
    const d = domainOf(address)
    return d ? (companies.find((c) => c.domains.includes(d))?.name ?? null) : null
  }
  const byMessage = new Map(mail.map((m) => [m.id, m]))
  const byThread = new Map<string, (typeof mail)[number]>()
  for (const m of mail) if (!byThread.has(m.threadId)) byThread.set(m.threadId, m)

  // The cards these replaced (redrafts), for "Superseded at 11:40: <reason>".
  const olderIds = rows.map((r) => r.redraftOfId).filter((x): x is string => !!x)
  const older = new Map(
    (olderIds.length
      ? await opsDb.assistantAction.findMany({
          where: { id: { in: olderIds } },
          select: { id: true, headline: true, staleReason: true, staleAt: true, decidedAt: true },
        })
      : []
    ).map((o) => [
      o.id,
      {
        headline: o.headline,
        reason: o.staleReason ?? 'Redrafted by a person',
        at: clock(o.staleAt ?? o.decidedAt ?? now),
      },
    ])
  )

  const groupOf = (r: Row): Omit<ReviewGroup, 'cards'> => {
    if (r.enquiry) {
      return {
        key: `enquiry:${r.enquiry.id}`,
        label: r.enquiry.ref,
        sub: [r.enquiry.client?.name, r.enquiry.title].filter(Boolean).join(' · ') || null,
        href: `/enquiries/${r.enquiry.ref}`,
      }
    }
    const m =
      r.subjectType === 'mail_message'
        ? byMessage.get(r.subjectId ?? '')
        : r.subjectType === 'mail_thread'
          ? byThread.get(r.subjectId ?? '')
          : undefined
    if (m) {
      const who = companyOf(m.fromAddress) ?? (m.fromName?.trim() || m.fromAddress)
      return {
        key: `thread:${m.threadId}`,
        label: who,
        sub: m.subject ?? null,
        href: `/mail/all/${m.threadId}`,
      }
    }
    return { key: 'other', label: 'Other', sub: null, href: null }
  }

  const attentionCards = rows.filter((r) => r.actionKey === 'outbound_attention')
  const all: ReviewCard[] = rows.filter((r) => r.actionKey !== 'outbound_attention').map((r) => {
    const card = toProposalCardData(r, user, now)
    const family = familyOf(r.actionKey)
    const g = groupOf(r)
    const def = actionDefinition(r.actionKey)
    return {
      ...card,
      family,
      familyLabel: FAMILY_LABEL[family],
      batchable: !!def?.batchable && isBatchableFamily(family) && !card.level.locked,
      groupKey: g.key,
      sub: firstLine(card.why[0]?.text ?? card.onApproveText ?? undefined),
      age: ageText(r.createdAt.getTime(), now.getTime()),
      supersedes: r.redraftOfId ? (older.get(r.redraftOfId) ?? null) : null,
      backFromLater: r.laterUntil && r.laterUntil.getTime() <= now.getTime() ? clock(r.laterUntil) : null,
    }
  })

  const counts = Object.fromEntries([['all', all.length], ...REVIEW_FAMILIES.map((f) => [f, 0])]) as Record<
    ReviewFamily | 'all',
    number
  >
  for (const c of all) counts[c.family] += 1

  const filtered = all.filter(
    (c) => (!search.type || c.family === search.type) && (!search.record || c.groupKey === search.record)
  )
  // Sort: oldest first (the default); due and value need records with dates and money (S12+): oldest until then.
  const sorted = filtered

  const groupMeta = new Map(rows.map((r) => [r.id, groupOf(r)]))
  const groups: ReviewGroup[] = []
  if (search.group === 'flat') {
    groups.push({ key: 'flat', label: '', sub: null, href: null, cards: sorted })
  } else {
    const index = new Map<string, ReviewGroup>()
    for (const c of sorted) {
      let g = index.get(c.groupKey)
      if (!g) {
        g = { ...groupMeta.get(c.id)!, cards: [] }
        index.set(c.groupKey, g)
        groups.push(g)
      }
      g.cards.push(c)
    }
  }

  const records = [...new Map(rows.map((r) => [groupOf(r).key, groupOf(r)])).values()]
    .filter((g) => g.key !== 'other')
    .map((g) => ({ value: g.key, label: g.sub ? `${g.label} · ${g.sub}` : g.label }))

  const expandedRef =
    (search.card && sorted.some((c) => c.ref === search.card) ? search.card : sorted[0]?.ref) ?? null

  return {
    attention: [
      ...attentionCards.map((r): AttentionItem => {
        const p = (r.preview as { failure?: string; actions?: AttentionItem['verbs'] } | null) ?? {}
        return {
          actionId: r.id,
          ref: r.ref,
          headline: r.headline,
          kind: r.headline.startsWith('Check') ? 'unknown' : 'failed',
          reason: p.failure ?? 'The send needs you.',
          mailbox: null,
          verbs: p.actions ?? ['retry', 'copy', 'mark_sent'],
        }
      }),
      ...(await attentionFromSends(now)),
    ],
    total: all.length,
    oldest: rows[0] ? ageText(rows[0].createdAt.getTime(), now.getTime()) : null,
    counts,
    groups,
    expandedRef,
    receipt: await lastReceipt(user, now),
    records,
  }
}

function clock(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

/**
 * Board 110's send states, from the action and its latest outbound row: failed after approval (Retry, Copy
 * text, Mark as sent, Fix mailbox), outcome unknown (Mark as sent, Resend), held while paused (sends on
 * resume · Cancel), waiting for a mailbox (Fix mailbox).
 */
async function attentionFromSends(now: Date): Promise<AttentionItem[]> {
  const rows = await opsDb.assistantAction.findMany({
    where: {
      surface: 'review',
      OR: [
        { state: 'failed', decidedAt: { not: null, gte: new Date(now.getTime() - 14 * 86_400_000) } },
        { state: { in: ['queued', 'running'] }, outbound: { some: { status: { in: ['held', 'waiting_for_mailbox', 'unknown', 'failed'] } } } },
      ],
    },
    orderBy: { decidedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      ref: true,
      headline: true,
      state: true,
      failureReason: true,
      outbound: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true, holdReason: true, failureReason: true, mailbox: { select: { address: true } } },
      },
    },
  })
  return rows.flatMap((r): AttentionItem[] => {
    const o = r.outbound[0]
    const mailbox = o?.mailbox?.address ?? null
    const local = mailbox ? `${mailbox.split('@')[0]}@` : 'a mailbox'
    const base = { actionId: r.id, ref: r.ref, headline: r.headline, mailbox }
    if (o?.status === 'unknown')
      return [
        {
          ...base,
          kind: 'unknown',
          reason: "We can't tell whether this was sent. Check Sent in Gmail, then Resend or Mark as sent.",
          verbs: ['mark_sent', 'retry', 'copy'],
        },
      ]
    if (r.state === 'failed' || o?.status === 'failed')
      return [
        {
          ...base,
          kind: 'failed',
          reason: o?.failureReason ?? r.failureReason ?? 'The send failed.',
          verbs: ['retry', 'fix_mailbox', 'copy', 'mark_sent'],
        },
      ]
    if (o?.status === 'held' && o.holdReason === 'pause')
      return [{ ...base, kind: 'paused', reason: 'Approved · queued · sends on resume', verbs: ['cancel'] }]
    if (o?.status === 'waiting_for_mailbox')
      return [{ ...base, kind: 'waiting_mailbox', reason: `Waiting for ${local}`, verbs: ['fix_mailbox', 'cancel'] }]
    if (o?.status === 'held')
      return [{ ...base, kind: 'held', reason: `Held: ${o.holdReason ?? 'waiting'}`, verbs: ['cancel'] }]
    return []
  })
}

/** The person's last approval while its undo window is open (the receipt row with Undo). */
async function lastReceipt(user: Pick<OpsUser, 'id'>, now: Date): Promise<ReviewReceipt | null> {
  const a = await opsDb.assistantAction.findFirst({
    where: {
      decidedById: user.id,
      surface: 'review',
      state: { in: ['queued', 'done'] },
      undoUntil: { gt: now },
    },
    orderBy: { decidedAt: 'desc' },
    select: {
      id: true,
      ref: true,
      headline: true,
      state: true,
      undoUntil: true,
      preview: true,
    },
  })
  if (!a?.undoUntil) return null
  const mailbox = (a.preview as { mailbox?: string | null } | null)?.mailbox
  return {
    actionId: a.id,
    ref: a.ref,
    headline: a.headline,
    state: a.state,
    detail: a.state === 'queued' && mailbox ? `sending from ${mailbox.split('@')[0]}@` : 'done',
    undoRemainingMs: Math.max(0, a.undoUntil.getTime() - now.getTime()),
  }
}

const DONE_LABEL: Readonly<Record<string, string>> = {
  classify_mail: 'Emails sorted by type',
  link_mail: 'Emails linked to records',
  label_gmail: 'Gmail labels kept in step',
  ooo_facts: 'Auto-replies read',
}

function startOfDubaiDay(now: Date): Date {
  const local = new Date(now.getTime() + 4 * 3_600_000)
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - 4 * 3_600_000
  )
}

/** "Done for you today · 41": today's finished actions by kind, most first. */
export async function getDoneToday(now = new Date()): Promise<{
  total: number
  rows: Array<{ key: string; label: string; count: number; href: string }>
}> {
  const groups = await opsDb.assistantAction.groupBy({
    by: ['actionKey'],
    where: { state: 'done', doneAt: { gte: startOfDubaiDay(now) } },
    _count: { _all: true },
  })
  const defs = groups.length
    ? await opsDb.autopilotActionDef.findMany({
        where: { key: { in: groups.map((g) => g.actionKey) } },
        select: { key: true, label: true },
      })
    : []
  const label = new Map(defs.map((d) => [d.key, d.label]))
  const rows = groups
    .map((g) => ({
      key: g.actionKey,
      label: DONE_LABEL[g.actionKey] ?? label.get(g.actionKey) ?? g.actionKey,
      count: g._count._all,
      href: `/assistant/log?action=${g.actionKey}`,
    }))
    .sort((a, b) => b.count - a.count)
  return { total: rows.reduce((s, r) => s + r.count, 0), rows }
}

/**
 * "Waiting on others" (suppliers late, clients silent): a provider registry. Providers arrive with the records
 * they watch (S12 RFQs, S17 quotations); until then the rail shows its empty state.
 */
export interface WaitingItem {
  key: string
  label: string
  due: string
  tone: 'warn' | 'bad' | 'muted'
  href: string
}
export type WaitingProvider = (now: Date) => Promise<{ title: string; items: WaitingItem[] }>
const PROVIDERS: WaitingProvider[] = []

export function registerWaitingProvider(p: WaitingProvider): void {
  PROVIDERS.push(p)
}

export async function getWaitingOnOthers(
  now = new Date()
): Promise<Array<{ title: string; items: WaitingItem[] }>> {
  const out = await Promise.all(PROVIDERS.map((p) => p(now)))
  return out.filter((s) => s.items.length > 0)
}
