import 'server-only'
import { PATH_TITLE, type QualifyPath } from '@indus/ops-core'
import { Prisma } from '@indus/ops-db'
import { actionDefinition } from '../assistant/registry'
import { actionRequestEvent } from '../assistant/request'
import type { ActionRequest, EffectEvent } from '../assistant/types'
import { writeTracked } from '../assistant/write-tracked'
import { changeType, markNotBusiness } from '../mail/overrides'
import { changeEnquiryStage, VersionConflict } from './transition'

/**
 * A person chooses the path on the qualification card (S09-T06, board 167). Chosen once; the Assistant then drafts
 * the next step for Review and nothing is sent on choose.
 *
 *   quote_fully       → Sourcing; ops/enquiry.path.chosen (S12 drafts the supplier RFQs from it)
 *   quote_partial     → Sourcing; regret_client for the named lines (one line-level regret email, reason required)
 *   ask_client_first  → stays Qualifying; ask_client_questions for the named lines (S09-T07)
 *   regret            → stays where it is; regret_client for the whole enquiry. It becomes Regretted when the
 *                       email has really left (regret-client.ts onSent), never on choose
 *   ignore_spam       → the source email filed Not business, the enquiry closed as spam; 5 minutes to undo
 *
 * (decision) The acknowledgement is not redrafted on a partial path: its wording is the signed-off client_ack
 * template, which has no line-regret slot. The line regret goes in its own email (regret_client, scope lines).
 *
 * The open qualify_enquiry read is closed as decided by the person (approved when the suggestion was taken,
 * edited_approved otherwise), so its learning signal records what the person chose.
 */

type Tx = Prisma.TransactionClient

export class ChoosePathError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChoosePathError'
  }
}

export interface ChoosePathInput {
  enquiryId: string
  path: QualifyPath
  /** Lines to regret (quote_partial) or to ask about (ask_client_first). */
  lineNos?: number[] | undefined
  version: number
  actor: { id: string; initials: string; role: 'owner' | 'helper' }
}

export interface ChoosePathResult {
  ref: string
  path: QualifyPath
  /** Requests and events to send once the transaction commits. */
  emit: EffectEvent[]
  /** ignore_spam: the undo window closes at this time (ISO). */
  undoUntil: string | null
}

export const SPAM_UNDO_MINUTES_DEFAULT = 5

async function undoMinutes(tx: Tx): Promise<number> {
  const row = await tx.settingsEntry.findUnique({
    where: { key: 'assistant.internal_undo_minutes' },
    select: { value: true },
  })
  const v = (row?.value as { minutes?: unknown } | null)?.minutes
  return typeof v === 'number' && v > 0 && v <= 60 ? v : SPAM_UNDO_MINUTES_DEFAULT
}

/** The source email of an enquiry (the intake batch's message), when it came by email. */
async function sourceMessageId(tx: Tx, enquiryId: string): Promise<string | null> {
  const b = await tx.intakeBatch.findFirst({
    where: { enquiryId, mailMessageId: { not: null } },
    orderBy: { createdAt: 'asc' },
    select: { mailMessageId: true },
  })
  return b?.mailMessageId ?? null
}

function plain(d: Record<string, unknown>): Record<string, string | number | boolean | null> {
  return Object.fromEntries(
    Object.entries(d).filter(
      ([, v]) => v === null || ['string', 'number', 'boolean'].includes(typeof v)
    )
  ) as Record<string, string | number | boolean | null>
}

function request(r: ActionRequest): EffectEvent[] {
  // An action not registered in this build (a later task's) is simply not requested.
  if (!actionDefinition(r.actionKey)) return []
  const e = actionRequestEvent(r)
  return [{ name: e.name, id: e.id, data: plain(e.data as unknown as Record<string, unknown>) }]
}

/** "whole" or "lines:3.14": the scope a regret or question request carries in its source version. */
export function scopeVersion(
  scope: 'whole' | 'lines',
  lineNos: readonly number[],
  at: Date
): string {
  return `${scope === 'whole' ? 'whole' : `lines:${[...lineNos].sort((a, b) => a - b).join('.')}`}@${at.getTime()}`
}
export function parseScopeVersion(v: string | number): {
  scope: 'whole' | 'lines'
  lineNos: number[]
} {
  const s = String(v).split('@')[0] ?? ''
  if (!s.startsWith('lines:')) return { scope: 'whole', lineNos: [] }
  return {
    scope: 'lines',
    lineNos: s
      .slice(6)
      .split('.')
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0),
  }
}

