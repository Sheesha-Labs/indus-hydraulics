import 'server-only'
import { opsDb } from '@indus/ops-db'
import { checkNote, replyReferences, shortNoteSchema } from '@indus/ops-core'
import { replySubject } from '../../mail/reply'
import { threadVersion } from '../../mail/thread-version'
import { correctionUser, PROMPT_VERSION, SYSTEM_PARTS } from '../prompts/correction-email.v1'
import { creditHoldContext } from '../guardrail-context'
import { registerAction } from '../registry'
import type { ActionDefinition, OutboundDraft, ProposalDraft } from '../types'

/**
 * `correction_email` (S06-T07, board 114 parts 2–3, max Draft and ask): something already left, so instead of
 * an undo a person starts a correction. Sonnet drafts a short note for the same thread from the same mailbox;
 * the card lands in Review with `correctionOfId` set, and a person approves it (editing in the corrected
 * figure). When it is sent, the original action becomes `corrected`.
 */
export interface CorrectionInput {
  originalId: string
  originalRef: string
  mailboxId: string
  mailboxAddress: string
  threadId: string
  inReplyTo: string | null
  references: string[]
  to: string[]
  cc: string[]
  subject: string
  excerpt: string
  reason: string
  note: string | null
  leftAt: string | null
}

export interface CorrectionOut {
  note: string
  problem: string | null
}

const CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** The hint a start-correction request carries: "<reason label>\n<note>". */
export function correctionHint(reason: string, note: string | null): string {
  return note ? `${reason}\n${note}` : reason
}

const definition: ActionDefinition<CorrectionInput, CorrectionOut> = {
  key: 'correction_email',
  group: 'system',
  aiPurpose: 'draft',
  external: true,
  // S07-T01: a send to a client on credit hold asks.
  guardrailContext: (request) => creditHoldContext(request),
  concurrencyGroup: 'mail',
  surface: 'review',

  estimate: () => ({ chars: 3_000, maxTokens: 500 }),

  async gather({ request }) {
    if (!request.correctionOfId) throw new Error('correction_email needs correctionOfId')
    const original = await opsDb.assistantAction.findUniqueOrThrow({
      where: { id: request.correctionOfId },
      select: { id: true, ref: true },
    })
    const o = await opsDb.outboundEmail.findFirstOrThrow({
      where: { actionId: original.id, status: { in: ['sent', 'sending', 'unknown'] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        mailboxId: true,
        threadId: true,
        toAddresses: true,
        ccAddresses: true,
        subject: true,
        bodyText: true,
        rfcMessageId: true,
        referencesRfcIds: true,
        sentAt: true,
        mailbox: { select: { address: true } },
      },
    })
    if (!o.threadId || !o.mailboxId || !o.mailbox)
      throw new Error('The email that left has no Gmail thread to correct in')
    const [reason, ...rest] = (request.hint ?? 'Other').split('\n')
    const input: CorrectionInput = {
      originalId: original.id,
      originalRef: original.ref,
      mailboxId: o.mailboxId,
      mailboxAddress: o.mailbox.address,
      threadId: o.threadId,
      inReplyTo: o.rfcMessageId,
      references: o.referencesRfcIds,
      to: o.toAddresses,
      cc: o.ccAddresses,
      subject: o.subject,
      excerpt: (o.bodyText ?? '').slice(0, 1_500),
      reason: reason || 'Other',
      note: rest.join('\n').trim() || null,
      leftAt: o.sentAt ? CLOCK.format(o.sentAt) : null,
    }
    return { input, versions: { outbound: o.id, thread: await threadVersion(o.threadId) } }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input, ai) {
    const res = await ai.call({
      route: 'draft',
      system: SYSTEM_PARTS,
      user: correctionUser(input),
      zod: shortNoteSchema,
      maxTokens: 500,
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
      out: { note: res.value.note.trim(), problem: null },
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(out) {
    const c = checkNote(out.note, [])
    return {
      out: { ...out, problem: c.ok ? null : (c.why ?? 'The note did not pass the checks') },
      checks: [
        { label: 'Same thread and mailbox', status: 'pass' },
        c.ok
          ? { label: 'No figures or links from the model', status: 'pass' }
          : { label: 'No figures or links from the model', status: 'fail', detail: c.why },
        { label: 'Add the corrected figure before you approve', status: 'warn' },
      ],
      confidence: c.ok ? 'likely' : 'unsure',
      ...(c.ok ? {} : { unsure: [{ field: 'note', why: c.why ?? 'Check the note' }] }),
    }
  },

  toProposal(v, input): ProposalDraft {
    return {
      headline: `Correction to ${input.originalRef}: ${input.reason}`,
      reasons: [
        {
          text: `${input.originalRef} left${input.leftAt ? ` at ${input.leftAt}` : ''}; it can’t be recalled`,
        },
        ...(input.note ? [{ text: input.note }] : []),
      ],
      preview: {
        mailbox: input.mailboxAddress,
        to: input.to,
        cc: input.cc,
        subject: replySubject(input.subject),
        text: v.out.note,
      },
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.out.problem,
      onApproveText: `Sends the correction from ${input.mailboxAddress} in the same thread`,
      options: null,
    }
  },

  async effect() {
    return { note: 'Sent a correction', undoable: false }
  },

  outbound(v, input): OutboundDraft | null {
    if (v.out.problem) return null
    return {
      kind: 'other',
      mailboxId: input.mailboxId,
      to: input.to,
      ...(input.cc.length ? { cc: input.cc } : {}),
      subject: replySubject(input.subject),
      bodyHtml: `<p>${escapeHtml(v.out.note)}</p>`,
      bodyText: v.out.note,
      threadId: input.threadId,
      ...(input.inReplyTo
        ? {
            inReplyToRfcId: input.inReplyTo,
            referencesRfcIds: replyReferences(input.references, input.inReplyTo),
          }
        : {}),
      subjectType: 'mail_thread',
      subjectId: input.threadId,
    }
  },
}

registerAction(definition)
export default definition
