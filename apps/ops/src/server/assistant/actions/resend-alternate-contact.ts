import 'server-only'
import { opsDb } from '@indus/ops-db'
import {
  checkNote,
  domainOf,
  fillNote,
  shortNoteSchema,
  type StoredMailFlags,
} from '@indus/ops-core'
import { findOurOutbound } from '../../mail/our-outbound'
import { threadVersion } from '../../mail/thread-version'
import { PROMPT_VERSION, resendUser, SYSTEM_PARTS } from '../prompts/resend-alternate-contact.v1'
import { creditHoldContext } from '../guardrail-context'
import { registerAction } from '../registry'
import type { ActionDefinition, OutboundDraft, ProposalDraft } from '../types'

/**
 * `resend_alternate_contact` (S05-T07, board 96, Draft and ask with the "first email to anyone new" guardrail
 * always on). Two sources, one proposal:
 *
 *   out of office  the auto-reply named a stand-in and answers one of our emails → "Send to <name>" /
 *                  "Wait for <original>"
 *   bounce         our email bounced → "Resend to <address>" when the company has another live address,
 *                  else "Fix contact" only
 *
 * The resend is a NEW message from the same mailbox carrying our original email's content under a short
 * opening (Sonnet, resend-alternate-contact@1; code fills the name and checks it). Nothing is sent from here:
 * a person approves in Review (S06) and the send queue sends `outbound`.
 */
export interface ResendInput {
  messageId: string
  threadId: string
  source: 'out_of_office' | 'bounce'
  mailboxId: string | null
  mailboxAddress: string | null
  original: { name: string | null; email: string }
  target: { name: string | null; email: string } | null
  outbound: {
    id: string
    subject: string
    bodyHtml: string
    bodyText: string | null
    enquiryId: string | null
    companyId: string | null
  } | null
}

export interface ResendOut {
  note: string | null
  problem: string | null
}

const first = (name: string | null, email: string) =>
  name?.trim().split(/\s+/)[0] ?? email.split('@')[0] ?? email

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Another live address at the same company (preferred first), never the bounced one. */
async function otherAddress(
  companyId: string | null,
  bounced: string
): Promise<{ name: string | null; email: string } | null> {
  const domain = domainOf(bounced)
  const c = await opsDb.contact.findFirst({
    where: {
      status: 'active',
      archivedAt: null,
      email: { not: null },
      NOT: { email: { equals: bounced, mode: 'insensitive' } },
      OR: [
        ...(companyId ? [{ companyId }] : []),
        ...(domain ? [{ email: { endsWith: `@${domain}`, mode: 'insensitive' as const } }] : []),
      ],
    },
    orderBy: [{ isPreferred: 'desc' }, { updatedAt: 'desc' }],
    select: { name: true, email: true },
  })
  return c?.email ? { name: c.name, email: c.email.toLowerCase() } : null
}

export async function loadResendInput(messageId: string): Promise<ResendInput> {
  const m = await opsDb.mailMessage.findUniqueOrThrow({
    where: { id: messageId },
    select: {
      id: true,
      classification: true,
      threadId: true,
      fromAddress: true,
      fromName: true,
      flags: true,
      headerFlags: true,
      inReplyToRfcId: true,
      referencesRfcIds: true,
    },
  })
  const flags =
    (m.flags as
      | (StoredMailFlags & { ooo?: { alternate?: { name: string; email: string } | null } })
      | null) ?? {}
  const header = (m.headerFlags as { xIndusOutbound?: string } | null) ?? {}
  const source: ResendInput['source'] = m.classification === 'bounce' ? 'bounce' : 'out_of_office'
  const recipient =
    source === 'bounce'
      ? (flags.bounce?.finalRecipient?.toLowerCase() ?? null)
      : m.fromAddress.toLowerCase()
  const out = await findOurOutbound({
    xIndusOutbound: flags.bounce?.xIndusOutbound ?? header.xIndusOutbound,
    rfcIds: [flags.bounce?.originalMessageId, m.inReplyToRfcId, ...m.referencesRfcIds.slice(-3)],
    threadId: m.threadId,
    recipient,
  })
  const mailbox = out?.mailboxId
    ? await opsDb.mailbox.findUnique({ where: { id: out.mailboxId }, select: { address: true } })
    : null
  const originalEmail = recipient ?? out?.to[0]?.toLowerCase() ?? m.fromAddress.toLowerCase()
  const contact = await opsDb.contact.findFirst({
    where: { email: { equals: originalEmail, mode: 'insensitive' } },
    select: { name: true },
  })
  const originalName =
    source === 'out_of_office' ? (m.fromName ?? contact?.name ?? null) : (contact?.name ?? null)
  const target =
    source === 'out_of_office'
      ? (flags.ooo?.alternate ?? null)
      : await otherAddress(out?.companyId ?? null, originalEmail)
  return {
    messageId: m.id,
    threadId: m.threadId,
    source,
    mailboxId: out?.mailboxId ?? null,
    mailboxAddress: mailbox?.address ?? null,
    original: { name: originalName, email: originalEmail },
    target,
    outbound: out
      ? {
          id: out.id,
          subject: out.subject,
          bodyHtml: out.bodyHtml,
          bodyText: out.bodyText,
          enquiryId: out.enquiryId,
          companyId: out.companyId,
        }
      : null,
  }
}