export async function choosePath(tx: Tx, i: ChoosePathInput): Promise<ChoosePathResult> {
  const e = await tx.enquiry.findUniqueOrThrow({
    where: { id: i.enquiryId },
    select: {
      id: true,
      ref: true,
      stage: true,
      version: true,
      chosenPath: true,
      suggestedPath: true,
      lines: { where: { status: { not: 'cancelled' } }, select: { no: true } },
    },
  })
  if (e.version !== i.version) throw new VersionConflict()
  if (e.chosenPath) throw new ChoosePathError('A path was already chosen for this enquiry')
  if (!['new', 'qualifying'].includes(e.stage))
    throw new ChoosePathError('The path is chosen before sourcing starts')

  const known = new Set(e.lines.map((l) => l.no))
  const lineNos = [...new Set(i.lineNos ?? [])].filter((n) => known.has(n)).sort((a, b) => a - b)
  if (i.path === 'quote_partial' && lineNos.length === 0)
    throw new ChoosePathError('Choose the lines to regret')
  if (i.path === 'quote_partial' && lineNos.length >= known.size)
    throw new ChoosePathError('Every line would be regretted: choose “Regret politely” instead')

  const now = new Date()
  const actor = { kind: 'user' as const, id: i.actor.id }
  const chosen = { chosenPath: i.path, pathChosenAt: now, pathChosenById: i.actor.id }
  const emit: EffectEvent[] = []
  let undoUntil: string | null = null

  // Close the open quick read as decided by this person.
  const read = await tx.assistantAction.findFirst({
    where: {
      enquiryId: e.id,
      actionKey: 'qualify_enquiry',
      state: { in: ['proposed', 'later'] },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, state: true },
  })
  if (read) {
    if (read.state === 'later')
      await tx.assistantAction.update({ where: { id: read.id }, data: { state: 'proposed' } })
    await tx.assistantAction.update({
      where: { id: read.id },
      data: {
        state: e.suggestedPath === i.path ? 'approved' : 'edited_approved',
        chosenOption: i.path,
        decidedById: i.actor.id,
        decidedAt: now,
      },
    })
    await tx.assistantAction.update({ where: { id: read.id }, data: { state: 'running' } })
    await tx.assistantAction.update({
      where: { id: read.id },
      data: { state: 'done', doneAt: now },
    })
  }

  const base = {
    subjectType: 'enquiry' as const,
    subjectId: e.id,
    enquiryId: e.id,
    trigger: 'enquiry.path.chosen',
    origin: 'live' as const,
    requestedById: i.actor.id,
  }
  const note = `Path chosen by ${i.actor.initials}: ${PATH_TITLE[i.path]}`

  switch (i.path) {
    case 'quote_fully':
    case 'quote_partial': {
      await changeEnquiryStage(tx, {
        enquiryId: e.id,
        to: 'sourcing',
        ctx: { chosenPath: i.path },
        actor,
        note,
        data: chosen,
      })
      emit.push({
        name: 'ops/enquiry.path.chosen',
        id: `enquiry-path:${e.id}`,
        data: { enquiryId: e.id, ref: e.ref, path: i.path, regretLines: lineNos.join(',') },
      })
      if (i.path === 'quote_partial')
        emit.push(
          ...request({
            ...base,
            actionKey: 'regret_client',
            sourceVersion: scopeVersion('lines', lineNos, now),
          })
        )
      break
    }
    case 'ask_client_first':
    case 'regret': {
      await recordChoice(tx, e.id, e.stage, chosen, actor, note)
      if (e.stage === 'new')
        await changeEnquiryStage(tx, {
          enquiryId: e.id,
          to: 'qualifying',
          actor,
          note: 'Path chosen',
        })
      emit.push(
        ...(i.path === 'regret'
          ? request({
              ...base,
              actionKey: 'regret_client',
              sourceVersion: scopeVersion('whole', [], now),
            })
          : request({
              ...base,
              actionKey: 'ask_client_questions',
              sourceVersion: scopeVersion('lines', lineNos.length ? lineNos : [...known], now),
            }))
      )
      break
    }
    case 'ignore_spam': {
      const messageId = await sourceMessageId(tx, e.id)
      if (messageId) {
        const r = await markNotBusiness(tx, {
          messageId,
          actor: { id: i.actor.id, initials: i.actor.initials },
        })
        emit.push(...r.events.map((x) => ({ name: x.name, data: x.data })))
      }
      await changeEnquiryStage(tx, {
        enquiryId: e.id,
        to: 'closed',
        ctx: { closedReason: 'spam' },
        actor,
        note: 'Filed as Not business. No reply, no record.',
        data: { ...chosen, closedReason: 'spam', closedAt: now },
      })
      undoUntil = new Date(now.getTime() + (await undoMinutes(tx)) * 60_000).toISOString()
      break
    }
  }
  return { ref: e.ref, path: i.path, emit, undoUntil }
}

