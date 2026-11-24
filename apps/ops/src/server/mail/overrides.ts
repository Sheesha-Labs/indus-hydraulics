import 'server-only'
import type { Prisma } from '@indus/ops-db'
import {
  assistantNote,
  CLASS_LABEL,
  handledState,
  type MailClassValue,
  type ConfidenceValue,
} from '@indus/ops-core'
import { setActor, writeTracked } from '../assistant/write-tracked'

/**
 * A person's corrections to what the Assistant decided about a message (S05-T05 "Not right?", S05-T06 Unsure
 * pile and Link to…). Each one, in the caller's transaction:
 *   - changes the message through writeTracked with the person as actor (the log reads "Overridden by KB")
 *   - records a preference_signal (kind override or unsure_choice) for learned preferences
 *   - closes any open Unsure item about the message (the classify or link proposal) as decided by the person
 * and returns the events to send after commit (labels follow; a new class asks the link step again).
 */
export interface Actor {
  id: string
  initials: string
}

export interface OverrideResult {
  messageId: string
  events: Array<{ name: `ops/${string}`; data: Record<string, string | number | boolean | null> }>
}

export class OverrideError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OverrideError'
  }
}

type Tx = Prisma.TransactionClient

async function loadMessage(tx: Tx, messageId: string) {
  const m = await tx.mailMessage.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      mailboxId: true,
      classification: true,
      confidence: true,
      handledState: true,
      assistantNote: true,
      direction: true,
      _count: {
        select: { links: { where: { removedAt: null, subjectType: { not: 'company' } } } },
      },
    },
  })
  if (!m) throw new OverrideError('That message is no longer here')
  return m
}

/** Open Unsure items (classify or link proposals) about this message, decided now by the person. */
async function closeUnsure(
  tx: Tx,
  messageId: string,
  actor: Actor,
  chosen: string,
  keys: readonly string[]
): Promise<string[]> {
  const open = await tx.assistantAction.findMany({
    where: {
      subjectType: 'mail_message',
      subjectId: messageId,
      actionKey: { in: [...keys] },
      state: { in: ['proposed', 'later'] },
    },
    select: { id: true, options: true, state: true },
  })
  for (const a of open) {
    const options = (a.options as Array<{ key: string }> | null) ?? []
    const matched = options.some((o) => o.key === chosen)
    // A Later item goes back to proposed first: the state machine has no later → approved edge.
    if (a.state === 'later')
      await tx.assistantAction.update({ where: { id: a.id }, data: { state: 'proposed' } })
    await tx.assistantAction.update({
      where: { id: a.id },
      data: {
        state: matched ? 'approved' : 'edited_approved',
        chosenOption: chosen,
        decidedById: actor.id,
        decidedAt: new Date(),
        doneAt: new Date(),
      },
    })
  }
  return open.map((a) => a.id)
}

/** "Change type": the person sets the class. Sure, by definition; the note says who set it. */
export async function changeType(
  tx: Tx,
  input: {
    messageId: string
    cls: MailClassValue
    actor: Actor
    kind?: 'override' | 'unsure_choice'
  }
): Promise<OverrideResult> {
  if (input.cls === 'unclassified') throw new OverrideError('Choose a type')
  await setActor(tx, { kind: 'user', id: input.actor.id })
  const m = await loadMessage(tx, input.messageId)
  const closed = await closeUnsure(tx, m.id, input.actor, input.cls, ['classify_mail'])
  const confidence: ConfidenceValue = 'sure'
  const handled = handledState({
    classification: input.cls,
    confidence,
    linked: m._count.links,
    openProposal: false,
  })
  const note = assistantNote(input.cls, confidence, `set by ${input.actor.initials}`)
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: input.actor.id },
      actionId: closed[0] ?? null,
      subjectType: 'mail_message',
      subjectId: m.id,
      changes: [
        { field: 'classification', before: m.classification, after: input.cls, kind: 'status' },
        { field: 'confidence', before: m.confidence, after: confidence, kind: 'status' },
        { field: 'handledState', before: m.handledState, after: handled, kind: 'status' },
      ],
      note: `Overridden by ${input.actor.initials}: ${CLASS_LABEL[input.cls]}`,
    },
    async (t) => {
      await t.mailMessage.update({
        where: { id: m.id },
        data: {
          classification: input.cls,
          confidence,
          handledState: handled,
          unsureReason: null,
          assistantNote: note,
        },
      })
      await t.preferenceSignal.create({
        data: {
          kind: input.kind ?? 'override',
          actionId: closed[0] ?? null,
          actionKey: 'classify_mail',
          mailboxId: m.mailboxId,
          payload: {
            field: 'classification',
            before: m.classification,
            after: input.cls,
          } as Prisma.InputJsonValue,
          createdById: input.actor.id,
        },
      })
    }
  )
  return {
    messageId: m.id,
    events: [
      {
        name: 'ops/mail.classified',
        data: { messageId: m.id, class: input.cls, confidence, origin: 'live', by: 'user' },
      },
      { name: 'ops/review.changed', data: { messageId: m.id } },
    ],
  }
}

export function markNotBusiness(
  tx: Tx,
  input: { messageId: string; actor: Actor }
): Promise<OverrideResult> {
  return changeType(tx, { ...input, cls: 'not_business' })
}

const LINKABLE = [
  'enquiry',
  'supplier_rfq',
  'quotation',
  'order',
  'supplier_po',
  'company',
] as const
export type LinkableType = (typeof LINKABLE)[number]

