import 'server-only'
import { fillTemplate, salutation } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { sendableContactOf } from '../../directory/contact'
import { registerAction } from '../registry'
import type { ActionDefinition, OutboundDraft, ProposalDraft } from '../types'

/**
 * `bank_change_warning` (S10-T07, board 132, locked Draft and ask): after a not-genuine call-back, a warning to the
 * supplier at the address on file (a verified contact; never the address that asked for the change), from
 * purchase@ in a new thread. Template `bank_change_warning` (awaiting sign-off); no model call. Subject: the bank
 * account; sourceVersion: the account id.
 */
export interface WarningInput {
  accountId: string
  supplierId: string
  supplierName: string
  sender: string | null
  requestDate: string
  mailboxId: string | null
  mailboxAddress: string | null
  contact: { id: string; email: string; salutation: string } | null
  template: { subject: string; body: string } | null
}
export interface WarningOut {
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

const definition: ActionDefinition<WarningInput, WarningOut> = {
  key: 'bank_change_warning',
  group: 'money',
  aiPurpose: 'draft',
  external: true,
  concurrencyGroup: 'directory',
  surface: 'review',
  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const acc = await opsDb.supplierBankAccount.findUniqueOrThrow({
      where: { id: String(request.sourceVersion) },
      select: {
        id: true,
        supplierId: true,
        requestedAt: true,
        requestedViaMessageId: true,
        supplier: { select: { name: true } },
      },
    })
    const [msg, mailbox, tpl] = await Promise.all([
      acc.requestedViaMessageId
        ? opsDb.mailMessage.findUnique({
            where: { id: acc.requestedViaMessageId },
            select: { fromAddress: true },
          })
        : null,
      opsDb.mailbox.findFirst({
        where: { role: 'supplier', status: 'live' },
        orderBy: { createdAt: 'asc' },
        select: { id: true, address: true },
      }),
      opsDb.emailTemplate.findUnique({
        where: { key: 'bank_change_warning' },
        select: { subjectTemplate: true, bodyTemplate: true },
      }),
    ])
    const sender = msg?.fromAddress.toLowerCase() ?? null
    const contact = await sendableContactOf(opsDb, acc.supplierId, ['Accounts', 'Sales'])
    const safe = contact?.email && contact.email.toLowerCase() !== sender ? contact : null
    return {
      input: {
        accountId: acc.id,
        supplierId: acc.supplierId,
        supplierName: acc.supplier.name,
        sender,
        requestDate: DATE.format(acc.requestedAt ?? new Date()),
        mailboxId: mailbox?.id ?? null,
        mailboxAddress: mailbox?.address ?? null,
        contact: safe
          ? { id: safe.id, email: safe.email!.toLowerCase(), salutation: salutation(safe) }
          : null,
        template: tpl ? { subject: tpl.subjectTemplate, body: tpl.bodyTemplate } : null,
      },
      versions: { account: acc.id, contact: safe?.id ?? '' },
    }
  },

  async propose(input) {
    const values = {
      salutation: input.contact?.salutation ?? 'Dear Sir or Madam,',
      request_date: input.requestDate,
      sender_address: input.sender ?? 'an address we do not recognise',
      supplier_name: input.supplierName,
    }
    const s = input.template
      ? fillTemplate(input.template.subject, values)
      : { text: '', missing: ['template'] }
    const b = input.template
      ? fillTemplate(input.template.body, values)
      : { text: '', missing: ['template'] }
    return {
      ok: true,
      out: { subject: s.text, body: b.text, missing: [...s.missing, ...b.missing] },
      costUsd: '0.000000',
      model: null,
      promptVersion: null,
      callIds: [],
    }
  },

  async verify(out, input) {
    const ok = !out.missing.length && !!input.contact && !!input.mailboxId
    return {
      out,
      checks: [
        {
          label: 'To the address on file, not the sender',
          status: input.contact ? 'pass' : 'fail',
        },
        { label: 'From purchase@', status: input.mailboxId ? 'pass' : 'fail' },
        { label: 'Wording from the template', status: out.missing.length ? 'fail' : 'pass' },
      ],
      confidence: ok ? 'sure' : 'unsure',
      ...(ok
        ? {}
        : {
            unsure: [
              {
                field: 'warning',
                why: input.contact
                  ? 'The template or mailbox is missing'
                  : 'No verified contact other than the sender',
              },
            ],
          }),
    }
  },

  toProposal(v, input): ProposalDraft {
    return {
      headline: `Warn ${input.supplierName} about the fake bank-change email`,
      reasons: [
        { text: `The call-back found the request of ${input.requestDate} was not genuine` },
      ],
      preview: {
        mailbox: input.mailboxAddress ?? 'purchase@',
        to: input.contact ? [input.contact.email] : [],
        subject: v.out.subject,
        text: v.out.body,
      },
      checks: v.checks,
      confidence: v.confidence,
      onApproveText: 'Sends the warning to the address on file',
    }
  },

  async effect() {
    return { note: 'Warning sent', undoable: false }
  },

  outbound(v, input): OutboundDraft | null {
    if (!input.contact || !input.mailboxId || v.out.missing.length) return null
    return {
      kind: 'supplier_bank_change_warning',
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
}

registerAction(definition)
export default definition
