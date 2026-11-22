import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { unstable_rethrow } from 'next/navigation'
import type { z } from 'zod'
import { err, type FieldErrors, type Result } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { can, requireOpsUser, type HelperFlag, type OpsRole, type OpsUser } from './access'
import { writeAudit, type AuditEntry } from './audit'
import { env } from './env'
import { newRequestId } from './request-id'
import { SAFE_MESSAGES, SafeError, isExpectedRefusal, safeMessage } from './safe-message'

/**
 * The one wrapper every Ops mutation goes through (05-map-frontend §7.2, architecture §4.2,
 * §4.9, §4.10, ADR-09; CLAUDE.md §3 and §6):
 *
 *   1. who: `requireOpsUser(roles)` from the SESSION, never a role or flag from input;
 *      then each of `flags` with `can(user, flag)` (the Owner always passes);
 *   2. `OPS_READ_ONLY=1` refuses everything not marked `readOnlySafe` (preview safety, ADR-31);
 *   3. Zod `safeParse` → `{ success: false, error: 'Check the highlighted fields.', fieldErrors }`;
 *   4. idempotency (approve / send / pay): key `${name}:${idempotent(input)}` in
 *      `ops.action_idempotency`; a stored, unexpired result is returned without running again;
 *   5. the handler, inside a transaction when the action is audited or idempotent, with the
 *      audit rows and the stored result written in that same transaction;
 *   6. any failure → a safe sentence (`safe-message.ts`), reported to Sentry with tags
 *      `action`, `actor` and `request_id`, and the request id shown as "Ref <id>".
 *
 * The returned function never throws to the client, except Next's own control flow
 * (`redirect()`, `notFound()`) from a handler that runs outside a transaction.
 *
 * ── Transactions and the connection budget (ADR-04) ──
 * Ops runs with `connection_limit=1`. While a transaction is open it holds the instance's only
 * connection, so a handler of an audited or idempotent action must do every database call
 * through `ctx.tx` (or `ctx.withTx`). A call on `opsDb` inside it waits for the pool until
 * `pool_timeout` and fails. Never call a model, Gmail or another slow service inside a
 * transaction: enqueue it (`inngest.send`) and let the job do it.
 */

/** The transaction client handlers write through. */
export type Tx = Prisma.TransactionClient

export type ActionContext = {
  user: OpsUser
  requestId: string
  /**
   * The action's transaction, present when the action is audited or idempotent. Writes through
   * it commit together with the audit rows and the stored result, or not at all.
   */
  tx?: Tx
  /**
   * Run `fn` in the action's transaction, opening one when the action has none. A handler that
   * needs atomicity without an audit row calls this.
   */
  withTx: <R>(fn: (tx: Tx) => Promise<R>) => Promise<R>
}

export type AuditResult = AuditEntry | readonly AuditEntry[] | null | undefined

export type ActionOptions<S extends z.ZodType, T> = {
  /** Dotted name for logs, Sentry and the idempotency key, e.g. "proposal.approve". */
  name: string
  schema: S
  /** Who may run it, read from the session (§4.3). */
  roles: readonly OpsRole[]
  /** Helper flags the action also needs, e.g. ['canSendSupplierMail']. The Owner always passes. */
  flags?: readonly HelperFlag[]
  /**
   * Turns the action idempotent: the caller's part of the key, normally `${proposalId}:${version}`.
   * A repeat within 24 h returns the first successful result; a failure is not stored, so a retry
   * after a failure runs again. The stored result is JSON: dates come back as ISO strings, and the
   * first call returns the same JSON form so both calls see identical data.
   */
  idempotent?: (input: z.output<S>) => string
  /** May run while OPS_READ_ONLY=1 (a read action, or a preview-safe preference). */
  readOnlySafe?: boolean
  handler: (input: z.output<S>, ctx: ActionContext) => Promise<T>
  /** The activity_event rows for this change, written in the handler's transaction. */
  audit?: (input: z.output<S>, out: T, ctx: { user: OpsUser }) => AuditResult
}

export type Action<S extends z.ZodType, T> = (raw: z.input<S>) => Promise<Result<T>>

/** Idempotency keys live a day (architecture §4.10). */
export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000

/**
 * `maxWait`: queue for the instance's one pooled connection as long as the pooler would
 * (`pool_timeout` 20 s). `timeout`: below `statement_timeout` (15 s) and far below
 * `idle_in_transaction_session_timeout` (30 s) on ops_app.
 */
export const ACTION_TX_OPTIONS = { maxWait: 20_000, timeout: 10_000 } as const

/** Zod issues → one message per field path ("lines.0.unitPrice"), the first issue winning. */
export function fieldErrorsOf(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.map(String).join('.')
    if (key && !(key in out)) out[key] = issue.message
  }
  return out
}

function isNextControlFlow(e: unknown): boolean {
  try {
    unstable_rethrow(e)
    return false
  } catch {
    return true
  }
}

function withRef(message: string, requestId: string): string {
  return `${message} Ref ${requestId}`
}