/** "Link to…": the person links a message to a record (and, when the record belongs to one, its enquiry). */
export async function linkTo(
  tx: Tx,
  input: {
    messageId: string
    subjectType: LinkableType
    subjectId: string
    enquiryId: string | null
    actor: Actor
    alsoThread?: boolean
    kind?: 'override' | 'unsure_choice'
  }
): Promise<OverrideResult> {
  await setActor(tx, { kind: 'user', id: input.actor.id })
  const m = await loadMessage(tx, input.messageId)
  const closed = await closeUnsure(
    tx,
    m.id,
    input.actor,
    `${input.subjectType}:${input.subjectId}`,
    ['link_mail']
  )
  const linked = m._count.links + (input.subjectType === 'company' ? 0 : 1)
  const handled = handledState({
    classification: m.classification as MailClassValue,
    confidence: m.confidence === 'unsure' ? 'likely' : m.confidence,
    linked,
    openProposal: false,
  })
  const thread = await tx.mailMessage.findUniqueOrThrow({
    where: { id: m.id },
    select: { threadId: true, thread: { select: { enquiryId: true } } },
  })
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: input.actor.id },
      actionId: closed[0] ?? null,
      enquiryId: input.enquiryId,
      subjectType: 'mail_message',
      subjectId: m.id,
      changes: [
        {
          field: 'link',
          before: null,
          after: `${input.subjectType}:${input.subjectId}`,
          kind: 'link',
        },
        { field: 'handledState', before: m.handledState, after: handled, kind: 'status' },
      ],
      note: `Linked by ${input.actor.initials}`,
    },
    async (t) => {
      await t.mailLink.upsert({
        where: {
          messageId_subjectType_subjectId: {
            messageId: m.id,
            subjectType: input.subjectType,
            subjectId: input.subjectId,
          },
        },
        create: {
          messageId: m.id,
          subjectType: input.subjectType,
          subjectId: input.subjectId,
          enquiryId: input.enquiryId,
          linkedBy: 'user',
          confidence: 'sure',
        },
        update: { removedAt: null, linkedBy: 'user', confidence: 'sure' },
      })
      if (input.enquiryId && (input.alsoThread ?? true) && !thread.thread.enquiryId) {
        await t.mailThread.update({
          where: { id: thread.threadId },
          data: { enquiryId: input.enquiryId },
        })
      }
      await t.mailMessage.update({
        where: { id: m.id },
        data: {
          handledState: handled,
          ...(m.confidence === 'unsure' ? { confidence: 'likely' } : {}),
        },
      })
      await t.preferenceSignal.create({
        data: {
          kind: input.kind ?? 'override',
          actionId: closed[0] ?? null,
          actionKey: 'link_mail',
          mailboxId: m.mailboxId,
          ...(input.subjectType === 'company' ? { companyId: input.subjectId } : {}),
          payload: {
            field: 'link',
            after: `${input.subjectType}:${input.subjectId}`,
          } as Prisma.InputJsonValue,
          createdById: input.actor.id,
        },
      })
    }
  )
  return {
    messageId: m.id,
    events: [
      {
        name: 'ops/mail.linked',
        data: {
          messageId: m.id,
          subjectType: input.subjectType,
          subjectId: input.subjectId,
          enquiryId: input.enquiryId,
          by: 'user',
        },
      },
    ],
  }
}

/** "Unlink": the link stays as history (removedAt), and the message returns to Not linked when it has no other. */
export async function unlink(
  tx: Tx,
  input: { messageId: string; subjectType: string; subjectId: string; actor: Actor }
): Promise<OverrideResult> {
  await setActor(tx, { kind: 'user', id: input.actor.id })
  const m = await loadMessage(tx, input.messageId)
  const link = await tx.mailLink.findFirst({
    where: {
      messageId: m.id,
      subjectType: input.subjectType as never,
      subjectId: input.subjectId,
      removedAt: null,
    },
    select: { id: true },
  })
  if (!link) throw new OverrideError('That link was already removed')
  const remaining = Math.max(0, m._count.links - (input.subjectType === 'company' ? 0 : 1))
  const handled = handledState({
    classification: m.classification as MailClassValue,
    confidence: m.confidence,
    linked: remaining,
    openProposal: false,
  })
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: input.actor.id },
      subjectType: 'mail_message',
      subjectId: m.id,
      changes: [
        {
          field: 'link',
          before: `${input.subjectType}:${input.subjectId}`,
          after: null,
          kind: 'link',
        },
        { field: 'handledState', before: m.handledState, after: handled, kind: 'status' },
      ],
      note: `Unlinked by ${input.actor.initials}`,
    },
    async (t) => {
      await t.mailLink.update({ where: { id: link.id }, data: { removedAt: new Date() } })
      await t.mailMessage.update({ where: { id: m.id }, data: { handledState: handled } })
      await t.preferenceSignal.create({
        data: {
          kind: 'override',
          actionKey: 'link_mail',
          mailboxId: m.mailboxId,
          payload: {
            field: 'link',
            before: `${input.subjectType}:${input.subjectId}`,
            after: null,
          } as Prisma.InputJsonValue,
          createdById: input.actor.id,
        },
      })
    }
  )
  return { messageId: m.id, events: [{ name: 'ops/review.changed', data: { messageId: m.id } }] }
}

export { LINKABLE }
