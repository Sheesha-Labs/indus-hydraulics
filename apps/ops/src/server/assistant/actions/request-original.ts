import 'server-only'
import { fillTemplate, replyReferences, salutation } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { replySubject } from '../../mail/reply'
import { threadVersion } from '../../mail/thread-version'
import { creditHoldContext } from '../guardrail-context'
import { registerAction } from '../registry'
import type { ActionDefinition, OutboundDraft, ProposalDraft } from '../types'

/**
 * `request_original` (S08-T04, board 17 "Ask client for original", Draft and ask): a file in an intake that came by
 * email could not be read (a coarse scan, an unreadable page). A short reply, in the same thread and from the
 * mailbox that holds it, asks for the original or a clearer copy. The wording is the signed-off `request_original`
 * template: no model call. A person approves it in Review; the send queue does the rest.
 */
export interface RequestOriginalInput {
  intakeFileId: string
  fileName: string
  reason: string
  messageId: string
  mailboxId: string
  mailboxAddress: string
  threadId: string
  rfcMessageId: string | null
  referencesRfcIds: string[]
  to: string
  subject: string
  salutation: string
  template: { subject: string; body: string } | null
}

export interface RequestOriginalOut {
  subject: string
  body: string
  missing: string[]
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const REASON: Record<string, string> = {
  unreadable: 'the scan is too low in resolution to read part numbers reliably',
  password_protected: 'it is password-protected',
  unsupported: 'we cannot open this file type',
}

const definition: ActionDefinition<RequestOriginalInput, RequestOriginalOut> = {
  key: 'request_original',
  group: 'enquiries',
  aiPurpose: 'draft',
  external: true,
  guardrailContext: (request) => creditHoldContext(request),
  concurrencyGroup: 'mail',
  surface: 'review',

  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const f = await opsDb.intakeFile.findUniqueOrThrow({
      where: { id: request.subjectId },
      select: {
        id: true,
        filename: true,
        failureKind: true,
        batch: {
          select: {
            contactId: true,
            mailMessage: {
              select: {
                id: true,
                mailboxId: true,
                threadId: true,
                rfcMessageId: true,
                referencesRfcIds: true,
                fromAddress: true,
                fromName: true,
                subject: true,
                mailbox: { select: { address: true } },
              },
            },
          },
        },
      },
    })
    const m = f.batch.mailMessage
    if (!m) throw new Error('request_original needs an intake that came by email')
    const [contact, tpl] = await Promise.all([
      opsDb.contact.findFirst({
        where: f.batch.contactId
          ? { id: f.batch.contactId }
          : { email: { equals: m.fromAddress, mode: 'insensitive' } },
        select: { salutation: true, firstName: true, name: true },
      }),
      opsDb.emailTemplate.findUnique({
        where: { key: 'request_original' },
        select: { subjectTemplate: true, bodyTemplate: true, version: true },
      }),
    ])
    const input: RequestOriginalInput = {
      intakeFileId: f.id,
      fileName: f.filename,
      reason: REASON[f.failureKind ?? 'unreadable'] ?? REASON.unreadable!,
      messageId: m.id,
      mailboxId: m.mailboxId,
      mailboxAddress: m.mailbox.address,
      threadId: m.threadId,
      rfcMessageId: m.rfcMessageId,
      referencesRfcIds: m.referencesRfcIds,
      to: m.fromAddress.toLowerCase(),
      subject: m.subject ?? '',
      salutation: salutation(contact ?? { name: m.fromName }),
      template: tpl ? { subject: tpl.subjectTemplate, body: tpl.bodyTemplate } : null,
    }
    return {
      input,
      versions: {
        file: f.id,
        failure: f.failureKind ?? '',
        thread: await threadVersion(m.threadId),
        template: tpl?.version ?? -1,
      },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input) {
    const values = {
      salutation: input.salutation,
      original_subject: input.subject.replace(/^\s*(re|fwd?|fw)\s*:\s*/i, ''),
      file_name: input.fileName,
      reason: input.reason,
    }
    const subject = input.template
      ? fillTemplate(input.template.subject, values)
      : { text: replySubject(input.subject), missing: [] }
    const body = input.template
      ? fillTemplate(input.template.body, values)
      : { text: '', missing: ['template'] }
    return {
      ok: true,
      out: {
        subject: subject.text,
        body: body.text,
        missing: [...subject.missing, ...body.missing],
      },
      costUsd: '0.000000',
      model: null,
      promptVersion: null,
      callIds: [],
    }
  },

  async verify(out) {
    const ok = out.missing.length === 0
    return {
      out,
      checks: [
        { label: 'Same thread and mailbox', status: 'pass' },
        ok
          ? { label: 'Wording from the signed-off template', status: 'pass' }
          : {
              label: 'Wording from the signed-off template',
              status: 'fail',
              detail: `Missing: ${out.missing.join(', ')}`,
            },
      ],
      confidence: ok ? 'sure' : 'unsure',
      ...(ok
        ? {}
        : {
            unsure: [
              { field: 'template', why: `The template is missing ${out.missing.join(', ')}` },
            ],
          }),
    }
  },

  toProposal(v, input): ProposalDraft {
    return {
      headline: `Ask ${input.to} for a clearer copy of ${input.fileName}`,
      reasons: [{ text: `${input.fileName} could not be read: ${input.reason}` }],
      preview: {
        mailbox: input.mailboxAddress,
        to: [input.to],
        subject: v.out.subject,
        text: v.out.body,
      },
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.out.missing.length ? `Template missing ${v.out.missing.join(', ')}` : null,
      onApproveText: `Sends the reply from ${input.mailboxAddress} in this thread`,
    }
  },

  async effect() {
    return { note: 'Asked the client for a clearer copy', undoable: false }
  },

  outbound(v, input): OutboundDraft | null {
    if (v.out.missing.length) return null
    return {
      kind: 'other',
      mailboxId: input.mailboxId,
      to: [input.to],
      subject: v.out.subject,
      bodyHtml: v.out.body
        .split(/\n{2,}/)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join(''),
      bodyText: v.out.body,
      threadId: input.threadId,
      ...(input.rfcMessageId
        ? {
            inReplyToRfcId: input.rfcMessageId,
            referencesRfcIds: replyReferences(input.referencesRfcIds, input.rfcMessageId),
          }
        : {}),
      subjectType: 'mail_message',
      subjectId: input.messageId,
    }
  },
}

registerAction(definition)
export default definition
