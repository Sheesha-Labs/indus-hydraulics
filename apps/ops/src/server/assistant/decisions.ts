import 'server-only'
import { opsDb, Prisma, type $Enums } from '@indus/ops-db'
import { emailEdit, nextWorkingDay, type EmailEdit } from '@indus/ops-core'
import {
  toProposalCardData,
  type ActionRowForCard,
  type CardEmail,
} from '../../data/proposal-mapper'
import { emitEvent } from '../../inngest/emit'
import { resolveSendEnvelope } from '../mail-send/envelope'
import { scheduleSend } from '../mail-send/schedule'
import { holidaysFor } from '../mail-send/slot'
import { mayUndo, undoSend } from '../mail-send/undo'
import { textToSanitizedHtml } from '../mail/body'
import { raiseNotification } from '../notify/raise'
import { getSetting } from '../settings/get'
import { setCounters } from './live-counter'
import { actionDefinition } from './registry'
import { requestActionQuietly, type ActionRequestedData } from './request'
import { effectRun, resolveRun } from './runner'
import { isStale } from './staleness'
import type { ActionRequest, Json, Verified } from './types'
import { releaseOnUndo } from './undo-hooks'
import { setActor } from './write-tracked'

// Every action definition registers itself on import; the decisions need them in the web server too.
import './actions'

/**
 * Review decisions (S06-T02, ADR-09/11): approve, edit and approve, reject (and redraft), Later, Redraft,
 * batch approve, and undo of an approval. Each is short transactions around the one call that must not sit
 * inside one: scheduleSend opens its own connection (ADR-04; the 2026-11-23 deadlock), so the action is
 * moved to approved, the email is scheduled, then the action is moved to queued.
 *
 * A proposal's columns never change. A person's edit goes to effectivePayload (with editDiff), and is what the
 * send uses. Errors are DecisionError with a code the UI turns into a state (changed, stale, …).
 */
export type DecisionCode =
  | 'not_found'
  | 'not_open'
  | 'changed'
  | 'stale'
  | 'forbidden'
  | 'blocked'
  | 'invalid'
  | 'send_failed'
  | 'too_late'

export class DecisionError extends Error {
  constructor(
    readonly code: DecisionCode,
    message: string
  ) {
    super(message)
    this.name = 'DecisionError'
  }
}

export interface Decider {
  id: string
  initials: string
  role: 'owner' | 'helper'
  canSendSupplierMail: boolean
  canSeeMargins: boolean
}

const OPEN: readonly $Enums.ActionState[] = ['proposed', 'later']
const NO_SEND_OPTIONS = new Set(['wait', 'fix', 'skip'])

const ROW = {
  include: {
    def: { select: { label: true, lockedLevel: true, group: true } },
    decidedBy: { select: { initials: true, name: true } },
  },
} as const

type Row = Prisma.AssistantActionGetPayload<typeof ROW>

async function load(actionId: string): Promise<Row> {
  const a = await opsDb.assistantAction.findUnique({ where: { id: actionId }, ...ROW })
  if (!a) throw new DecisionError('not_found', 'This proposal is no longer here.')
  return a
}

function requestOf(a: Row): ActionRequest | null {
  return (a.inputs as { request?: ActionRequest } | null)?.request ?? null
}

async function mailboxRoleOf(a: Row): Promise<string | null> {
  const req = requestOf(a)
  if (req?.mailboxId) {
    const m = await opsDb.mailbox.findUnique({
      where: { id: req.mailboxId },
      select: { role: true },
    })
    if (m) return m.role
  }
  const address = (a.preview as { mailbox?: string | null } | null)?.mailbox
  if (address) {
    const m = await opsDb.mailbox.findUnique({ where: { address }, select: { role: true } })
    if (m) return m.role
  }
  return null
}

/** Who may decide this card (CLAUDE.md §5.4–5.5). The database triggers repeat it for the locked actions. */
async function permission(a: Row, user: Decider): Promise<string | null> {
  if (a.surface !== 'review') return 'This is not a Review card.'
  if (user.role === 'owner') return null
  const locked = a.def.lockedLevel !== null
  if (locked || a.def.group === 'money') return 'Only the Owner decides this.'
  if (a.actionKey === 'manual_reply') return 'Only the Owner sends from the client mailbox.'
  const def = actionDefinition(a.actionKey)
  if (def?.external) {
    const role = await mailboxRoleOf(a)
    if (role !== 'supplier') return 'Only the Owner sends from this mailbox.'
    if (!user.canSendSupplierMail) return 'You cannot send supplier mail.'
  }
  return null
}

