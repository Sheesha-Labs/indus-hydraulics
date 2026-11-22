import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import type { OpsUser } from './access-core'

/**
 * defineAction against the real local Postgres (role ops_app), for what an in-memory stand-in
 * cannot prove: the advisory lock serialising two concurrent calls, ON CONFLICT DO NOTHING on
 * ops.action_idempotency, and a failed audit insert rolling back the handler's own write.
 *
 *   DATABASE_URL="postgresql://ops_app:ops_app_local@localhost:54329/postgres" \
 *     bun run --filter @indus/ops test -- define-action
 *
 * Skipped when DATABASE_URL is unset, and refused for any host but localhost: it writes rows.
 * Every row it writes is deleted again (action_idempotency only; it writes no activity_event,
 * which is append-only and could not be cleaned up).
 */

function localDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  try {
    const host = new URL(raw).hostname
    return ['localhost', '127.0.0.1', '[::1]'].includes(host) ? raw : undefined
  } catch {
    return undefined
  }
}

const DB_URL = localDatabaseUrl()

const h = vi.hoisted(() => ({
  user: null as OpsUser | null,
  envState: { OPS_READ_ONLY: undefined as '0' | '1' | undefined, APP_ENV: 'test' },
}))

vi.mock('./env', () => ({ env: () => h.envState }))
vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: () => undefined,
}))
vi.mock('./access', async () => {
  const core = await import('./access-core')
  return {
    can: core.can,
    requireOpsUser: async () => {
      if (!h.user) throw new core.AccessError('unauthenticated')
      return h.user
    },
  }
})

describe.skipIf(!DB_URL)('defineAction · local database', () => {
  // Three pooled connections so the second call really reaches the advisory lock instead of
  // queueing for the one connection production allows.
  process.env.DATABASE_CONNECTION_LIMIT = '3'

  const runId = crypto.randomUUID()
  const keyPrefix = `test.${runId}`
  let db: typeof import('@indus/ops-db').opsDb
  let defineAction: typeof import('./define-action').defineAction

  const schema = z.object({ proposalId: z.string(), version: z.number().int() })

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    ;({ defineAction } = await import('./define-action'))
    const owner = await db.user.findFirst({
      where: { role: 'owner', status: 'active' },
      select: {
        id: true,
        email: true,
        name: true,
        initials: true,
        role: true,
        canSeeMargins: true,
        canSendSupplierMail: true,
        canEditChaserRules: true,
      },
    })
    if (!owner) throw new Error('the local database has no active owner; seed one first')
    h.user = owner
  })

  afterAll(async () => {
    await db.actionIdempotency.deleteMany({ where: { key: { startsWith: keyPrefix } } })
    await db.$disconnect()
  })

  it('runs the handler once under two concurrent calls and replays the first result', async () => {
    let runs = 0
    const approve = defineAction({
      name: keyPrefix,
      schema,
      roles: ['owner'],
      idempotent: (i) => `${i.proposalId}:${i.version}`,
      handler: async (input, ctx) => {
        runs++
        expect(ctx.tx).toBeDefined()
        await new Promise((r) => setTimeout(r, 250))
        return { approved: input.proposalId, run: runs }
      },
    })
    const input = { proposalId: 'p1', version: 1 }
    const [a, b] = await Promise.all([approve(input), approve(input)])
    expect(runs).toBe(1)
    expect(a).toEqual({ success: true, data: { approved: 'p1', run: 1 } })
    expect(b).toEqual(a)
    expect(await approve(input)).toEqual(a)

    const row = await db.actionIdempotency.findUnique({ where: { key: `${keyPrefix}:p1:1` } })
    expect(row?.action).toBe(keyPrefix)
    expect(row?.userId).toBe(h.user?.id)
    expect(row?.result).toEqual(a)
    const ttl = (row?.expiresAt.getTime() ?? 0) - (row?.createdAt.getTime() ?? 0)
    expect(Math.abs(ttl - 24 * 3600 * 1000)).toBeLessThan(60_000)
  })

  it('rolls back the handler write and stores no result when the audit insert fails', async () => {
    const handlerKey = `${keyPrefix}:handler-write`
    const act = defineAction({
      name: `${keyPrefix}.audited`,
      schema,
      roles: ['owner'],
      idempotent: (i) => `${i.proposalId}:${i.version}`,
      handler: async (_input, ctx) => {
        // The handler's own write, through the action's transaction.
        await ctx.withTx((tx) =>
          tx.actionIdempotency.create({
            data: {
              key: handlerKey,
              action: 'handler',
              userId: ctx.user.id,
              result: { written: true },
              expiresAt: new Date(Date.now() + 60_000),
            },
          })
        )
        return 'saved'
      },
      // Not a uuid: the activity_event insert fails inside the same transaction, after the
      // handler's write.
      audit: () => ({ subjectType: 'settings', subjectId: 'not-a-uuid', kind: 'settings' }),
    })
    const res = await act({ proposalId: 'p2', version: 1 })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error).not.toMatch(/P\d{4}|uuid|invalid input|prisma/i)
      expect(res.error).toMatch(/Ref [0-9a-f-]{36}$/)
    }
    expect(await db.actionIdempotency.findUnique({ where: { key: handlerKey } })).toBeNull()
    expect(
      await db.actionIdempotency.findUnique({ where: { key: `${keyPrefix}.audited:p2:1` } })
    ).toBeNull()
  })

  it('maps a real unique violation (P2002) to a safe sentence', async () => {
    const key = `${keyPrefix}:dup`
    const dup = defineAction({
      name: `${keyPrefix}.dup`,
      schema,
      roles: ['owner'],
      handler: async (_input, ctx) => {
        const data = {
          key,
          action: 'dup',
          userId: ctx.user.id,
          result: {},
          expiresAt: new Date(Date.now() + 60_000),
        }
        await ctx.withTx(async (tx) => {
          await tx.actionIdempotency.create({ data })
          await tx.actionIdempotency.create({ data })
        })
        return 'never'
      },
    })
    const res = await dup({ proposalId: 'p3', version: 1 })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error).toMatch(/^That already exists\. Reload to see it\. Ref /)
      expect(res.error).not.toMatch(/P2002|unique constraint/i)
    }
    expect(await db.actionIdempotency.findUnique({ where: { key } })).toBeNull()
  })
})
