import 'server-only'
import { addWorkingDays, questionDay, wallTime, type WeekendTable } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import type { OpsUser } from '../lib/access'
import { holidaysFor } from '../server/mail-send/slot'
import { getSetting } from '../server/settings/get'
import { REVIEW_SELECT, reviewCardOf, type ReviewCard } from './review'

/**
 * Board 171 · the Questions tab (S09-T07): the questions to the client (held lines only), the Assistant's clock on
 * them (day-2 reminder, day-3 call, fallback, last useful day), the fallback choice and the cards waiting on this
 * enquiry's questions. Reads: the enquiry with its lines, questions, contact and RFQs; the open cards; the AE
 * holidays when a round of questions is running (to place the last useful day).
 */
export type QuestionChip = 'Line on hold' | 'Not sent yet' | 'Answered' | 'Proceed with assumption' | 'Left out' | 'Withdrawn'

export interface QuestionRow {
  id: string
  lineNo: number | null
  line: string | null
  question: string
  status: string
  chip: QuestionChip
  assumption: string | null
  answer: string | null
  /** "Not sent. Assumption printed on the quotation: '…'" for a line quoted on its assumption. */
  note: string | null
}

export interface QuestionsTab {
  id: string
  ref: string
  clientName: string
  contactName: string | null
  questions: QuestionRow[]
  /** "Sent to <contact> · 14 Sep, 11:20 · no reply yet". */
  sentLine: string | null
  round: {
    waitingDays: number
    since: string
    today: string
    stats: Array<{ label: string; value: string }>
    timeline: Array<{
      key: string
      mark: 'done' | 'warn' | 'assistant' | 'current' | 'todo'
      date: string
      dateTime: string
      title: string
      sub?: string
    }>
  } | null
  /** `quoteLines`: the lines a quotation would carry if the held ones were left out. */
  fallback: { dateLabel: string; open: number; quoteLines: number; missingAssumption: number[] } | null
  cards: ReviewCard[]
  /** Lines that can still be asked about (open), for "Add question". */
  askable: Array<{ no: number; description: string }>
}

const CHIP: Record<string, QuestionChip> = {
  draft: 'Not sent yet',
  sent: 'Line on hold',
  answered: 'Answered',
  proceeded_on_assumption: 'Proceed with assumption',
  left_out: 'Left out',
  withdrawn: 'Withdrawn',
}

const QUESTION_CARDS = ['ask_client_questions', 'remind_client_questions', 'client_question_fallback', 'match_client_answers']

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })
const DAY_TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const WEEKDAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', weekday: 'short', day: 'numeric', month: 'short' })
const day = (d: Date) => DAY.format(d).replace('Sept', 'Sep')
const dayTime = (d: Date) => DAY_TIME.format(d).replace('Sept', 'Sep')
const iso = (d: Date) => d.toISOString().slice(0, 10)

