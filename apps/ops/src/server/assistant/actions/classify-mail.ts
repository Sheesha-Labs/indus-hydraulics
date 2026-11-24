import 'server-only'
import type { Prisma } from '@indus/ops-db'
import {
  assistantNote,
  CLASS_LABEL,
  classifySchema,
  compactFlags,
  computeClassifyConfidence,
  handledState,
  type StoredMailFlags,
  type ClassifyModelClass,
  type ConfidenceValue,
  type MailClassValue,
} from '@indus/ops-core'
import { recountMailCounters } from '../../mail/counters'
import { loadMailInput, type MailInput } from '../../mail/facts'
import { resolveQuotes, saveEmailSpans } from '../../mail/spans'
import { classifyUser, PROMPT_VERSION, SYSTEM_PARTS } from '../prompts/classify-mail.v1'
import { registerAction } from '../registry'
import type {
  ActionDefinition,
  EffectContext,
  EffectResult,
  ProposalDraft,
  Verified,
} from '../types'
import { writeTracked } from '../write-tracked'

/**
 * Action #1 classify (S05-T04, catalogue key `classify_mail`, Do quietly under every preset).
 *
 *   gather   the message as the Assistant sees it, with the detectors' facts (server/mail/facts.ts)
 *   propose  bounce, phishing, out of office and newsletters are decided by the detectors with NO model call;
 *            everything else asks Haiku (classify-mail@1, effort low)
 *   verify   every quote is resolved against the email; a reason whose quote does not resolve is dropped;
 *            confidence is computed (ADR-12), never the model's own word
 *   effect   sure / likely: the class, confidence, alternatives and the Assistant note are written
 *   onProposed  unsure: nothing is written as fact. The message stays unclassified, marked unsure with the
 *            best guess and two alternatives, and the action waits in the Unsure pile (surface mail_unsure)
 */
type Reason = { text: string; quote: string | null }
type Alternative = { class: ClassifyModelClass; why: string }

export interface ClassifyOut {
  /** The stored class, or null when unsure. */
  class: MailClassValue | null
  /** What the model (or detector) said. */
  guess: ClassifyModelClass | MailClassValue
  confidence: ConfidenceValue
  why: string
  reasons: Reason[]
  alternatives: Alternative[]
  /** Decided by a detector, without a model call. */
  detector: 'bounce' | 'phishing' | 'auto_reply' | 'bulk' | null
  /** The detectors' facts the cards need (S05-T07), stored in mail_message.flags. */
  flags?: StoredMailFlags
}

type In = MailInput
type Out = ClassifyOut

const DETECTED: Record<NonNullable<ClassifyOut['detector']>, MailClassValue> = {
  bounce: 'bounce',
  phishing: 'phishing',
  auto_reply: 'auto_reply',
  bulk: 'not_business',
}

/** The detectors' verdict, strongest first: a bounce, then phishing, an auto-reply, a newsletter. */
export function detectorVerdict(input: MailInput): ClassifyOut | null {
  const f = input.facts
  const pick = (
    detector: NonNullable<ClassifyOut['detector']>,
    reasons: string[]
  ): ClassifyOut => ({
    class: DETECTED[detector],
    guess: DETECTED[detector],
    confidence: 'sure',
    why: reasons[0] ?? 'Found by the mail checks',
    reasons: reasons.slice(0, 3).map((text) => ({ text, quote: null })),
    alternatives: [],
    detector,
  })
  if (f.bounce.isBounce) {
    return pick('bounce', [
      f.bounce.hard ? 'A delivery failure (permanent)' : 'A delivery delay notice',
      ...(f.bounce.finalRecipient ? [`For ${f.bounce.finalRecipient}`] : []),
    ])
  }
  if (f.phishing.flagged)
    return pick(
      'phishing',
      f.phishing.reasons.map((r) => r.text)
    )
  if (f.autoReply.isAutoReply)
    return pick(
      'auto_reply',
      f.autoReply.signals.map((s) => `Auto-reply signal: ${s}`)
    )
  if (f.bulk.isBulk)
    return pick(
      'bulk',
      f.bulk.signals.map((s) => `Newsletter signal: ${s}`)
    )
  return null
}

