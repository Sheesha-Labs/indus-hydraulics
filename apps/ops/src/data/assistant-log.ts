import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { LEVEL_LABEL } from './proposal-mapper'
import type { OpsUser } from '../lib/access-core'
import { dayRange, type LogOutcome, type LogSearch } from '../lib/log-params'

/**
 * Board 111's reads (S06-T04) over ops.assistant_log_v: one page of entries (keyset on at desc, id desc; 50),
 * the selected day's header counts, and one entry's detail (inputs read, the email it wrote, values before →
 * after, its events and model calls). A Helper without "can see margins" gets no cost and no money values.
 */
export const LOG_PAGE = 50

export interface LogRow {
  id: string
  at: string
  time: string
  kind: 'action' | 'decision' | 'human'
  actor: { assistant: true } | { assistant: false; initials: string }
  actionId: string | null
  actionRef: string | null
  headline: string
  record: { label: string; href: string } | null
  level: string | null
  outcome: { text: string; tone: 'ok' | 'info' | 'warn' | 'bad' | 'muted' }
  cost: string | null
}

export interface LogDay {
  label: string
  rows: LogRow[]
}

export interface LogPageData {
  days: LogDay[]
  nextCursor: string | null
  header: {
    label: string
    total: number
    asked: number
    approved: number
    edited: number
    rejected: number
    undone: number
    failed: number
    costUsd: string | null
  }
}

const masked = (u: Pick<OpsUser, 'role' | 'canSeeMargins'>) => u.role !== 'owner' && !u.canSeeMargins

const OUTCOME_STATES: Readonly<Record<LogOutcome, string[]>> = {
  approved: ['approved', 'queued', 'done', 'running'],
  edited: ['edited_approved'],
  done: ['done'],
  rejected: ['rejected'],
  undone: ['undone'],
  failed: ['failed'],
  waiting: ['proposed', 'later'],
}

function clock(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', hour12: false }).format(d)
}

function dayLabel(d: Date): string {
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const l = new Date(d.getTime() + 4 * 3_600_000)
  return `${WD[l.getUTCDay()]} ${l.getUTCDate()} ${MON[l.getUTCMonth()]}`
}

type Entry = Prisma.AssistantLogEntryGetPayload<object>

function outcomeOf(e: Entry): LogRow['outcome'] {
  const by = e.deciderInitials
  if (e.kind === 'human') return { text: 'Done', tone: 'muted' }
  if (e.kind === 'decision') {
    const verb: Record<string, LogRow['outcome']> = {
      approved: { text: `Approved by ${by ?? ''}`.trim(), tone: 'ok' },
      edited_approved: { text: `Edited by ${by ?? ''}`.trim(), tone: 'info' },
      rejected: { text: 'Rejected', tone: 'warn' },
      undone: { text: 'Undone', tone: 'muted' },
      later: { text: 'Later', tone: 'muted' },
      cancelled: { text: 'Cancelled', tone: 'muted' },
    }
    return verb[e.outcome] ?? { text: e.outcome, tone: 'muted' }
  }
  switch (e.outcome) {
    case 'proposed':
    case 'later':
      return { text: 'Waiting for you', tone: 'info' }
    case 'approved':
    case 'queued':
    case 'running':
      return { text: by ? `Approved by ${by}` : 'Running', tone: 'ok' }
    case 'edited_approved':
      return { text: `Edited by ${by ?? ''}`.trim(), tone: 'info' }
    case 'done':
      return by ? { text: e.edited ? `Edited by ${by}` : `Approved by ${by}`, tone: e.edited ? 'info' : 'ok' } : { text: 'Done', tone: 'muted' }
    case 'rejected':
      return { text: 'Rejected', tone: 'warn' }
    case 'undone':
      return { text: 'Undone', tone: 'muted' }
    case 'failed':
      return { text: 'Failed', tone: 'bad' }
    case 'reverted':
      return { text: 'Reverted', tone: 'muted' }
    case 'corrected':
      return { text: 'Corrected', tone: 'muted' }
    case 'cancelled':
      return { text: 'Cancelled', tone: 'muted' }
    default:
      return { text: e.outcome, tone: 'muted' }
  }
}