function cardRow(a: Row): ActionRowForCard {
  return {
    ...a,
    def: { label: a.def.label, lockedLevel: a.def.lockedLevel },
    decidedBy: a.decidedBy,
  }
}

function verifiedOf(a: Row): Verified<Json> {
  return {
    out: (a.output as Json) ?? {},
    checks: (a.checks as Verified<Json>['checks'] | null) ?? [],
    confidence: a.confidence ?? 'likely',
  }
}

async function bumpReview(): Promise<void> {
  const pending = await opsDb.assistantAction.count({
    where: { surface: 'review', state: { in: ['proposed', 'later'] } },
  })
  await setCounters({ 'review.pending': pending })
}

async function afterDecision(a: Row): Promise<void> {
  await bumpReview()
  if (a.subjectType === 'mail_message' && a.subjectId) {
    await emitEvent({
      name: 'ops/review.changed',
      id: `review-changed:${a.id}:${Date.now()}`,
      data: { messageId: a.subjectId, actionId: a.id },
    })
  }
}

/** Field-level before/after of an email edit, for "Edited by KB" and the preference signal. */
export function emailDiff(
  before: CardEmail,
  edit: EmailEdit
): Array<{ field: string; before: unknown; after: unknown }> {
  const out: Array<{ field: string; before: unknown; after: unknown }> = []
  if (edit.to && edit.to.join(',') !== before.to.join(','))
    out.push({ field: 'to', before: before.to, after: edit.to })
  if (edit.cc && edit.cc.join(',') !== before.cc.join(','))
    out.push({ field: 'cc', before: before.cc, after: edit.cc })
  if (edit.subject !== undefined && edit.subject !== before.subject)
    out.push({ field: 'subject', before: before.subject, after: edit.subject })
  if (edit.body !== undefined && edit.body.trim() !== before.body.trim())
    out.push({ field: 'body', before: before.body, after: edit.body })
  return out
}

async function guardOpen(a: Row, version: number, user: Decider): Promise<void> {
  if (!OPEN.includes(a.state)) throw new DecisionError('not_open', 'This card was already decided.')
  if (a.version !== version)
    throw new DecisionError('changed', 'This card changed since you opened it. Look again.')
  const denied = await permission(a, user)
  if (denied) throw new DecisionError('forbidden', denied)
}

async function guardFresh(a: Row): Promise<void> {
  const s = await isStale(a.id)
  if (!s.stale) return
  if (!a.staleAt) {
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'system' })
      await tx.assistantAction.updateMany({
        where: { id: a.id, staleAt: null },
        data: {
          staleAt: new Date(),
          staleReason: s.reason ?? 'The record changed since this was drafted.',
        },
      })
    })
  }
  throw new DecisionError(
    'stale',
    s.reason ?? 'The record changed since this was drafted. Redraft it.'
  )
}

/** A guardrail or level that now forbids the action (S05 interim resolver; S07 the full one). */
async function guardLevel(a: Row): Promise<void> {
  const req = requestOf(a)
  if (!req) return
  const data: ActionRequestedData = {
    ...req,
    enquiryId: req.enquiryId ?? null,
    mailboxId: req.mailboxId ?? null,
    idempotencyKey: a.idempotencyKey ?? `${a.actionKey}:${a.id}`,
    group: 'review',
    recordKey: `${req.subjectType}:${req.subjectId}`,
  }
  const r = await resolveRun(data)
  if (r.blocked === 'never' || r.blocked === 'off')
    throw new DecisionError(
      'blocked',
      r.reasons.at(-1) ?? 'This action is switched off in Autopilot.'
    )
}

export interface ApproveInput {
  actionId: string
  version: number
  optionValue?: string | undefined
  edits?: EmailEdit | undefined
}

