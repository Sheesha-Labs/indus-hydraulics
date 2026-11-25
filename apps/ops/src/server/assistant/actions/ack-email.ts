import 'server-only'
import {
  computeRevertBy,
  dayMonth,
  fillTemplate,
  replyReferences,
  salutation,
  type CalendarDate,
  type HolidayRow,
  type RevertByRule,
  type RevertByStep,
  type WeekendTable,
} from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { holidaysFor } from '../../mail-send/slot'
import { replySubject } from '../../mail/reply'
import { getSetting } from '../../settings/get'
import { registerAction } from '../registry'
import { registerUndoRelease } from '../undo-hooks'
import { writeTracked } from '../write-tracked'
import type { ActionDefinition, OutboundDraft, ProposalDraft } from '../types'

/**
 * Action #6 Acknowledge client (S08-T07, board 93, C15). When an enquiry is created, the client gets one reply
 * from sales@ in their own thread: "We have received your enquiry <ref> (<n> lines). Our reference is ENQ-….
 * We will revert by <date>." The wording is the signed-off `client_ack` template (no model call); the revert-by
 * date is computed on the working-day calendar (ops-core computeRevertBy, `ack.revert_by` setting) and shown on
 * the card as "Why <date>". Careful: Draft and ask; at Do and tell the same path schedules directly. Every send
 * goes through the one queue with its 5-minute undo; approval records the revert-by on the enquiry and undo takes
 * it back. Never from purchase@: when the thread is held only by purchase@ the acknowledgement is a new message
 * from sales@ and the card says why. A client who asked for no acknowledgement gets none (create_enquiry does not
 * request this action for them).
 */
export interface AckInput {
  enquiryId: string
  enquiryRef: string
  clientName: string
  clientRef: string | null
  lineCount: number
  received: CalendarDate
  deadline: CalendarDate | null
  mailbox: { id: string; address: string } | null
  /** The client's message, when there is one. */
  source: {
    threadId: string
    inSales: boolean
    rfcMessageId: string | null
    referencesRfcIds: string[]
    subject: string
    to: string
    quoted: string
  } | null
  salutation: string
  template: { subject: string; body: string } | null
  rule: RevertByRule
  holidays: HolidayRow[]
  weekends: WeekendTable
}

export interface AckOut {
  subject: string
  body: string
  missing: string[]
  revertBy: string
  revertByLabel: string
  steps: RevertByStep[]
  warn: string | null
}

const DEFAULT_RULE: RevertByRule = {
  pricingDays: 0.5,
  bufferDays: 2,
  defaultSupplierReplyDays: 2,
  defaultNoDeadlineDays: 3,
}

function dubaiDate(d: Date): CalendarDate {
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai' })
    .format(d)
    .split('-')
    .map(Number)
  return { year: year!, month: month!, day: day! }
}