function headlineOf(e: Entry): string {
  if (e.kind !== 'decision') return e.headline
  const verb: Record<string, string> = {
    approved: 'Approved',
    edited_approved: 'Edited and approved',
    rejected: 'Rejected',
    undone: 'Undid',
    later: 'Moved to later',
    cancelled: 'Cancelled',
  }
  return `${verb[e.outcome] ?? e.outcome} “${e.headline}”`
}

function recordOf(e: Entry): LogRow['record'] {
  if (e.enquiryRef) return { label: e.enquiryRef, href: `/enquiries/${e.enquiryRef}` }
  if (e.actionRef && (e.subjectType === 'mail_message' || e.subjectType === 'mail_thread'))
    return { label: 'Email', href: `/why/${e.actionRef}` }
  return null
}

function decodeCursor(c: string | undefined): { at: Date; id: string } | null {
  if (!c) return null
  try {
    const [at, id] = Buffer.from(c, 'base64url').toString('utf8').split('|')
    if (!at || !id) return null
    const d = new Date(at)
    return Number.isNaN(d.getTime()) ? null : { at: d, id }
  } catch {
    return null
  }
}
const encodeCursor = (e: { at: Date; id: string }) => Buffer.from(`${e.at.toISOString()}|${e.id}`, 'utf8').toString('base64url')

export function logWhere(search: LogSearch, now: Date): Prisma.AssistantLogEntryWhereInput {
  const { from, to } = dayRange(search.day, now)
  return {
    at: { gte: from, lt: to },
    ...(search.action ? { actionKey: search.action } : {}),
    ...(search.record ? { OR: [{ enquiryRef: { contains: search.record, mode: 'insensitive' } }, { actionRef: search.record }] } : {}),
    ...(search.outcome
      ? search.outcome === 'edited'
        ? { OR: [{ outcome: 'edited_approved' }, { edited: true, outcome: { in: OUTCOME_STATES.approved } }] }
        : { outcome: { in: OUTCOME_STATES[search.outcome] } }
      : {}),
    ...(search.actor === 'assistant'
      ? { actorKind: 'assistant' }
      : search.actor
        ? { actorInitials: search.actor }
        : {}),
  }
}

export async function listLog(
  search: LogSearch,
  user: Pick<OpsUser, 'role' | 'canSeeMargins'>,
  now = new Date()
): Promise<LogPageData> {
  const where = logWhere(search, now)
  const after = decodeCursor(search.cursor)
  const [rows, groups] = await Promise.all([
    opsDb.assistantLogEntry.findMany({
      where: after
        ? { AND: [where, { OR: [{ at: { lt: after.at } }, { at: after.at, id: { lt: after.id } }] }] }
        : where,
      orderBy: [{ at: 'desc' }, { id: 'desc' }],
      take: LOG_PAGE + 1,
    }),
    // The header: the day's counts in one grouped read (actions only; decisions and people's changes are not
    // Assistant actions).
    opsDb.assistantLogEntry.groupBy({
      by: ['outcome', 'surface', 'edited'],
      where: { ...logWhere({ day: search.day }, now), kind: 'action' },
      _count: { _all: true },
      _sum: { costUsd: true },
    }),
  ])
  const hide = masked(user)
  const page = rows.slice(0, LOG_PAGE)
  const days: LogDay[] = []
  for (const e of page) {
    const label = dayLabel(e.at)
    let d = days.at(-1)
    if (!d || d.label !== label) {
      d = { label, rows: [] }
      days.push(d)
    }
    d.rows.push({
      id: e.id,
      at: e.at.toISOString(),
      time: clock(e.at),
      kind: e.kind as LogRow['kind'],
      actor: e.kind === 'action' ? { assistant: true } : { assistant: false, initials: e.actorInitials ?? '—' },
      actionId: e.actionId,
      actionRef: e.actionRef,
      headline: headlineOf(e),
      record: recordOf(e),
      level: e.kind === 'action' && e.level ? (LEVEL_LABEL[e.level as keyof typeof LEVEL_LABEL] ?? e.level) : null,
      outcome: outcomeOf(e),
      cost: hide || e.kind !== 'action' ? null : `$${Number(e.costUsd).toFixed(2)}`,
    })
  }
  const count = (pred: (g: (typeof groups)[number]) => boolean) =>
    groups.filter(pred).reduce((s, g) => s + g._count._all, 0)
  const cost = groups.reduce((s, g) => s + Number(g._sum.costUsd ?? 0), 0)
  const last = page.at(-1)
  return {
    days,
    nextCursor: rows.length > LOG_PAGE && last ? encodeCursor(last) : null,
    header: {
      label: dayRange(search.day, now).label,
      total: count(() => true),
      asked: count((g) => g.surface === 'review'),
      approved: count((g) => ['approved', 'queued', 'done', 'running'].includes(g.outcome) && g.surface === 'review' && !g.edited),
      edited: count((g) => g.outcome === 'edited_approved' || (g.edited && g.surface === 'review')),
      rejected: count((g) => g.outcome === 'rejected'),
      undone: count((g) => g.outcome === 'undone'),
      failed: count((g) => g.outcome === 'failed'),
      costUsd: hide ? null : cost.toFixed(2),
    },
  }
}