/** The choice on an enquiry whose stage does not move on choose (ask first, regret). */
async function recordChoice(
  tx: Tx,
  enquiryId: string,
  stage: string,
  data: { chosenPath: QualifyPath; pathChosenAt: Date; pathChosenById: string },
  actor: { kind: 'user'; id: string },
  note: string
) {
  await writeTracked(
    tx,
    {
      actor,
      enquiryId,
      subjectType: 'enquiry',
      subjectId: enquiryId,
      changes: [{ field: 'chosenPath', before: null, after: data.chosenPath, kind: 'decision' }],
      note: `${note} (stage ${stage})`,
    },
    (t) =>
      t.enquiry.update({ where: { id: enquiryId }, data: { ...data, version: { increment: 1 } } })
  )
}

/**
 * "Undo · treat as enquiry" (171b state 3): inside the window, the enquiry goes back to Qualifying with no path
 * chosen and the email back to the class it had. After the window it is an Owner's reopen from the record.
 */
export async function undoSpam(
  tx: Tx,
  i: { enquiryId: string; actor: { id: string; initials: string } }
): Promise<{ ref: string; emit: EffectEvent[] }> {
  const e = await tx.enquiry.findUniqueOrThrow({
    where: { id: i.enquiryId },
    select: { id: true, ref: true, stage: true, chosenPath: true, pathChosenAt: true },
  })
  const minutes = await undoMinutes(tx)
  if (e.stage !== 'closed' || e.chosenPath !== 'ignore_spam' || !e.pathChosenAt)
    throw new ChoosePathError('There is nothing to undo here')
  if (Date.now() - e.pathChosenAt.getTime() > minutes * 60_000)
    throw new ChoosePathError('The undo window has closed: the Owner can reopen it from the record')
  const emit: EffectEvent[] = []
  const messageId = await sourceMessageId(tx, e.id)
  if (messageId) {
    const before = await tx.activityEvent.findFirst({
      where: { subjectType: 'mail_message', subjectId: messageId, field: 'classification' },
      orderBy: { at: 'desc' },
      select: { before: true },
    })
    const cls =
      typeof before?.before === 'string' && before.before !== 'not_business'
        ? before.before
        : 'client_enquiry'
    const r = await changeType(tx, {
      messageId,
      cls: cls as Parameters<typeof changeType>[1]['cls'],
      actor: i.actor,
    })
    emit.push(...r.events.map((x) => ({ name: x.name, data: x.data })))
  }
  await changeEnquiryStage(tx, {
    enquiryId: e.id,
    to: 'qualifying',
    ctx: { undoSpam: true },
    actor: { kind: 'user', id: i.actor.id },
    note: `Undone by ${i.actor.initials}: treated as an enquiry`,
    data: {
      chosenPath: null,
      pathChosenAt: null,
      pathChosenById: null,
      closedReason: null,
      closedAt: null,
    },
  })
  return { ref: e.ref, emit }
}

/**
 * "Read it now" (an enquiry without a quick read): marks the read as asked, so the card shows "reading" until the
 * action lands and replaces the notes. The request itself is sent after commit by the caller.
 */
export async function markQuickReadAsked(
  tx: Tx,
  i: { enquiryId: string; actor: { id: string; initials: string } }
): Promise<{ ref: string }> {
  const e = await tx.enquiry.findUniqueOrThrow({
    where: { id: i.enquiryId },
    select: { id: true, ref: true, stage: true, chosenPath: true },
  })
  if (e.chosenPath || !['new', 'qualifying'].includes(e.stage))
    throw new ChoosePathError('The path is already chosen')
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: i.actor.id },
      enquiryId: e.id,
      subjectType: 'enquiry',
      subjectId: e.id,
      changes: [{ field: 'quickRead', before: null, after: 'asked', kind: 'decision' }],
      note: `Quick read asked by ${i.actor.initials}`,
    },
    (t) =>
      t.enquiry.update({
        where: { id: e.id },
        data: {
          legitimacyNotes: { askedAt: new Date().toISOString() },
          fitNotes: Prisma.DbNull,
          effortNotes: Prisma.DbNull,
        },
      })
  )
  return { ref: e.ref }
}
