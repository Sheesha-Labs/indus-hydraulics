import 'server-only'
import { extractableSegments, segmentEmail } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { applyAnswers } from '../../enquiry/questions'
import { resolveQuotes, saveEmailSpans } from '../../mail/spans'
import {
  matchAnswersSchema,
  matchAnswersUser,
  PROMPT_VERSION,
  SYSTEM_PARTS,
  type MatchAnswersOut,
} from '../prompts/match-client-answers.v1'
import { registerAction } from '../registry'
import type { ActionDefinition, ProposalDraft } from '../types'

/**
 * `match_client_answers` (S09-T07, board 171): a client's reply read against the open questions on an enquiry.
 * Requested when a client reply arrives in a thread whose enquiry has questions waiting (mail router). Internal
 * (it changes lines, sends nothing), Draft and ask: answers are proposals, never automatic edits.
 *
 *   propose  Sonnet (match_client_answers@1): per question answered / the verbatim answer / what it implies
 *   verify   each quote is resolved into the reply; an unresolved quote is Unsure and not applied; an implied
 *            quantity must be digits that appear in the quote (code reads numbers, the model never computes one)
 *   approve  the answered questions → answered, their lines held → open, the implied changes written with the
 *            answer as evidence; the rest keep their clock; the response clock resumes when none are left
 */
export interface MatchInput {
  messageId: string
  enquiryId: string
  ref: string
  textHash: string | null
  /** The whole stored body: spans are offsets into it (Why? highlights them). */
  body: string
  reply: string
  questions: Array<{ id: string; lineNo: number | null; line: string | null; question: string }>
}

export interface MatchOut {
  answers: Array<MatchAnswersOut['answers'][number] & { resolved: boolean; spanId: string | null }>
}

export async function gatherMatch(
  messageId: string,
  enquiryId: string,
  /** The effect's transaction: never a second connection while one is held. */
  db: Pick<Prisma.TransactionClient, 'mailMessage' | 'enquiry'> = opsDb
): Promise<MatchInput> {
  const [m, e] = await Promise.all([
    db.mailMessage.findUniqueOrThrow({
      where: { id: messageId },
      select: { id: true, bodyText: true, bodyTextHash: true, isForward: true },
    }),
    db.enquiry.findUniqueOrThrow({
      where: { id: enquiryId },
      select: {
        id: true,
        ref: true,
        clientQuestions: {
          where: { status: 'sent' },
          orderBy: { createdAt: 'asc' },
          select: { id: true, question: true, line: { select: { no: true, description: true } } },
        },
      },
    }),
  ])
  const text = m.bodyText ?? ''
  // The client's fresh words only: the quoted questions below their reply must not count as answers.
  const fresh = extractableSegments(segmentEmail(text, { isForward: m.isForward }))
    .map((s) => text.slice(s.start, s.end))
    .join('\n')
  return {
    messageId: m.id,
    enquiryId: e.id,
    ref: e.ref,
    textHash: m.bodyTextHash,
    body: text,
    reply: fresh || text,
    questions: e.clientQuestions.map((q) => ({
      id: q.id,
      lineNo: q.line?.no ?? null,
      line: q.line?.description ?? null,
      question: q.question,
    })),
  }
}

const QTY = /^\d{1,7}(?:\.\d{1,4})?$/

