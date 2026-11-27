import 'server-only'
import { planQuestionClock, type QuestionClock, type WeekendTable } from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { writeTracked } from '../assistant/write-tracked'
import { holidaysFor } from '../mail-send/slot'
import { getSetting } from '../settings/get'
import { changeLineStatus } from './transition'

/**
 * Client questions before sourcing (S09-T07, board 171): only the held lines wait; the rest go to suppliers.
 *
 *   holdForQuestions     approving #7: one draft ClientQuestion per line, the line open → held (its reason)
 *   releaseHeldOnUndo    the queued questions were undone: the drafts go, the lines back to open
 *   markQuestionsSent    the email left: sentAt, the clock planned (questions.clock), the response-time clock paused
 *   applyAnswers         a client's answers (matched, or typed by a person): answered, the line held → open, the
 *                        implied changes applied with the answer as evidence (a quoted line whose quantity or spec
 *                        changes goes back to sourcing); the response clock resumes when none are left open
 *   applyFallback        the last useful day: assume (assumptions printed on the quotation, lines open), leave out
 *                        (held → not_quoted, "Awaiting client answer"), or wait (the clock stays paused)
 *   changeAssumption     "Change" on an assumption row
 *
 * Every write goes through writeTracked or changeLineStatus, with the person or the Assistant as actor.
 */

type Tx = Prisma.TransactionClient
type Actor = { kind: 'user'; id: string } | { kind: 'assistant' } | { kind: 'system' }

export class QuestionsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QuestionsError'
  }
}

export const HELD_PREFIX = 'Waiting on the client: '
export const LEFT_OUT_REASON = 'Awaiting client answer'

export interface DraftQuestion {
  lineId: string
  lineNo: number
  question: string
  fallbackAssumption: string | null
}

export async function holdForQuestions(
  tx: Tx,
  i: { enquiryId: string; actionId: string; actor: Actor; questions: readonly DraftQuestion[] }
): Promise<void> {
  const pending = await tx.clientQuestion.count({
    where: { enquiryId: i.enquiryId, status: 'draft' },
  })
  if (pending) throw new QuestionsError('Questions to this client are already waiting to send')
  for (const q of i.questions) {
    const line = await tx.enquiryLine.findUniqueOrThrow({
      where: { id: q.lineId },
      select: { status: true },
    })
    await tx.clientQuestion.create({
      data: {
        enquiryId: i.enquiryId,
        lineId: q.lineId,
        question: q.question,
        fallbackAssumption: q.fallbackAssumption,
        status: 'draft',
      },
    })
    if (line.status === 'open')
      await changeLineStatus(tx, {
        lineId: q.lineId,
        to: 'held',
        actor: i.actor,
        actionId: i.actionId,
        note: `Line ${q.lineNo} on hold for the client’s answer`,
        data: { heldReason: `${HELD_PREFIX}${q.question}`.slice(0, 500) },
      })
  }
}

export async function releaseHeldOnUndo(
  tx: Tx,
  i: { enquiryId: string; actionId: string; actor: Actor }
) {
  const drafts = await tx.clientQuestion.findMany({
    where: { enquiryId: i.enquiryId, status: 'draft' },
    select: { id: true, lineId: true },
  })
  for (const d of drafts) {
    if (d.lineId) {
      const line = await tx.enquiryLine.findUniqueOrThrow({
        where: { id: d.lineId },
        select: { status: true, heldReason: true },
      })
      if (line.status === 'held' && line.heldReason?.startsWith(HELD_PREFIX))
        await changeLineStatus(tx, {
          lineId: d.lineId,
          to: 'open',
          actor: i.actor,
          actionId: i.actionId,
          note: 'Questions undone: the line is open again',
          data: { heldReason: null },
        })
    }
  }
  await tx.clientQuestion.deleteMany({ where: { id: { in: drafts.map((d) => d.id) } } })
}

const CLOCK_DEFAULT = { reminderWorkingDays: 2, callTaskHour: '10:00', supplierLeadWorkingDays: 4 }

/**
 * The plan for questions sent now, from the questions.clock setting and the AE working-day calendar. Given a
 * transaction (the send's settle hook), every read goes through it: never a second connection while one is held
 * (ADR-04, connection_limit=1).
 */