const definition: ActionDefinition<ResendInput, ResendOut> = {
  key: 'resend_alternate_contact',
  group: 'sourcing',
  aiPurpose: 'draft',
  external: true,
  concurrencyGroup: 'mail',
  surface: 'review',
  alwaysAsk: {
    guardrail: 'first_contact',
    reason: 'First email to a new address: a person decides',
  },
  // S07-T01: the address is new by definition; the client's credit hold applies too.
  async guardrailContext(request) {
    const [input, hold] = await Promise.all([
      loadResendInput(request.subjectId),
      creditHoldContext(request),
    ])
    return {
      ...hold,
      counterpartyIsNew: true,
      counterpartyName: input.target ? (input.target.name ?? input.target.email) : null,
    }
  },

  estimate: () => ({ chars: 2_000, maxTokens: 400 }),

  async gather({ request }) {
    const input = await loadResendInput(request.subjectId)
    return {
      input,
      versions: {
        message: input.messageId,
        outbound: input.outbound?.id ?? 'none',
        target: input.target?.email ?? 'none',
        thread: await threadVersion(input.threadId),
      },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input, ai) {
    // Nothing to send without our email and somewhere new to send it: the proposal is "Fix contact".
    if (!input.target || !input.outbound) {
      return {
        ok: true,
        out: { note: null, problem: null },
        costUsd: '0.000000',
        model: null,
        promptVersion: null,
        callIds: [],
      }
    }
    const res = await ai.call({
      route: 'draft',
      system: SYSTEM_PARTS,
      user: resendUser({ reason: input.source, subject: input.outbound.subject }),
      zod: shortNoteSchema,
      maxTokens: 400,
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

  async verify(out, input) {
    const checks = [
      {
        label: 'First email to a new address',
        status: 'warn' as const,
        detail: input.target
          ? `${input.target.email} has not had mail from us in this thread`
          : 'No other address known',
      },
      { label: 'Same mailbox', status: 'pass' as const, detail: input.mailboxAddress ?? undefined },
    ]
    if (out.note === null) return { out, checks, confidence: 'sure' }
    const c = checkNote(out.note, ['original'])
    return {
      out: { ...out, problem: c.ok ? null : (c.why ?? 'The note did not pass the checks') },
      checks: [
        ...checks,
        c.ok
          ? { label: 'No figures or links', status: 'pass' as const }
          : { label: 'No figures or links', status: 'fail' as const, detail: c.why },
      ],
      confidence: c.ok ? 'sure' : 'unsure',
      ...(c.ok ? {} : { unsure: [{ field: 'note', why: c.why ?? 'Check the note' }] }),
    }
  },

  toProposal(v, input): ProposalDraft {
    const orig = input.original
    const target = input.target
    const opening =
      v.out.note !== null ? fillNote(v.out.note, { original: orig.name ?? orig.email }) : null
    const preview =
      target && input.outbound && opening
        ? {
            mailbox: input.mailboxAddress,
            to: [target.email],
            subject: input.outbound.subject,
            text: opening,
            quotedOutboundId: input.outbound.id,
          }
        : null
    if (input.source === 'out_of_office') {
      return {
        headline: `Send our email to ${target?.name ?? target?.email ?? 'the stand-in'}, named in the auto-reply?`,
        reasons: [
          {
            text: `${orig.name ?? orig.email} is away; the auto-reply names ${target?.name ?? target?.email ?? 'a stand-in'}`,
          },
        ],
        preview,
        checks: v.checks,
        confidence: v.confidence,
        unsureAbout: v.out.problem,
        onApproveText: target ? `Sends our email to ${target.email} as a new message` : null,
        options: [
          ...(target
            ? [
                {
                  key: 'send',
                  label: `Send to ${first(target.name, target.email)}`,
                  consequence: 'A new message from the same mailbox',
                },
              ]
            : []),
          {
            key: 'wait',
            label: `Wait for ${first(orig.name, orig.email)}`,
            consequence: 'Nothing is sent',
          },
        ],
      }
    }
    return {
      headline: `Contact marked bad: ${orig.name ?? orig.email}`,
      reasons: [
        { text: `Our email to ${orig.email} could not be delivered` },
        ...(target
          ? [{ text: `${target.email} is another address we hold for that company` }]
          : []),
      ],
      preview,
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.out.problem,
      onApproveText: target ? `Resends our email to ${target.email}` : null,
      options: [
        ...(target
          ? [
              {
                key: 'send',
                label: `Resend to ${target.email.split('@')[0]}@`,
                consequence: 'A new message from the same mailbox',
              },
            ]
          : []),
        {
          key: 'fix',
          label: 'Fix contact',
          consequence: 'Opens the contact to correct the address',
        },
      ],
    }
  },

  // External: on approval (S06) the send queue sends `outbound`; the effect itself records nothing.
  async effect() {
    return { note: 'Resent to another address', undoable: false }
  },

  outbound(v, input): OutboundDraft | null {
    if (
      !input.target ||
      !input.outbound ||
      !input.mailboxId ||
      v.out.note === null ||
      v.out.problem
    )
      return null
    const opening = fillNote(v.out.note, { original: input.original.name ?? input.original.email })
    return {
      kind: 'other',
      mailboxId: input.mailboxId,
      to: [input.target.email],
      subject: input.outbound.subject,
      bodyHtml: `<p>${escapeHtml(opening)}</p><hr>${input.outbound.bodyHtml}`,
      bodyText: `${opening}\n\n${input.outbound.bodyText ?? ''}`.trim(),
      threadId: null,
      enquiryId: input.outbound.enquiryId,
      companyId: input.outbound.companyId,
      subjectType: 'mail_message',
      subjectId: input.messageId,
    }
  },
}

registerAction(definition)
export default definition
