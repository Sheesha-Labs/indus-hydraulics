import 'server-only'
import { weekStart } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'

/**
 * Board 115 · What the Assistant has learned (S07-T05). One read transaction: every preference (with its
 * counterparty and first evidence action), the trades named by trade preferences, the two sending mailboxes,
 * and, for the tone-sample picker, the last 40 messages sent from the client mailbox.
 */

const PRICING = new Set(['margin_habit', 'rounding', 'line_display'])
const SIDE = new Set(['tone_sample', 'phrase_use', 'phrase_avoid'])
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export interface LearnedRow {
  id: string
  group: 'clients' | 'pricing' | 'suppliers'
  chip: string
  description: string
  source: string
  evidence: string[]
  enabled: boolean
  isNew: boolean
  manual: boolean
}

export interface PhraseRow {
  id: string
  phrase: string
  mailbox: string | null
  mine: boolean
}

export interface LearnedPageData {
  isOwner: boolean
  total: number
  newThisWeek: number
  rows: LearnedRow[]
  tone: { id: string; messageId: string; subject: string; to: string; date: string }[]
  use: PhraseRow[]
  avoid: PhraseRow[]
  sent: { id: string; subject: string; to: string; date: string }[]
  companies: { id: string; name: string }[]
  mailboxes: { id: string; address: string; role: string }[]
  /** The Helper adds phrases for this mailbox only (D19). */
  helperMailboxId: string | null
}

function sourceOf(createdFrom: string | null, strength: number, at: Date): string {
  const when = `${MONTH[at.getUTCMonth()]}`
  switch (createdFrom) {
    case 'manual':
      return `From your note, ${at.getUTCDate()} ${when}`
    case 'edit':
      return `From ${strength} edit${strength === 1 ? '' : 's'} in ${when}`
    case 'reject':
      return strength === 1 ? 'You rejected it once' : `You rejected it ${strength} times`
    case 'override':
      return `You re-filed ${strength} email${strength === 1 ? '' : 's'}`
    case 'unsure_choice':
      return `You chose it ${strength} time${strength === 1 ? '' : 's'}`
    case 'sent_mail':
      return 'From your sent mail'
    default:
      return `From ${strength} signal${strength === 1 ? '' : 's'}`
  }
}

function shortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Dubai' })
}

export async function getLearnedPage(
  user: { id: string; role: string },
  now = new Date()
): Promise<LearnedPageData> {
  const [prefs, mailboxes, companies] = await opsDb.$transaction([
    opsDb.preference.findMany({
      where: { active: true },
      orderBy: [{ strength: 'desc' }, { updatedAt: 'desc' }],
      take: 300,
      select: {
        id: true,
        scope: true,
        kind: true,
        description: true,
        value: true,
        source: true,
        createdFrom: true,
        strength: true,
        disabledAt: true,
        createdAt: true,
        createdById: true,
        mailboxId: true,
        tradeId: true,
        company: { select: { name: true } },
        evidence: { select: { actionId: true }, take: 3 },
      },
    }),
    opsDb.mailbox.findMany({
      where: { role: { in: ['client', 'supplier'] } },
      orderBy: { role: 'asc' },
      select: { id: true, address: true, role: true },
    }),
    opsDb.company.findMany({ orderBy: { name: 'asc' }, take: 300, select: { id: true, name: true } }),
  ])
  const sales = mailboxes.find((m) => m.role === 'client') ?? null
  const purchase = mailboxes.find((m) => m.role === 'supplier') ?? null
  const tradeIds = [...new Set(prefs.map((p) => p.tradeId).filter((x): x is string => !!x))]
  const [trades, sent] = await opsDb.$transaction([
    opsDb.trade.findMany({ where: { id: { in: tradeIds } }, select: { id: true, name: true } }),
    opsDb.mailMessage.findMany({
      // No client mailbox yet: the nil UUID matches nothing.
      where: { direction: 'outbound', mailboxId: sales?.id ?? '00000000-0000-0000-0000-000000000000' },
      orderBy: { sentAt: 'desc' },
      take: 40,
      select: { id: true, subject: true, toAddresses: true, sentAt: true },
    }),
  ])
  const tradeName = new Map(trades.map((t) => [t.id, t.name]))
  const since = weekStart(now)
  const listed = prefs.filter((p) => !SIDE.has(p.kind))
  const rows: LearnedRow[] = listed.map((p) => {
    const group: LearnedRow['group'] = PRICING.has(p.kind)
      ? 'pricing'
      : p.scope === 'client'
        ? 'clients'
        : 'suppliers'
    const chip =
      p.company?.name ??
      (p.tradeId ? (tradeName.get(p.tradeId) ?? 'Trade') : null) ??
      (p.kind === 'classification_rule'
        ? 'Mail'
        : p.kind === 'chaser_pause'
          ? 'Chasers'
          : p.scope === 'mailbox'
            ? (mailboxes.find((m) => m.id === p.mailboxId)?.address.split('@')[0] ?? 'Mailbox') + '@'
            : group === 'pricing'
              ? 'All clients'
              : 'Everyone')
    return {
      id: p.id,
      group,
      chip,
      description: p.description,
      source: sourceOf(p.createdFrom, p.strength, p.createdAt),
      evidence: p.evidence.map((e) => e.actionId),
      enabled: p.disabledAt === null,
      isNew: p.createdAt >= since,
      manual: p.source === 'manual',
    }
  })
  const value = (v: unknown) => (v ?? {}) as Record<string, unknown>
  const phrases = (kind: string): PhraseRow[] =>
    prefs
      .filter((p) => p.kind === kind && p.disabledAt === null)
      .map((p) => ({
        id: p.id,
        phrase: String(value(p.value).phrase ?? p.description),
        mailbox: p.mailboxId ? (mailboxes.find((m) => m.id === p.mailboxId)?.address ?? null) : null,
        mine: p.createdById === user.id,
      }))
  return {
    isOwner: user.role === 'owner',
    total: listed.length,
    newThisWeek: listed.filter((p) => p.createdAt >= since).length,
    rows,
    tone: prefs
      .filter((p) => p.kind === 'tone_sample' && p.disabledAt === null)
      .slice(0, 3)
      .map((p) => {
        const v = value(p.value)
        return {
          id: p.id,
          messageId: String(v.messageId ?? ''),
          subject: String(v.subject ?? p.description),
          to: String(v.to ?? ''),
          date: String(v.date ?? ''),
        }
      }),
    use: phrases('phrase_use'),
    avoid: phrases('phrase_avoid'),
    sent: sent.map((m) => ({
      id: m.id,
      subject: m.subject ?? '(no subject)',
      to: m.toAddresses[0] ?? '',
      date: shortDate(m.sentAt),
    })),
    companies,
    mailboxes,
    helperMailboxId: purchase?.id ?? null,
  }
}
