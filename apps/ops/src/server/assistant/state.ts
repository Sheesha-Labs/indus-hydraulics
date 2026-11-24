import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { emitEvent } from '../../inngest/emit'
import { settingSubjectId } from '../settings/subject-id'

/**
 * "Pause everything" (S05-T02, boards 98 and 102, 08-map-integrations §1.10). One row, `ops.assistant_state`
 * (id = 1). Every Inngest function reads it through defineOpsFunction's pause behaviour, the send gate holds
 * queued sends while it is set, and the runner waits for `ops/assistant.resumed`.
 *
 * Reads are cached for 15 seconds per process: a pause reaches every function within that, and the send gate
 * re-reads it in its own step right before claiming a send. Pausing and resuming clear this process's cache.
 */
export type PauseState = { pausedAt: string; pausedById: string | null; note: string | null } | null

const TTL_MS = 15_000
let cached: { at: number; state: PauseState } | null = null

/** Test seam. */
export function resetPauseCache(): void {
  cached = null
}

export async function assistantPauseState(): Promise<PauseState> {
  const now = Date.now()
  if (cached && now - cached.at < TTL_MS) return cached.state
  const row = await opsDb.assistantState.findUnique({
    where: { id: 1 },
    select: { pausedAt: true, pausedById: true, pauseNote: true },
  })
  const state: PauseState = row?.pausedAt
    ? { pausedAt: row.pausedAt.toISOString(), pausedById: row.pausedById, note: row.pauseNote }
    : null
  cached = { at: now, state }
  return state
}

export async function isAssistantPaused(): Promise<boolean> {
  return (await assistantPauseState()) !== null
}

const SUBJECT = settingSubjectId('assistant.paused')

async function audit(
  tx: Prisma.TransactionClient,
  userId: string,
  before: unknown,
  after: unknown,
  note: string
): Promise<void> {
  await tx.activityEvent.create({
    data: {
      actorKind: 'user',
      actorId: userId,
      subjectType: 'settings',
      subjectId: SUBJECT,
      kind: 'settings',
      field: 'assistant.paused',
      before: before as Prisma.InputJsonValue,
      after: after as Prisma.InputJsonValue,
      note,
    },
  })
}

/**
 * Pause the Assistant. Idempotent: pausing while paused changes nothing and returns the existing pause.
 * Owner-only is enforced by the calling action (S05-T08).
 */
export async function pauseAssistant(
  userId: string,
  note?: string | null
): Promise<{ pausedAt: Date; changed: boolean }> {
  const out = await opsDb.$transaction(async (tx) => {
    const now = new Date()
    const updated = await tx.assistantState.updateMany({
      where: { id: 1, pausedAt: null },
      data: {
        pausedAt: now,
        pausedById: userId,
        pauseNote: note?.trim() || null,
        version: { increment: 1 },
        updatedAt: now,
      },
    })
    if (updated.count === 0) {
      const row = await tx.assistantState.findUniqueOrThrow({
        where: { id: 1 },
        select: { pausedAt: true },
      })
      return { pausedAt: row.pausedAt ?? now, changed: false }
    }
    await audit(tx, userId, null, { pausedAt: now.toISOString() }, 'Assistant paused')
    return { pausedAt: now, changed: true }
  })
  cached = null
  if (out.changed) {
    await emitEvent({
      name: 'ops/assistant.paused',
      data: { at: out.pausedAt.toISOString(), byId: userId },
    })
  }
  return out
}

/**
 * Resume. Idempotent. Emits `ops/assistant.resumed` (event id per resume), which releases every run waiting
 * in defineOpsFunction's `wait` behaviour and the runner's paused step; the send gate re-gates held sends.
 */
export async function resumeAssistant(
  userId: string
): Promise<{ resumedAt: Date; changed: boolean }> {
  const out = await opsDb.$transaction(async (tx) => {
    const now = new Date()
    const before = await tx.assistantState.findUniqueOrThrow({
      where: { id: 1 },
      select: { pausedAt: true, version: true },
    })
    if (!before.pausedAt) return { resumedAt: now, changed: false, version: before.version }
    await tx.assistantState.update({
      where: { id: 1 },
      data: {
        pausedAt: null,
        pausedById: null,
        pauseNote: null,
        resumedAt: now,
        resumedById: userId,
        version: { increment: 1 },
        updatedAt: now,
      },
    })
    await audit(tx, userId, { pausedAt: before.pausedAt.toISOString() }, null, 'Assistant resumed')
    return { resumedAt: now, changed: true, version: before.version + 1 }
  })
  cached = null
  if (out.changed) {
    await emitEvent({
      name: 'ops/assistant.resumed',
      id: `assistant-resumed-${out.version}`,
      data: { at: out.resumedAt.toISOString(), byId: userId },
    })
  }
  return { resumedAt: out.resumedAt, changed: out.changed }
}
