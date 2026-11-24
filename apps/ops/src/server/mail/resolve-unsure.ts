import 'server-only'
import type { Prisma } from '@indus/ops-db'
import {
  CLASS_LABEL,
  domainOf,
  isPublicMailDomain,
  MAIL_CLASSES,
  type MailClassValue,
} from '@indus/ops-core'
import { setActor, writeTracked } from '../assistant/write-tracked'
import {
  changeType,
  linkTo,
  OverrideError,
  type Actor,
  type LinkableType,
  type OverrideResult,
} from './overrides'

/**
 * The Unsure pile (S05-T06, board 94). An unsure email is never filed by guessing (ADR-12): it waits until a
 * person chooses. A choice is either a class ("Supplier price list") or a record ("Client reply on ENQ-…"),
 * recorded as theirs (decidedBy) and as a learning signal; when it names a company and the sender's domain is
 * a company domain (not a free mail provider), the domain is added to the company so the next email from it is
 * read correctly. Undo, inside the internal undo window, puts everything back and returns the card.
 */
type Tx = Prisma.TransactionClient

export interface ResolveInput {
  messageId: string
  actionId: string
  /** A class key, `<subjectType>:<id>`, or 'new_enquiry'. */
  option: string
  /** The company the choice names, if any (learned from the sender's domain). */
  companyId?: string | null
  actor: Actor
}

export interface ResolveResult extends OverrideResult {
  filedAs: string
  learned: string | null
}

const LINKABLE = new Set<string>([
  'enquiry',
  'supplier_rfq',
  'quotation',
  'order',
  'supplier_po',
  'company',
])

async function openItem(tx: Tx, actionId: string, messageId: string) {
  const a = await tx.assistantAction.findUnique({
    where: { id: actionId },
    select: {
      id: true,
      state: true,
      actionKey: true,
      subjectId: true,
      options: true,
      surface: true,
    },
  })
  if (!a || a.subjectId !== messageId || a.surface !== 'mail_unsure') {
    throw new OverrideError('That item is no longer in the Unsure pile')
  }
  if (a.state !== 'proposed' && a.state !== 'later')
    throw new OverrideError('Someone has already decided this one')
  return a
}

async function enquiryOf(tx: Tx, subjectType: string, subjectId: string): Promise<string | null> {
  if (subjectType === 'enquiry') return subjectId
  if (subjectType === 'supplier_rfq') {
    return (
      (await tx.supplierRfq.findUnique({ where: { id: subjectId }, select: { enquiryId: true } }))
        ?.enquiryId ?? null
    )
  }
  if (subjectType === 'quotation' || subjectType === 'order') {
    const row =
      subjectType === 'quotation'
        ? await tx.quotation.findUnique({ where: { id: subjectId }, select: { enquiryId: true } })
        : await tx.order.findUnique({ where: { id: subjectId }, select: { enquiryId: true } })
    return row?.enquiryId ?? null
  }
  return null
}

/** Adds the sender's domain to the company (tracked), unless it is a free mail domain or already there. */
async function learnDomain(
  tx: Tx,
  companyId: string,
  domain: string | null,
  actor: Actor
): Promise<string | null> {
  if (!domain || isPublicMailDomain(domain)) return null
  const company = await tx.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, domains: true, isClient: true, isSupplier: true },
  })
  if (!company || company.domains.includes(domain)) return null
  const next = [...company.domains, domain]
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: actor.id },
      subjectType: 'company',
      subjectId: company.id,
      changes: [{ field: 'domains', before: company.domains, after: next, kind: 'contact' }],
      note: `Learned from an Unsure choice by ${actor.initials}`,
    },
    async (t) => {
      await t.company.update({ where: { id: company.id }, data: { domains: next } })
    }
  )
  const role =
    company.isSupplier && !company.isClient
      ? 'a supplier'
      : company.isClient && !company.isSupplier
        ? 'a client'
        : company.name
  return `Next time, mail from @${domain} is ${role}.`
}