export async function questionClockFor(
  e: { deadline: Date | null; revertBy: Date | null },
  sentAt: Date,
  tx?: Tx
): Promise<QuestionClock> {
  const from = new Date(sentAt.getTime() - 86_400_000)
  let setting: typeof CLOCK_DEFAULT
  let weekends: WeekendTable
  let holidays: Awaited<ReturnType<typeof holidaysFor>>
  if (tx) {
    const rows = await tx.settingsEntry.findMany({
      where: { key: { in: ['questions.clock', 'calendar.country_weekends'] } },
      select: { key: true, value: true },
    })
    const v = (k: string) => rows.find((r) => r.key === k)?.value as unknown
    const clock = v('questions.clock') as Partial<typeof CLOCK_DEFAULT> | undefined
    setting = { ...CLOCK_DEFAULT, ...(clock ?? {}) }
    weekends = (v('calendar.country_weekends') as WeekendTable | undefined) ?? {
      default: [6, 0],
      byCountry: {},
    }
    holidays = await holidaysFor(['AE'], from, 120, tx)
  } else {
    ;[setting, weekends, holidays] = await Promise.all([
      getSetting('questions.clock').catch(() => CLOCK_DEFAULT),
      getSetting('calendar.country_weekends') as Promise<WeekendTable>,
      holidaysFor(['AE'], from, 120),
    ])
  }
  return planQuestionClock({
    sentAt,
    deadline: e.deadline,
    revertBy: e.revertBy,
    calendar: { holidays, weekends },
    reminderWorkingDays: setting.reminderWorkingDays,
    callTaskHour: setting.callTaskHour,
    supplierLeadWorkingDays: setting.supplierLeadWorkingDays,
  })
}

export async function markQuestionsSent(
  tx: Tx,
  i: {
    enquiryId: string
    actionId: string
    sentAt: Date
    outboundId: string | null
    clock: QuestionClock
  }
): Promise<number> {
  const drafts = await tx.clientQuestion.findMany({
    where: { enquiryId: i.enquiryId, status: 'draft' },
    select: { id: true },
  })
  if (!drafts.length) return 0
  const e = await tx.enquiry.findUniqueOrThrow({
    where: { id: i.enquiryId },
    select: { responseClockPausedAt: true },
  })
  await writeTracked(
    tx,
    {
      actor: { kind: 'system' },
      actionId: i.actionId,
      enquiryId: i.enquiryId,
      subjectType: 'enquiry',
      subjectId: i.enquiryId,
      changes: [
        {
          field: 'responseClockPausedAt',
          before: e.responseClockPausedAt?.toISOString() ?? null,
          after: e.responseClockPausedAt?.toISOString() ?? i.sentAt.toISOString(),
          kind: 'status',
        },
      ],
      note: `${drafts.length} question${drafts.length === 1 ? '' : 's'} sent to the client; the response-time clock waits for the answers`,
    },
    async (t) => {
      await t.clientQuestion.updateMany({
        where: { id: { in: drafts.map((d) => d.id) } },
        data: {
          status: 'sent',
          sentAt: i.sentAt,
          outboundId: i.outboundId,
          reminderDueAt: i.clock.reminderDueAt,
          callTaskAt: i.clock.callTaskAt,
          fallbackAt: i.clock.fallbackAt,
        },
      })
      if (!e.responseClockPausedAt)
        await t.enquiry.update({
          where: { id: i.enquiryId },
          data: { responseClockPausedAt: i.sentAt },
        })
    }
  )
  return drafts.length
}

export interface AnswerInput {
  questionId: string
  answerText: string
  messageId: string | null
  implies?:
    | {
        qty?: string | undefined
        uom?: string | undefined
        spec?: string | undefined
        partNo?: string | undefined
      }
    | undefined
}

const QTY = /^\d{1,7}(?:\.\d{1,4})?$/

