import 'server-only'
import { Prisma, type $Enums } from '@indus/ops-db'

/**
 * Tracked writes (S05-T02, apps/ops/CLAUDE.md §6.7): every Assistant mutation of business data runs inside
 * `writeTracked`, which performs the change (`apply`) and records one `activity_event` per changed field with
 * its before and after, the actor and the action. The log, Why? and undo read these rows; nothing the
 * Assistant changes is invisible.
 *
 * `writeTracked.guard.test.ts` fails the build when a module under server/assistant/actions mutates a model
 * outside a writeTracked callback.
 */
export interface TrackedChange {
  field: string
  before: unknown
  after: unknown
  kind: $Enums.ActivityKind
  /** Hidden from a Helper without canSeeMargins (cost, margin, sell). */
  sensitive?: boolean
}

export interface TrackedWrite {
  actor: { kind: $Enums.ActorKind; id?: string | null }
  actionId?: string | null
  enquiryId?: string | null
  subjectType: $Enums.RecordType
  subjectId: string
  changes: TrackedChange[]
  note?: string | null
}

function json(v: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return v === undefined || v === null ? Prisma.DbNull : (v as Prisma.InputJsonValue)
}

/** Sets the session actor the assistant_action trigger reads for event rows, for this transaction only. */
export async function setActor(
  tx: Prisma.TransactionClient,
  actor: { kind: $Enums.ActorKind; id?: string | null }
): Promise<void> {
  await tx.$executeRaw`SELECT set_config('ops.actor_kind', ${actor.kind}, true), set_config('ops.actor_id', ${actor.id ?? ''}, true)`
}

/**
 * Runs `apply` (the mutation), then records the changes. Unchanged fields (before === after by JSON) are not
 * recorded; a write with no real change records nothing.
 */
export async function writeTracked<T>(
  tx: Prisma.TransactionClient,
  write: TrackedWrite,
  apply: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  const result = await apply(tx)
  const changed = write.changes.filter((c) => JSON.stringify(c.before) !== JSON.stringify(c.after))
  if (changed.length > 0) {
    await tx.activityEvent.createMany({
      data: changed.map((c) => ({
        actorKind: write.actor.kind,
        actorId: write.actor.id ?? null,
        actionId: write.actionId ?? null,
        enquiryId: write.enquiryId ?? null,
        subjectType: write.subjectType,
        subjectId: write.subjectId,
        kind: c.kind,
        field: c.field,
        before: json(c.before),
        after: json(c.after),
        note: write.note ?? null,
        sensitive: c.sensitive ?? false,
      })),
    })
  }
  return result
}