export interface ApproveResult {
  state: $Enums.ActionState
  undoRemainingMs?: number
  outboundId?: string
}

export async function approve(
  input: ApproveInput,
  user: Decider,
  now = new Date()
): Promise<ApproveResult> {
  const a = await load(input.actionId)
  await guardOpen(a, input.version, user)
  await guardFresh(a)
  await guardLevel(a)

  const card = toProposalCardData(cardRow(a), user, now)
  if (card.invalid)
    throw new DecisionError('invalid', 'This proposal could not be read; redraft it.')
  let edits: EmailEdit | null = null
  let diff: Array<{ field: string; before: unknown; after: unknown }> = []
  if (input.edits) {
    if (!card.email) throw new DecisionError('invalid', 'This card has nothing to edit.')
    const parsed = emailEdit.safeParse(input.edits)
    if (!parsed.success) throw new DecisionError('invalid', 'Check the edited fields.')
    edits = parsed.data
    diff = emailDiff(card.email, edits)
  }
  const def = actionDefinition(a.actionKey)
  const option = input.optionValue
  const sends =
    !!def?.external && !!def.outbound && !!card.email && !(option && NO_SEND_OPTIONS.has(option))
  const decided: $Enums.ActionState = diff.length ? 'edited_approved' : 'approved'
  const effective: EmailEdit | null = diff.length
    ? { ...((a.effectivePayload as EmailEdit | null) ?? {}), ...edits }
    : null

  await opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'user', id: user.id })
    if (a.state === 'later')
      await tx.assistantAction.update({ where: { id: a.id }, data: { state: 'proposed' } })
    const moved = await tx.assistantAction.updateMany({
      where: { id: a.id, state: { in: ['proposed', 'later'] } },
      data: {
        state: decided,
        decidedById: user.id,
        decidedAt: now,
        chosenOption: option ?? null,
        ...(effective
          ? {
              effectivePayload: effective as Prisma.InputJsonValue,
              editDiff: {
                by: user.initials,
                at: now.toISOString(),
                fields: diff.map((d) => d.field),
                changes: diff,
              } as unknown as Prisma.InputJsonValue,
            }
          : {}),
      },
    })
    if (moved.count === 0) throw new DecisionError('not_open', 'This card was already decided.')
    if (diff.length) {
      await tx.preferenceSignal.create({
        data: {
          kind: 'edit',
          actionId: a.id,
          actionKey: a.actionKey,
          payload: {
            fields: diff.map((d) => d.field),
            changes: diff,
          } as unknown as Prisma.InputJsonValue,
          createdById: user.id,
        },
      })
    }
  })

  if (sends && def?.outbound && card.email) {
    const email = effective
      ? {
          to: effective.to ?? card.email.to,
          cc: effective.cc ?? card.email.cc,
          subject: effective.subject ?? card.email.subject,
          body: effective.body ?? card.email.body,
        }
      : { to: card.email.to, cc: card.email.cc, subject: card.email.subject, body: card.email.body }
    try {
      const req = requestOf(a)
      if (!req) throw new Error('The proposal has no request to rebuild its envelope from')
      const { input: gathered } = await def.gather({ request: req })
      const draft = def.outbound(verifiedOf(a), gathered)
      if (!draft) throw new Error('Nothing to send for this choice')
      const html =
        !effective?.body && card.email.html
          ? card.email.html
          : (textToSanitizedHtml(email.body) as string)
      const envelope = await resolveSendEnvelope('other', { mailboxId: draft.mailboxId })
      if (!envelope.ok) throw new Error(envelope.message)
      const scheduled = await scheduleSend({
        ...draft,
        to: email.to,
        cc: email.cc,
        subject: email.subject,
        bodyHtml: html,
        bodyText: email.body,
        fromAlias: envelope.envelope.fromAlias,
        idempotencyKey: `${a.id}:${a.version}`,
        approvedById: user.id,
        createdById: user.id,
        actionId: a.id,
        basisHash: a.basisHash,
      })
      await opsDb.$transaction(async (tx) => {
        await setActor(tx, { kind: 'user', id: user.id })
        await tx.assistantAction.updateMany({
          where: { id: a.id, state: decided },
          data: {
            state: 'queued',
            undoUntil: scheduled.undoUntil ? new Date(scheduled.undoUntil) : null,
          },
        })
      })
      await afterDecision(a)
      return {
        state: 'queued',
        undoRemainingMs: scheduled.undoRemainingMs,
        outboundId: scheduled.outboundId,
      }
    } catch (e) {
      const reason = e instanceof Error ? e.message.slice(0, 300) : 'The send could not be queued'
      await opsDb.$transaction(async (tx) => {
        await setActor(tx, { kind: 'user', id: user.id })
        await tx.assistantAction.updateMany({
          where: { id: a.id, state: decided },
          data: { state: 'running' },
        })
        await tx.assistantAction.updateMany({
          where: { id: a.id, state: 'running' },
          data: { state: 'failed', failureReason: reason },
        })
      })
      await afterDecision(a)
      throw new DecisionError('send_failed', `The email was not queued: ${reason}`)
    }
  }

  // Internal effect (or a choice that sends nothing): run it now.
  await opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'user', id: user.id })
    await tx.assistantAction.updateMany({
      where: { id: a.id, state: decided },
      data: { state: 'running' },
    })
  })
  const out = await effectRun(a.id, now)
  // The effect's follow-ups (labels, a requested action) go out after its transaction, as the runner does.
  for (const e of out.emit ?? []) {
    await emitEvent({ name: e.name, ...(e.id ? { id: e.id } : {}), data: e.data })
  }
  const row = await opsDb.assistantAction.findUnique({
    where: { id: a.id },
    select: { state: true, undoUntil: true },
  })
  await afterDecision(a)
  if (out.state === 'failed')
    throw new DecisionError('send_failed', out.failureReason ?? 'It did not work.')
  const undoRemainingMs = row?.undoUntil ? Math.max(0, row.undoUntil.getTime() - now.getTime()) : 0
  return { state: row?.state ?? 'done', ...(undoRemainingMs ? { undoRemainingMs } : {}) }
}

