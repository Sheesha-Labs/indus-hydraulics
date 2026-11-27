import 'server-only'
import { documentLabel, dueReminders, fillTemplate, salutation } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { sendableContactOf } from '../../directory/contact'
import { uploadLinkFor } from '../../directory/document-request'
import { replySubject } from '../../mail/reply'
import { getSetting } from '../../settings/get'
import { registerAction } from '../registry'
import type { ActionDefinition, OutboundDraft, ProposalDraft } from '../types'
import { writeTracked } from '../write-tracked'
import { LINK_MARK } from './request-supplier-documents'

/**
 * #16 `remind_supplier_documents` (S10-T04/T08, C18). One email per supplier per run, from purchase@, with the /u
 * link (added when sent, never stored on the card). Two kinds of run, told apart by `request.sourceVersion`:
 *
 *   request:<requestId>:<n>       a new supplier has not sent everything asked for (every 4 days, board 50), in
 *                                 the thread of the request email
 *   expiry:<requestId>:<date>     documents reach 60, 30 or 7 days before expiry (ops.reminders.documents); the
 *                                 job opened a fresh request for the due kinds; the thresholds are recorded on the
 *                                 documents only when the email has really left (onSent), so an undone reminder is
 *                                 proposed again the next working day
 *
 * Always proposed for now (`alwaysAsk`): the runner has no send path for an email at an automatic level yet, so a
 * Balanced "Do quietly" would otherwise finish without sending. Template: `supplier_document_reminder` (awaiting
 * sign-off); no model call.
 */
