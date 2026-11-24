import 'server-only'
import type { Prisma } from '@indus/ops-db'
import { oooFactsSchema, shortDate, verifyOooFacts } from '@indus/ops-core'
import { recountMailCounters } from '../../mail/counters'
import { loadOooInput, type OooInput } from '../../mail/out-of-office'
import { resolveQuotes, saveEmailSpans } from '../../mail/spans'
import { oooUser, PROMPT_VERSION, SYSTEM_PARTS } from '../prompts/ooo-facts.v1'
import { registerAction } from '../registry'
import { actionRequestEvent } from '../request'
import type { ActionDefinition, EffectEvent, ProposalDraft } from '../types'
import { writeTracked } from '../write-tracked'

/**
 * `ooo_facts` (S05-T07, internal, Do quietly): an out-of-office reply's return date and stand-in.
 *
 *   gather   the auto-reply, the contact who sent it and our email it answers (server/mail/out-of-office.ts)
 *   propose  Haiku (ooo-facts@1) only when the mail checks saw a date or a stand-in; otherwise nothing to read
 *   verify   verifyOooFacts: the date within today..+120 days and quoted; the stand-in's address verbatim
 *   effect   contact.outOfOfficeUntil and mail_message.outOfOfficeUntil (tracked), the event
 *            ops/contact.out_of_office (S12/S14 move reply-by and skip chasers), and, when a stand-in is named
 *            and the reply answers one of our emails, a resend_alternate_contact proposal (Draft and ask)
 */
type Reason = { text: string; quote: string }

export interface OooOut {
  returnDate: string | null
  alternate: { name: string; email: string } | null
  reasons: Reason[]
  read: boolean
}