export const REJECT_CHIPS = [
  'wrong-supplier',
  'wrong-price',
  'wrong-client',
  'not-needed',
  'other',
] as const

export async function reject(
  input: {
    actionId: string
    version: number
    chip?: string | undefined
    reason: string
    redraft: boolean
  },
  user: Decider,
  now = new Date()
): Promise<{ redraftRequested: boolean }> {
  const reason = input.reason.trim()
  if (!reason || reason.length > 200)
    throw new DecisionError('invalid', 'Say in one line why (up to 200 characters).')
  const a = await load(input.actionId)
  await guardOpen(a, input.version, user)
  await opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'user', id: user.id })
    if (a.state === 'later')
      await tx.assistantAction.update({ where: { id: a.id }, data: { state: 'proposed' } })
    await tx.assistantAction.update({
      where: { id: a.id },
      data: {
        state: 'rejected',
        rejectReason: reason,
        chosenOption: input.chip ?? null,
        decidedById: user.id,
        decidedAt: now,
      },
    })
    await tx.preferenceSignal.create({
      data: {
        kind: 'reject',
        actionId: a.id,
        actionKey: a.actionKey,
        payload: {
          chip: input.chip ?? null,
          reason,
          redraft: input.redraft,
        } as Prisma.InputJsonValue,
        createdById: user.id,
      },
    })
  })
  let redraftRequested = false
  const req = requestOf(a)
  if (input.redraft && req) {
    redraftRequested = await requestActionQuietly({
      ...req,
      trigger: 'redraft',
      origin: 'manual',
      sourceVersion: `redraft:${a.id}`,
      redraftOfId: a.id,
      hint: reason,
    })
  }
  await afterDecision(a)
  return { redraftRequested }
}

export type LaterPreset = 'in-1h' | 'tomorrow-0900' | 'monday-0900'

function dubaiParts(d: Date): { year: number; month: number; day: number; weekday: number } {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(d)
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? ''
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return {
    year: Number(g('year')),
    month: Number(g('month')),
    day: Number(g('day')),
    weekday: days.indexOf(g('weekday')),
  }
}

/** 09:00 Dubai on a calendar day, as an instant (GST is UTC+4, no daylight saving). */
function nineAm(day: { year: number; month: number; day: number }): Date {
  return new Date(Date.UTC(day.year, day.month - 1, day.day, 5, 0, 0))
}