export async function resolveUnsure(tx: Tx, input: ResolveInput): Promise<ResolveResult> {
  await setActor(tx, { kind: 'user', id: input.actor.id })
  const item = await openItem(tx, input.actionId, input.messageId)
  const msg = await tx.mailMessage.findUniqueOrThrow({
    where: { id: input.messageId },
    select: { fromAddress: true },
  })
  const domain = domainOf(msg.fromAddress)
  const offered = ((item.options as Array<{ key: string }> | null) ?? []).map((o) => o.key)
  const signal = { senderDomain: domain, chosen: input.option, offered }

  let out: OverrideResult
  let filedAs: string
  if (input.option === 'new_enquiry') {
    // C5: enquiry numbering starts in S08; until then it waits as Needs you, queued for #4.
    out = await changeType(tx, {
      messageId: input.messageId,
      cls: 'client_enquiry',
      actor: input.actor,
      kind: 'unsure_choice',
      signal,
      needsYou: true,
    })
    filedAs = 'New enquiry'
  } else if (
    (MAIL_CLASSES as readonly string[]).includes(input.option) &&
    input.option !== 'unclassified'
  ) {
    const cls = input.option as MailClassValue
    out = await changeType(tx, {
      messageId: input.messageId,
      cls,
      actor: input.actor,
      kind: 'unsure_choice',
      signal,
    })
    filedAs = CLASS_LABEL[cls]
  } else {
    const [type, id] = input.option.split(':')
    if (!type || !id || !LINKABLE.has(type)) throw new OverrideError('Choose one of the options')
    out = await linkTo(tx, {
      messageId: input.messageId,
      subjectType: type as LinkableType,
      subjectId: id,
      enquiryId: await enquiryOf(tx, type, id),
      actor: input.actor,
      kind: 'unsure_choice',
      signal,
    })
    const label = ((item.options as Array<{ key: string; label?: string }> | null) ?? []).find(
      (o) => o.key === input.option
    )?.label
    filedAs = label ?? type.replace('_', ' ')
  }
  // The pile's item itself (closed by changeType / linkTo when it matched their key; otherwise closed here).
  const still = await tx.assistantAction.findUnique({
    where: { id: item.id },
    select: { state: true },
  })
  if (still && (still.state === 'proposed' || still.state === 'later')) {
    if (still.state === 'later')
      await tx.assistantAction.update({ where: { id: item.id }, data: { state: 'proposed' } })
    await tx.assistantAction.update({
      where: { id: item.id },
      data: {
        state: 'edited_approved',
        chosenOption: input.option,
        decidedById: input.actor.id,
        decidedAt: new Date(),
      },
    })
    await tx.assistantAction.update({ where: { id: item.id }, data: { state: 'running' } })
    await tx.assistantAction.update({
      where: { id: item.id },
      data: { state: 'done', doneAt: new Date(), undoUntil: new Date(Date.now() + 5 * 60_000) },
    })
  }

  const companyId =
    input.companyId ?? (input.option.startsWith('company:') ? input.option.slice(8) : null)
  const learned = companyId ? await learnDomain(tx, companyId, domain, input.actor) : null
  return { ...out, filedAs, learned }
}

/**
 * Undo a choice inside its window: the message's fields and links go back to what the activity rows say they
 * were, any learned domain is removed, the decided item becomes `undone`, and a fresh copy returns to the pile.
 */