export async function getQuestionsTab(
  ref: string,
  user: Pick<OpsUser, 'id' | 'role' | 'canSeeMargins'>,
  now = new Date()
): Promise<QuestionsTab | null> {
  const e = await opsDb.enquiry.findUnique({
    where: { ref },
    select: {
      id: true,
      ref: true,
      deadline: true,
      revertBy: true,
      client: { select: { name: true } },
      contact: { select: { name: true, phone: true } },
      lines: {
        where: { status: { not: 'cancelled' } },
        orderBy: { no: 'asc' },
        select: { no: true, description: true, status: true },
      },
      clientQuestions: {
        where: { status: { not: 'withdrawn' } },
        orderBy: [{ createdAt: 'asc' }],
        select: {
          id: true,
          question: true,
          status: true,
          fallbackAssumption: true,
          answerText: true,
          sentAt: true,
          reminderSentAt: true,
          reminderDueAt: true,
          callTaskAt: true,
          fallbackAt: true,
          fallbackChoice: true,
          line: { select: { no: true, description: true } },
        },
      },
      rfqs: {
        where: { status: { in: ['sent', 'closed'] } },
        orderBy: { createdAt: 'asc' },
        select: { recipients: { where: { sentAt: { not: null } }, select: { sentAt: true } } },
      },
      tasks: {
        where: { kind: 'call', notes: { startsWith: 'client-questions' } },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true, assignee: { select: { initials: true } } },
      },
    },
  })
  if (!e) return null
  const sent = e.clientQuestions.filter((q) => q.status === 'sent')
  const first = sent.map((q) => q.sentAt).filter((d): d is Date => !!d).sort((a, b) => a.getTime() - b.getTime())[0] ?? null
  const [rows, calendar] = await Promise.all([
    opsDb.assistantAction.findMany({
      where: { enquiryId: e.id, actionKey: { in: QUESTION_CARDS }, surface: 'review', state: { in: ['proposed', 'later'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      ...REVIEW_SELECT,
    }),
    first
      ? Promise.all([
          getSetting('calendar.country_weekends') as Promise<WeekendTable>,
          holidaysFor(['AE'], first, 60),
          getSetting('questions.clock').catch(() => ({ reminderWorkingDays: 2, callTaskHour: '10:00', supplierLeadWorkingDays: 4 })),
        ])
      : null,
  ])

  const questions: QuestionRow[] = e.clientQuestions.map((q) => ({
    id: q.id,
    lineNo: q.line?.no ?? null,
    line: q.line?.description ?? null,
    question: q.question,
    status: q.status,
    chip: CHIP[q.status] ?? 'Line on hold',
    assumption: q.fallbackAssumption,
    answer: q.answerText,
    note:
      q.status === 'proceeded_on_assumption' && q.fallbackAssumption
        ? `Not sent. Assumption printed on the quotation: “${q.fallbackAssumption}”`
        : null,
  }))

  let round: QuestionsTab['round'] = null
  let fallback: QuestionsTab['fallback'] = null
  if (first && calendar) {
    const [weekends, holidays, setting] = calendar
    const q0 = sent[0]!
    const lastDayDate = q0.fallbackAt
      ? (() => {
          const w = wallTime(q0.fallbackAt, 'Asia/Dubai')
          const d = addWorkingDays({ year: w.year, month: w.month, day: w.day }, 1, 'AE', holidays, weekends)
          return new Date(Date.UTC(d.year, d.month - 1, d.day, 13))
        })()
      : null
    const remindCard = rows.find((r) => r.actionKey === 'remind_client_questions')
    const task = e.tasks[0] ?? null
    const target = e.deadline ?? e.revertBy
    const held = e.lines.filter((l) => l.status === 'held')
    const sourcing = e.lines.filter((l) => !['open', 'held'].includes(l.status))
    const rfqSent = e.rfqs.flatMap((r) => r.recipients.map((x) => x.sentAt!)).sort((a, b) => a.getTime() - b.getTime())
    round = {
      waitingDays: questionDay(first, now, { holidays, weekends }),
      since: dayTime(first),
      today: WEEKDAY.format(now).replace('Sept', 'Sep'),
      stats: [
        { label: 'Lines sourcing', value: `${sourcing.length} of ${e.lines.length}` },
        { label: 'Lines on hold', value: `${held.length}${held.length ? ` · ${held.map((l) => `#${l.no}`).join(', ')}` : ''}` },
        { label: 'Supplier RFQs sent', value: rfqSent.length ? `${e.rfqs.length} · ${dayTime(rfqSent[0]!)}` : '0' },
      ],
      timeline: [
        { key: 'sent', mark: 'done', date: day(first), dateTime: iso(first), title: 'Questions sent' },
        ...(q0.reminderDueAt || q0.reminderSentAt
          ? [
              {
                key: 'reminder',
                mark: q0.reminderSentAt ? ('done' as const) : remindCard ? ('current' as const) : ('todo' as const),
                date: day(q0.reminderSentAt ?? q0.reminderDueAt!),
                dateTime: iso(q0.reminderSentAt ?? q0.reminderDueAt!),
                title: `Day ${setting.reminderWorkingDays} · reminder email`,
                sub: q0.reminderSentAt
                  ? 'Sent in the client’s thread'
                  : remindCard
                    ? 'Proposal in Review now. Autopilot can make it Do it, tell you'
                    : 'The Assistant drafts it for Review',
              },
            ]
          : []),
        ...(q0.callTaskAt
          ? [
              {
                key: 'call',
                mark: task?.status === 'done' ? ('done' as const) : task ? ('current' as const) : ('todo' as const),
                date: day(q0.callTaskAt),
                dateTime: iso(q0.callTaskAt),
                title: `Day ${setting.reminderWorkingDays + 1} · task: call ${e.contact?.name ?? 'the client'}`,
                sub: `${e.contact?.phone ? `${e.contact.phone} · ` : ''}on Today${task?.assignee ? ` for ${task.assignee.initials}` : ''}`,
              },
            ]
          : []),
        ...(q0.fallbackAt
          ? [
              {
                key: 'fallback',
                mark: q0.fallbackChoice ? ('done' as const) : ('todo' as const),
                date: day(q0.fallbackAt),
                dateTime: iso(q0.fallbackAt),
                title: q0.fallbackChoice === 'wait' ? 'Keep waiting was chosen' : 'Then the fallback below applies',
              },
            ]
          : []),
        ...(lastDayDate
          ? [
              {
                key: 'last',
                mark: 'todo' as const,
                date: day(lastDayDate),
                dateTime: iso(lastDayDate),
                title: 'Last day to send held lines to suppliers',
                ...(target
                  ? { sub: `Suppliers need ${setting.supplierLeadWorkingDays} working days before ${day(target)}` }
                  : {}),
              },
            ]
          : []),
      ],
    }
    fallback = q0.fallbackAt
      ? {
          dateLabel: day(q0.fallbackAt),
          open: sent.length,
          quoteLines: e.lines.length - held.length,
          missingAssumption: sent.filter((q) => !q.fallbackAssumption?.trim()).map((q) => q.line?.no ?? 0),
        }
      : null
  }
  const replied = sent.length === 0 && e.clientQuestions.some((q) => q.status === 'answered')
  return {
    id: e.id,
    ref: e.ref,
    clientName: e.client?.name ?? 'the client',
    contactName: e.contact?.name ?? null,
    questions,
    sentLine: first
      ? `Sent to ${e.contact?.name ?? 'the client'} · ${dayTime(first)} · ${sent.some((q) => q.reminderSentAt) ? 'reminded, ' : ''}no reply yet`
      : replied
        ? 'Every question is answered'
        : null,
    round,
    fallback,
    cards: rows.map((r) => reviewCardOf(r, user, now)),
    askable: e.lines.filter((l) => l.status === 'open').map((l) => ({ no: l.no, description: l.description })),
  }
}