/** When Later brings the card back: tomorrow and Monday on the UAE working calendar (09:00 GST). */
export async function laterUntil(until: LaterPreset | string, now = new Date()): Promise<Date> {
  if (until === 'in-1h') return new Date(now.getTime() + 3_600_000)
  if (until === 'tomorrow-0900' || until === 'monday-0900') {
    const today = dubaiParts(now)
    const add = (n: number) => {
      const d = new Date(Date.UTC(today.year, today.month - 1, today.day + n))
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
    }
    const start = until === 'tomorrow-0900' ? add(1) : add((1 - today.weekday + 7) % 7 || 7)
    const [holidays, weekends] = await Promise.all([
      holidaysFor(['AE'], now, 30),
      getSetting('calendar.country_weekends'),
    ])
    return nineAm(nextWorkingDay(start, 'AE', holidays, weekends))
  }
  const at = new Date(until)
  if (Number.isNaN(at.getTime()) || at.getTime() <= now.getTime())
    throw new DecisionError('invalid', 'Pick a time in the future.')
  return at
}

export async function later(
  input: { actionId: string; version: number; until: LaterPreset | string },
  user: Decider,
  now = new Date()
): Promise<{ laterUntil: string }> {
  const a = await load(input.actionId)
  await guardOpen(a, input.version, user)
  const at = await laterUntil(input.until, now)
  await opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'user', id: user.id })
    if (a.state === 'later') {
      await tx.assistantAction.update({ where: { id: a.id }, data: { laterUntil: at } })
    } else {
      await tx.assistantAction.update({
        where: { id: a.id },
        data: { state: 'later', laterUntil: at },
      })
    }
  })
  await bumpReview()
  return { laterUntil: at.toISOString() }
}

/** A stale card: cancelled, and a fresh draft requested for the same subject (supersededById set by the runner). */
export async function redraft(
  input: { actionId: string },
  user: Decider
): Promise<{ requested: boolean }> {
  const a = await load(input.actionId)
  if (!OPEN.includes(a.state)) throw new DecisionError('not_open', 'This card was already decided.')
  const denied = await permission(a, user)
  if (denied) throw new DecisionError('forbidden', denied)
  const req = requestOf(a)
  if (!req)
    throw new DecisionError('invalid', 'This card cannot be redrafted; write a new reply instead.')
  await opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'user', id: user.id })
    if (a.state === 'later')
      await tx.assistantAction.update({ where: { id: a.id }, data: { state: 'proposed' } })
    await tx.assistantAction.update({
      where: { id: a.id },
      data: { state: 'cancelled', decidedById: user.id, decidedAt: new Date() },
    })
  })
  const requested = await requestActionQuietly({
    ...req,
    trigger: 'redraft',
    origin: 'manual',
    sourceVersion: `redraft:${a.id}`,
    redraftOfId: a.id,
  })
  await afterDecision(a)
  return { requested }
}

/** Batch approve (BatchBar): only batchable actions, never a locked one; each item decided on its own. */
export async function batchApprove(
  items: Array<{ actionId: string; version: number }>,
  user: Decider
): Promise<Array<{ actionId: string; ok: boolean; error?: string }>> {
  const out: Array<{ actionId: string; ok: boolean; error?: string }> = []
  for (const it of items) {
    try {
      const a = await load(it.actionId)
      const def = actionDefinition(a.actionKey)
      if (!def?.batchable || a.def.lockedLevel !== null)
        throw new DecisionError('forbidden', 'This card is decided one at a time.')
      await approve({ actionId: it.actionId, version: it.version }, user)
      out.push({ actionId: it.actionId, ok: true })
    } catch (e) {
      out.push({
        actionId: it.actionId,
        ok: false,
        error: e instanceof Error ? e.message : 'Failed',
      })
    }
  }
  return out
}

/**
 * Undo an approval inside its window (the receipt's Undo): a queued email is cancelled (nothing was sent) and
 * the card comes back as it was, the person's edit kept. Returns the returned card's ref.
 */
