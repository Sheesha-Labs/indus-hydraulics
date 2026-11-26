import 'server-only'
import { fillTemplate, replyReferences, type DenyTerm, type ScanHit } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { parseScopeVersion } from '../../enquiry/choose-path'
import {
  clientThread,
  originalSubject,
  paragraphsHtml,
  type ClientThread,
} from '../../enquiry/client-thread'
import {
  holdForQuestions,
  markQuestionsSent,
  questionClockFor,
  releaseHeldOnUndo,
} from '../../enquiry/questions'
import { blockReason, enquiryDenyList, scanClientBound } from '../../identity/client-bound'
import {
  clientQuestionsSchema,
  clientQuestionsUser,
  PROMPT_VERSION,
  SYSTEM_PARTS,
  type ClientQuestionsOut,
} from '../prompts/client-questions.v1'
import { registerAction } from '../registry'
import { registerUndoRelease } from '../undo-hooks'
import type { ActionDefinition, Check, OutboundDraft, ProposalDraft } from '../types'

/**
 * Action #7 `ask_client_questions` (S09-T07, board 171): before sourcing, ask the client about the lines that cannot
 * go to suppliers yet. Only those lines are held; the rest are sourced.
 *
 *   trigger  choosePath('ask_client_first', lines) or the Questions tab's "Add question" (lines + an optional note)
 *   gather   the asked lines (open or held only; a line already with suppliers is left out and said so), what is
 *            unclear about each (extraction doubts, no make, equivalents not stated), the client's thread, the
 *            awaiting `client_questions` template and the deny list
 *   propose  Sonnet (client_questions@1): one question and one fallback assumption per line; the email is the
 *            template listing them by line
 *   verify   only the asked lines, each answered once; the reverse identifier check and the money scan
 *   approve  onScheduled: a draft ClientQuestion per line, the line open → held; undo of the send takes both back
 *   onSent   sentAt, the clock (day-2 reminder, day-3 call, fallback, last day), the response-time clock paused
 */

export interface AskInput {
  enquiryId: string
  ref: string
  clientRef: string | null
  title: string
  note: string | null
  lines: Array<{ id: string; no: number; description: string; qty: string; unclear: string[] }>
  /** Asked lines that had already gone to suppliers (left out of the questions). */
  skipped: number[]
  /** Lines not asked about: they go to suppliers. */
  others: number
  thread: ClientThread
  template: { subject: string; body: string } | null
  deny: DenyTerm[]
}

export interface AskOut {
  questions: ClientQuestionsOut['questions']
  subject: string
  body: string
  missing: string[]
  identity: ScanHit[]
  money: ScanHit[]
  problems: string[]
}

export async function gatherAsk(
  enquiryId: string,
  sourceVersion: string | number,
  note: string | null
): Promise<AskInput> {
  const { lineNos } = parseScopeVersion(sourceVersion)
  const e = await opsDb.enquiry.findUniqueOrThrow({
    where: { id: enquiryId },
    select: {
      id: true,
      ref: true,
      clientRef: true,
      title: true,
      lines: {
        where: { status: { not: 'cancelled' } },
        orderBy: { no: 'asc' },
        select: {
          id: true,
          no: true,
          description: true,
          qty: true,
          uom: true,
          status: true,
          specNotes: true,
          requestedMake: true,
          equivalentsPolicy: true,
          extractionConfidence: true,
          clientPartNo: true,
        },
      },
    },
  })
  const [thread, tpl, deny] = await Promise.all([
    clientThread(e.id),
    opsDb.emailTemplate.findUnique({
      where: { key: 'client_questions' },
      select: { subjectTemplate: true, bodyTemplate: true },
    }),
    enquiryDenyList(e.id),
  ])
  const asked = e.lines.filter((l) => lineNos.includes(l.no))
  const askable = asked.filter((l) => l.status === 'open' || l.status === 'held')
  return {
    enquiryId: e.id,
    ref: e.ref,
    clientRef: e.clientRef,
    title: e.title,
    note,
    lines: askable.map((l) => ({
      id: l.id,
      no: l.no,
      description: l.description,
      qty: `${l.qty.toString().replace(/\.0+$/, '')} ${l.uom}`,
      unclear: [
        ...(l.extractionConfidence && l.extractionConfidence !== 'sure'
          ? ['read from the document with doubt']
          : []),
        ...(!l.requestedMake && !l.clientPartNo ? ['no make or part number'] : []),
        ...(l.equivalentsPolicy === 'unknown' ? ['equivalents not stated'] : []),
        ...(l.specNotes ? [`notes: ${l.specNotes.slice(0, 120)}`] : []),
      ],
    })),
    skipped: asked.filter((l) => !askable.includes(l)).map((l) => l.no),
    others: e.lines.length - askable.length,
    thread,
    template: tpl ? { subject: tpl.subjectTemplate, body: tpl.bodyTemplate } : null,
    deny,
  }
}