function report(e: unknown, name: string, user: OpsUser | null, requestId: string): void {
  Sentry.withScope((scope) => {
    scope.setTag('action', name)
    scope.setTag('actor', user?.role ?? 'anonymous')
    scope.setTag('request_id', requestId)
    Sentry.captureException(e)
  })
  if (env().APP_ENV === 'local') {
    // Local only: production logs would carry driver text Sentry scrubs (ADR-24).
    console.error(`[ops action ${name}] Ref ${requestId}`, e)
  }
}

/** Raised inside the transaction when another call stored this key first: rolls our work back. */
class ReplayLost extends Error {}

type StoredRow = { result: Prisma.JsonValue; expiresAt: Date }
type IdemClient = Pick<Tx, 'actionIdempotency'>

async function readStored<T>(db: IdemClient, key: string, now: Date): Promise<Result<T> | null> {
  const row: StoredRow | null = await db.actionIdempotency.findUnique({
    where: { key },
    select: { result: true, expiresAt: true },
  })
  if (!row || row.expiresAt.getTime() <= now.getTime()) return null
  return row.result as unknown as Result<T>
}

/** The JSON form a successful result is stored and returned in. */
function toStored<T>(data: T): Result<T> {
  return JSON.parse(JSON.stringify({ success: true, data })) as Result<T>
}

export function defineAction<S extends z.ZodType, T>(opts: ActionOptions<S, T>): Action<S, T> {
  const transactional = Boolean(opts.audit || opts.idempotent)

  return async function action(raw: z.input<S>): Promise<Result<T>> {
    const requestId = newRequestId()
    let user: OpsUser | null = null
    try {
      user = await requireOpsUser([...opts.roles])
      if (env().OPS_READ_ONLY === '1' && !opts.readOnlySafe) return err(SAFE_MESSAGES.readOnly)
      for (const flag of opts.flags ?? []) {
        if (!can(user, flag)) return err(SAFE_MESSAGES.forbidden)
      }

      const parsed = opts.schema.safeParse(raw)
      if (!parsed.success) return err(SAFE_MESSAGES.invalid, fieldErrorsOf(parsed.error))
      const input = parsed.data as z.output<S>
      const actor = user

      if (!transactional) {
        const data = await opts.handler(input, {
          user: actor,
          requestId,
          withTx: (fn) => opsDb.$transaction(fn, ACTION_TX_OPTIONS),
        })
        return { success: true, data }
      }

      // One transaction for the handler's writes, the audit rows and the stored result.
      const runInTx = async (tx: Tx): Promise<T> => {
        let out: T
        try {
          out = await opts.handler(input, {
            user: actor,
            requestId,
            tx,
            withTx: (fn) => fn(tx),
          })
        } catch (e) {
          // redirect()/notFound() would roll the transaction back and then navigate as if it
          // had worked. Fail loudly instead: return data and navigate in the client. (No
          // `cause`: unstable_rethrow follows causes and would rethrow the redirect after all.)
          if (isNextControlFlow(e)) {
            // eslint-disable-next-line eslint/preserve-caught-error -- a cause would be rethrown as the redirect
            throw new Error(`${opts.name}: redirect() or notFound() inside a transactional action`)
          }
          throw e
        }
        if (opts.audit) await writeAudit(tx, actor.id, opts.audit(input, out, { user: actor }))
        return out
      }

      if (!opts.idempotent) {
        const data = await opsDb.$transaction(runInTx, ACTION_TX_OPTIONS)
        return { success: true, data }
      }

      const key = `${opts.name}:${opts.idempotent(input)}`
      const now = new Date()
      const first = await readStored<T>(opsDb, key, now)
      if (first) return first

      try {
        return await opsDb.$transaction(async (tx) => {
          // Serialise concurrent calls with the same key until this transaction ends. Raw SQL
          // because Prisma has no advisory-lock API; the key is a bound parameter. A
          // transaction-scoped lock is safe behind the transaction pooler.
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`
          const again = await readStored<T>(tx, key, now)
          if (again) return again
          // An expired row for this key would block the insert below.
          await tx.actionIdempotency.deleteMany({ where: { key, expiresAt: { lte: now } } })

          const stored = toStored(await runInTx(tx))
          const { count } = await tx.actionIdempotency.createMany({
            data: [
              {
                key,
                action: opts.name,
                userId: actor.id,
                result: stored as unknown as Prisma.InputJsonValue,
                expiresAt: new Date(now.getTime() + IDEMPOTENCY_TTL_MS),
              },
            ],
            skipDuplicates: true, // INSERT … ON CONFLICT DO NOTHING
          })
          if (count === 0) throw new ReplayLost()
          return stored
        }, ACTION_TX_OPTIONS)
      } catch (e) {
        if (!(e instanceof ReplayLost)) throw e
        // Another call stored this key first; ours rolled back. Return what it stored.
        const winner = await readStored<T>(opsDb, key, new Date())
        if (winner) return winner
        throw new Error(`${opts.name}: idempotency row vanished after a conflict`, { cause: e })
      }
    } catch (e) {
      // Next's own control flow (redirect, notFound, dynamic-render bailouts) passes through.
      unstable_rethrow(e)
      if (isExpectedRefusal(e)) return err(safeMessage(e))
      report(e, opts.name, user, requestId)
      return err(withRef(safeMessage(e), requestId))
    }
  }
}

export { SafeError }