export async function undoApproval(
  input: { actionId: string },
  user: Decider,
  now = new Date()
): Promise<{ ref: string }> {
  const a = await load(input.actionId)
  if (a.state !== 'queued') throw new DecisionError('too_late', 'Too late to undo this here.')
  const outbound = await opsDb.outboundEmail.findFirst({
    where: { actionId: a.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  if (!outbound) throw new DecisionError('too_late', 'Nothing queued to undo.')
  if (!(await mayUndo(outbound.id, user)))
    throw new DecisionError('forbidden', 'You cannot undo this send.')
  const res = await undoSend(outbound.id, { now: () => now })
  if (!res.success) throw new DecisionError('too_late', res.error)
  const ref = await opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'user', id: user.id })
    await tx.assistantAction.update({ where: { id: a.id }, data: { state: 'undone' } })
    // S06-T07: give back what the approval consumed (a number allocated at approval: S17's quotation).
    await releaseOnUndo(tx, a)
    return cloneAsProposed(tx, a, { retryOfId: a.id }, now)
  })
  await bumpReview()
  return { ref }
}

function dubaiDayKey(now: Date): string {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '00'
  return `${g('year')}-${g('month')}-${g('day')}`
}

/** The same proposal as a new card (its own ref), with any edit kept. */
export async function cloneAsProposed(
  tx: Prisma.TransactionClient,
  a: Row,
  extra: { retryOfId?: string; redraftOfId?: string },
  now = new Date()
): Promise<string> {
  const [num] = await tx.$queryRaw<Array<{ formatted: string }>>`
    SELECT formatted FROM ops.allocate_number('assistant_action', ${dubaiDayKey(now)})`
  if (!num) throw new Error('allocate_number returned no row')
  const j = (v: unknown) => (v === null ? Prisma.DbNull : (v as Prisma.InputJsonValue))
  await tx.assistantAction.create({
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
      preview: j(a.preview),
      checks: j(a.checks),
      confidence: a.confidence,
      unsureAbout: a.unsureAbout,
      onApproveText: a.onApproveText,
      options: j(a.options),
      inputs: j(a.inputs),
      output: j(a.output),
      effectivePayload: j(a.effectivePayload),
      editDiff: j(a.editDiff),
      state: 'proposed',
      basisHash: a.basisHash,
      origin: a.origin,
      model: a.model,
      promptVersion: a.promptVersion,
      levelReasons: j(a.levelReasons),
      surface: a.surface,
      ...extra,
    },
  })
  return num.formatted
}

/**
 * The send queue's outcome on the action that queued it (from ops.mail.send): sent → done; failed → failed
 * (S06-T03 shows "Send failed"); stopped stale → cancelled (the card is redrafted); cancelled by Undo is
 * handled by undoApproval.
 */
export async function settleActionForOutbound(
  outboundId: string,
  now = new Date()
): Promise<string | null> {
  const o = await opsDb.outboundEmail.findUnique({
    where: { id: outboundId },
    select: { actionId: true, status: true, failureReason: true },
  })
  if (!o) return null
  if (!o.actionId) {
    // A send with no card of its own (an Owner's reply, a test send) that went wrong gets one (S06-T03).
    if (o.status === 'failed' || o.status === 'unknown') {
      const { createOutboundAttention } = await import('./attention')
      await createOutboundAttention(outboundId, now)
    }
    return null
  }
  return opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'system' })
    const a = await tx.assistantAction.findUnique({
      where: { id: o.actionId! },
      select: { state: true, correctionOfId: true },
    })
    if (!a || a.state !== 'queued') return a?.state ?? null
    if (o.status === 'sent') {
      await tx.assistantAction.update({ where: { id: o.actionId! }, data: { state: 'running' } })
      await tx.assistantAction.update({
        where: { id: o.actionId! },
        data: { state: 'done', doneAt: now },
      })
      // S06-T07: a correction that went out marks the action it corrects.
      if (a.correctionOfId) {
        await tx.assistantAction.updateMany({
          where: { id: a.correctionOfId, state: 'done' },
          data: { state: 'corrected' },
        })
      }
      return 'done'
    }
    if (o.status === 'failed') {
      if (a.state === 'queued')
        await tx.assistantAction.update({ where: { id: o.actionId! }, data: { state: 'running' } })
      await tx.assistantAction.update({
        where: { id: o.actionId! },
        data: { state: 'failed', failureReason: o.failureReason ?? 'The send failed' },
      })
      return 'failed'
    }
    if (o.status === 'superseded' && a.state === 'queued') {
      await tx.assistantAction.update({
        where: { id: o.actionId! },
        data: { state: 'cancelled', staleReason: 'Stopped before sending: the record changed.' },
      })
      return 'cancelled'
    }
    return a.state
  })
}

