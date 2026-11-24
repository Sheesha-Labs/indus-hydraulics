import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { OpsUser } from '../../lib/access-core'
import {
  buildQueueWorld,
  allowTestRecipient,
  disallowTestRecipient,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from './testing/fixture'

/**
 * "Send a test email…" through the real action on ONE pooled connection, as production runs it
 * (connection_limit=1). Regression for 2026-11-23: the action held its audit transaction on the only
 * connection while scheduleSend waited for another, and answered "The database is busy" after queuing anyway.
 */
const DB_URL = localDatabaseUrl()
const h = vi.hoisted(() => ({ user: null as OpsUser | null, emitted: [] as string[] }))

vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: () => undefined,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async (e: { name: string }) => (h.emitted.push(e.name), true),
  emitEventOrThrow: async (e: { name: string }) => void h.emitted.push(e.name),
}))
vi.mock('../../lib/access', async () => {
  const core = await import('../../lib/access-core')
  return {
    can: core.can,
    requireOpsUser: async () => {
      if (!h.user) throw new core.AccessError('unauthenticated')
      return h.user
    },
  }
})

const TAG = 'sendtest'
/** Its own recipient: sending-settings.db.test.ts adds and removes the fixture CLIENT in parallel. */
const TO = 'sendtest-buyer@client.example.test'

describe.skipIf(!DB_URL)('mailbox.sendTest action · one pooled connection', () => {
  process.env.APP_ENV = 'test'
  // Production's budget: one connection per instance (ADR-04). A fresh client so the limit applies here.
  process.env.DATABASE_CONNECTION_LIMIT = '1'
  delete (globalThis as { opsDb?: unknown }).opsDb
  let db: typeof import('@indus/ops-db').opsDb
  let world: QueueWorld
  let action: typeof import('../../app/(console)/settings/mailboxes/actions/mailbox').sendTestEmailAction

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    ;({ sendTestEmailAction: action } =
      await import('../../app/(console)/settings/mailboxes/actions/mailbox'))
    world = await buildQueueWorld(db, TAG)
    const owner = await db.user.findUniqueOrThrow({
      where: { id: world.ownerId },
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
    h.user = owner as OpsUser
    await allowTestRecipient(db, TO)
  })

  afterAll(async () => {
    await disallowTestRecipient(db, TO)
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  it('queues the email and answers success well inside the transaction timeout', async () => {
    const started = Date.now()
    const res = await action({ mailboxId: world.salesId, to: TO, mode: 'new' })
    expect(res).toMatchObject({ success: true })
    expect(Date.now() - started).toBeLessThan(8_000)
    if (!res.success) return
    expect(res.data.undoRemainingMs).toBeGreaterThan(4 * 60_000)
    expect(
      (await db.outboundEmail.findUniqueOrThrow({ where: { id: res.data.outboundId } })).status
    ).toBe('scheduled')
    expect(h.emitted).toContain('ops/mail.send.requested')
    const note = await db.activityEvent.findFirst({
      where: {
        subjectType: 'mailbox',
        subjectId: world.salesId,
        note: { startsWith: 'Test email queued' },
      },
    })
    expect(note).not.toBeNull()
  })
})