export interface ReminderInput {
  mode: 'request' | 'expiry'
  requestId: string
  supplierId: string
  supplierName: string
  documents: Array<{
    id: string | null
    kind: string
    label: string
    threshold: number | null
    expires: string | null
  }>
  expires: string
  status: string
  mailboxId: string | null
  mailboxAddress: string | null
  thread: { id: string; rfcMessageId: string | null; subject: string } | null
  contact: { id: string; email: string; salutation: string } | null
  template: { subject: string; body: string; version: number } | null
}
export interface ReminderOut {
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

export function parseReminderVersion(v: string | number): {
  mode: 'request' | 'expiry'
  requestId: string
  tail: string
} {
  const [mode, requestId, ...rest] = String(v).split(':')
  if ((mode !== 'request' && mode !== 'expiry') || !requestId)
    throw new Error(`Bad reminder version "${v}"`)
  return { mode, requestId, tail: rest.join(':') }
}

const definition: ActionDefinition<ReminderInput, ReminderOut> = {
  key: 'remind_supplier_documents',
  group: 'sourcing',
  aiPurpose: 'draft',
  external: true,
  concurrencyGroup: 'directory',
  surface: 'review',
  alwaysAsk: {
    guardrail: 'auto_send',
    reason: 'Supplier emails ask until the automatic send path ships (S12)',
  },
  batchable: true,

  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const v = parseReminderVersion(request.sourceVersion)
    const r = await opsDb.supplierDocumentRequest.findUniqueOrThrow({
      where: { id: v.requestId },
      select: {
        id: true,
        supplierId: true,
        contactId: true,
        requestedKinds: true,
        expiresAt: true,
        status: true,
        threadId: true,
        uploads: { select: { kind: true } },
      },
    })
    const [company, mailbox, tpl, docs, settings] = await Promise.all([
      opsDb.company.findUniqueOrThrow({ where: { id: r.supplierId }, select: { name: true } }),
      opsDb.mailbox.findFirst({
        where: { role: 'supplier', status: 'live' },
        orderBy: { createdAt: 'asc' },
        select: { id: true, address: true },
      }),
      opsDb.emailTemplate.findUnique({
        where: { key: 'supplier_document_reminder' },
        select: { subjectTemplate: true, bodyTemplate: true, version: true },
      }),
      opsDb.complianceDocument.findMany({
        where: { companyId: r.supplierId, archivedAt: null },
        select: {
          id: true,
          companyId: true,
          kind: true,
          expiresAt: true,
          archivedAt: true,
          remindersSentDays: true,
          createdAt: true,
        },
      }),
      getSetting('documents.reminders'),
    ])
    const thread = r.threadId
      ? await opsDb.mailMessage.findFirst({
          where: { threadId: r.threadId },
          orderBy: { sentAt: 'desc' },
          select: { threadId: true, rfcMessageId: true, subject: true },
        })
      : null
    const contact = await sendableContactOf(
      opsDb,
      r.supplierId,
      v.mode === 'expiry' ? ['Quality', 'Sales'] : ['Sales']
    )
    const got = new Set(r.uploads.map((u) => u.kind))
    let documents: ReminderInput['documents']
    if (v.mode === 'request') {
      documents = r.requestedKinds
        .filter((k) => !got.has(k))
        .map((k) => ({
          id: null,
          kind: k,
          label: documentLabel(k),
          threshold: null,
          expires: null,
        }))
    } else {
      const day = new Date(`${v.tail}T00:00:00.000Z`)
      const due = dueReminders(docs, day, {
        thresholds: settings.thresholds,
        isWorkingDay: () => true,
      })
      documents = due.map((d) => {
        const doc = docs.find((x) => x.id === d.documentId)!
        return {
          id: d.documentId,
          kind: doc.kind,
          label: documentLabel(doc.kind),
          threshold: d.threshold,
          expires: doc.expiresAt ? DATE.format(doc.expiresAt) : null,
        }
      })
    }
    return {
      input: {
        mode: v.mode,
        requestId: r.id,
        supplierId: r.supplierId,
        supplierName: company.name,
        documents,
        expires: DATE.format(r.expiresAt),
        status: r.status,
        mailboxId: mailbox?.id ?? null,
        mailboxAddress: mailbox?.address ?? null,
        thread: thread
          ? {
              id: thread.threadId,
              rfcMessageId: thread.rfcMessageId,
              subject: thread.subject ?? '',
            }
          : null,
        contact: contact?.email
          ? { id: contact.id, email: contact.email.toLowerCase(), salutation: salutation(contact) }
          : null,
        template: tpl
          ? { subject: tpl.subjectTemplate, body: tpl.bodyTemplate, version: tpl.version }
          : null,
      },
      versions: {
        request: `${r.id}:${r.status}:${r.uploads.length}`,
        template: tpl?.version ?? -1,
        sent: docs.map((d) => `${d.id}=${d.remindersSentDays.join('.')}`).join(','),
      },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input) {
    const list = input.documents
      .map((d) => `- ${d.label}${d.expires ? ` (expires ${d.expires})` : ''}`)
      .join('\n')
    const values = {
      salutation: input.contact?.salutation ?? 'Dear Sir or Madam,',
      original_subject:
        input.thread?.subject.replace(/^\s*((re|fwd?|fw)\s*:\s*)+/i, '') ??
        `Documents for ${input.supplierName}`,
      reminder_line:
        input.mode === 'request'
          ? 'A short reminder: we still need the following documents to complete your registration as a supplier:'
          : 'The following documents we hold for you are due to expire. Please send the renewed copies:',
      document_list: list,
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
      ...(input.contact ? [] : ['No verified contact to send to']),
      ...(input.mailboxId ? [] : ['purchase@ is not connected']),
      ...(input.documents.length ? [] : ['Nothing is outstanding any more']),
      ...(input.status === 'open' ? [] : ['The upload link is no longer open']),
    ]
    return {
      out,
      checks: [
        { label: 'From purchase@', status: input.mailboxId ? 'pass' : 'fail' },
        { label: 'To a verified contact', status: input.contact ? 'pass' : 'fail' },
        {
          label: `${input.documents.length} document${input.documents.length === 1 ? '' : 's'} named`,
          status: input.documents.length ? 'pass' : 'fail',
        },
        { label: 'Wording from the template', status: out.missing.length ? 'fail' : 'pass' },
      ],
      confidence: problems.length ? 'unsure' : 'sure',
      ...(problems.length ? { unsure: problems.map((why) => ({ field: 'reminder', why })) } : {}),
    }
  },

  toProposal(v, input): ProposalDraft {
    return {
      headline:
        input.mode === 'request'
          ? `Remind ${input.supplierName} of ${input.documents.length} outstanding document${input.documents.length === 1 ? '' : 's'}`
          : `Remind ${input.supplierName}: ${input.documents.map((d) => `${d.label} (${d.threshold} days)`).join(', ')}`,
      reasons: input.documents.map((d) => ({
        text: d.threshold
          ? `${d.label} expires ${d.expires} · ${d.threshold}-day reminder`
          : `${d.label} not received yet`,
      })),
      preview: {
        mailbox: input.mailboxAddress ?? 'purchase@',
        to: input.contact ? [input.contact.email] : [],
        subject: v.out.subject,
        text: v.out.body,
      },
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.confidence === 'unsure' ? 'Something is missing before this can go' : null,
      onApproveText: `Sends from ${input.mailboxAddress ?? 'purchase@'}${input.thread ? ' in the request thread' : ''}`,
    }
  },

  async effect() {
    return { note: 'Reminder sent', undoable: false }
  },

  outbound(v, input): OutboundDraft | null {
    if (!input.contact || !input.mailboxId || v.out.missing.length || !input.documents.length)
      return null
    return {
      kind: 'supplier_document_reminder',
      mailboxId: input.mailboxId,
      to: [input.contact.email],
      subject: input.thread ? replySubject(input.thread.subject) : v.out.subject,
      bodyHtml: '',
      bodyText: v.out.body,
      threadId: input.thread?.id ?? null,
      ...(input.thread?.rfcMessageId
        ? {
            inReplyToRfcId: input.thread.rfcMessageId,
            referencesRfcIds: [input.thread.rfcMessageId],
          }
        : {}),
      companyId: input.supplierId,
      contactId: input.contact.id,
      subjectType: 'company',
      subjectId: input.supplierId,
    }
  },

  finalizeEmail(email, input) {
    const link = uploadLinkFor(input.requestId)
    return { subject: email.subject, body: email.body.split(LINK_MARK).join(link) }
  },

  /** The thresholds count as sent only now: an undone reminder is proposed again the next working day. */
  async onSent(tx, action) {
    const v = parseReminderVersion(action.request.sourceVersion)
    const req = await tx.supplierDocumentRequest.findUnique({
      where: { id: v.requestId },
      select: { supplierId: true },
    })
    if (!req) return undefined
    if (v.mode === 'request') {
      await writeTracked(
        tx,
        {
          actor: { kind: 'assistant' },
          actionId: action.id,
          subjectType: 'company',
          subjectId: req.supplierId,
          changes: [
            { field: 'documentRequest.reminder', before: null, after: v.tail, kind: 'documents' },
          ],
        },
        (t) =>
          t.supplierDocumentRequest.update({
            where: { id: v.requestId },
            data: { remindersSent: { increment: 1 } },
          })
      )
      return undefined
    }
    const settings = await tx.settingsEntry.findUnique({
      where: { key: 'documents.reminders' },
      select: { value: true },
    })
    const thresholds = (
      (settings?.value as { thresholds?: number[] } | null)?.thresholds ?? [60, 30, 7]
    ).slice()
    const docs = await tx.complianceDocument.findMany({
      where: { companyId: req.supplierId, archivedAt: null },
      select: {
        id: true,
        companyId: true,
        kind: true,
        expiresAt: true,
        archivedAt: true,
        remindersSentDays: true,
        createdAt: true,
      },
    })
    const due = dueReminders(docs, new Date(`${v.tail}T00:00:00.000Z`), {
      thresholds,
      isWorkingDay: () => true,
    })
    for (const d of due) {
      const doc = docs.find((x) => x.id === d.documentId)!
      const after = [
        ...new Set([...doc.remindersSentDays, ...thresholds.filter((t) => t >= d.threshold)]),
      ].sort((a, b) => b - a)
      await writeTracked(
        tx,
        {
          actor: { kind: 'assistant' },
          actionId: action.id,
          subjectType: 'company',
          subjectId: req.supplierId,
          changes: [
            {
              field: `document.${doc.kind}.remindersSentDays`,
              before: doc.remindersSentDays,
              after,
              kind: 'documents',
            },
          ],
        },
        (t) =>
          t.complianceDocument.update({
            where: { id: doc.id },
            data: { remindersSentDays: after, lastReminderAt: new Date() },
          })
      )
    }
    return undefined
  },
}

registerAction(definition)
export default definition
