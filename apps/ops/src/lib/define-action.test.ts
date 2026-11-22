import type { Route } from 'next'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import type { OpsRole, OpsUser } from './access-core'

/**
 * defineAction against a mocked session and an in-memory stand-in for the two tables it touches
 * (action_idempotency, activity_event). The stand-in runs transactions one at a time and drops a
 * transaction's writes when its callback throws, the way Postgres does. The same behaviours
 * against the real local database are in define-action.db.test.ts.
 */

type Row = Record<string, unknown>

const h = vi.hoisted(() => {
  const committed = { idem: new Map<string, Row>(), events: [] as Row[] }
  let chain: Promise<unknown> = Promise.resolve()

  function models(store: { idem: Map<string, Row>; events: Row[] }) {
    return {
      actionIdempotency: {
        findUnique: async ({ where }: { where: { key: string } }) =>
          store.idem.get(where.key) ?? null,
        deleteMany: async ({ where }: { where: { key: string; expiresAt: { lte: Date } } }) => {
          const row = store.idem.get(where.key)
          if (row && (row.expiresAt as Date) <= where.expiresAt.lte) {
            store.idem.delete(where.key)
            return { count: 1 }
          }
          return { count: 0 }
        },
        createMany: async ({ data }: { data: Row[] }) => {
          let count = 0
          for (const row of data) {
            if (store.idem.has(row.key as string)) continue // ON CONFLICT DO NOTHING
            store.idem.set(row.key as string, row)
            count++
          }
          return { count }
        },
      },
      activityEvent: {
        createMany: async ({ data }: { data: Row[] }) => {
          // Stands in for a database error on a bad audit row (invalid uuid in Postgres).
          if (data.some((r) => r.subjectId === 'not-a-uuid')) {
            throw Object.assign(new Error('invalid input syntax for type uuid'), { code: 'P2010' })
          }
          store.events.push(...data)
          return { count: data.length }
        },
      },
    }
  }

  const transactions = { opened: 0 }
  const opsDb = {
    ...models({
      get idem() {
        return committed.idem
      },
      get events() {
        return committed.events
      },
    }),
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => {
      const run = chain.then(async () => {
        transactions.opened++
        const stage = { idem: new Map(committed.idem), events: [...committed.events] }
        const tx = { ...models(stage), $executeRaw: async () => 0 }
        const out = await fn(tx)
        committed.idem = stage.idem
        committed.events = stage.events
        return out
      })
      chain = run.catch(() => undefined)
      return run
    },
  }

  const session = { user: null as OpsUser | null }
  const envState = { OPS_READ_ONLY: undefined as '0' | '1' | undefined, APP_ENV: 'test' }
  const sentry = { captured: [] as Array<{ error: unknown; tags: Record<string, string> }> }

  function reset() {
    committed.idem = new Map()
    committed.events = []
    chain = Promise.resolve()
    transactions.opened = 0
    envState.OPS_READ_ONLY = undefined
    sentry.captured.length = 0
  }

  return { committed, opsDb, session, envState, sentry, transactions, reset }
})

vi.mock('@indus/ops-db', () => ({ opsDb: h.opsDb }))
vi.mock('./env', () => ({ env: () => h.envState }))
vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: (k: string, v: string) => void }) => void) => {
    const tags: Record<string, string> = {}
    fn({ setTag: (k, v) => (tags[k] = v) })
    const last = h.sentry.captured.at(-1)
    if (last) last.tags = tags
  },
  captureException: (error: unknown) => h.sentry.captured.push({ error, tags: {} }),
}))
vi.mock('./access', async () => {
  const core = await import('./access-core')
  return {
    can: core.can,
    AccessError: core.AccessError,
    requireOpsUser: async (roles?: OpsRole[]) => {
      const user = h.session.user
      if (!user) throw new core.AccessError('unauthenticated')
      if (roles && !roles.includes(user.role)) throw new core.AccessError('forbidden')
      return user
    },
  }
})

const { defineAction, fieldErrorsOf } = await import('./define-action')
const { SAFE_MESSAGES, SafeError } = await import('./safe-message')
const { redirect } = await import('next/navigation')