export async function undoResolution(
  tx: Tx,
  input: { actionId: string; actor: Actor; now?: Date }
): Promise<{ messageId: string; newActionId: string }> {
  await setActor(tx, { kind: 'user', id: input.actor.id })
  const now = input.now ?? new Date()
  const a = await tx.assistantAction.findUnique({ where: { id: input.actionId } })
  if (!a || a.surface !== 'mail_unsure' || !a.subjectId) throw new OverrideError('Nothing to undo')
  if (a.state !== 'done' || !a.undoUntil || a.undoUntil.getTime() < now.getTime()) {
    throw new OverrideError('Too late to undo; change it from the email instead')
  }
  const messageId = a.subjectId
  const rows = await tx.activityEvent.findMany({
    where: { actionId: a.id, subjectType: 'mail_message', subjectId: messageId, actorKind: 'user' },
    orderBy: { at: 'asc' },
    select: { field: true, before: true, after: true },
  })
  const restore: Record<string, unknown> = {}
  for (const r of rows) {
    if (r.field === 'classification' || r.field === 'confidence' || r.field === 'handledState') {
      restore[r.field] = r.before
    }
  }
  const links = rows
    .filter((r) => r.field === 'link' && typeof r.after === 'string')
    .map((r) => r.after as string)
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: input.actor.id },
      actionId: a.id,
      subjectType: 'mail_message',
      subjectId: messageId,
      changes: [
        ...Object.entries(restore).map(([field, before]) => ({
          field,
          before: 'undo',
          after: before,
          kind: 'status' as const,
        })),
        ...links.map((l) => ({ field: 'link', before: l, after: null, kind: 'link' as const })),
      ],
      note: `Undone by ${input.actor.initials}`,
    },
    async (t) => {
      if (Object.keys(restore).length) {
        await t.mailMessage.update({
          where: { id: messageId },
          data: restore as Prisma.MailMessageUpdateInput,
        })
      }
      for (const l of links) {
        const [subjectType, subjectId] = l.split(':')
        await t.mailLink.updateMany({
          where: {
            messageId,
            subjectType: subjectType as never,
            subjectId: subjectId!,
            removedAt: null,
          },
          data: { removedAt: now },
        })
      }
    }
  )
  // A learned domain goes back too.
  const learned = await tx.activityEvent.findFirst({
    where: {
      subjectType: 'company',
      field: 'domains',
      actorId: input.actor.id,
      at: { gte: a.decidedAt ?? a.doneAt ?? now },
    },
    orderBy: { at: 'desc' },
    select: { subjectId: true, before: true },
  })
  if (learned && Array.isArray(learned.before)) {
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: input.actor.id },
        subjectType: 'company',
        subjectId: learned.subjectId,
        changes: [{ field: 'domains', before: 'undo', after: learned.before, kind: 'contact' }],
        note: `Undone by ${input.actor.initials}`,
      },
      async (t) => {
        await t.company.update({
          where: { id: learned.subjectId },
          data: { domains: learned.before as string[] },
        })
      }
    )
  }
  await tx.assistantAction.update({ where: { id: a.id }, data: { state: 'undone' } })

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  const [num] = await tx.$queryRaw<Array<{ formatted: string }>>`
    SELECT formatted FROM ops.allocate_number('assistant_action', ${`${get('year')}-${get('month')}-${get('day')}`})`
  if (!num) throw new Error('allocate_number returned no row')
  const copy = await tx.assistantAction.create({
    data: {
      ref: num.formatted,
      actionKey: a.actionKey,
      levelAtTime: a.levelAtTime,
      guardrails: a.guardrails,
      enquiryId: a.enquiryId,
      subjectType: a.subjectType,
      subjectId: a.subjectId,
      headline: a.headline,
      reasons: a.reasons as Prisma.InputJsonValue,
      ...(a.preview === null ? {} : { preview: a.preview as Prisma.InputJsonValue }),
      ...(a.checks === null ? {} : { checks: a.checks as Prisma.InputJsonValue }),
      confidence: a.confidence,
      unsureAbout: a.unsureAbout,
      onApproveText: a.onApproveText,
      ...(a.options === null ? {} : { options: a.options as Prisma.InputJsonValue }),
      ...(a.inputs === null ? {} : { inputs: a.inputs as Prisma.InputJsonValue }),
      ...(a.output === null ? {} : { output: a.output as Prisma.InputJsonValue }),
      state: 'proposed',
      retryOfId: a.id,
      origin: a.origin,
      model: a.model,
      promptVersion: a.promptVersion,
      ...(a.levelReasons === null ? {} : { levelReasons: a.levelReasons as Prisma.InputJsonValue }),
      surface: a.surface,
    },
    select: { id: true },
  })
  return { messageId, newActionId: copy.id }
}