const definition: ActionDefinition<MatchInput, MatchOut> = {
  key: 'match_client_answers',
  group: 'enquiries',
  aiPurpose: 'read_mail',
  external: false,
  concurrencyGroup: 'enquiry',
  surface: 'review',

  estimate: (input) => ({
    chars: input.reply.length + input.questions.length * 250,
    maxTokens: 300 + input.questions.length * 150,
  }),

  async gather({ request }) {
    const input = await gatherMatch(request.subjectId, request.enquiryId ?? '')
    return {
      input,
      versions: { message: input.messageId, open: input.questions.map((q) => q.id).join('.') },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input, ai) {
    if (!input.questions.length)
      return {
        ok: true,
        out: { answers: [] },
        costUsd: '0.000000',
        model: null,
        promptVersion: null,
        callIds: [],
      }
    const res = await ai.call({
      route: 'draft',
      purpose: 'read_mail',
      system: SYSTEM_PARTS,
      user: matchAnswersUser({ reply: input.reply, questions: input.questions }),
      zod: matchAnswersSchema,
      maxTokens: 300 + input.questions.length * 150,
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
    return {
      ok: true,
      out: { answers: res.value.answers.map((a) => ({ ...a, resolved: false, spanId: null })) },
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(out, input) {
    const known = new Set(input.questions.map((q) => q.id))
    const answers = out.answers
      .filter((a) => known.has(a.id))
      .map((a) => {
        if (!a.answered || !a.answerQuote.trim()) return { ...a, answered: false, resolved: false }
        const r = resolveQuotes(input.reply, [a.answerQuote])[0]!
        const resolved = r.resolved !== 'unresolved'
        // A quantity is kept only as digits that the client actually wrote in the quoted answer.
        const qty =
          a.implies?.qty && QTY.test(a.implies.qty) && a.answerQuote.includes(a.implies.qty)
            ? a.implies.qty
            : undefined
        return {
          ...a,
          resolved,
          ...(a.implies
            ? { implies: { ...a.implies, ...(qty ? { qty } : { qty: undefined }) } }
            : {}),
        }
      })
    const answered = answers.filter((a) => a.answered && a.resolved)
    const unresolved = answers.filter((a) => a.answered && !a.resolved)
    return {
      out: { answers },
      checks: [
        unresolved.length
          ? {
              label: 'Every answer found in the reply',
              status: 'warn',
              detail: `${unresolved.length} could not be found word for word`,
            }
          : { label: 'Every answer found in the reply', status: 'pass' },
        { label: 'Numbers read from the client’s words', status: 'pass' },
      ],
      confidence: !answered.length ? 'unsure' : unresolved.length ? 'unsure' : 'likely',
      ...(unresolved.length || !answered.length
        ? {
            unsure: [
              {
                field: 'answers',
                why: answered.length
                  ? 'An answer could not be found in the reply'
                  : 'The reply answers none of the questions',
              },
            ],
          }
        : {}),
    }
  },

  toProposal(v, input): ProposalDraft {
    const answered = v.out.answers.filter((a) => a.answered && a.resolved)
    const q = new Map(input.questions.map((x) => [x.id, x]))
    return {
      headline: `Answers to ${answered.length} of ${input.questions.length} question${input.questions.length === 1 ? '' : 's'} on ${input.ref}.`,
      reasons: answered.slice(0, 6).map((a) => {
        const it = q.get(a.id)
        const changes = [
          a.implies?.qty
            ? `quantity ${a.implies.qty}${a.implies.uom ? ` ${a.implies.uom}` : ''}`
            : null,
          a.implies?.spec ?? null,
          a.implies?.partNo ? `part ${a.implies.partNo}` : null,
        ].filter(Boolean)
        return {
          text: `${it?.lineNo ? `Line ${it.lineNo}` : 'Question'}: “${a.answerQuote.slice(0, 140)}”${changes.length ? ` → ${changes.join('; ')}` : ''}`,
          ...(a.spanId ? { spanIds: [a.spanId] } : {}),
        }
      }),
      preview: {
        answers: v.out.answers.map((a) => ({
          line: q.get(a.id)?.lineNo ?? null,
          question: q.get(a.id)?.question ?? '',
          answered: a.answered && a.resolved,
          quote: a.answerQuote,
          implies: a.implies ?? null,
        })),
      } as Prisma.InputJsonValue,
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.unsure?.[0]?.why ?? null,
      onApproveText: `Marks ${answered.length} answered and opens ${answered.length === 1 ? 'its line' : 'their lines'} for sourcing, applying what the answers change; the rest keep their clock.`,
    }
  },

  async effect(tx, v, ctx) {
    const input = await gatherMatch(ctx.request.subjectId, ctx.request.enquiryId ?? '', tx)
    const answered = v.out.answers.filter((a) => a.answered && a.resolved)
    // The answers become spans on the email, the evidence each change cites.
    const spans = await saveEmailSpans(
      input.messageId,
      input.textHash,
      input.body,
      answered.map((a) => a.answerQuote),
      tx
    )
    const out = await applyAnswers(tx, {
      enquiryId: input.enquiryId,
      actor: ctx.decidedById ? { kind: 'user', id: ctx.decidedById } : { kind: 'assistant' },
      actionId: ctx.actionId,
      answers: answered.map((a) => ({
        questionId: a.id,
        answerText: a.answerQuote,
        messageId: input.messageId,
        implies: a.implies,
      })),
    })
    return {
      note: `${out.answered} answered from the client’s reply (${spans.length} quoted)${out.open ? `; ${out.open} still open` : '; none left open'}`,
      undoable: false,
    }
  },
}

registerAction(definition)
export default definition