const definition: ActionDefinition<AskInput, AskOut> = {
  key: 'ask_client_questions',
  group: 'enquiries',
  aiPurpose: 'draft',
  external: true,
  concurrencyGroup: 'mail',
  surface: 'review',
  requestableOn: ['enquiry'],

  estimate: (input) => ({
    chars: 1_500 + input.lines.length * 300,
    maxTokens: 400 + input.lines.length * 120,
  }),

  async gather({ request }) {
    const input = await gatherAsk(request.subjectId, request.sourceVersion, request.hint ?? null)
    return {
      input,
      versions: {
        enquiry: input.ref,
        lines: input.lines.map((l) => l.no).join('.'),
        template: input.template?.body.length ?? -1,
      },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input, ai) {
    if (!input.lines.length)
      return {
        ok: true,
        out: {
          questions: [],
          subject: '',
          body: '',
          missing: [],
          identity: [],
          money: [],
          problems: ['No line left to ask about'],
        },
        costUsd: '0.000000',
        model: null,
        promptVersion: null,
        callIds: [],
      }
    const res = await ai.call({
      route: 'draft',
      system: SYSTEM_PARTS,
      user: clientQuestionsUser({
        note: input.note,
        lines: input.lines.map((l) => ({
          no: l.no,
          description: l.description,
          qty: l.qty,
          unclear: l.unclear,
        })),
      }),
      zod: clientQuestionsSchema,
      maxTokens: 400 + input.lines.length * 120,
      promptVersion: PROMPT_VERSION,
    })
    if (!res.ok)
      return {
        ok: false,
        reason: res.reason,
        detail: res.detail,
        costUsd: res.costUsd,
        callIds: res.callIds,
      }
    const out = renderAsk(input, res.value.questions)
    return {
      ok: true,
      out,
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(out, input) {
    const asked = new Set(input.lines.map((l) => l.no))
    const got = out.questions.map((q) => q.lineNo)
    const stray = got.filter((n) => !asked.has(n))
    const missingLines = [...asked].filter((n) => !got.includes(n))
    const twice = got.filter((n, i) => got.indexOf(n) !== i)
    const problems = [
      ...out.problems,
      ...(stray.length ? [`Questions for lines not asked about: ${stray.join(', ')}`] : []),
      ...(missingLines.length ? [`No question for line ${missingLines.join(', ')}`] : []),
      ...(twice.length ? [`Two questions for line ${[...new Set(twice)].join(', ')}`] : []),
    ]
    const clean = !out.identity.length && !out.money.length
    const reason = blockReason({ identity: out.identity, money: out.money })
    const checks: Check[] = [
      clean
        ? { label: 'No supplier names, prices or margins in the email', status: 'pass' }
        : {
            label: 'No supplier names, prices or margins in the email',
            status: 'fail',
            detail: reason ?? undefined,
          },
      problems.length
        ? {
            label: 'Only the held lines, one question each',
            status: 'fail',
            detail: problems.join('; '),
          }
        : { label: `Only the held lines, one question each (${got.length})`, status: 'pass' },
      input.thread.source?.inSales
        ? {
            label: 'In the client’s thread from sales@',
            status: 'pass',
            detail: input.thread.mailbox?.address,
          }
        : {
            label: 'New message from sales@',
            status: 'warn',
            detail: input.thread.source
              ? 'the thread is only in purchase@'
              : 'no email to reply to',
          },
      out.missing.length
        ? {
            label: 'Wording from the template',
            status: 'fail',
            detail: `Missing: ${out.missing.join(', ')}`,
          }
        : { label: 'Wording from the template', status: 'pass' },
      ...(input.thread.source?.to ? [] : [{ label: 'No client address', status: 'fail' as const }]),
    ]
    const ok =
      clean &&
      !problems.length &&
      !out.missing.length &&
      !!input.thread.source?.to &&
      !!input.thread.mailbox
    return {
      out: { ...out, problems },
      checks,
      confidence: ok ? 'likely' : 'unsure',
      ...(ok
        ? {}
        : {
            unsure: [
              {
                field: !clean ? 'identity' : problems.length ? 'questions' : 'recipient',
                why: !clean
                  ? (reason ?? 'The email names a supplier or a price')
                  : (problems[0] ?? 'No client address or sales mailbox'),
              },
            ],
          }),
    }
  },

  toProposal(v, input): ProposalDraft {
    const mailbox = input.thread.mailbox?.address ?? 'sales@'
    const name = input.thread.contact?.name ?? 'the client'
    const n = v.out.questions.length
    return {
      headline: `Ask ${name} ${n} question${n === 1 ? '' : 's'} on ${input.ref} before sourcing ${n === 1 ? 'that line' : 'those lines'}.`,
      reasons: [
        {
          text: `Line${n === 1 ? '' : 's'} ${v.out.questions.map((q) => q.lineNo).join(', ')} wait for the answers; each has an assumption the quotation can use instead.`,
        },
        ...(input.others
          ? [
              {
                text: `${input.others} line${input.others === 1 ? '' : 's'} go to suppliers meanwhile.`,
              },
            ]
          : []),
        ...(input.skipped.length
          ? [
              {
                text: `Line${input.skipped.length === 1 ? '' : 's'} ${input.skipped.join(', ')} already went to suppliers, so ${input.skipped.length === 1 ? 'it is' : 'they are'} not asked about.`,
              },
            ]
          : []),
      ],
      preview:
        input.thread.source?.to && input.thread.mailbox
          ? ({
              mailbox,
              to: [input.thread.source.to],
              subject: v.out.subject,
              text: input.thread.source.quoted
                ? `${v.out.body}\n\n${input.thread.source.wrote} ${input.thread.source.quoted}…`
                : v.out.body,
            } as Prisma.InputJsonValue)
          : null,
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.unsure?.[0]?.why ?? null,
      onApproveText: `Sends from ${mailbox} in 5 minutes and holds line${n === 1 ? '' : 's'} ${v.out.questions.map((q) => q.lineNo).join(', ')}; the Assistant reminds on day 2 and puts a call on Today on day 3.`,
    }
  },

  async effect() {
    return { note: 'Questions sent to the client', undoable: false }
  },

  async approvalCheck(email, request) {
    if (!request.enquiryId) return null
    const pending = await opsDb.clientQuestion.count({
      where: { enquiryId: request.enquiryId, status: 'draft' },
    })
    if (pending)
      return 'Questions to this client are already waiting to send. Undo those first, or wait until they leave.'
    return blockReason(
      scanClientBound(`${email.subject}\n${email.body}`, await enquiryDenyList(request.enquiryId))
    )
  },

  outbound(v, input): OutboundDraft | null {
    const t = input.thread
    if (v.out.missing.length || v.out.problems.length || !t.mailbox || !t.source?.to) return null
    if (v.out.identity.length || v.out.money.length) return null
    const inThread = t.source.inSales
    return {
      kind: 'client_questions',
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

  async onScheduled(tx, v, ctx) {
    const lines = await tx.enquiryLine.findMany({
      where: { enquiryId: ctx.request.subjectId, no: { in: v.out.questions.map((q) => q.lineNo) } },
      select: { id: true, no: true },
    })
    const byNo = new Map(lines.map((l) => [l.no, l.id]))
    await holdForQuestions(tx, {
      enquiryId: ctx.request.subjectId,
      actionId: ctx.actionId,
      actor: { kind: 'user', id: ctx.decidedById },
      questions: v.out.questions.flatMap((q) =>
        byNo.has(q.lineNo)
          ? [
              {
                lineId: byNo.get(q.lineNo)!,
                lineNo: q.lineNo,
                question: q.question,
                fallbackAssumption: q.fallbackAssumption,
              },
            ]
          : []
      ),
    })
  },

  async onSent(tx, action) {
    const e = await tx.enquiry.findUniqueOrThrow({
      where: { id: action.request.subjectId },
      select: { id: true, deadline: true, revertBy: true },
    })
    const out = await tx.outboundEmail.findFirst({
      where: { actionId: action.id, status: 'sent' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, sentAt: true },
    })
    const sentAt = out?.sentAt ?? new Date()
    const clock = await questionClockFor(e, sentAt, tx)
    await markQuestionsSent(tx, {
      enquiryId: e.id,
      actionId: action.id,
      sentAt,
      outboundId: out?.id ?? null,
      clock,
    })
    return undefined
  },
}

/** The template filled in code: the questions listed by line, the held count, the references. */
export function renderAsk(input: AskInput, questions: ClientQuestionsOut['questions']): AskOut {
  const byNo = new Map(input.lines.map((l) => [l.no, l]))
  const list = questions
    .map((q) => {
      const l = byNo.get(q.lineNo)
      return `Line ${q.lineNo}${l ? ` · ${l.description.slice(0, 80)}` : ''}\n${q.question}`
    })
    .join('\n\n')
  const values = {
    salutation: input.thread.salutation,
    original_subject: originalSubject(input.thread.source?.subject, input.title),
    held_count: questions.length,
    client_ref: input.clientRef ?? input.ref,
    questions: list,
    enquiry_ref: input.ref,
  }
  const subject = input.template
    ? fillTemplate(input.template.subject, values)
    : { text: `Re: ${values.original_subject}`, missing: [] }
  const body = input.template
    ? fillTemplate(input.template.body, values)
    : { text: '', missing: ['template'] }
  const scan = scanClientBound(`${subject.text}\n${body.text}`, input.deny)
  return {
    questions,
    subject: subject.text,
    body: body.text.replace(/\n{3,}/g, '\n\n').trim(),
    missing: [...subject.missing, ...body.missing],
    identity: scan.identity,
    money: scan.money,
    problems: [],
  }
}

// Undo of the queued questions: the drafts go and the lines are open again.
registerUndoRelease('ask_client_questions', async (tx, action) => {
  const a = await tx.assistantAction.findUnique({
    where: { id: action.id },
    select: { subjectId: true, decidedById: true },
  })
  if (!a?.subjectId) return
  await releaseHeldOnUndo(tx, {
    enquiryId: a.subjectId,
    actionId: action.id,
    actor: a.decidedById ? { kind: 'user', id: a.decidedById } : { kind: 'assistant' },
  })
})

registerAction(definition)
export default definition
