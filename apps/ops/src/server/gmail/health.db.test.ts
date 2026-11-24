import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * The five-minute health check and the sidebar pill against the local database (S04-T09). Skips without a DB.
 */
const DB_URL = localDatabaseUrl()

vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: () => undefined,
  captureMessage: () => undefined,
}))
// The pause row is shared (pause.db.test toggles it); this file is not about it.
vi.mock('../assistant/pause', () => ({
  isAssistantPaused: async () => false,
  assistantPauseState: async () => null,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }))

const TAG = 'health'
// Monday 10:00 GST: desk hours.
const DESK = new Date('2026-11-23T06:00:00Z')
// Saturday 10:00 GST: not desk hours.
const WEEKEND = new Date('2026-11-21T06:00:00Z')

describe.skipIf(!DB_URL)('mailbox health · local database', () => {
  process.env.APP_ENV = 'test'
  let db: typeof import('@indus/ops-db').opsDb
  let health: typeof import('./health')
  let shell: typeof import('../../data/shell')
  let world: QueueWorld

  const setSync = (mailboxId: string, data: Record<string, unknown>) =>
    db.mailboxSyncState.update({ where: { mailboxId }, data })
  const statusOf = async (id: string) =>
    (await db.mailbox.findUniqueOrThrow({ where: { id } })).status
  const mine = (
    changes: Array<{ mailboxId: string; to: string }>,
    id: string
  ): string | undefined => changes.find((c) => c.mailboxId === id)?.to

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    health = await import('./health')
    shell = await import('../../data/shell')
  })

  beforeEach(async () => {
    world = await buildQueueWorld(db, TAG)
    const fresh = {
      lastSuccessfulSyncAt: new Date(DESK.getTime() - 60_000),
      watchExpiresAt: new Date(DESK.getTime() + 6 * 86_400_000),
    }
    await setSync(world.salesId, fresh)
    await setSync(world.purchaseId, fresh)
  })

  afterAll(async () => {
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  it('30 minutes without a sync: behind, a notification, a Sentry alert in desk hours; recovery resolves it', async () => {
    await setSync(world.purchaseId, {
      lastSuccessfulSyncAt: new Date(DESK.getTime() - 40 * 60_000),
    })
    const alerts: string[] = []
    const out = await health.runHealthCheck({
      now: DESK,
      only: [world.salesId, world.purchaseId],
      capture: (m, tags) => void (tags.mailbox?.startsWith('s04q-health-') && alerts.push(m)),
    })
    expect(mine(out.changes, world.purchaseId)).toBe('behind')
    expect(await statusOf(world.salesId)).toBe('live')
    expect(alerts).toEqual(['No Gmail sync for 30 minutes'])
    const key = health.behindKey(world.purchaseId)
    expect(
      await db.notification.count({ where: { dedupeKey: key, resolvedAt: null } })
    ).toBeGreaterThan(0)
    expect(
      (await db.mailboxSyncState.findUniqueOrThrow({ where: { mailboxId: world.purchaseId } }))
        .lagSeconds
    ).toBe(2400)

    await setSync(world.purchaseId, { lastSuccessfulSyncAt: new Date(DESK.getTime() - 60_000) })
    await health.runHealthCheck({
      now: DESK,
      only: [world.salesId, world.purchaseId],
      capture: () => undefined,
    })
    expect(await statusOf(world.purchaseId)).toBe('live')
    expect(await db.notification.count({ where: { dedupeKey: key, resolvedAt: null } })).toBe(0)
  })

  it('no sync alert outside desk hours; a watch error alerts at any hour', async () => {
    await setSync(world.salesId, {
      lastSuccessfulSyncAt: new Date(WEEKEND.getTime() - 40 * 60_000),
      watchExpiresAt: new Date(WEEKEND.getTime() + 6 * 86_400_000),
      watchError: 'renewal failed',
    })
    const alerts: string[] = []
    await health.runHealthCheck({
      now: WEEKEND,
      only: [world.salesId, world.purchaseId],
      capture: (m, tags) => void (tags.mailbox === 's04q-health-sales@' && alerts.push(m)),
    })
    expect(alerts).toEqual(['Gmail watch renewal failed'])
  })

  it('sends held for the cap: limit reached; the pill turns amber naming the mailbox', async () => {
    const out = await db.outboundEmail.create({
      data: {
        kind: 'follow_up',
        mailboxId: world.salesId,
        toAddresses: ['buyer@client.example.test'],
        subject: 'x',
        bodyHtml: 'x',
        status: 'held',
        holdReason: 'cap',
        idempotencyKey: `s04q:${TAG}:${Date.now()}`,
      },
    })
    const run = await health.runHealthCheck({
      now: DESK,
      only: [world.salesId, world.purchaseId],
      capture: () => undefined,
    })
    expect(mine(run.changes, world.salesId)).toBe('limit_reached')
    const pill = await shell.getShellAssistantStates()
    expect(pill.states).toContain('behind')
    await db.outboundEmail.update({ where: { id: out.id }, data: { status: 'cancelled' } })
    await health.runHealthCheck({
      now: DESK,
      only: [world.salesId, world.purchaseId],
      capture: () => undefined,
    })
    expect(await statusOf(world.salesId)).toBe('live')
  })

  it('a disconnected mailbox is left alone and turns the pill red with its name', async () => {
    await db.mailbox.update({ where: { id: world.purchaseId }, data: { status: 'token_expired' } })
    await health.runHealthCheck({
      now: DESK,
      only: [world.salesId, world.purchaseId],
      capture: () => undefined,
    })
    expect(await statusOf(world.purchaseId)).toBe('token_expired')
    const pill = await shell.getShellAssistantStates()
    expect(pill.states).toContain('disconnected')
    expect(pill.label).toMatch(/ disconnected$/)
  })
})
