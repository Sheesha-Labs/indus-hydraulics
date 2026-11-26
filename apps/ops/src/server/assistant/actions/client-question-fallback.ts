import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { applyFallback, questionClockFor, type FallbackChoice } from '../../enquiry/questions'
import { registerAction } from '../registry'
import type { ActionDefinition, ProposalDraft } from '../types'

/**
 * `client_question_fallback` (S09-T07, board 171 "If no answer by …"): questions still open on the day before the
 * last useful day. Three options, always a person's choice (maxLevel Draft and ask, not configurable):
 *
 *   assume     quote on the stated assumptions: printed on the quotation, the lines go to suppliers
 *   leave_out  leave the lines out: held → not_quoted ("Awaiting client answer")
 *   wait       keep waiting: the quote is due on the answer; the response-time clock stays paused
 *
 * Internal (it sends nothing). The Questions tab's FallbackChooser applies the same choice directly.
 */
export interface FallbackInput {
  enquiryId: string
  ref: string
  questions: Array<{ id: string; lineNo: number | null; assumption: string | null }>
  lastDayLabel: string
  linesSourcing: number
  linesTotal: number
}

export interface FallbackOut {
  questionIds: string[]
  missingAssumption: number[]
}

const SHORT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
})

export async function gatherFallback(enquiryId: string): Promise<FallbackInput> {
  const e = await opsDb.enquiry.findUniqueOrThrow({
    where: { id: enquiryId },
    select: {
      id: true,
      ref: true,
      deadline: true,
      revertBy: true,
      lines: { where: { status: { not: 'cancelled' } }, select: { status: true } },
      clientQuestions: {
        where: { status: 'sent' },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          sentAt: true,
          fallbackAssumption: true,
          line: { select: { no: true } },
        },
      },
    },
  })
  const sentAt = e.clientQuestions[0]?.sentAt ?? new Date()
  const clock = await questionClockFor(e, sentAt)
  return {
    enquiryId: e.id,
    ref: e.ref,
    questions: e.clientQuestions.map((q) => ({
      id: q.id,
      lineNo: q.line?.no ?? null,
      assumption: q.fallbackAssumption,
    })),
    lastDayLabel: SHORT.format(clock.lastDayToSendHeld).replace('Sept', 'Sep'),
    linesSourcing: e.lines.filter((l) => !['open', 'held'].includes(l.status)).length,
    linesTotal: e.lines.length,
  }
}

const definition: ActionDefinition<FallbackInput, FallbackOut> = {
  key: 'client_question_fallback',
  group: 'enquiries',
  aiPurpose: 'other',
  external: false,
  concurrencyGroup: 'enquiry',
  surface: 'review',

  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const input = await gatherFallback(request.subjectId)
    return {
      input,
      versions: { enquiry: input.ref, open: input.questions.map((q) => q.id).join('.') },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input) {
    return {
      ok: true,
      out: {
        questionIds: input.questions.map((q) => q.id),
        missingAssumption: input.questions
          .filter((q) => !q.assumption?.trim())
          .map((q) => q.lineNo ?? 0),
      },
      costUsd: '0.000000',
      model: null,
      promptVersion: null,
      callIds: [],
    }
  },

  async verify(out, input) {
    return {
      out,
      checks: [
        input.questions.length
          ? {
              label: `${input.questions.length} question${input.questions.length === 1 ? '' : 's'} still open`,
              status: 'pass',
            }
          : { label: 'Every question is answered', status: 'warn' },
        out.missingAssumption.length
          ? {
              label: 'An assumption for every line',
              status: 'warn',
              detail: `Line ${out.missingAssumption.join(', ')} has none: quoting on assumptions needs one`,
            }
          : { label: 'An assumption for every line', status: 'pass' },
      ],
      confidence: input.questions.length ? 'likely' : 'unsure',
    }
  },

  toProposal(v, input): ProposalDraft {
    const n = input.questions.length
    const lines = input.questions.map((q) => q.lineNo).filter((x): x is number => !!x)
    return {
      headline: `No answer on ${n} question${n === 1 ? '' : 's'} for ${input.ref}: quote on the assumptions, leave the line${lines.length === 1 ? '' : 's'} out, or keep waiting.`,
      reasons: [
        { text: `The held lines must reach suppliers by ${input.lastDayLabel} to quote on time.` },
        { text: `${input.linesSourcing} of ${input.linesTotal} lines are already with suppliers.` },
      ],
      preview: {
        assumptions: input.questions.map((q) => ({ line: q.lineNo, text: q.assumption })),
      } as Prisma.InputJsonValue,
      checks: v.checks,
      confidence: v.confidence,
      options: [
        {
          key: 'assume',
          label: 'Quote on stated assumptions',
          consequence: 'The held lines go to suppliers; the assumptions print on the quotation',
        },
        {
          key: 'leave_out',
          label: 'Leave the lines out',
          consequence: `Quote ${input.linesTotal - lines.length} lines; the held lines are not quoted (awaiting the client)`,
        },
        {
          key: 'wait',
          label: 'Keep waiting',
          consequence: 'The quotation waits for the answer; the response clock stays paused',
        },
      ],
      onApproveText: 'Applies the option you choose to every open question; nothing is sent.',
    }
  },

  async effect(tx, v, ctx) {
    const choice = (['assume', 'leave_out', 'wait'] as const).find(
      (c) => c === ctx.chosenOption
    ) as FallbackChoice | undefined
    if (!choice) throw new Error('Choose one of the three fallbacks')
    const out = await applyFallback(tx, {
      enquiryId: ctx.request.subjectId,
      choice,
      actor: ctx.decidedById ? { kind: 'user', id: ctx.decidedById } : { kind: 'assistant' },
      actionId: ctx.actionId,
      questionIds: v.out.questionIds,
    })
    return {
      note:
        choice === 'assume'
          ? `Quoted on the stated assumptions (${out.applied})`
          : choice === 'leave_out'
            ? `Left ${out.applied} line${out.applied === 1 ? '' : 's'} out`
            : 'Keeping waiting for the client',
      undoable: false,
    }
  },
}

registerAction(definition)
export default definition