function senderWhy(input: MailInput): string {
  if (input.sender.role === 'client') return 'from a known client domain'
  if (input.sender.role === 'supplier') return 'from a known supplier domain'
  if (input.sender.role === 'both') return 'from a known client and supplier'
  return 'from a new sender'
}

function today(): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', dateStyle: 'full' }).format(
    new Date()
  )
}

const definition: ActionDefinition<In, Out> = {
  key: 'classify_mail',
  group: 'mail',
  aiPurpose: 'classify',
  external: false,
  concurrencyGroup: 'mail',
  surface: 'mail_unsure',

  estimate: (input) => ({ chars: input.newText.length + 6_000, maxTokens: 1_500 }),

  async gather({ request }) {
    const input = await loadMailInput(request.subjectId)
    return {
      input,
      versions: {
        message: input.messageId,
        body: input.bodyTextHash ?? 'none',
        previous: input.previousClass ?? 'none',
      },
    }
  },

  async propose(input, ai) {
    const detected = detectorVerdict(input)
    const flags = compactFlags(input.facts)
    if (detected) {
      return {
        ok: true,
        out: { ...detected, flags },
        costUsd: '0.000000',
        model: null,
        promptVersion: null,
        callIds: [],
      }
    }
    const res = await ai.call({
      route: 'classify',
      system: SYSTEM_PARTS,
      user: classifyUser({
        today: today(),
        mailboxRole: input.mailboxRole,
        senderRole: input.sender.role,
        senderCompany: input.sender.companyName,
        previousClass: input.previousClass,
        referenceFound: input.facts.reference.match?.canonical ?? null,
        from: input.fromName ? `${input.fromName} <${input.fromAddress}>` : input.fromAddress,
        to: input.to,
        cc: input.cc,
        subject: input.subject,
        newText: input.newText,
        attachments: input.attachments,
      }),
      zod: classifySchema,
      maxTokens: 1_500,
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
    const v = res.value
    return {
      ok: true,
      out: {
        class: v.class === 'unsure' ? null : v.class,
        guess: v.class,
        confidence: v.confidence,
        why: '',
        reasons: v.reasons,
        alternatives: v.alternatives,
        detector: null,
        flags,
      },
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(out, input) {
    if (out.detector) {
      return {
        out,
        checks: [{ label: 'Mail checks', status: 'pass', detail: out.why }],
        confidence: 'sure',
      }
    }
    const text = `${input.subject}\n${input.bodyText}`
    const resolved = resolveQuotes(
      text,
      out.reasons.map((r) => r.quote ?? '')
    )
    const kept = out.reasons.filter((_, i) => resolved[i]!.resolved !== 'unresolved')
    const guess = out.guess as ClassifyModelClass
    const computed = computeClassifyConfidence({
      modelConfidence: out.confidence,
      modelClass: guess,
      resolvedReasons: kept.length,
      senderRole: input.sender.role,
    })
    const unsure = computed.confidence === 'unsure'
    const best: MailClassValue | null = guess === 'unsure' ? null : guess
    const verified: ClassifyOut = {
      ...out,
      class: unsure ? null : best,
      confidence: computed.confidence,
      why: unsure ? computed.why : senderWhy(input),
      reasons: kept.length ? kept : out.reasons.slice(0, 1),
    }
    return {
      out: verified,
      checks: [
        {
          label: 'Quoted evidence',
          status: kept.length ? 'pass' : 'warn',
          detail: `${kept.length} of ${out.reasons.length} quotes found in the email`,
        },
        {
          label: 'Sender role',
          status: computed.why.includes('role') ? 'warn' : 'pass',
          detail: senderWhy(input),
        },
      ],
      confidence: computed.confidence,
      ...(unsure ? { unsure: [{ field: 'classification', why: computed.why }] } : {}),
    }
  },

  toProposal(v): ProposalDraft {
    const o = v.out
    const best = o.class ?? (o.guess === 'unsure' ? null : (o.guess as MailClassValue))
    const options = [
      ...(best
        ? [{ key: best, label: CLASS_LABEL[best], consequence: 'Files it as the best guess' }]
        : []),
      ...o.alternatives
        .filter((a) => a.class !== 'unsure' && a.class !== best)
        .slice(0, 2)
        .map((a) => ({ key: a.class, label: CLASS_LABEL[a.class], consequence: a.why })),
    ]
    return {
      headline: o.class
        ? `Classified as ${CLASS_LABEL[o.class]}`
        : `Unsure what this is${best ? ` · best guess ${CLASS_LABEL[best]}` : ''}`,
      reasons: o.reasons.map((r) => ({ text: r.quote ? `${r.text} — “${r.quote}”` : r.text })),
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: o.class ? null : o.why,
      onApproveText: best ? `Files the message as ${CLASS_LABEL[best]}` : null,
      options: o.class ? null : options,
    }
  },

  async effect(tx, verified, ctx) {
    return write(tx, verified, ctx, false)
  },

  async onProposed(tx, verified, ctx) {
    return write(tx, verified, ctx, true)
  },

  afterRecord: () => recountMailCounters(),
}

async function write(
  tx: Prisma.TransactionClient,
  verified: Verified<Out>,
  ctx: EffectContext,
  unsure: boolean
): Promise<EffectResult> {
  const o = verified.out
  const messageId = ctx.request.subjectId
  const before = await tx.mailMessage.findUniqueOrThrow({
    where: { id: messageId },
    select: {
      classification: true,
      confidence: true,
      handledState: true,
      assistantNote: true,
      bodyText: true,
      bodyTextHash: true,
      subject: true,
      flags: true,
      _count: { select: { links: { where: { removedAt: null } } } },
    },
  })
  const cls: MailClassValue = unsure ? 'unclassified' : (o.class ?? 'unclassified')
  const confidence: ConfidenceValue = unsure ? 'unsure' : o.confidence
  const best = o.class ?? (o.guess === 'unsure' ? 'other' : (o.guess as MailClassValue))
  const note = unsure ? assistantNote(best, 'unsure', o.why) : assistantNote(cls, confidence, o.why)
  const handled = handledState({
    classification: cls,
    confidence,
    linked: before._count.links,
    openProposal: unsure,
  })
  const alternatives = (
    unsure ? [{ class: best, why: 'Best guess' }, ...o.alternatives] : o.alternatives
  ).slice(0, 3)

  await writeTracked(
    tx,
    {
      actor: { kind: 'assistant' },
      actionId: ctx.actionId,
      subjectType: 'mail_message',
      subjectId: messageId,
      changes: [
        { field: 'classification', before: before.classification, after: cls, kind: 'status' },
        { field: 'confidence', before: before.confidence, after: confidence, kind: 'status' },
        { field: 'handledState', before: before.handledState, after: handled, kind: 'status' },
      ],
      note,
    },
    async (t) => {
      if (!o.detector) {
        const quotes = o.reasons.map((r) => r.quote).filter((q): q is string => !!q)
        if (quotes.length) {
          await saveEmailSpans(
            messageId,
            before.bodyTextHash,
            `${before.subject ?? ''}\n${before.bodyText ?? ''}`,
            quotes,
            t
          )
        }
      }
      await t.mailMessage.update({
        where: { id: messageId },
        data: {
          classification: cls,
          confidence,
          alternatives: alternatives as unknown as Prisma.InputJsonValue,
          unsureReason: unsure ? o.why : null,
          classifiedByActionId: ctx.actionId,
          assistantNote: note,
          handledState: handled,
          ...(o.flags
            ? {
                flags: {
                  ...((before.flags as Record<string, unknown> | null) ?? {}),
                  ...o.flags,
                } as Prisma.InputJsonValue,
              }
            : {}),
        },
      })
    }
  )
  if (unsure) return { note }
  return {
    note,
    emit: [
      {
        name: 'ops/mail.classified',
        id: `mail-classified:${messageId}:${ctx.actionId}`,
        data: {
          messageId,
          actionId: ctx.actionId,
          class: cls,
          confidence,
          origin: ctx.request.origin,
        },
      },
    ],
  }
}

registerAction(definition)
export default definition
