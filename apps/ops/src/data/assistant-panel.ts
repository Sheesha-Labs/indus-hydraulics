import 'server-only'
import { opsDb, type $Enums } from '@indus/ops-db'
import { encodeEvidenceId } from '@indus/ops-core'
import type { OpsUser } from '../lib/access-core'
import { displayBudgetState } from '../server/assistant/runner'
import { assistantPauseState } from '../server/assistant/state'
import { upcomingFor } from '../server/clocks'

/**
 * The Assistant panel (S06-T08, shell S03a): on one record, what waits on you, what the Assistant is doing
 * now, and what it did earlier today. Three queries for the record (the record, its actions, its queued
 * email) plus the shell's cached pause state and the month's budget state, cached for a minute (the call
 * itself still reserves budget first, so the box is only ever a minute behind). Each registered clock adds what it
 * will do next from the actions already read (describeUpcoming).
 *
 * A Helper without "can see margins" gets money in headlines masked ("AED Hidden"): masked here.
 */
export interface PanelWaiting {
  id: string
  action: string
  title: string
  sub?: string
  href: string
}
export interface PanelDoing {
  id: string
  time: string
  text: string
  scheduled: boolean
}
export interface PanelEarlier {
  id: string
  time: string
  text: string
  actor: 'assistant' | 'person' | 'warn'
  whyId: string | null
}

export interface AssistantPanelFeed {
  /** The record the panel is on (for the instruct action), or null on a page without one. */
  record: { subjectType: 'enquiry'; subjectId: string; ref: string } | null
  waiting: PanelWaiting[]
  doing: PanelDoing[]
  earlier: PanelEarlier[]
  /** Why the ask box is off: paused, or the month's AI budget is spent. Null when it works. */
  blocked: { kind: 'paused' | 'budget' | 'no_record'; text: string } | null
  canInstruct: boolean
}

type Viewer = Pick<OpsUser, 'id' | 'role' | 'canSeeMargins'>

const CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const DAY_KEY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Dubai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** 00:00 today in Dubai (UTC+4, no daylight saving). */
export function dubaiDayStart(now: Date): Date {
  return new Date(`${DAY_KEY.format(now)}T00:00:00+04:00`)
}

/** "14:00" today, "Tomorrow 09:00", or "26 Nov 09:00". */
export function whenText(at: Date, now: Date): string {
  const day = DAY_KEY.format(at)
  if (day === DAY_KEY.format(now)) return CLOCK.format(at)
  if (day === DAY_KEY.format(new Date(now.getTime() + 86_400_000))) return `Tomorrow ${CLOCK.format(at)}`
  return `${new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' }).format(at)} ${CLOCK.format(at)}`
}

const MONEY = /\b(AED|USD|EUR|GBP|SAR|QAR|OMR|KWD|BHD|INR|CNY)\s?[\d.,]+/g

/** Money in a headline, for a Helper without margins. */
export function maskMoney(text: string): string {
  return text.replace(MONEY, '$1 Hidden')
}

const OPEN: $Enums.ActionState[] = ['proposed', 'later']
const DOING: $Enums.ActionState[] = ['queued', 'running']
const ENDED: $Enums.ActionState[] = ['done', 'undone', 'rejected', 'failed', 'reverted', 'corrected']

const ENDED_WORD: Partial<Record<$Enums.ActionState, string>> = {
  undone: 'undone',
  rejected: 'rejected',
  failed: 'failed',
  reverted: 'reverted',
  corrected: 'corrected',
}