const OWNER: OpsUser = {
  id: '01936f7e-0000-7000-8000-000000000001',
  email: 'owner@example.test',
  name: 'Owner Example',
  initials: 'OE',
  role: 'owner',
  canSeeMargins: true,
  canSendSupplierMail: true,
  canEditChaserRules: true,
}
const HELPER: OpsUser = {
  ...OWNER,
  id: '01936f7e-0000-7000-8000-000000000002',
  email: 'helper@example.test',
  name: 'Helper Example',
  initials: 'HE',
  role: 'helper',
  canSeeMargins: false,
  canSendSupplierMail: false,
  canEditChaserRules: false,
}
const SUBJECT = '01936f7e-0000-7000-8000-0000000000aa'
const REF = /Ref [0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

const schema = z.object({ proposalId: z.string().uuid(), version: z.number().int().min(1) })
const INPUT = { proposalId: SUBJECT, version: 2 }

beforeEach(() => {
  h.reset()
  h.session.user = OWNER
})

describe('defineAction · who may run it', () => {
  it('refuses a role the action does not allow, without running the handler', async () => {
    h.session.user = HELPER
    const handler = vi.fn(async () => 'done')
    const approve = defineAction({ name: 'test.approve', schema, roles: ['owner'], handler })
    expect(await approve(INPUT)).toEqual({ success: false, error: SAFE_MESSAGES.forbidden })
    expect(handler).not.toHaveBeenCalled()
    expect(h.sentry.captured).toHaveLength(0)
  })

  it('refuses a signed-out caller with a sign-in message', async () => {
    h.session.user = null
    const handler = vi.fn(async () => 'done')
    const act = defineAction({ name: 'test.any', schema, roles: ['owner', 'helper'], handler })
    expect(await act(INPUT)).toEqual({ success: false, error: SAFE_MESSAGES.signedOut })
    expect(handler).not.toHaveBeenCalled()
  })

  it('refuses a Helper without canSendSupplierMail, allows one with it and the Owner', async () => {
    const handler = vi.fn(async () => 'sent')
    const send = defineAction({
      name: 'test.supplier-send',
      schema,
      roles: ['owner', 'helper'],
      flags: ['canSendSupplierMail'],
      handler,
    })
    h.session.user = HELPER
    expect(await send(INPUT)).toEqual({ success: false, error: SAFE_MESSAGES.forbidden })
    expect(handler).not.toHaveBeenCalled()

    h.session.user = { ...HELPER, canSendSupplierMail: true }
    expect(await send(INPUT)).toEqual({ success: true, data: 'sent' })
    h.session.user = OWNER
    expect(await send(INPUT)).toEqual({ success: true, data: 'sent' })
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('never reads a role from input', async () => {
    h.session.user = HELPER
    const handler = vi.fn(async () => 'done')
    const loose = z.object({ role: z.string() }).loose()
    const act = defineAction({ name: 'test.loose', schema: loose, roles: ['owner'], handler })
    expect((await act({ role: 'owner' })).success).toBe(false)
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('defineAction · read-only (OPS_READ_ONLY=1)', () => {
  it('refuses every action unless it is readOnlySafe', async () => {
    h.envState.OPS_READ_ONLY = '1'
    const handler = vi.fn(async () => 'ok')
    const write = defineAction({ name: 'test.write', schema, roles: ['owner'], handler })
    const read = defineAction({
      name: 'test.read',
      schema,
      roles: ['owner'],
      readOnlySafe: true,
      handler,
    })
    expect(await write(INPUT)).toEqual({ success: false, error: SAFE_MESSAGES.readOnly })
    expect(handler).not.toHaveBeenCalled()
    expect(await read(INPUT)).toEqual({ success: true, data: 'ok' })
  })
})

describe('defineAction · validation', () => {
  it('returns one message per field and does not run the handler', async () => {
    const handler = vi.fn(async () => 'ok')
    const act = defineAction({ name: 'test.validate', schema, roles: ['owner'], handler })
    const res = await act({ proposalId: 'nope', version: 0 })
    expect(res.success).toBe(false)
    if (res.success) return
    expect(res.error).toBe('Check the highlighted fields.')
    expect(Object.keys(res.fieldErrors ?? {}).sort()).toEqual(['proposalId', 'version'])
    expect(handler).not.toHaveBeenCalled()
  })

  it('keys nested fields by path, first issue winning', () => {
    const lines = z.object({ lines: z.array(z.object({ qty: z.number().min(1).int() })) })
    const parsed = lines.safeParse({ lines: [{ qty: 1 }, { qty: 0.5 }] })
    expect(parsed.success).toBe(false)
    if (parsed.success) return
    expect(Object.keys(fieldErrorsOf(parsed.error))).toEqual(['lines.1.qty'])
  })
})

describe('defineAction · errors are safe', () => {
  it('maps a thrown Prisma P2002 to a sentence with no code, driver text or stack, and a Ref', async () => {
    const prismaError = Object.assign(
      new Error(
        'Invalid `prisma.company.create()` invocation:\n\nUnique constraint failed on the fields: (`name`)'
      ),
      { name: 'PrismaClientKnownRequestError', code: 'P2002', meta: { target: ['name'] } }
    )
    const act = defineAction({
      name: 'test.create',
      schema,
      roles: ['owner'],
      handler: async () => {
        throw prismaError
      },
    })
    const res = await act(INPUT)
    expect(res.success).toBe(false)
    if (res.success) return
    expect(res.error.startsWith(SAFE_MESSAGES.duplicate)).toBe(true)
    expect(res.error).toMatch(REF)
    expect(res.error).not.toContain('P2002')
    expect(res.error).not.toMatch(/unique constraint/i)
    expect(res.error).not.toMatch(/\bat\s.+:\d+/) // no stack frame
    expect(JSON.stringify(res)).not.toContain('invocation')

    expect(h.sentry.captured).toHaveLength(1)
    const [event] = h.sentry.captured
    expect(event?.error).toBe(prismaError)
    expect(event?.tags).toMatchObject({ action: 'test.create', actor: 'owner' })
    expect(res.error.endsWith(`Ref ${event?.tags.request_id}`)).toBe(true)
  })

  it('never throws: an arbitrary error becomes the generic sentence', async () => {
    const act = defineAction({
      name: 'test.boom',
      schema,
      roles: ['owner'],
      handler: async () => {
        throw new TypeError("Cannot read properties of undefined (reading 'id')")
      },
    })
    const res = await act(INPUT)
    expect(res).toEqual({ success: false, error: expect.stringMatching(REF) })
    if (!res.success) expect(res.error.startsWith(SAFE_MESSAGES.generic)).toBe(true)
  })

  it('passes a SafeError through without reporting it as a fault', async () => {
    const act = defineAction({
      name: 'test.refuse',
      schema,
      roles: ['owner'],
      handler: async () => {
        throw new SafeError('This quotation has already been sent.')
      },
    })
    expect(await act(INPUT)).toEqual({
      success: false,
      error: 'This quotation has already been sent.',
    })
    expect(h.sentry.captured).toHaveLength(0)
  })

  it('lets redirect() through from a plain handler and fails a transactional one instead', async () => {
    const plain = defineAction({
      name: 'test.redirect',
      schema,
      roles: ['owner'],
      handler: async () => redirect('/today' as Route),
    })
    await expect(plain(INPUT)).rejects.toThrow('NEXT_REDIRECT')

    const audited = defineAction({
      name: 'test.redirect-tx',
      schema,
      roles: ['owner'],
      handler: async () => redirect('/today' as Route),
      audit: () => ({ subjectType: 'settings', subjectId: SUBJECT, kind: 'settings' }),
    })
    const res = await audited(INPUT)
    expect(res.success).toBe(false)
    expect(h.committed.events).toHaveLength(0)
  })
})

describe('defineAction · idempotency', () => {
  it('returns the first result to a replay and runs the handler once under two concurrent calls', async () => {
    let n = 0
    const handler = vi.fn(async () => {
      n++
      await new Promise((r) => setTimeout(r, 20))
      return { sent: n, at: new Date('2026-11-22T09:30:00Z') }
    })
    const approve = defineAction({
      name: 'proposal.approve',
      schema,
      roles: ['owner'],
      idempotent: (i) => `${i.proposalId}:${i.version}`,
      handler,
    })
    const [a, b] = await Promise.all([approve(INPUT), approve(INPUT)])
    const third = await approve(INPUT)
    expect(handler).toHaveBeenCalledTimes(1)
    // The stored JSON form: the date comes back as an ISO string on every call.
    const expected = { success: true, data: { sent: 1, at: '2026-11-22T09:30:00.000Z' } }
    expect(a).toEqual(expected)
    expect(b).toEqual(expected)
    expect(third).toEqual(expected)
    expect(h.committed.idem.get(`proposal.approve:${SUBJECT}:2`)).toMatchObject({
      action: 'proposal.approve',
      userId: OWNER.id,
    })

    // A new version is a new key.
    expect(await approve({ ...INPUT, version: 3 })).toEqual({
      success: true,
      data: { sent: 2, at: '2026-11-22T09:30:00.000Z' },
    })
  })

  it('does not store a failure, so a retry runs again', async () => {
    let calls = 0
    const send = defineAction({
      name: 'mail.send',
      schema,
      roles: ['owner'],
      idempotent: (i) => `${i.proposalId}:${i.version}`,
      handler: async () => {
        calls++
        if (calls === 1) throw Object.assign(new Error('timeout'), { code: 'P2024' })
        return 'queued'
      },
    })
    const first = await send(INPUT)
    expect(first.success).toBe(false)
    if (!first.success) expect(first.error.startsWith(SAFE_MESSAGES.busy)).toBe(true)
    expect(await send(INPUT)).toEqual({ success: true, data: 'queued' })
    expect(calls).toBe(2)
  })

  it('runs again once the stored result has expired', async () => {
    const key = `proposal.approve:${SUBJECT}:2`
    h.committed.idem.set(key, {
      key,
      result: { success: true, data: 'old' },
      expiresAt: new Date(Date.now() - 1000),
    })
    const approve = defineAction({
      name: 'proposal.approve',
      schema,
      roles: ['owner'],
      idempotent: (i) => `${i.proposalId}:${i.version}`,
      handler: async () => 'new',
    })
    expect(await approve(INPUT)).toEqual({ success: true, data: 'new' })
  })
})

describe('defineAction · audit', () => {
  const auditOf = (subjectId: string) => () => ({
    subjectType: 'settings' as const,
    subjectId,
    kind: 'settings' as const,
    field: 'sendWindow',
    before: '08:00',
    after: '09:00',
  })

  it('writes the activity row in the same transaction as the handler', async () => {
    const act = defineAction({
      name: 'settings.update',
      schema,
      roles: ['owner'],
      handler: async (_input, ctx) => {
        expect(ctx.tx).toBeDefined()
        await ctx.withTx((tx) =>
          tx.activityEvent.createMany({
            data: [
              {
                actorKind: 'user',
                subjectType: 'settings',
                subjectId: SUBJECT,
                kind: 'other',
                note: 'handler write',
              },
            ],
          })
        )
        return 'saved'
      },
      audit: auditOf(SUBJECT),
    })
    expect(await act(INPUT)).toEqual({ success: true, data: 'saved' })
    expect(h.transactions.opened).toBe(1)
    expect(h.committed.events).toHaveLength(2)
    expect(h.committed.events[1]).toMatchObject({
      actorKind: 'user',
      actorId: OWNER.id,
      subjectType: 'settings',
      field: 'sendWindow',
      before: '08:00',
      after: '09:00',
      sensitive: false,
    })
  })

  it('rolls the handler back with the audit row when the audit write fails', async () => {
    const act = defineAction({
      name: 'settings.update',
      schema,
      roles: ['owner'],
      handler: async (_input, ctx) => {
        await ctx.tx?.activityEvent.createMany({
          data: [
            {
              actorKind: 'user',
              subjectType: 'settings',
              subjectId: SUBJECT,
              kind: 'other',
              note: 'handler write',
            },
          ],
        })
        return 'saved'
      },
      audit: auditOf('not-a-uuid'),
    })
    const res = await act(INPUT)
    expect(res.success).toBe(false)
    expect(h.committed.events).toHaveLength(0)
  })

  it('writes nothing when the handler fails', async () => {
    const act = defineAction({
      name: 'settings.update',
      schema,
      roles: ['owner'],
      handler: async () => {
        throw new SafeError('That setting is locked.')
      },
      audit: auditOf(SUBJECT),
    })
    expect(await act(INPUT)).toEqual({ success: false, error: 'That setting is locked.' })
    expect(h.committed.events).toHaveLength(0)
  })

  it('opens no transaction for a plain action until the handler asks for one', async () => {
    const plain = defineAction({
      name: 'test.plain',
      schema,
      roles: ['owner'],
      handler: async (_input, ctx) => {
        expect(ctx.tx).toBeUndefined()
        return 'ok'
      },
    })
    expect(await plain(INPUT)).toEqual({ success: true, data: 'ok' })
    expect(h.transactions.opened).toBe(0)
  })
})
