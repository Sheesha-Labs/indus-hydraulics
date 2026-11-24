import 'server-only'
import type { Prisma } from '@indus/ops-db'
import {
  decideLink,
  handledState,
  linkTieBreakSchema,
  type ConfidenceValue,
  type LinkCandidate,
  type MailClassValue,
} from '@indus/ops-core'
import { recountMailCounters } from '../../mail/counters'
import { loadMailInput, type MailInput } from '../../mail/facts'
import { linkCandidates } from '../../mail/link'
import { resolveQuotes } from '../../mail/spans'
import { linkUser, PROMPT_VERSION, SYSTEM_PARTS } from '../prompts/link-mail.v1'
import { registerAction } from '../registry'
import type {
  ActionDefinition,
  EffectContext,
  EffectResult,
  ProposalDraft,
  ProposeOutcome,
  Verified,
} from '../types'
import { writeTracked } from '../write-tracked'

/**
 * Action #2 link (S05-T04, catalogue key `link_mail`, Do quietly).
 *
 *   gather   the message and the chain's candidates (server/mail/link.ts)
 *   propose  decideLink; the model is asked ONLY to break a tie between 2–3 open records of one company
 *   verify   a tie-break choice must be one of the candidates and quote the email; otherwise Unsure
 *   effect   a mail_link row (assistant, confidence, action), the thread's enquiry, the handled state
 *   onProposed  Unsure: the message waits in the Unsure pile with the two best candidates as options
 */
type In = MailInput & { candidates: LinkCandidate[] }

export interface LinkOut {
  kind: 'link' | 'company_only' | 'none' | 'unsure'
  candidate: LinkCandidate | null
  companyId: string | null
  confidence: ConfidenceValue
  options: LinkCandidate[]
  reasons: Array<{ text: string; quote: string | null }>
  tieBreak: boolean
}

function today(): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', dateStyle: 'full' }).format(
    new Date()
  )
}