const definition: ActionDefinition<OooInput, OooOut> = {
  key: 'ooo_facts',
  group: 'mail',
  aiPurpose: 'read_mail',
  external: false,
  concurrencyGroup: 'mail',
  surface: 'hint',

  estimate: (input) => ({ chars: input.body.length + 1_500, maxTokens: 600 }),

  async gather({ request }) {
    const input = await loadOooInput(request.subjectId)
    return { input, versions: { message: input.messageId, today: input.today } }
  },

  async propose(input, ai) {
    if (!input.detectorReturnText && !input.detectorAlternateText) {
      return {
        ok: true,
        out: { returnDate: null, alternate: null, reasons: [], read: false },
        costUsd: '0.000000',
        model: null,
        promptVersion: null,
        callIds: [],
      }
    }
    const res = await ai.call({
      route: 'ooo',
      system: SYSTEM_PARTS,
      user: oooUser({ today: input.today, subject: input.subject, body: input.body }),
      zod: oooFactsSchema,
      maxTokens: 600,
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
      out: {
        returnDate: res.value.returnDate,
        alternate: res.value.alternateContact,
        reasons: res.value.reasons,
        read: true,
      },
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(out, input) {
    if (!out.read) {
      return {
        out,
        checks: [
          { label: 'Auto-reply', status: 'pass', detail: 'No return date or stand-in written' },
        ],
        confidence: 'sure',
      }
    }
    const v = verifyOooFacts(
      { returnDate: out.returnDate, alternateContact: out.alternate, reasons: out.reasons },
      `${input.subject}\n${input.body}`,
      input.today,
      input.fromAddress
    )
    const verified: OooOut = { ...out, returnDate: v.returnDate, alternate: v.alternate }
    return {
      out: verified,
      checks: [
        {
          label: 'Return date',
          status: v.returnDate ? 'pass' : out.returnDate ? 'warn' : 'pass',
          detail: v.returnDate
            ? `Back on ${shortDate(v.returnDate)}`
            : out.returnDate
              ? 'The date was outside 120 days or not quoted, so it is not used'
              : 'No date given',
        },
        {
          label: 'Stand-in',
          status: v.alternate ? 'pass' : out.alternate ? 'warn' : 'pass',
          detail: v.alternate
            ? `${v.alternate.name} is written in the reply`
            : out.alternate
              ? 'The address is not written in the reply, so it is not used'
              : 'No one named',
        },
      ],
      confidence: v.returnDate || v.alternate ? 'sure' : 'likely',
    }
  },

  toProposal(v, input): ProposalDraft {
    const who = input.fromName ?? input.contact?.name ?? input.fromAddress
    const o = v.out
    return {
      headline: o.returnDate
        ? `${who} out until ${shortDate(o.returnDate)} (auto-reply)`
        : `${who} is away (auto-reply)`,
      reasons: o.reasons.map((r) => ({ text: `${r.text} — “${r.quote}”` })),
      checks: v.checks,
      confidence: v.confidence,
      onApproveText: null,
    }
  },

  async effect(tx, verified, ctx) {
    const o = verified.out
    const input = await loadForEffect(tx, ctx.request.subjectId)
    const until = o.returnDate ? new Date(`${o.returnDate}T00:00:00Z`) : null
    const note = o.returnDate
      ? `Out of office until ${shortDate(o.returnDate)}${o.alternate ? `; stand-in ${o.alternate.name}` : ''}`
      : 'Auto-reply, no return date'
    const emit: EffectEvent[] = []

    await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        actionId: ctx.actionId,
        subjectType: 'mail_message',
        subjectId: input.id,
        changes: [
          {
            field: 'outOfOfficeUntil',
            before: input.outOfOfficeUntil?.toISOString().slice(0, 10) ?? null,
            after: o.returnDate,
            kind: 'contact',
          },
        ],
        note,
      },
      async (t) => {
        if (o.read) {
          const quotes = o.reasons.map((r) => r.quote)
          const text = `${input.subject ?? ''}\n${input.bodyText ?? ''}`
          if (resolveQuotes(text, quotes).some((q) => q.resolved !== 'unresolved'))
            await saveEmailSpans(input.id, input.bodyTextHash, text, quotes, t)
        }
        await t.mailMessage.update({
          where: { id: input.id },
          data: {
            outOfOfficeUntil: until,
            flags: {
              ...((input.flags as Record<string, unknown> | null) ?? {}),
              ooo: { returnDate: o.returnDate, alternate: o.alternate },
            } as Prisma.InputJsonValue,
          },
        })
      }
    )

    const contact = input.fromAddress
      ? await tx.contact.findFirst({
          where: { email: { equals: input.fromAddress, mode: 'insensitive' }, archivedAt: null },
          select: { id: true, outOfOfficeUntil: true },
        })
      : null
    if (contact && until) {
      await writeTracked(
        tx,
        {
          actor: { kind: 'assistant' },
          actionId: ctx.actionId,
          subjectType: 'contact',
          subjectId: contact.id,
          changes: [
            {
              field: 'outOfOfficeUntil',
              before: contact.outOfOfficeUntil?.toISOString().slice(0, 10) ?? null,
              after: o.returnDate,
              kind: 'contact',
            },
          ],
          note,
        },
        (t) => t.contact.update({ where: { id: contact.id }, data: { outOfOfficeUntil: until } })
      )
      emit.push({
        name: 'ops/contact.out_of_office',
        id: `contact-ooo:${contact.id}:${o.returnDate}`,
        data: { contactId: contact.id, until: o.returnDate, messageId: input.id },
      })
    }

    if (o.alternate && ctx.request.origin === 'live') {
      const answered = await answersOurEmail(tx, input)
      if (answered) {
        const ev = actionRequestEvent({
          actionKey: 'resend_alternate_contact',
          subjectType: 'mail_message',
          subjectId: input.id,
          trigger: 'mail.out_of_office',
          origin: 'live',
          sourceVersion: `ooo:${o.alternate.email}`,
          mailboxId: input.mailboxId,
        })
        emit.push({ name: ev.name, id: ev.id, data: { ...ev.data } })
      }
    }
    return { note, undoable: false, ...(emit.length ? { emit } : {}) }
  },

  afterRecord: () => recountMailCounters(),
}

async function loadForEffect(tx: Prisma.TransactionClient, messageId: string) {
  return tx.mailMessage.findUniqueOrThrow({
    where: { id: messageId },
    select: {
      id: true,
      mailboxId: true,
      threadId: true,
      fromAddress: true,
      subject: true,
      bodyText: true,
      bodyTextHash: true,
      flags: true,
      outOfOfficeUntil: true,
      inReplyToRfcId: true,
      referencesRfcIds: true,
    },
  })
}

/** Whether the auto-reply answers one of our sent emails (In-Reply-To, References, or the same thread). */
async function answersOurEmail(
  tx: Prisma.TransactionClient,
  m: {
    threadId: string
    fromAddress: string
    inReplyToRfcId: string | null
    referencesRfcIds: string[]
  }
): Promise<boolean> {
  const ids = [m.inReplyToRfcId, ...m.referencesRfcIds].filter((v): v is string => !!v)
  const n = await tx.outboundEmail.count({
    where: {
      status: 'sent',
      OR: [
        ...(ids.length ? [{ rfcMessageId: { in: ids } }] : []),
        { threadId: m.threadId, toAddresses: { has: m.fromAddress.toLowerCase() } },
      ],
    },
  })
  return n > 0
}

registerAction(definition)
export default definition