export async function getAssistantPanel(
  recordRef: string | null,
  viewer: Viewer,
  now = new Date()
): Promise<AssistantPanelFeed> {
  const [pause, budget] = await Promise.all([assistantPauseState(), displayBudgetState(now)])
  const blocked: AssistantPanelFeed['blocked'] = pause
    ? {
        kind: 'paused',
        text: `Assistant paused by ${pause.pausedById === viewer.id ? 'you' : 'the Owner'} at ${CLOCK.format(new Date(pause.pausedAt))}. Instructions wait until it resumes.`,
      }
    : budget === 'hard_stop'
      ? {
          kind: 'budget',
          text: 'This month’s AI cost limit is reached. Instructions wait until the Owner raises it in Settings.',
        }
      : null

  const e = recordRef?.startsWith('ENQ-')
    ? await opsDb.enquiry.findUnique({ where: { ref: recordRef }, select: { id: true, ref: true } })
    : null
  if (!e) {
    return {
      record: null,
      waiting: [],
      doing: [],
      earlier: [],
      blocked: blocked ?? {
        kind: 'no_record',
        text: 'Open a record to ask or instruct the Assistant about it.',
      },
      canInstruct: false,
    }
  }

  const masked = viewer.role !== 'owner' && !viewer.canSeeMargins
  const show = (t: string) => (masked ? maskMoney(t) : t)
  const since = dubaiDayStart(now)
  const onRecord = { OR: [{ enquiryId: e.id }, { subjectType: 'enquiry' as const, subjectId: e.id }] }
  const [actions, mail] = await Promise.all([
    opsDb.assistantAction.findMany({
      where: {
        AND: [
          onRecord,
          {
            OR: [
              { state: { in: [...OPEN, ...DOING] } },
              { state: { in: ENDED }, updatedAt: { gte: since } },
            ],
          },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 60,
      select: {
        id: true,
        ref: true,
        state: true,
        headline: true,
        laterUntil: true,
        createdAt: true,
        updatedAt: true,
        decidedById: true,
        surface: true,
        def: { select: { label: true } },
      },
    }),
    opsDb.outboundEmail.findMany({
      where: { enquiryId: e.id, status: { in: ['scheduled', 'held', 'waiting_for_mailbox'] } },
      orderBy: { scheduledFor: 'asc' },
      take: 10,
      select: { id: true, subject: true, toAddresses: true, scheduledFor: true, status: true, actionId: true },
    }),
  ])

  const waiting: PanelWaiting[] = actions
    .filter((a) => OPEN.includes(a.state) && a.surface === 'review')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((a) => ({
      id: a.id,
      action: a.def.label,
      title: show(a.headline),
      sub: a.state === 'later' && a.laterUntil ? `Later · back ${whenText(a.laterUntil, now)}` : a.ref,
      href: `/review?card=${a.ref}`,
    }))

  const doing: PanelDoing[] = [
    ...actions
      .filter((a) => DOING.includes(a.state))
      .map((a) => ({
        id: a.id,
        time: CLOCK.format(a.updatedAt),
        text: a.state === 'queued' ? `Sending: ${show(a.headline)}` : show(a.headline),
        scheduled: a.state === 'queued',
      })),
    ...mail
      .filter((m) => !actions.some((a) => a.id === m.actionId && DOING.includes(a.state)))
      .map((m) => ({
        id: m.id,
        time: m.scheduledFor ? whenText(m.scheduledFor, now) : '—',
        text: `${m.status === 'held' ? 'Held' : 'Email'} to ${m.toAddresses[0] ?? 'the recipient'}: ${show(m.subject)}`,
        scheduled: true,
      })),
    ...(
      await upcomingFor(
        { subjectType: 'enquiry', subjectId: e.id, enquiryId: e.id },
        { actions: actions.map((a) => ({ ...a, state: a.state as string })) }
      )
    ).map((u) => ({ id: u.key, time: whenText(u.at, now), text: show(u.text), scheduled: true })),
  ]

  const earlier: PanelEarlier[] = actions
    .filter((a) => ENDED.includes(a.state) && a.updatedAt >= since)
    .map((a) => ({
      id: a.id,
      time: CLOCK.format(a.updatedAt),
      text: `${show(a.headline)}${ENDED_WORD[a.state] ? ` · ${ENDED_WORD[a.state]}` : ''}`,
      actor:
        a.state === 'failed'
          ? ('warn' as const)
          : a.state === 'done' && !a.decidedById
            ? ('assistant' as const)
            : ('person' as const),
      whyId: encodeEvidenceId({ kind: 'action', ref: a.ref }),
    }))

  return {
    record: { subjectType: 'enquiry', subjectId: e.id, ref: e.ref },
    waiting,
    doing,
    earlier,
    blocked,
    canInstruct: blocked === null,
  }
}