const definition: ActionDefinition<In, LinkOut> = {
  key: 'link_mail',
  group: 'mail',
  aiPurpose: 'classify',
  external: false,
  concurrencyGroup: 'mail',
  surface: 'mail_unsure',

  estimate: (input) => ({ chars: input.newText.length + 2_000, maxTokens: 800 }),

  async gather({ request }) {
    const mail = await loadMailInput(request.subjectId)
    const candidates = await linkCandidates(mail)
    return {
      input: { ...mail, candidates },
      versions: {
        message: mail.messageId,
        candidates:
          candidates
            .map((c) => c.key)
            .sort()
            .join(',') || 'none',
      },
    }
  },

  async propose(input, ai) {
    const d = decideLink({ candidates: input.candidates, knownCompanyId: input.sender.companyId })
    const done = (out: LinkOut): ProposeOutcome<LinkOut> => ({
      ok: true,
      out,
      costUsd: '0.000000',
      model: null,
      promptVersion: null,
      callIds: [],
    })
    if (d.kind === 'link') {
      return done({
        kind: 'link',
        candidate: d.candidate,
        companyId: null,
        confidence: d.confidence,
        options: [],
        reasons: [{ text: d.candidate.reason, quote: null }],
        tieBreak: false,
      })
    }
    if (d.kind === 'company_only') {
      return done({
        kind: 'company_only',
        candidate: null,
        companyId: d.companyId,
        confidence: 'likely',
        options: [],
        reasons: [
          { text: 'The sender’s company is known but no open record matches', quote: null },
        ],
        tieBreak: false,
      })
    }
    if (d.kind === 'none') {
      return done({
        kind: 'none',
        candidate: null,
        companyId: null,
        confidence: 'sure',
        options: [],
        reasons: [{ text: 'No record or company matches this sender', quote: null }],
        tieBreak: false,
      })
    }
    if (d.kind === 'unsure') {
      return done({
        kind: 'unsure',
        candidate: null,
        companyId: null,
        confidence: 'unsure',
        options: d.options,
        reasons: [{ text: 'More than one record fits; a person decides', quote: null }],
        tieBreak: false,
      })
    }
    const res = await ai.call({
      route: 'link',
      system: SYSTEM_PARTS,
      user: linkUser({
        today: today(),
        subject: input.subject,
        newText: input.newText,
        candidates: d.candidates.map((c) => ({ id: c.key, label: c.label })),
      }),
      zod: linkTieBreakSchema,
      maxTokens: 800,
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
    const chosen = d.candidates.find((c) => c.key === res.value.choice) ?? null
    return {
      ok: true,
      out: {
        kind: chosen ? 'link' : 'unsure',
        candidate: chosen,
        companyId: null,
        confidence: chosen ? 'likely' : 'unsure',
        options: chosen ? [] : d.candidates.slice(0, 2),
        reasons: res.value.reasons,
        tieBreak: true,
      },
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(out, input) {
    if (!out.tieBreak || out.kind !== 'link') {
      return {
        out,
        checks: [
          {
            label: 'Link chain',
            status: out.kind === 'unsure' ? 'warn' : 'pass',
            detail: out.reasons[0]?.text ?? '',
          },
        ],
        confidence: out.confidence,
        ...(out.kind === 'unsure'
          ? { unsure: [{ field: 'link', why: 'More than one record fits' }] }
          : {}),
      }
    }
    // A tie-break pick stands only with a quote found in the email; at best it is likely.
    const text = `${input.subject}\n${input.bodyText}`
    const resolved = resolveQuotes(
      text,
      out.reasons.map((r) => r.quote ?? '')
    )
    const ok = resolved.some((r) => r.resolved !== 'unresolved')
    if (ok) {
      return { out, checks: [{ label: 'Quoted evidence', status: 'pass' }], confidence: 'likely' }
    }
    const fallback: LinkOut = {
      ...out,
      kind: 'unsure',
      candidate: null,
      confidence: 'unsure',
      options: input.candidates.slice(0, 2),
    }
    return {
      out: fallback,
      checks: [
        {
          label: 'Quoted evidence',
          status: 'fail',
          detail: 'The pick quoted nothing found in the email',
        },
      ],
      confidence: 'unsure',
      unsure: [{ field: 'link', why: 'The choice could not be checked against the email' }],
    }
  },

  toProposal(v): ProposalDraft {
    const o = v.out
    return {
      headline:
        o.kind === 'link' && o.candidate
          ? `Linked to ${o.candidate.label}`
          : o.kind === 'company_only'
            ? 'Linked to the sender’s company'
            : o.kind === 'none'
              ? 'Not linked: no matching record'
              : 'Unsure which record this belongs to',
      reasons: o.reasons.map((r) => ({ text: r.quote ? `${r.text} — “${r.quote}”` : r.text })),
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: o.kind === 'unsure' ? 'Which record this message belongs to' : null,
      onApproveText: o.options[0] ? `Links the message to ${o.options[0].label}` : null,
      options:
        o.kind === 'unsure'
          ? o.options.map((c) => ({ key: c.key, label: c.label, consequence: c.reason }))
          : null,
    }
  },

  effect: (tx, verified, ctx) => write(tx, verified, ctx, false),
  onProposed: (tx, verified, ctx) => write(tx, verified, ctx, true),
  afterRecord: () => recountMailCounters(),
}

async function write(
  tx: Prisma.TransactionClient,
  verified: Verified<LinkOut>,
  ctx: EffectContext,
  unsure: boolean
): Promise<EffectResult> {
  const o = verified.out
  const messageId = ctx.request.subjectId
  const msg = await tx.mailMessage.findUniqueOrThrow({
    where: { id: messageId },
    select: {
      classification: true,
      confidence: true,
      handledState: true,
      threadId: true,
      thread: { select: { enquiryId: true } },
      _count: { select: { links: { where: { removedAt: null } } } },
    },
  })
  const target =
    !unsure && o.kind === 'link' && o.candidate
      ? {
          subjectType: o.candidate.subjectType,
          subjectId: o.candidate.subjectId,
          enquiryId: o.candidate.enquiryId,
        }
      : !unsure && o.kind === 'company_only' && o.companyId
        ? { subjectType: 'company', subjectId: o.companyId, enquiryId: null }
        : null
  const linked = msg._count.links + (target && target.subjectType !== 'company' ? 1 : 0)
  const handled = unsure
    ? 'unsure'
    : handledState({
        classification: msg.classification as MailClassValue,
        confidence: msg.confidence,
        linked,
        openProposal: false,
      })

  await writeTracked(
    tx,
    {
      actor: { kind: 'assistant' },
      actionId: ctx.actionId,
      enquiryId: target?.enquiryId ?? null,
      subjectType: 'mail_message',
      subjectId: messageId,
      changes: [
        ...(target
          ? [
              {
                field: 'link',
                before: null,
                after: `${target.subjectType}:${target.subjectId}`,
                kind: 'link' as const,
              },
            ]
          : []),
        { field: 'handledState', before: msg.handledState, after: handled, kind: 'status' },
      ],
    },
    async (t) => {
      if (target) {
        await t.mailLink.upsert({
          where: {
            messageId_subjectType_subjectId: {
              messageId,
              subjectType: target.subjectType as Prisma.MailLinkCreateInput['subjectType'],
              subjectId: target.subjectId,
            },
          },
          create: {
            messageId,
            subjectType: target.subjectType as Prisma.MailLinkCreateInput['subjectType'],
            subjectId: target.subjectId,
            enquiryId: target.enquiryId,
            linkedBy: 'assistant',
            confidence: o.confidence,
            actionId: ctx.actionId,
          },
          update: { removedAt: null, confidence: o.confidence, actionId: ctx.actionId },
        })
        if (target.enquiryId && !msg.thread.enquiryId) {
          await t.mailThread.update({
            where: { id: msg.threadId },
            data: { enquiryId: target.enquiryId },
          })
        }
      }
      await t.mailMessage.update({ where: { id: messageId }, data: { handledState: handled } })
    }
  )
  if (unsure || !target) return {}
  return {
    emit: [
      {
        name: 'ops/mail.linked',
        id: `mail-linked:${messageId}:${ctx.actionId}`,
        data: {
          messageId,
          actionId: ctx.actionId,
          subjectType: target.subjectType,
          subjectId: target.subjectId,
          enquiryId: target.enquiryId,
        },
      },
    ],
  }
}

registerAction(definition)
export default definition