export async function applyAnswers(
  tx: Tx,
  i: {
    enquiryId: string
    answers: readonly AnswerInput[]
    actor: Actor
    actionId?: string | null
    now?: Date
  }
): Promise<{ answered: number; open: number }> {
  const now = i.now ?? new Date()
  let answered = 0
  for (const a of i.answers) {
    const q = await tx.clientQuestion.findUniqueOrThrow({
      where: { id: a.questionId },
      select: {
        id: true,
        enquiryId: true,
        status: true,
        line: {
          select: {
            id: true,
            no: true,
            status: true,
            qty: true,
            uom: true,
            specNotes: true,
            clientPartNo: true,
          },
        },
      },
    })
    if (q.enquiryId !== i.enquiryId)
      throw new QuestionsError('That question belongs to another enquiry')
    if (q.status !== 'sent') continue
    const note = `Answered${i.actor.kind === 'user' ? ' manually' : ''}: “${a.answerText.slice(0, 160)}”`
    await writeTracked(
      tx,
      {
        actor: i.actor,
        actionId: i.actionId ?? null,
        enquiryId: i.enquiryId,
        subjectType: 'enquiry',
        subjectId: i.enquiryId,
        changes: [{ field: 'clientQuestion', before: 'sent', after: 'answered', kind: 'status' }],
        note: q.line ? `Line ${q.line.no} · ${note}` : note,
      },
      (t) =>
        t.clientQuestion.update({
          where: { id: q.id },
          data: {
            status: 'answered',
            answerText: a.answerText.slice(0, 2000),
            answerMessageId: a.messageId,
            answeredAt: now,
          },
        })
    )
    answered += 1
    const l = q.line
    if (!l) continue
    // What the answer implies for the line, the answer quoted as the evidence.
    const changes: Array<{
      field: string
      before: unknown
      after: unknown
      kind: 'quantity' | 'other'
    }> = []
    const data: Prisma.EnquiryLineUncheckedUpdateInput = {}
    if (
      a.implies?.qty &&
      QTY.test(a.implies.qty) &&
      new Prisma.Decimal(a.implies.qty).cmp(l.qty) !== 0
    ) {
      changes.push({
        field: 'qty',
        before: l.qty.toString(),
        after: a.implies.qty,
        kind: 'quantity',
      })
      data.qty = a.implies.qty
      data.qtyChangedAt = now
    }
    if (a.implies?.uom && a.implies.uom !== l.uom) {
      changes.push({ field: 'uom', before: l.uom, after: a.implies.uom, kind: 'quantity' })
      data.uom = a.implies.uom
    }
    if (a.implies?.spec) {
      const spec = [l.specNotes, a.implies.spec].filter(Boolean).join(' · ').slice(0, 1000)
      changes.push({ field: 'specNotes', before: l.specNotes, after: spec, kind: 'other' })
      data.specNotes = spec
    }
    if (a.implies?.partNo && a.implies.partNo !== l.clientPartNo) {
      changes.push({
        field: 'clientPartNo',
        before: l.clientPartNo,
        after: a.implies.partNo,
        kind: 'other',
      })
      data.clientPartNo = a.implies.partNo
    }
    if (changes.length)
      await writeTracked(
        tx,
        {
          actor: i.actor,
          actionId: i.actionId ?? null,
          enquiryId: i.enquiryId,
          subjectType: 'enquiry_line',
          subjectId: l.id,
          changes,
          note: `From the client’s answer: “${a.answerText.slice(0, 160)}”`,
        },
        (t) =>
          t.enquiryLine.update({
            where: { id: l.id },
            data: { ...data, version: { increment: 1 } },
          })
      )
    if (l.status === 'held')
      await changeLineStatus(tx, {
        lineId: l.id,
        to: 'open',
        actor: i.actor,
        actionId: i.actionId ?? null,
        note: `Line ${l.no} answered: open for sourcing`,
        data: { heldReason: null },
      })
    else if (
      l.status === 'quoted' &&
      changes.some((c) => c.field === 'qty' || c.field === 'specNotes')
    )
      await changeLineStatus(tx, {
        lineId: l.id,
        to: 'sourcing',
        ctx: { staleReason: 'quantity_changed_awaiting_revision' },
        actor: i.actor,
        actionId: i.actionId ?? null,
        note: `Line ${l.no} changed by the client’s answer: the quotes need revising`,
      })
  }
  const open = await resumeWhenAnswered(tx, i.enquiryId, i.actor, i.actionId ?? null)
  return { answered, open }
}

/** When no sent question is left open, the response-time clock resumes. Returns the questions still open. */
async function resumeWhenAnswered(
  tx: Tx,
  enquiryId: string,
  actor: Actor,
  actionId: string | null
) {
  const open = await tx.clientQuestion.count({ where: { enquiryId, status: 'sent' } })
  if (open) return open
  const e = await tx.enquiry.findUniqueOrThrow({
    where: { id: enquiryId },
    select: { responseClockPausedAt: true },
  })
  if (e.responseClockPausedAt)
    await writeTracked(
      tx,
      {
        actor,
        actionId,
        enquiryId,
        subjectType: 'enquiry',
        subjectId: enquiryId,
        changes: [
          {
            field: 'responseClockPausedAt',
            before: e.responseClockPausedAt.toISOString(),
            after: null,
            kind: 'status',
          },
        ],
        note: 'No question left open: the response-time clock runs again',
      },
      (t) => t.enquiry.update({ where: { id: enquiryId }, data: { responseClockPausedAt: null } })
    )
  return 0
}

export type FallbackChoice = 'assume' | 'leave_out' | 'wait'

