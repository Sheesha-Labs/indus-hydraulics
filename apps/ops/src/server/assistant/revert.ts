import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { SENDS_EXTERNALLY } from '@indus/ops-core'
import { fieldLabel } from '../../data/history'
import { allocateActionRef } from './action-number'
import { fieldWriter } from './field-writers'
import { definitionOf } from './runner'
import { releaseOnUndo } from './undo-hooks'
import { setActor, writeTracked } from './write-tracked'

/**
 * Putting an Assistant change back (S06-T07, ADR-11). Nothing is deleted: every reversal is a new
 * activity row with `revertsEventId` pointing at the change it reverses, so History keeps the Assistant's
 * version and shows the person's.
 *
 *   undoInternal  inside the action's undo window: its changes go back, done → undone ("Undone by KB").
 *   revertEvent   later, from a History row: a `revert_change` action decided by the person writes the
 *                 before values back ("Reverted by KB") and the original done → reverted.
 *
 * Only internal actions: anything that emailed someone outside cannot be taken back; it gets a correction.
 */
export class RevertError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RevertError'
  }
}

export interface Actor {
  id: string
  initials: string
}

export interface RevertEvent {
  name: `ops/${string}`
  data: Record<string, string | number | boolean | null>
}

const EXTERNAL = new Set<string>(SENDS_EXTERNALLY)

async function reverseChanges(
  tx: Prisma.TransactionClient,
  actionId: string,
  actor: Actor,
  note: string,
  newActionId: string | null
): Promise<RevertEvent[]> {
  const events = await tx.activityEvent.findMany({
    where: { actionId, actorKind: 'assistant' },
    orderBy: [{ at: 'desc' }, { id: 'desc' }],
  })
  const reversed = new Set(
    (
      await tx.activityEvent.findMany({
        where: { revertsEventId: { in: events.map((e) => e.id) } },
        select: { revertsEventId: true },
      })
    ).map((r) => r.revertsEventId)
  )
  const todo = events.filter((e) => !reversed.has(e.id))
  if (todo.length === 0) throw new RevertError('Nothing is left to put back.')
  for (const e of todo) {
    if (!fieldWriter(e.subjectType, e.field)) {
      throw new RevertError(
        `${fieldLabel(e.field)} can’t be put back from here; correct it from Why?`
      )
    }
  }
  const subjects = new Map<string, typeof todo>()
  for (const e of todo) {
    const k = `${e.subjectType}:${e.subjectId}`
    subjects.set(k, [...(subjects.get(k) ?? []), e])
  }
  const out: RevertEvent[] = []
  for (const rows of subjects.values()) {
    const first = rows[0]!
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: actor.id },
        actionId: newActionId,
        enquiryId: first.enquiryId,
        subjectType: first.subjectType,
        subjectId: first.subjectId,
        changes: rows.map((e) => ({
          field: e.field ?? 'value',
          before: e.after,
          after: e.before,
          kind: e.kind,
          sensitive: e.sensitive,
          revertsEventId: e.id,
        })),
        note,
      },
      async (t) => {
        for (const e of rows) {
          await fieldWriter(e.subjectType, e.field)!(t, e.subjectId, {
            to: e.before,
            from: e.after,
          })
        }
      }
    )
    if (first.subjectType === 'mail_message') {
      out.push({ name: 'ops/review.changed', data: { messageId: first.subjectId } })
    }
  }
  return out
}

const ACTION_SELECT = {
  id: true,
  ref: true,
  actionKey: true,
  state: true,
  undoUntil: true,
  output: true,
  enquiryId: true,
  subjectType: true,
  subjectId: true,
} as const

/** Undo an internal action inside its window. */
export async function undoInternal(
  actionId: string,
  actor: Actor,
  now = new Date()
): Promise<{ ref: string; events: RevertEvent[] }> {
  return opsDb.$transaction(async (tx) => {
    const a = await tx.assistantAction.findUnique({
      where: { id: actionId },
      select: ACTION_SELECT,
    })
    if (!a) throw new RevertError('That action is no longer here.')
    if (EXTERNAL.has(a.actionKey)) throw new RevertError('An email that left cannot be undone.')
    if (a.state !== 'done' || !a.undoUntil || a.undoUntil <= now) {
      throw new RevertError('Too late to undo; revert it from History instead.')
    }
    await setActor(tx, { kind: 'user', id: actor.id })
    const events = await reverseChanges(tx, a.id, actor, `Undone by ${actor.initials}`, null)
    const def = definitionOf(a.actionKey)
    if (def.undo) await def.undo(tx, { id: a.id, output: a.output as never })
    await releaseOnUndo(tx, a)
    await tx.assistantAction.update({ where: { id: a.id }, data: { state: 'undone' } })
    return { ref: a.ref, events }
  })
}

/** "Revert to before Assistant change" on a History row: the whole action's changes go back. */
export async function revertEvent(
  eventId: string,
  actor: Actor,
  now = new Date()
): Promise<{ ref: string; events: RevertEvent[] }> {
  return opsDb.$transaction(async (tx) => {
    const ev = await tx.activityEvent.findUnique({
      where: { id: eventId },
      select: { actorKind: true, actionId: true },
    })
    if (!ev || ev.actorKind !== 'assistant' || !ev.actionId) {
      throw new RevertError('Only a change the Assistant made can be reverted here.')
    }
    const a = await tx.assistantAction.findUnique({
      where: { id: ev.actionId },
      select: ACTION_SELECT,
    })
    if (!a) throw new RevertError('That action is no longer here.')
    if (EXTERNAL.has(a.actionKey)) {
      throw new RevertError('That change went out by email; send a correction instead.')
    }
    if (a.state !== 'done') throw new RevertError('This change was already undone or reverted.')
    await setActor(tx, { kind: 'user', id: actor.id })
    const ref = await allocateActionRef(tx, now)
    const row = await tx.assistantAction.create({
      data: {
        ref,
        actionKey: 'revert_change',
        levelAtTime: 'draft_and_ask',
        guardrails: [],
        enquiryId: a.enquiryId,
        subjectType: a.subjectType,
        subjectId: a.subjectId,
        headline: `Reverted by ${actor.initials}: ${a.ref}`,
        reasons: [{ text: `Put back the values from before ${a.ref}` }] as Prisma.InputJsonValue,
        checks: [] as Prisma.InputJsonValue,
        confidence: 'sure',
        state: 'done',
        decidedById: actor.id,
        decidedAt: now,
        doneAt: now,
        revertOfId: a.id,
        surface: 'review',
        origin: 'manual',
        idempotencyKey: `revert_change:${a.id}`,
      },
      select: { id: true },
    })
    const events = await reverseChanges(tx, a.id, actor, `Reverted by ${actor.initials}`, row.id)
    await tx.assistantAction.update({ where: { id: a.id }, data: { state: 'reverted' } })
    return { ref, events }
  })
}
