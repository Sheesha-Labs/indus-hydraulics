import 'server-only'
import { addWorkingDays, instantAt, wallTime, type WeekendTable } from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
// The tick runs in its own process: the actions it requests must be registered there.
import '../assistant/actions'
import { requestAction, idempotencyKeyOf } from '../assistant/request'
import { setActor } from '../assistant/write-tracked'
import { holidaysFor } from '../mail-send/slot'
import { getSetting } from '../settings/get'
import { registerClock } from './registry'

/**
 * The clocks on client questions (S09-T07, board 171), run by ops.clocks.tick every 15 minutes. Each fires once per
 * round of questions (the round is the first question's sentAt), on the AE working-day calendar planned when the
 * questions left (enquiry/questions.ts markQuestionsSent):
 *
 *   questions.reminder  day 2 without an answer → #8 remind_client_questions (Draft and ask). A contact who is out of
 *                       office moves it to the working day after they are back, 09:00.
 *   questions.call      day 3 → a call task on the Owner's Today: "Call <contact> about n open questions on ENQ-…"
 *   questions.fallback  the day before the last useful day → client_question_fallback (assume / leave out / wait)
 *
 * (decision) The handler lives with the other clocks in server/clocks (the S06 registry ops.clocks.tick runs), not
 * in a separate inngest/clocks/questions.ts: one function, one lane, the same 200-item batch.
 */
type Round = { enquiryId: string; sentAt: Date }

const roundVersion = (prefix: string, sentAt: Date) => `${prefix}@${sentAt.getTime()}`

/** One row per enquiry whose open questions have this clock due, with the round's first sentAt. */
async function dueRounds(
  column: 'reminderDueAt' | 'callTaskAt' | 'fallbackAt',
  now: Date,
  limit: number
): Promise<Round[]> {
  const extra =
    column === 'reminderDueAt'
      ? Prisma.sql`AND q."reminderSentAt" IS NULL`
      : column === 'fallbackAt'
        ? Prisma.sql`AND q."fallbackChoice" IS NULL`
        : Prisma.empty
  return opsDb.$queryRaw<Round[]>(Prisma.sql`
    SELECT q."enquiryId"::text AS "enquiryId", min(q."sentAt") AS "sentAt"
      FROM ops.client_question q
     WHERE q.status = 'sent' AND q."sentAt" IS NOT NULL
       AND q.${Prisma.raw(`"${column}"`)} <= ${now} ${extra}
     GROUP BY q."enquiryId"
     ORDER BY min(q.${Prisma.raw(`"${column}"`)}) ASC
     LIMIT ${limit}`)
}

async function alreadyRequested(
  actionKey: string,
  enquiryId: string,
  version: string
): Promise<boolean> {
  const key = idempotencyKeyOf({
    actionKey,
    subjectType: 'enquiry',
    subjectId: enquiryId,
    sourceVersion: version,
  })
  return !!(await opsDb.assistantAction.findUnique({
    where: { idempotencyKey: key },
    select: { id: true },
  }))
}

