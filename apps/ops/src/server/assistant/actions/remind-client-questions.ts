import 'server-only'
import { fillTemplate, replyReferences, type DenyTerm, type ScanHit } from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import {
  clientThread,
  originalSubject,
  paragraphsHtml,
  type ClientThread,
} from '../../enquiry/client-thread'
import { questionClockFor } from '../../enquiry/questions'
import { blockReason, enquiryDenyList, scanClientBound } from '../../identity/client-bound'
import { registerAction } from '../registry'
import type { ActionDefinition, Check, OutboundDraft, ProposalDraft } from '../types'
import { writeTracked } from '../write-tracked'

/**
 * Action #8 `remind_client_questions` (S09-T07, board 171 "Send reminder"): on day 2 without a reply, a reminder of
 * the open questions, in the client's thread from sales@. No model: the awaiting `client_question_reminder`
 * template, filled in code, says the date after which the lines are quoted on the stated assumptions.
 *
 * Requested by the questions clock (server/clocks/questions.ts) once per round of questions; never while the contact
 * is out of office (the clock moves the reminder to the day after they are back). onSent stamps reminderSentAt.
 */
export interface RemindInput {
  enquiryId: string
  ref: string
  clientRef: string | null
  title: string
  questions: Array<{ id: string; lineNo: number | null; line: string | null; question: string }>
  sentAt: string
  daysWaiting: number
  lastDayLabel: string
  fallbackLabel: string
  /** The contact's median hours to reply to our emails, from mail history; null without three replies. */
  medianReplyHours: number | null
  repliesCounted: number
  thread: ClientThread
  template: { subject: string; body: string } | null
  deny: DenyTerm[]
}

export interface RemindOut {
  subject: string
  body: string
  missing: string[]
  identity: ScanHit[]
  money: ScanHit[]
}

const LONG = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'long',
})
const SHORT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
})
const short = (d: Date) => SHORT.format(d).replace('Sept', 'Sep')

export async function gatherRemind(enquiryId: string, now = new Date()): Promise<RemindInput> {
  const e = await opsDb.enquiry.findUniqueOrThrow({
    where: { id: enquiryId },
    select: {
      id: true,
      ref: true,
      clientRef: true,
      title: true,
      deadline: true,
      revertBy: true,
      clientQuestions: {
        where: { status: 'sent' },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          question: true,
          sentAt: true,
          line: { select: { no: true, description: true } },
        },
      },
    },
  })
  const sentAt =
    e.clientQuestions
      .map((q) => q.sentAt)
      .filter((d): d is Date => !!d)
      .sort((a, b) => a.getTime() - b.getTime())[0] ?? now
  const [thread, tpl, deny, clock] = await Promise.all([
    clientThread(e.id),
    opsDb.emailTemplate.findUnique({
      where: { key: 'client_question_reminder' },
      select: { subjectTemplate: true, bodyTemplate: true },
    }),
    enquiryDenyList(e.id),
    questionClockFor(e, sentAt),
  ])
  // How quickly this contact usually answers us: inbound replies after our outbound, in their threads.
  const history = thread.contact?.email
    ? await opsDb.$queryRaw<Array<{ hours: number | null; n: bigint }>>(Prisma.sql`
        WITH ours AS (
          SELECT m."threadId", m."sentAt" FROM ops.mail_message m
           WHERE m.direction = 'outbound' AND ${thread.contact.email} = ANY(m."toAddresses")
           ORDER BY m."sentAt" DESC LIMIT 20),
        replies AS (
          SELECT EXTRACT(EPOCH FROM (min(r."sentAt") - o."sentAt")) / 3600.0 AS h
            FROM ours o JOIN ops.mail_message r
              ON r."threadId" = o."threadId" AND r.direction = 'inbound'
             AND lower(r."fromAddress") = lower(${thread.contact.email}) AND r."sentAt" > o."sentAt"
           GROUP BY o."threadId", o."sentAt")
        SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY h)::float AS hours, count(*) AS n FROM replies`)
    : []
  const n = Number(history[0]?.n ?? 0)
  return {
    enquiryId: e.id,
    ref: e.ref,
    clientRef: e.clientRef,
    title: e.title,
    questions: e.clientQuestions.map((q) => ({
      id: q.id,
      lineNo: q.line?.no ?? null,
      line: q.line?.description ?? null,
      question: q.question,
    })),
    sentAt: sentAt.toISOString(),
    daysWaiting: Math.max(0, Math.round((now.getTime() - sentAt.getTime()) / 86_400_000)),
    lastDayLabel: short(clock.lastDayToSendHeld),
    fallbackLabel: LONG.format(clock.fallbackAt),
    medianReplyHours: n >= 3 && history[0]?.hours != null ? Math.round(history[0].hours) : null,
    repliesCounted: n,
    thread,
    template: tpl ? { subject: tpl.subjectTemplate, body: tpl.bodyTemplate } : null,
    deny,
  }
}

