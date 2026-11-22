import 'server-only'
import type { $Enums, Prisma } from '@indus/ops-db'

/**
 * Audit rows for person-made changes (ADR-09): one `ops.activity_event` per entry, actor kind
 * `user`. `defineAction({ audit })` writes them in the same transaction as the handler's own
 * writes, so a change and its record commit or roll back together. Assistant changes do not come
 * through here: they use `writeTracked()` with an `actionId` (S06).
 *
 * `activity_event` is append-only (no UPDATE or DELETE for ops_app, trigger-guarded): an entry,
 * once committed, is permanent. Never put a secret, a token or mail content in `before`/`after`.
 */
export type AuditEntry = {
  subjectType: $Enums.RecordType
  subjectId: string
  kind: $Enums.ActivityKind
  /** The field that changed, when the entry is about one field. */
  field?: string
  before?: Prisma.InputJsonValue
  after?: Prisma.InputJsonValue
  note?: string
  /** Hidden from a Helper without canSeeMargins (margin, cost, sell). */
  sensitive?: boolean
  /** The deal space the subject belongs to, so the cockpit history finds it. */
  enquiryId?: string
  /** The Assistant action this decision belongs to (approve / reject of a proposal). */
  actionId?: string
}

/** The one client method an audit write needs: a transaction client or the root client. */
export type AuditClient = {
  activityEvent: Pick<Prisma.TransactionClient['activityEvent'], 'createMany'>
}

/** Normalise what an `audit` callback returned into rows. */
export function auditRows(
  actorId: string,
  entries: AuditEntry | readonly AuditEntry[] | null | undefined
): Prisma.ActivityEventCreateManyInput[] {
  const list: readonly AuditEntry[] =
    entries == null ? [] : Array.isArray(entries) ? entries : [entries as AuditEntry]
  return list.map((e) => ({
    actorKind: 'user',
    actorId,
    subjectType: e.subjectType,
    subjectId: e.subjectId,
    kind: e.kind,
    field: e.field ?? null,
    note: e.note ?? null,
    sensitive: e.sensitive ?? false,
    enquiryId: e.enquiryId ?? null,
    actionId: e.actionId ?? null,
    ...(e.before === undefined ? {} : { before: e.before }),
    ...(e.after === undefined ? {} : { after: e.after }),
  }))
}

/** Write the entries as activity events by `actorId` on `db` (pass the action's transaction). */
export async function writeAudit(
  db: AuditClient,
  actorId: string,
  entries: AuditEntry | readonly AuditEntry[] | null | undefined
): Promise<number> {
  const rows = auditRows(actorId, entries)
  if (rows.length === 0) return 0
  const { count } = await db.activityEvent.createMany({ data: rows })
  return count
}
