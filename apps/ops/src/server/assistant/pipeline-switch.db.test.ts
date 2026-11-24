import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { OpsUser } from '../../lib/access-core'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * S05-T09 on the local database: with the switch off the router requests nothing; switching on emits the
 * backlog event; the backlog is requested oldest first, in batches, with the router's idempotency key, and
 * stops when the switch goes off; latency is recorded once per message and the window's p50 / p95 land in
 * live_counter.
 */
const DB_URL = localDatabaseUrl()
const TAG = 'pipesw'
const h = vi.hoisted(() => ({
  emitted: [] as Array<{ name: string; id?: string; data: Record<string, unknown> }>,
  // The switch lives here, not in settings_entry: settings.db.test restores every row before each of its
  // tests, in parallel with this file.
  on: false,
  version: 0,
  updatedBy: [] as string[],
}))

vi.mock('../settings/get', () => ({
  getSetting: async () => ({ enabled: h.on }),
  getSettingEntry: async () => ({ value: { enabled: h.on }, version: h.version }),
}))
vi.mock('../settings/update', () => ({
  updateSetting: async (
    key: string,
    value: { enabled: boolean },
    version: number,
    user: { id: string }
  ) => {
    if (version !== h.version) throw new Error('conflict')
    h.on = value.enabled
    h.version += 1
    h.updatedBy.push(user.id)
    return { key, version: h.version }
  },
  revalidateSettings: () => undefined,
}))

vi.mock('@sentry/nextjs', () => ({
  captureException: () => undefined,
  captureMessage: () => undefined,
  withScope: () => undefined,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async (e: { name: string; id?: string; data: Record<string, unknown> }) => (
    h.emitted.push(e),
    true
  ),
  emitEventOrThrow: async (e: { name: string; id?: string; data: Record<string, unknown> }) =>
    void h.emitted.push(e),
}))
vi.mock('../../inngest/emit-batch', () => ({
  emitEvents: async (es: Array<{ name: string; id?: string; data: Record<string, unknown> }>) => {
    h.emitted.push(...es)
    return es.length
  },
}))

describe.skipIf(!DB_URL)('mail pipeline switch · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let sw: typeof import('./pipeline-switch')
  let router: typeof import('../mail/router')
  let latency: typeof import('./latency')
  let world: QueueWorld
  let owner: OpsUser
  let threadId: string
  const ids: string[] = []

  async function msg(minutesAgo: number, over: Record<string, unknown> = {}) {
    const at = new Date(Date.now() - minutesAgo * 60_000)
    const m = await db.mailMessage.create({
      data: {
        mailboxId: world.purchaseId,
        threadId,
        gmailMessageId: `g-${TAG}-${randomUUID()}`,
        direction: 'inbound',
        fromAddress: 'buyer@client.example.test',
        toAddresses: ['purchase@example.test'],
        ccAddresses: [],
        subject: `Backlog ${minutesAgo}`,
        bodyText: 'Please quote',
        bodyTextHash: randomUUID(),
        sentAt: at,
        receivedAt: at,
        labelsApplied: [],
        origin: 'live',
        ...over,
      },
      select: { id: true },
    })
    ids.push(m.id)
    return m.id
  }

  function setPipeline(enabled: boolean) {
    h.on = enabled
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    sw = await import('./pipeline-switch')
    router = await import('../mail/router')
    latency = await import('./latency')
    await import('./actions')
    world = await buildQueueWorld(db, TAG)
    owner = (await db.user.findUniqueOrThrow({
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
    })) as OpsUser
    threadId = (
      await db.mailThread.create({
        data: { mailboxId: world.purchaseId, gmailThreadId: `t-${TAG}-${randomUUID()}` },
        select: { id: true },
      })
    ).id
  })

  afterAll(async () => {
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  it('off: the router leaves new mail unclassified and requests nothing', async () => {
    setPipeline(false)
    const id = await msg(1)
    h.emitted.length = 0
    expect(await router.routeReceived({ messageId: id, origin: 'live' })).toEqual({
      requested: null,
      skipped: 'pipeline_off',
    })
    expect(h.emitted).toEqual([])
    expect(await sw.requestBacklogBatch(null, { mailboxId: world.purchaseId })).toMatchObject({
      requested: 0,
      stopped: 'off',
    })
  })

  it('switching on (Owner) emits the backlog event once; the backlog goes oldest first, in batches', async () => {
    setPipeline(false)
    h.emitted.length = 0
    const on = await sw.setMailPipeline(true, owner)
    expect(on.enabled).toBe(true)
    expect(h.updatedBy).toContain(owner.id)
    expect(h.emitted.filter((e) => e.name === 'ops/assistant.pipeline.enabled')).toHaveLength(1)
    // Already on: no second event.
    h.emitted.length = 0
    await sw.setMailPipeline(true, owner)
    expect(h.emitted).toEqual([])

    const older = [await msg(50), await msg(40), await msg(30)]
    // Not backlog: an outbound, a backfilled one, one already classified, one waiting as Unsure.
    await msg(45, { direction: 'outbound' })
    await msg(44, { origin: 'backfill' })
    await msg(43, { classification: 'supplier_quote', confidence: 'sure' })
    await msg(42, { confidence: 'unsure' })

    h.emitted.length = 0
    let cursor: Awaited<ReturnType<typeof sw.requestBacklogBatch>>['next'] = null
    const sizes: number[] = []
    for (let n = 0; n < 10; n += 1) {
      const out = await sw.requestBacklogBatch(cursor, { mailboxId: world.purchaseId, size: 2 })
      sizes.push(out.requested)
      if (!out.next) break
      cursor = out.next
    }
    // Batches of two until a short one; every message once; the three backlog ones oldest first.
    expect(sizes.slice(0, -1).every((n) => n === 2)).toBe(true)
    const order = h.emitted.map((e) => String(e.data.subjectId))
    expect(new Set(order).size).toBe(order.length)
    expect(order.filter((id) => older.includes(id))).toEqual(older)
    expect(order.indexOf(older[0]!)).toBe(0)
    // The router's idempotency key: the same message is one action whichever path asked.
    const one = h.emitted[0]!
    expect(one.id).toMatch(/^classify_mail:mail_message:/)

    setPipeline(false)
    expect((await sw.requestBacklogBatch(null, { mailboxId: world.purchaseId })).stopped).toBe(
      'off'
    )
  })

  it('latency: recorded once per live message; p50 / p95 of the window land in live_counter', async () => {
    const a = await msg(3)
    const first = await latency.recordLatency(a)
    expect(first).not.toBeNull()
    expect(await latency.recordLatency(a)).toBeNull()
    const row = await db.mailMessage.findUniqueOrThrow({ where: { id: a } })
    expect(row.firstLabelledAt).not.toBeNull()
    const read = await latency.readLatency()
    expect(read.count).toBe(first!.count)
    expect(read.p95).toBe(first!.p95)
    // A backfilled message never counts.
    expect(await latency.recordLatency(await msg(2, { origin: 'backfill' }))).toBeNull()
  })
})