export interface LogEntryDetail {
  ref: string
  inputs: string[]
  output: { title: string; text: string } | null
  values: Array<{ field: string; before: string; after: string }>
  events: Array<{ time: string; text: string }>
  calls: Array<{ model: string; tokens: string; cost: string | null }>
}

function show(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.join(', ')
  return JSON.stringify(v)
}

/** One action's detail for the expanded row. */
export async function getLogEntry(
  actionId: string,
  user: Pick<OpsUser, 'role' | 'canSeeMargins'>
): Promise<LogEntryDetail | null> {
  const a = await opsDb.assistantAction.findUnique({
    where: { id: actionId },
    select: {
      ref: true,
      inputs: true,
      preview: true,
      effectivePayload: true,
      subjectType: true,
      levelReasons: true,
      events: { orderBy: { at: 'asc' }, select: { at: true, fromState: true, toState: true, actorKind: true, note: true } },
      aiCalls: { select: { model: true, inputTokens: true, outputTokens: true, costUsd: true } },
    },
  })
  if (!a) return null
  const changes = await opsDb.activityEvent.findMany({
    where: { actionId },
    orderBy: { at: 'asc' },
    take: 50,
    select: { field: true, before: true, after: true, sensitive: true },
  })
  const hide = masked(user)
  const req = (a.inputs as { request?: { subjectType?: string; trigger?: string } } | null)?.request
  const inputs = [
    ...(req?.subjectType ? [`${req.subjectType.replace('_', ' ')} · ${req.trigger ?? ''}`.trim()] : []),
    ...((a.levelReasons as string[] | null) ?? []).map((r) => `Autopilot · ${r}`),
  ]
  const p = a.preview as { mailbox?: string | null; subject?: string; text?: string; html?: string } | null
  const edit = (a.effectivePayload as { subject?: string; body?: string } | null) ?? {}
  const output =
    p && (p.text || p.html)
      ? {
          title: `Email from ${p.mailbox ? `${p.mailbox.split('@')[0]}@` : 'the mailbox'}`,
          text: `${edit.subject ?? p.subject ?? ''}\n${edit.body ?? p.text ?? (p.html ?? '').replace(/<[^>]+>/g, ' ')}`.trim(),
        }
      : null
  return {
    ref: a.ref,
    inputs,
    output,
    values: changes
      .filter((c) => !(hide && c.sensitive))
      .map((c) => ({ field: c.field ?? '—', before: show(c.before), after: show(c.after) })),
    events: a.events.map((e) => ({
      time: clock(e.at),
      text: `${e.fromState ?? 'created'} → ${e.toState}${e.actorKind === 'user' ? ' (a person)' : ''}`,
    })),
    calls: a.aiCalls.map((c) => ({
      model: c.model,
      tokens: `${c.inputTokens} in · ${c.outputTokens} out`,
      cost: hide ? null : `$${Number(c.costUsd).toFixed(4)}`,
    })),
  }
}