const iso = (d: CalendarDate) =>
  `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
const LONG_MONTH = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export async function gatherAck(enquiryId: string): Promise<AckInput> {
  const e = await opsDb.enquiry.findUniqueOrThrow({
    where: { id: enquiryId },
    select: {
      id: true,
      ref: true,
      clientRef: true,
      receivedAt: true,
      deadline: true,
      contactId: true,
      client: { select: { name: true } },
      _count: { select: { lines: true } },
      intakeBatches: {
        take: 1,
        select: {
          mailMessage: {
            select: {
              threadId: true,
              rfcMessageId: true,
              referencesRfcIds: true,
              subject: true,
              fromAddress: true,
              fromName: true,
              bodyText: true,
              originalSender: true,
              isForward: true,
              mailboxId: true,
              mailbox: { select: { role: true } },
            },
          },
        },
      },
    },
  })
  const m = e.intakeBatches[0]?.mailMessage ?? null
  const [sales, contact, tpl, rule, weekends, holidays] = await Promise.all([
    // sales@: the client mailbox that holds the thread, else the client mailbox (never purchase@).
    m?.mailbox.role === 'client'
      ? opsDb.mailbox.findUnique({
          where: { id: m.mailboxId },
          select: { id: true, address: true },
        })
      : opsDb.mailbox.findFirst({
          where: { role: 'client', status: 'live' },
          orderBy: { createdAt: 'asc' },
          select: { id: true, address: true },
        }),
    e.contactId
      ? opsDb.contact.findUnique({
          where: { id: e.contactId },
          select: { salutation: true, firstName: true, name: true, email: true },
        })
      : null,
    opsDb.emailTemplate.findUnique({
      where: { key: 'client_ack' },
      select: { subjectTemplate: true, bodyTemplate: true },
    }),
    getSetting('ack.revert_by').catch(() => DEFAULT_RULE),
    getSetting('calendar.country_weekends') as Promise<WeekendTable>,
    holidaysFor(['AE'], new Date(), 120),
  ])
  // The client: the contact on the enquiry (a forward's original sender), else the sender of the message.
  const to = (contact?.email ?? m?.fromAddress ?? '').toLowerCase()
  return {
    enquiryId: e.id,
    enquiryRef: e.ref,
    clientName: e.client?.name ?? 'the client',
    clientRef: e.clientRef,
    lineCount: e._count.lines,
    received: dubaiDate(e.receivedAt),
    deadline: e.deadline ? dubaiDate(e.deadline) : null,
    mailbox: sales,
    source: m
      ? {
          threadId: m.threadId,
          inSales: m.mailbox.role === 'client',
          rfcMessageId: m.rfcMessageId,
          referencesRfcIds: m.referencesRfcIds,
          subject: m.subject ?? '',
          to,
          quoted: (m.bodyText ?? '').replace(/\s+/g, ' ').trim().slice(0, 160),
        }
      : null,
    salutation: salutation(contact ?? (m ? { name: m.fromName } : null)),
    template: tpl ? { subject: tpl.subjectTemplate, body: tpl.bodyTemplate } : null,
    rule: rule as RevertByRule,
    holidays,
    weekends,
  }
}

const definition: ActionDefinition<AckInput, AckOut> = {
  key: 'ack_email',
  group: 'enquiries',
  aiPurpose: 'draft',
  external: true,
  concurrencyGroup: 'mail',
  surface: 'review',

  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const input = await gatherAck(request.subjectId)
    return {
      input,
      versions: {
        enquiry: input.enquiryRef,
        lines: input.lineCount,
        deadline: input.deadline ? iso(input.deadline) : 'none',
        template: input.template ? input.template.body.length : -1,
      },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  // No model: the wording is the signed-off template; the date is computed in code.
  async propose(input) {
    const r = computeRevertBy({
      received: input.received,
      deadline: input.deadline,
      supplierReply: null,
      rule: input.rule,
      country: 'AE',
      holidays: input.holidays,
      weekends: input.weekends,
    })
    const revertBy = `${r.revertBy.day} ${LONG_MONTH[r.revertBy.month - 1]}`
    const values = {
      salutation: input.salutation,
      client_ref: input.clientRef ?? 'of ' + dayMonth(input.received),
      line_count: input.lineCount,
      enquiry_ref: input.enquiryRef,
      revert_by: revertBy,
      original_subject: (input.source?.subject ?? input.enquiryRef).replace(
        /^\s*((re|fwd?|fw)\s*:\s*)+/i,
        ''
      ),
    }
    const subject = input.template
      ? fillTemplate(input.template.subject, values)
      : { text: replySubject(input.source?.subject ?? input.enquiryRef), missing: [] }
    const body = input.template
      ? fillTemplate(input.template.body, values)
      : { text: '', missing: ['template'] }
    return {
      ok: true,
      out: {
        subject: subject.text,
        body: body.text,
        missing: [...subject.missing, ...body.missing],
        revertBy: iso(r.revertBy),
        revertByLabel: dayMonth(r.revertBy),
        steps: r.steps,
        warn: r.warn,
      },
      costUsd: '0.000000',
      model: null,
      promptVersion: null,
      callIds: [],
    }
  },

  async verify(out, input) {
    const ok = out.missing.length === 0
    const inThread = !!input.source?.inSales
    return {
      out,
      checks: [
        inThread
          ? {
              label: 'In the client’s thread from sales@',
              status: 'pass',
              detail: input.mailbox?.address,
            }
          : {
              label: 'New message from sales@',
              status: 'warn',
              detail: input.source ? 'the thread is only in purchase@' : 'no email to reply to',
            },
        ok
          ? { label: 'Wording from the signed-off template', status: 'pass' }
          : {
              label: 'Wording from the signed-off template',
              status: 'fail',
              detail: `Missing: ${out.missing.join(', ')}`,
            },
        // Reverse identity check (C13): nothing about a supplier goes to a client. No supplier is on an enquiry yet.
        { label: 'No supplier named', status: 'pass' },
        ...(out.warn
          ? [
              {
                label: 'The client’s date is close',
                status: 'warn' as const,
                detail: `revert by ${out.revertByLabel}`,
              },
            ]
          : []),
        ...(input.source?.to ? [] : [{ label: 'No client address', status: 'fail' as const }]),
      ],
      confidence: ok && input.source?.to && input.mailbox ? 'sure' : 'unsure',
      ...(ok && input.source?.to && input.mailbox
        ? {}
        : {
            unsure: [
              {
                field: ok ? 'recipient' : 'template',
                why: ok
                  ? 'No client address or sales mailbox to send from'
                  : `The template is missing ${out.missing.join(', ')}`,
              },
            ],
          }),
    }
  },

  toProposal(v, input): ProposalDraft {
    const mailbox = input.mailbox?.address ?? 'sales@'
    return {
      headline: `Acknowledge ${input.clientName}: ${input.enquiryRef}, revert by ${v.out.revertByLabel}`,
      reasons: [
        {
          text: `${input.enquiryRef} was created with ${input.lineCount} line${input.lineCount === 1 ? '' : 's'}${input.clientRef ? ` for ${input.clientRef}` : ''}.`,
        },
        ...(input.source && !input.source.inSales
          ? [
              {
                text: 'The client’s email reached purchase@ only, so this goes as a new message from sales@.',
              },
            ]
          : []),
      ],
      preview:
        input.source?.to && input.mailbox
          ? ({
              mailbox,
              to: [input.source.to],
              subject: v.out.subject,
              text: input.source.quoted ? `${v.out.body}\n\n> ${input.source.quoted}…` : v.out.body,
              whyDate: {
                title: `Why ${v.out.revertByLabel}`,
                steps: v.out.steps.map((s) => ({
                  label: s.label,
                  value: s.value,
                  ...(s.note ? { note: s.note } : {}),
                })),
              },
            } as Prisma.InputJsonValue)
          : null,
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.out.missing.length ? `Template missing ${v.out.missing.join(', ')}` : null,
      onApproveText: input.source?.inSales
        ? `Sends the acknowledgement from ${mailbox} in the client’s thread, with a 5-minute undo`
        : `Sends the acknowledgement from ${mailbox} as a new message, with a 5-minute undo`,
    }
  },

  async effect() {
    return { note: 'Acknowledged the client', undoable: false }
  },

  // Approval queues the send and records the promise on the enquiry; undo of the send takes it back.
  async onScheduled(tx, v, ctx) {
    const e = await tx.enquiry.findUniqueOrThrow({
      where: { id: ctx.request.subjectId },
      select: { id: true, revertBy: true },
    })
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: ctx.decidedById },
        actionId: ctx.actionId,
        enquiryId: e.id,
        subjectType: 'enquiry',
        subjectId: e.id,
        changes: [
          {
            field: 'revertBy',
            before: e.revertBy?.toISOString() ?? null,
            after: v.out.revertBy,
            kind: 'terms',
          },
        ],
        note: `Acknowledged · revert by ${v.out.revertByLabel}`,
      },
      (t) =>
        t.enquiry.update({
          where: { id: e.id },
          data: { revertBy: new Date(`${v.out.revertBy}T14:00:00.000Z`) },
        })
    )
  },

  outbound(v, input): OutboundDraft | null {
    if (v.out.missing.length || !input.mailbox || !input.source?.to) return null
    // Never from purchase@: sales@ replies in the thread only when sales@ holds it; otherwise a new message.
    const inThread = input.source.inSales
    return {
      kind: 'client_acknowledgement',
      mailboxId: input.mailbox.id,
      to: [input.source.to],
      subject: inThread ? v.out.subject : v.out.subject.replace(/^Re:\s*/i, ''),
      bodyHtml: v.out.body
        .split(/\n{2,}/)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join(''),
      bodyText: v.out.body,
      threadId: inThread ? input.source.threadId : null,
      ...(inThread && input.source.rfcMessageId
        ? {
            inReplyToRfcId: input.source.rfcMessageId,
            referencesRfcIds: replyReferences(
              input.source.referencesRfcIds,
              input.source.rfcMessageId
            ),
          }
        : {}),
      enquiryId: input.enquiryId,
      subjectType: 'enquiry',
      subjectId: input.enquiryId,
    }
  },
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Undo of the queued acknowledgement takes the promise back off the enquiry.
registerUndoRelease('ack_email', async (tx, action) => {
  const a = await tx.assistantAction.findUnique({
    where: { id: action.id },
    select: { subjectId: true, decidedById: true },
  })
  if (!a?.subjectId) return
  const e = await tx.enquiry.findUnique({
    where: { id: a.subjectId },
    select: { id: true, revertBy: true },
  })
  if (!e?.revertBy) return
  await writeTracked(
    tx,
    {
      actor: a.decidedById ? { kind: 'user', id: a.decidedById } : { kind: 'assistant' },
      actionId: action.id,
      enquiryId: e.id,
      subjectType: 'enquiry',
      subjectId: e.id,
      changes: [
        { field: 'revertBy', before: e.revertBy.toISOString(), after: null, kind: 'terms' },
      ],
      note: 'Acknowledgement undone',
    },
    (t) => t.enquiry.update({ where: { id: e.id }, data: { revertBy: null } })
  )
})

registerAction(definition)
export default definition