const definition: ActionDefinition<RemindInput, RemindOut> = {
  key: 'remind_client_questions',
  group: 'enquiries',
  aiPurpose: 'draft',
  external: true,
  concurrencyGroup: 'mail',
  surface: 'review',

  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const input = await gatherRemind(request.subjectId)
    return {
      input,
      versions: { enquiry: input.ref, open: input.questions.map((q) => q.id).join('.') },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input) {
    const list = input.questions
      .map(
        (q) =>
          `${q.lineNo ? `Line ${q.lineNo}${q.line ? ` · ${q.line.slice(0, 80)}` : ''}\n` : ''}${q.question}`
      )
      .join('\n\n')
    const values = {
      salutation: input.thread.salutation,
      original_subject: originalSubject(input.thread.source?.subject, input.title),
      open_count: input.questions.length,
      client_ref: input.clientRef ?? input.ref,
      fallback_date: input.fallbackLabel,
      questions: list,
    }
    const subject = input.template
      ? fillTemplate(input.template.subject, values)
      : { text: `Re: ${values.original_subject}`, missing: [] }
    const body = input.template
      ? fillTemplate(input.template.body, values)
      : { text: '', missing: ['template'] }
    const scan = scanClientBound(`${subject.text}\n${body.text}`, input.deny)
    return {
      ok: true,
      out: {
        subject: subject.text,
        body: body.text.replace(/\n{3,}/g, '\n\n').trim(),
        missing: [...subject.missing, ...body.missing],
        identity: scan.identity,
        money: scan.money,
      },
      costUsd: '0.000000',
      model: null,
      promptVersion: null,
      callIds: [],
    }
  },

  async verify(out, input) {
    const clean = !out.identity.length && !out.money.length
    const reason = blockReason({ identity: out.identity, money: out.money })
    const ok =
      clean &&
      !out.missing.length &&
      input.questions.length > 0 &&
      !!input.thread.source?.to &&
      !!input.thread.mailbox
    const checks: Check[] = [
      clean
        ? { label: 'No supplier names, prices or margins in the email', status: 'pass' }
        : {
            label: 'No supplier names, prices or margins in the email',
            status: 'fail',
            detail: reason ?? undefined,
          },
      input.thread.source?.inSales
        ? {
            label: 'In the client’s thread from sales@',
            status: 'pass',
            detail: input.thread.mailbox?.address,
          }
        : { label: 'New message from sales@', status: 'warn' },
      out.missing.length
        ? {
            label: 'Wording from the template',
            status: 'fail',
            detail: `Missing: ${out.missing.join(', ')}`,
          }
        : { label: 'Wording from the template', status: 'pass' },
      input.questions.length
        ? {
            label: `${input.questions.length} open question${input.questions.length === 1 ? '' : 's'}`,
            status: 'pass',
          }
        : { label: 'No open question left', status: 'fail' },
    ]
    return {
      out,
      checks,
      confidence: ok ? 'sure' : 'unsure',
      ...(ok
        ? {}
        : {
            unsure: [
              { field: clean ? 'reminder' : 'identity', why: reason ?? 'Nothing to remind about' },
            ],
          }),
    }
  },

  toProposal(v, input): ProposalDraft {
    const name = input.thread.contact?.name ?? 'the client'
    const n = input.questions.length
    return {
      headline: `Remind ${name} of the ${n} open question${n === 1 ? '' : 's'}, in ${input.thread.source?.inSales ? 'their thread' : 'a new message'}.`,
      reasons: [
        {
          text: `${input.daysWaiting} day${input.daysWaiting === 1 ? '' : 's'} without a reply; ${input.thread.contact?.outOfOfficeUntil ? 'back from out-of-office' : 'no out-of-office'}.`,
        },
        ...(input.medianReplyHours !== null
          ? [
              {
                text: `${name} usually answers within ${input.medianReplyHours < 24 ? 'a day' : `${Math.round(input.medianReplyHours / 24)} days`} (last ${input.repliesCounted} replies).`,
              },
            ]
          : []),
        { text: `Held lines must reach suppliers by ${input.lastDayLabel}.` },
      ],
      preview:
        input.thread.source?.to && input.thread.mailbox
          ? ({
              mailbox: input.thread.mailbox.address,
              to: [input.thread.source.to],
              subject: v.out.subject,
              text: v.out.body,
            } as Prisma.InputJsonValue)
          : null,
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.unsure?.[0]?.why ?? null,
      onApproveText: `Sends from ${input.thread.mailbox?.address ?? 'sales@'} in 5 minutes; if there is still no answer, a call goes on Today tomorrow.`,
    }
  },

  async effect() {
    return { note: 'Reminder sent to the client', undoable: false }
  },

  async approvalCheck(email, request) {
    if (!request.enquiryId) return null
    return blockReason(
      scanClientBound(`${email.subject}\n${email.body}`, await enquiryDenyList(request.enquiryId))
    )
  },

  outbound(v, input): OutboundDraft | null {
    const t = input.thread
    if (
      v.out.missing.length ||
      !t.mailbox ||
      !t.source?.to ||
      v.out.identity.length ||
      v.out.money.length
    )
      return null
    const inThread = t.source.inSales
    return {
      kind: 'client_question_reminder',
      mailboxId: t.mailbox.id,
      to: [t.source.to],
      subject: inThread ? v.out.subject : v.out.subject.replace(/^Re:\s*/i, ''),
      bodyHtml: paragraphsHtml(v.out.body),
      bodyText: v.out.body,
      threadId: inThread ? t.source.threadId : null,
      ...(inThread && t.source.rfcMessageId
        ? {
            inReplyToRfcId: t.source.rfcMessageId,
            referencesRfcIds: replyReferences(t.source.referencesRfcIds, t.source.rfcMessageId),
          }
        : {}),
      enquiryId: input.enquiryId,
      ...(t.contact ? { contactId: t.contact.id } : {}),
      subjectType: 'enquiry',
      subjectId: input.enquiryId,
    }
  },

  async onSent(tx, action) {
    const enquiryId = action.request.subjectId
    const at = new Date()
    await writeTracked(
      tx,
      {
        actor: { kind: 'system' },
        actionId: action.id,
        enquiryId,
        subjectType: 'enquiry',
        subjectId: enquiryId,
        changes: [
          { field: 'questionsReminder', before: null, after: at.toISOString(), kind: 'status' },
        ],
        note: 'Reminder of the open questions sent to the client',
      },
      (t) =>
        t.clientQuestion.updateMany({
          where: { enquiryId, status: 'sent', reminderSentAt: null },
          data: { reminderSentAt: at },
        })
    )
    return undefined
  },
}

registerAction(definition)
export default definition