export async function applyFallback(
  tx: Tx,
  i: {
    enquiryId: string
    choice: FallbackChoice
    actor: Actor
    actionId?: string | null
    questionIds?: readonly string[]
  }
): Promise<{ applied: number }> {
  const qs = await tx.clientQuestion.findMany({
    where: {
      enquiryId: i.enquiryId,
      status: 'sent',
      ...(i.questionIds ? { id: { in: [...i.questionIds] } } : {}),
    },
    select: {
      id: true,
      fallbackAssumption: true,
      line: { select: { id: true, no: true, status: true } },
    },
  })
  if (!qs.length) throw new QuestionsError('No open question to apply it to')
  const actionId = i.actionId ?? null
  if (i.choice === 'wait') {
    await writeTracked(
      tx,
      {
        actor: i.actor,
        actionId,
        enquiryId: i.enquiryId,
        subjectType: 'enquiry',
        subjectId: i.enquiryId,
        changes: [{ field: 'questionsFallback', before: null, after: 'wait', kind: 'decision' }],
        note: 'Keep waiting: the quotation is due on the client’s answer; the response-time clock stays paused',
      },
      (t) =>
        t.clientQuestion.updateMany({
          where: { id: { in: qs.map((q) => q.id) } },
          data: { fallbackChoice: 'wait' },
        })
    )
    return { applied: qs.length }
  }
  for (const q of qs) {
    if (i.choice === 'assume') {
      const text = q.fallbackAssumption?.trim()
      if (!text)
        throw new QuestionsError('A question has no assumption to quote on: write one first')
      await writeTracked(
        tx,
        {
          actor: i.actor,
          actionId,
          enquiryId: i.enquiryId,
          subjectType: 'enquiry',
          subjectId: i.enquiryId,
          changes: [{ field: 'assumption', before: null, after: text, kind: 'terms' }],
          note: `${q.line ? `Line ${q.line.no}: ` : ''}quoted on the stated assumption, printed on the quotation`,
        },
        async (t) => {
          await t.enquiryAssumption.create({
            data: {
              enquiryId: i.enquiryId,
              lineId: q.line?.id ?? null,
              text,
              printOnQuotation: true,
            },
          })
          await t.clientQuestion.update({
            where: { id: q.id },
            data: { status: 'proceeded_on_assumption', fallbackChoice: 'assume' },
          })
        }
      )
      if (q.line?.status === 'held')
        await changeLineStatus(tx, {
          lineId: q.line.id,
          to: 'open',
          actor: i.actor,
          actionId,
          note: `Line ${q.line.no} goes to suppliers on the assumption`,
          data: { heldReason: null },
        })
    } else {
      await writeTracked(
        tx,
        {
          actor: i.actor,
          actionId,
          enquiryId: i.enquiryId,
          subjectType: 'enquiry',
          subjectId: i.enquiryId,
          changes: [
            { field: 'clientQuestion', before: 'sent', after: 'left_out', kind: 'decision' },
          ],
          note: `${q.line ? `Line ${q.line.no}` : 'The question'} left out of the quotation`,
        },
        (t) =>
          t.clientQuestion.update({
            where: { id: q.id },
            data: { status: 'left_out', fallbackChoice: 'leave_out' },
          })
      )
      if (q.line?.status === 'held')
        await changeLineStatus(tx, {
          lineId: q.line.id,
          to: 'not_quoted',
          ctx: { notQuotedReason: LEFT_OUT_REASON },
          actor: i.actor,
          actionId,
          note: `Line ${q.line.no} left out: ${LEFT_OUT_REASON.toLowerCase()}`,
          data: { notQuotedReason: LEFT_OUT_REASON },
        })
    }
  }
  await resumeWhenAnswered(tx, i.enquiryId, i.actor, actionId)
  return { applied: qs.length }
}

/**
 * "Change" on an assumption: the text the quotation will print if the client does not answer, or (once quoted on
 * it) the assumption the quotation prints.
 */
export async function changeAssumption(
  tx: Tx,
  i: { questionId: string; text: string; actor: Actor }
): Promise<{ enquiryId: string }> {
  const q = await tx.clientQuestion.findUniqueOrThrow({
    where: { id: i.questionId },
    select: { id: true, enquiryId: true, lineId: true, status: true, fallbackAssumption: true },
  })
  if (!['draft', 'sent', 'proceeded_on_assumption'].includes(q.status))
    throw new QuestionsError('This question is already settled')
  await writeTracked(
    tx,
    {
      actor: i.actor,
      enquiryId: q.enquiryId,
      subjectType: 'enquiry',
      subjectId: q.enquiryId,
      changes: [
        { field: 'fallbackAssumption', before: q.fallbackAssumption, after: i.text, kind: 'terms' },
      ],
      note: 'Assumption changed',
    },
    async (t) => {
      await t.clientQuestion.update({ where: { id: q.id }, data: { fallbackAssumption: i.text } })
      // Already quoted on it: the assumption the quotation prints changes with it.
      if (q.status === 'proceeded_on_assumption' && q.fallbackAssumption)
        await t.enquiryAssumption.updateMany({
          where: { enquiryId: q.enquiryId, lineId: q.lineId, text: q.fallbackAssumption },
          data: { text: i.text },
        })
    }
  )
  return { enquiryId: q.enquiryId }
}