registerClock<Round>({
  key: 'questions.reminder',
  async due(now, limit) {
    return dueRounds('reminderDueAt', now, limit)
  },
  async fire(r, now) {
    const version = roundVersion('remind', r.sentAt)
    if (await alreadyRequested('remind_client_questions', r.enquiryId, version)) return 'already'
    const e = await opsDb.enquiry.findUniqueOrThrow({
      where: { id: r.enquiryId },
      select: { contact: { select: { outOfOfficeUntil: true } } },
    })
    const ooo = e.contact?.outOfOfficeUntil
    if (ooo && ooo.getTime() + 86_400_000 > now.getTime()) {
      // Out of office: the reminder waits for the working day after they are back, 09:00 Dubai.
      const [weekends, holidays] = await Promise.all([
        getSetting('calendar.country_weekends') as Promise<WeekendTable>,
        holidaysFor(['AE'], now, 120),
      ])
      const back = wallTime(ooo, 'Asia/Dubai')
      const next = addWorkingDays(
        { year: back.year, month: back.month, day: back.day },
        1,
        'AE',
        holidays,
        weekends
      )
      await opsDb.$transaction(async (tx) => {
        await setActor(tx, { kind: 'system' })
        await tx.clientQuestion.updateMany({
          where: { enquiryId: r.enquiryId, status: 'sent', reminderSentAt: null },
          data: { reminderDueAt: instantAt(next, 9, 0, 'Asia/Dubai') },
        })
      })
      return 'moved_ooo'
    }
    await requestAction({
      actionKey: 'remind_client_questions',
      subjectType: 'enquiry',
      subjectId: r.enquiryId,
      enquiryId: r.enquiryId,
      trigger: 'clock.questions.reminder',
      origin: 'live',
      sourceVersion: version,
    })
    return 'requested'
  },
  async nextExpected(now) {
    const q = await opsDb.clientQuestion.findFirst({
      where: { status: 'sent', reminderSentAt: null, reminderDueAt: { gt: now } },
      orderBy: { reminderDueAt: 'asc' },
      select: { reminderDueAt: true, enquiry: { select: { ref: true } } },
    })
    return q?.reminderDueAt
      ? {
          key: `questions.reminder:${q.enquiry.ref}`,
          at: q.reminderDueAt,
          text: `Reminder of the open questions on ${q.enquiry.ref}`,
        }
      : null
  },
  describeUpcoming: async (record) => {
    if (record.subjectType !== 'enquiry') return []
    const q = await opsDb.clientQuestion.findFirst({
      where: {
        enquiryId: record.subjectId,
        status: 'sent',
        reminderSentAt: null,
        reminderDueAt: { not: null },
      },
      orderBy: { reminderDueAt: 'asc' },
      select: { reminderDueAt: true },
    })
    return q?.reminderDueAt
      ? [
          {
            key: 'questions.reminder',
            at: q.reminderDueAt,
            text: 'Reminder of the open questions to the client',
          },
        ]
      : []
  },
})

const CALL_MARK = 'client-questions'

registerClock<Round>({
  key: 'questions.call',
  async due(now, limit) {
    const rounds = await dueRounds('callTaskAt', now, limit * 2)
    if (!rounds.length) return []
    const done = await opsDb.task.findMany({
      where: {
        kind: 'call',
        enquiryId: { in: rounds.map((r) => r.enquiryId) },
        notes: { startsWith: CALL_MARK },
      },
      select: { enquiryId: true, notes: true },
    })
    const seen = new Set(done.map((t) => `${t.enquiryId}|${t.notes?.split('\n')[0]}`))
    return rounds
      .filter((r) => !seen.has(`${r.enquiryId}|${CALL_MARK} ${r.sentAt.getTime()}`))
      .slice(0, limit)
  },
  async fire(r) {
    const e = await opsDb.enquiry.findUniqueOrThrow({
      where: { id: r.enquiryId },
      select: {
        id: true,
        ref: true,
        contact: { select: { name: true, phone: true } },
        clientQuestions: { where: { status: 'sent' }, select: { callTaskAt: true } },
      },
    })
    const owner = await opsDb.user.findFirst({
      where: { role: 'owner', status: 'active' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    const n = e.clientQuestions.length
    const due = e.clientQuestions.map((q) => q.callTaskAt).find((d): d is Date => !!d) ?? new Date()
    const marker = `${CALL_MARK} ${r.sentAt.getTime()}`
    const created = await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'system' })
      // Once per round: the marker on the first line of the notes is the key.
      const exists = await tx.task.findFirst({
        where: { enquiryId: e.id, kind: 'call', notes: { startsWith: marker } },
        select: { id: true },
      })
      if (exists) return false
      await tx.task.create({
        data: {
          title: `Call ${e.contact?.name ?? 'the client'} about ${n} open question${n === 1 ? '' : 's'} on ${e.ref}`,
          kind: 'call',
          source: 'assistant',
          status: 'open',
          dueAt: due,
          assigneeId: owner?.id ?? null,
          enquiryId: e.id,
          subjectType: 'enquiry',
          subjectId: e.id,
          notes: `${marker}\n${e.contact?.phone ? `Phone ${e.contact.phone}` : 'No phone on file'}`,
        },
      })
      return true
    })
    return created ? 'task' : 'already'
  },
})

registerClock<Round>({
  key: 'questions.fallback',
  async due(now, limit) {
    return dueRounds('fallbackAt', now, limit)
  },
  async fire(r) {
    const version = roundVersion('fallback', r.sentAt)
    if (await alreadyRequested('client_question_fallback', r.enquiryId, version)) return 'already'
    await requestAction({
      actionKey: 'client_question_fallback',
      subjectType: 'enquiry',
      subjectId: r.enquiryId,
      enquiryId: r.enquiryId,
      trigger: 'clock.questions.fallback',
      origin: 'live',
      sourceVersion: version,
    })
    return 'requested'
  },
})
