import 'server-only'
import { documentLabel, fillTemplate, salutation } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { sendableContactOf } from '../../directory/contact'
import { uploadLinkFor } from '../../directory/document-request'
import { registerAction } from '../registry'
import { writeTracked } from '../write-tracked'
import type { ActionDefinition, OutboundDraft, ProposalDraft } from '../types'

/**
 * `request_supplier_documents` (S10-T04, board 50, Draft and ask): the email that carries the /u upload link to a
 * new supplier, from purchase@ in a new thread, to its sendable Sales contact. The wording is the signed-off
 * `supplier_document_request` template; no model call. The card shows "⟨secure upload link⟩"; the real link is
 * derived from the request id only when the approved email is queued (finalizeEmail), so it is never stored on the
 * card. `request.sourceVersion` is the request id.
 */
export const LINK_MARK = '⟨secure upload link⟩'

export interface DocRequestInput {
  requestId: string
  supplierId: string
  supplierName: string
  kinds: string[]
  expires: string
  status: string
  mailboxId: string | null
  mailboxAddress: string | null
  contact: { id: string; email: string; salutation: string } | null
  template: { subject: string; body: string; version: number } | null
}
export interface DocRequestOut {
  subject: string
  body: string
  missing: string[]
}

const DATE = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const definition: ActionDefinition<DocRequestInput, DocRequestOut> = {
  key: 'request_supplier_documents',
  group: 'sourcing',
  aiPurpose: 'draft',
  external: true,
  concurrencyGroup: 'directory',
  surface: 'review',
  alwaysAsk: { guardrail: 'first_contact', reason: 'The first email to a new supplier' },

  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const requestId = String(request.sourceVersion)
    const [r, mailbox, tpl] = await Promise.all([
      opsDb.supplierDocumentRequest.findUniqueOrThrow({
        where: { id: requestId },
        select: {
          id: true,
          supplierId: true,
          contactId: true,
          requestedKinds: true,
          expiresAt: true,
          status: true,
        },
      }),
      opsDb.mailbox.findFirst({
        where: { role: 'supplier', status: 'live' },
        orderBy: { createdAt: 'asc' },
        select: { id: true, address: true },
      }),
      opsDb.emailTemplate.findUnique({
        where: { key: 'supplier_document_request' },
        select: { subjectTemplate: true, bodyTemplate: true, version: true },
      }),
    ])
    const company = await opsDb.company.findUniqueOrThrow({
      where: { id: r.supplierId },
      select: { name: true },
    })
    const chosen = r.contactId
      ? await opsDb.contact.findUnique({
          where: { id: r.contactId },
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            salutation: true,
            sourceKind: true,
            status: true,
            archivedAt: true,
            bouncedAt: true,
            role: true,
            isPreferred: true,
          },
        })
      : null
    const contact = chosen ?? (await sendableContactOf(opsDb, r.supplierId, ['Sales', 'Quality']))
    return {
      input: {
        requestId,
        supplierId: r.supplierId,
        supplierName: company.name,
        kinds: r.requestedKinds,
        expires: DATE.format(r.expiresAt),
        status: r.status,
        mailboxId: mailbox?.id ?? null,
        mailboxAddress: mailbox?.address ?? null,
        contact: contact?.email
          ? { id: contact.id, email: contact.email.toLowerCase(), salutation: salutation(contact) }
          : null,
        template: tpl
          ? { subject: tpl.subjectTemplate, body: tpl.bodyTemplate, version: tpl.version }
          : null,
      },
      versions: {
        request: `${r.id}:${r.status}`,
        template: tpl?.version ?? -1,
        contact: contact?.id ?? '',
      },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input) {
    const values = {
      salutation: input.contact?.salutation ?? 'Dear Sir or Madam,',
      supplier_name: input.supplierName,
      document_list: input.kinds.map((k) => `- ${documentLabel(k)}`).join('\n'),
      upload_link: LINK_MARK,
      expiry_date: input.expires,
    }
    const subject = input.template
      ? fillTemplate(input.template.subject, values)
      : { text: '', missing: ['template'] }
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

  async verify(out, input) {
    const problems = [
      ...out.missing.map((m) => `The template is missing ${m}`),
      ...(input.contact ? [] : ['No verified contact to send to: add the Sales contact first']),
      ...(input.mailboxId ? [] : ['purchase@ is not connected']),
      ...(input.status === 'open' ? [] : ['The request is no longer open']),
    ]
    return {
      out,
      checks: [
        { label: 'From purchase@ in a new thread', status: input.mailboxId ? 'pass' : 'fail' },
        { label: 'To a verified contact', status: input.contact ? 'pass' : 'fail' },
        {
          label: 'Wording from the signed-off template',
          status: out.missing.length ? 'fail' : 'pass',
          ...(out.missing.length ? { detail: `Missing: ${out.missing.join(', ')}` } : {}),
        },
        { label: 'The link is added when the email is sent', status: 'pass' },
      ],
      confidence: problems.length ? 'unsure' : 'sure',
      ...(problems.length ? { unsure: problems.map((why) => ({ field: 'request', why })) } : {}),
    }
  },

  toProposal(v, input): ProposalDraft {
    return {
      headline: `Ask ${input.supplierName} for ${input.kinds.length} document${input.kinds.length === 1 ? '' : 's'}`,
      reasons: [{ text: `Supplier set-up: ${input.kinds.map(documentLabel).join(', ')}` }],
      preview: {
        mailbox: input.mailboxAddress ?? 'purchase@',
        to: input.contact ? [input.contact.email] : [],
        subject: v.out.subject,
        text: v.out.body,
      },
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.confidence === 'unsure' ? 'Something is missing before this can go' : null,
      onApproveText: `Sends from ${input.mailboxAddress ?? 'purchase@'} with a link that expires on ${input.expires}`,
    }
  },

  async effect() {
    return { note: 'Document request sent', undoable: false }
  },

  outbound(v, input): OutboundDraft | null {
    if (!input.contact || !input.mailboxId || v.out.missing.length || input.status !== 'open')
      return null
    return {
      kind: 'supplier_document_request',
      mailboxId: input.mailboxId,
      to: [input.contact.email],
      subject: v.out.subject,
      bodyHtml: '',
      bodyText: v.out.body,
      threadId: null,
      companyId: input.supplierId,
      contactId: input.contact.id,
      subjectType: 'company',
      subjectId: input.supplierId,
    }
  },

  finalizeEmail(email, input) {
    const link = uploadLinkFor(input.requestId)
    return {
      subject: email.subject,
      body: email.body.includes(LINK_MARK)
        ? email.body.split(LINK_MARK).join(link)
        : `${email.body}\n\n${link}`,
    }
  },

  async onSent(tx, action) {
    const requestId = String(action.request.sourceVersion)
    const out = await tx.outboundEmail.findFirst({
      where: { actionId: action.id, status: 'sent' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, threadId: true },
    })
    const r = await tx.supplierDocumentRequest.findUnique({
      where: { id: requestId },
      select: { supplierId: true },
    })
    if (!r) return undefined
    await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        actionId: action.id,
        subjectType: 'company',
        subjectId: r.supplierId,
        changes: [
          {
            field: 'documentRequest.sent',
            before: null,
            after: out?.id ?? null,
            kind: 'documents',
          },
        ],
      },
      (t) =>
        t.supplierDocumentRequest.update({
          where: { id: requestId },
          data: {
            outboundId: out?.id ?? null,
            threadId: out?.threadId ?? null,
            actionId: action.id,
          },
        })
    )
    return undefined
  },
}

registerAction(definition)
export default definition