// ── Saved edits and the version conflict (S06-T03, board 110 "Changed by Ayush while you were reviewing") ──

/** The activity field that keeps every saved version of a proposal's email (both people's). */
export const DRAFT_EDIT_FIELD = 'draft_edit'

/** One saved version, as the activity row stores it (before and after). */
export interface DraftVersion {
  version: number
  payload: EmailEdit
  fields?: string[]
  kept?: boolean
}

/** A stored draft version (activity before/after), or null when the row holds something else. */
export function draftVersionOf(v: unknown): DraftVersion | null {
  if (!v || typeof v !== 'object') return null
  const d = v as Partial<DraftVersion>
  return typeof d.version === 'number'
    ? { ...d, version: d.version, payload: d.payload ?? {} }
    : null
}

/** Who may change a draft without approving it: anyone who may see the card, except on locked or money cards. */
function editDenied(a: Row, user: Decider): string | null {
  if (a.surface !== 'review') return 'This is not a Review card.'
  if (user.role === 'owner') return null
  if (a.def.lockedLevel !== null || a.def.group === 'money') return 'Only the Owner changes this.'
  return null
}

async function recordDraftVersion(
  tx: Prisma.TransactionClient,
  a: Row,
  user: Decider,
  before: DraftVersion,
  after: DraftVersion,
  note: string
): Promise<void> {
  const state = a.state
  await tx.assistantActionEvent.create({
    data: {
      actionId: a.id,
      fromState: state,
      toState: state,
      actorKind: 'user',
      actorId: user.id,
      note,
    },
  })
  if (a.subjectType && a.subjectId) {
    await tx.activityEvent.create({
      data: {
        actorKind: 'user',
        actorId: user.id,
        actionId: a.id,
        enquiryId: a.enquiryId,
        subjectType: a.subjectType,
        subjectId: a.subjectId,
        kind: 'other',
        field: DRAFT_EDIT_FIELD,
        before: before as unknown as Prisma.InputJsonValue,
        after: after as unknown as Prisma.InputJsonValue,
        note,
      },
    })
  }
}

/**
 * Save an edit without approving it (board 103 "Diff is kept on save"): the person's version goes to
 * effectivePayload and the card's version moves on, so anyone approving the version they opened is refused
 * with 'changed' and sees the conflict panel. Both versions are kept in the activity trail.
 */
export async function saveEdits(
  input: { actionId: string; version: number; edits: EmailEdit },
  user: Decider,
  now = new Date()
): Promise<{ version: number; fields: string[] }> {
  const a = await load(input.actionId)
  if (!OPEN.includes(a.state)) throw new DecisionError('not_open', 'This card was already decided.')
  if (a.version !== input.version)
    throw new DecisionError('changed', 'This card changed since you opened it. Look again.')
  const denied = editDenied(a, user)
  if (denied) throw new DecisionError('forbidden', denied)
  const card = toProposalCardData(cardRow(a), user, now)
  if (!card.email || card.invalid)
    throw new DecisionError('invalid', 'This card has nothing to edit.')
  const parsed = emailEdit.safeParse(input.edits)
  if (!parsed.success) throw new DecisionError('invalid', 'Check the edited fields.')
  const diff = emailDiff(card.email, parsed.data)
  if (!diff.length) return { version: a.version, fields: [] }
  const was = (a.effectivePayload as EmailEdit | null) ?? {}
  const next: EmailEdit = { ...was, ...parsed.data }
  const fields = diff.map((d) => d.field)
  const version = await opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'user', id: user.id })
    const moved = await tx.assistantAction.updateMany({
      where: { id: a.id, version: a.version, state: { in: [...OPEN] } },
      data: {
        effectivePayload: next as Prisma.InputJsonValue,
        editDiff: {
          by: user.initials,
          at: now.toISOString(),
          fields,
          changes: diff,
        } as unknown as Prisma.InputJsonValue,
      },
    })
    if (moved.count === 0)
      throw new DecisionError('changed', 'This card changed since you opened it. Look again.')
    const v = (
      await tx.assistantAction.findUniqueOrThrow({ where: { id: a.id }, select: { version: true } })
    ).version
    await recordDraftVersion(
      tx,
      a,
      user,
      { version: a.version, payload: was },
      { version: v, payload: next, fields },
      `Edited by ${user.initials}: ${fields.join(', ')}`
    )
    return v
  })
  await bumpReview()
  return { version, fields }
}

