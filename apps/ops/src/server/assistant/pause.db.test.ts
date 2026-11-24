import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { OpsUser } from '../../lib/access-core'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * "Pause everything" end to end on the local database (S05-T08): Owner only (the Helper gets the forbidden
 * Result), one activity row each way, the locked notification raised to everyone on pause and resolved on
 * resume, ops/assistant.paused and ops/assistant.resumed (event id resume:<ISO>), a sync while paused keeps
 * the cursor and records the notified historyId, and resume starts a catch-up sync for each readable mailbox.
 *
 * The pause row is shared: other files that read it pass their own `isPaused` / `paused` stubs.
 */
const DB_URL = localDatabaseUrl()
const TAG = 'pause'
const h = vi.hoisted(() => ({
  user: null as OpsUser | null,
  emitted: [] as Array<{ name: string; id?: string; data: Record<string, unknown> }>,
}))

vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: () => undefined,
  captureMessage: () => undefined,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))
vi.mock('next/server', () => ({ after: (work: () => Promise<void>) => work() }))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async (e: { name: string; id?: string; data: Record<string, unknown> }) => (
    h.emitted.push(e),
    true
  ),
  emitEventOrThrow: async (e: { name: string; id?: string; data: Record<string, unknown> }) =>
    void h.emitted.push(e),
}))
vi.mock('../../inngest/emit-batch', () => ({
  emitEvents: async (es: Array<{ name: string; data: Record<string, unknown> }>) => {
    h.emitted.push(...es)
  },
}))
vi.mock('../../lib/access', async () => {
  const core = await import('../../lib/access-core')
  return {
    can: core.can,
    requireOpsUser: async (roles?: string[]) => {
      if (!h.user) throw new core.AccessError('unauthenticated')
      if (roles && !roles.includes(h.user.role)) throw new core.AccessError('forbidden')
      return h.user
    },
  }
})

describe.skipIf(!DB_URL)('pause everything · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let actions: typeof import('../../actions/assistant-pause')
  let state: typeof import('./state')
  let sync: typeof import('../gmail/sync')
  let resume: typeof import('./on-resumed')
  let world: QueueWorld
  let owner: OpsUser
  let helper: OpsUser

  const select = {
    id: true,
    email: true,
    name: true,
    initials: true,
    role: true,
    canSeeMargins: true,
    canSendSupplierMail: true,
    canEditChaserRules: true,
  } as const

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    actions = await import('../../actions/assistant-pause')
    state = await import('./state')
    sync = await import('../gmail/sync')
    resume = await import('./on-resumed')
    world = await buildQueueWorld(db, TAG)
    owner = (await db.user.findUniqueOrThrow({ where: { id: world.ownerId }, select })) as OpsUser
    helper = (await db.user.findUniqueOrThrow({ where: { id: world.helperId }, select })) as OpsUser
    await db.mailboxSyncState.upsert({
      where: { mailboxId: world.salesId },
      create: { mailboxId: world.salesId, historyId: '1000' },
      update: { historyId: '1000' },
    })
  })

  afterAll(async () => {
    // Never leave the shared row paused.
    await db.assistantState.updateMany({
      where: { id: 1 },
      data: { pausedAt: null, pausedById: null, pauseNote: null },
    })
    await db.notification.deleteMany({
      where: { dedupeKey: 'assistant_paused', userId: { in: [world.ownerId, world.helperId] } },
    })
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  it('the Helper can neither pause nor resume', async () => {
    h.user = helper
    expect(await actions.pauseAssistantAction({})).toMatchObject({ success: false })
    expect(await actions.resumeAssistantAction({})).toMatchObject({ success: false })
  })

  it('the Owner pauses: one activity row, the locked notification, a sync keeps its cursor; resume undoes all of it', async () => {
    h.user = owner
    h.emitted.length = 0
    try {
      const paused = await actions.pauseAssistantAction({ note: 'checking a price' })
      expect(paused).toMatchObject({ success: true, data: { changed: true } })
      state.resetPauseCache()
      expect(await state.isAssistantPaused()).toBe(true)
      expect(h.emitted.map((e) => e.name)).toContain('ops/assistant.paused')
      const notes = await db.notification.findMany({
        where: {
          dedupeKey: 'assistant_paused',
          resolvedAt: null,
          userId: { in: [world.ownerId, world.helperId] },
        },
      })
      expect(notes.map((n) => n.userId).sort()).toEqual([world.ownerId, world.helperId].sort())
      // Idempotent: a second pause changes nothing.
      expect(await actions.pauseAssistantAction({})).toMatchObject({ data: { changed: false } })

      // A push while paused: recorded, cursor untouched, the notified id kept for the record.
      const res = await sync.syncMailbox(
        { mailboxId: world.salesId, reason: 'push', notifiedHistoryId: '1050' },
        { paused: async () => true }
      )
      expect(res.kind).toBe('paused')
      const s1 = await db.mailboxSyncState.findUniqueOrThrow({
        where: { mailboxId: world.salesId },
      })
      expect(s1.historyId).toBe('1000')
      expect(s1.backfillState).toMatchObject({ pendingHistoryId: '1050' })

      h.emitted.length = 0
      const resumed = await actions.resumeAssistantAction({})
      expect(resumed).toMatchObject({ success: true, data: { changed: true } })
      state.resetPauseCache()
      expect(await state.isAssistantPaused()).toBe(false)
      const ev = h.emitted.find((e) => e.name === 'ops/assistant.resumed')
      expect(ev?.id).toMatch(/^resume:\d{4}-\d{2}-\d{2}T/)
      expect(
        await db.notification.count({
          where: {
            dedupeKey: 'assistant_paused',
            resolvedAt: null,
            userId: { in: [world.ownerId, world.helperId] },
          },
        })
      ).toBe(0)
      const trail = await db.activityEvent.findMany({
        where: { field: 'assistant.paused', actorId: world.ownerId },
        orderBy: [{ at: 'desc' }, { id: 'desc' }],
        take: 2,
      })
      expect(trail.map((t) => t.note)).toEqual(['Assistant resumed', 'Assistant paused'])
    } finally {
      await db.assistantState.updateMany({
        where: { id: 1 },
        data: { pausedAt: null, pausedById: null },
      })
      state.resetPauseCache()
    }
    // The notification goes to every active user, and the local database keeps other files' test users.
  }, 30_000)

  it('after resume, every readable mailbox syncs from its stored cursor', async () => {
    h.emitted.length = 0
    await resume.afterResume()
    const ticks = h.emitted
      .filter((e) => e.name === 'ops/gmail.poll.tick')
      .map((e) => e.data.emailAddress)
    const mine = await db.mailbox.findMany({
      where: { id: { in: [world.salesId, world.purchaseId] } },
      select: { address: true, status: true },
    })
    for (const m of mine) {
      if (m.status === 'live') expect(ticks).toContain(m.address)
    }
  })
})