/**
 * "Keep mine and tell <them>": put the draft back to the version this person opened (`seen`), keep the other
 * version in the trail, and tell whoever changed it. The card's version moves on again, so it is approvable
 * from the page that follows (Approve stayed off until a choice was made).
 */
export async function keepMyVersion(
  input: { actionId: string; version: number; seen: number },
  user: Decider,
  now = new Date()
): Promise<{ version: number; told: string[] }> {
  const a = await load(input.actionId)
  if (!OPEN.includes(a.state)) throw new DecisionError('not_open', 'This card was already decided.')
  if (a.version !== input.version)
    throw new DecisionError('changed', 'This card changed again. Look again.')
  const denied = editDenied(a, user)
  if (denied) throw new DecisionError('forbidden', denied)
  const edits = await opsDb.activityEvent.findMany({
    where: { actionId: a.id, field: DRAFT_EDIT_FIELD },
    orderBy: [{ at: 'asc' }, { id: 'asc' }],
    select: { actorId: true, before: true },
  })
  const theirs = edits.filter((e) => {
    const b = draftVersionOf(e.before)
    return !!b && b.version >= input.seen && e.actorId !== user.id
  })
  const first = theirs[0]
  if (!first) throw new DecisionError('invalid', 'Nobody else changed this card.')
  const restore = draftVersionOf(first.before)?.payload ?? {}
  const current = (a.effectivePayload as EmailEdit | null) ?? {}
  const empty = Object.keys(restore).length === 0
  const others = [...new Set(theirs.map((e) => e.actorId).filter((x): x is string => !!x))]
  const names = await opsDb.user.findMany({
    where: { id: { in: others } },
    select: { id: true, initials: true },
  })
  const theirInitials = names.map((n) => n.initials).join(', ') || 'the other person'
  const version = await opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'user', id: user.id })
    const moved = await tx.assistantAction.updateMany({
      where: { id: a.id, version: a.version, state: { in: [...OPEN] } },
      data: {
        effectivePayload: empty ? Prisma.DbNull : (restore as Prisma.InputJsonValue),
        editDiff: empty
          ? Prisma.DbNull
          : ({
              by: user.initials,
              at: now.toISOString(),
              fields: Object.keys(restore),
              keptOver: theirInitials,
            } as unknown as Prisma.InputJsonValue),
      },
    })
    if (moved.count === 0)
      throw new DecisionError('changed', 'This card changed again. Look again.')
    const v = (
      await tx.assistantAction.findUniqueOrThrow({ where: { id: a.id }, select: { version: true } })
    ).version
    await recordDraftVersion(
      tx,
      a,
      user,
      { version: a.version, payload: current },
      { version: v, payload: restore, fields: Object.keys(restore), kept: true },
      `${user.initials} kept their version over ${theirInitials}'s edit`
    )
    return v
  })
  await raiseNotification({
    event: 'other',
    severity: 'info',
    title: `${user.initials} kept their version of “${a.headline}”`,
    body: 'Your edit is kept in the Assistant log; the card goes out as they had it.',
    dedupeKey: `draft-kept:${a.id}:${version}`,
    actionUrl: `/review?card=${a.ref}`,
    ...(a.subjectType && a.subjectId ? { subjectType: a.subjectType, subjectId: a.subjectId } : {}),
    ...(a.enquiryId ? { enquiryId: a.enquiryId } : {}),
    audience: others,
  })
  return { version, told: names.map((n) => n.initials) }
}
