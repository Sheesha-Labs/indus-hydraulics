import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { OpsUser } from '../lib/access-core'
import { buildQueueWorld, cleanQueue, localDatabaseUrl, type QueueWorld } from '../server/mail-send/testing/fixture'

/**
 * S06-T04 on the local database: the log pages by keyset without gaps or repeats, filters by action and
 * outcome, hides costs from a Helper without margins, and the CSV export is the Owner's (with the filters).
 */
const DB_URL = localDatabaseUrl()
const TAG = 'alog'
const KEY = 'month_pack'
const h = vi.hoisted(() => ({ user: null as OpsUser | null }))

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../lib/access', async () => {
  const core = await import('../lib/access-core')
  return {
    AccessError: core.AccessError,
    can: core.can,
    requireOpsUser: async (roles?: string[]) => {
      if (!h.user) throw new core.AccessError('unauthenticated')
      if (roles && !roles.includes(h.user.role)) throw new core.AccessError('forbidden')
      return h.user
    },
  }
})

describe.skipIf(!DB_URL)('assistant log · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let log: typeof import('./assistant-log')
  let route: typeof import('../app/api/assistant/log/export/route')
  let world: QueueWorld
  const now = new Date()
  // Actions are append-only: each run writes on its own day in 2024 so earlier runs never show up.
  const dayMs = Date.UTC(2024, 0, 1) + (Math.floor(Date.now() / 1000) % 360) * 86_400_000
  const DAY = new Date(dayMs).toISOString().slice(0, 10)
  const owner = { role: 'owner' as const, canSeeMargins: true }
  const helper = { role: 'helper' as const, canSeeMargins: false }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    log = await import('./assistant-log')
    route = await import('../app/api/assistant/log/export/route')
    world = await buildQueueWorld(db, TAG)
    const base = dayMs + 8 * 3_600_000 - 4 * 3_600_000
    for (let i = 0; i < 55; i++) {
      await db.assistantAction.create({
        data: {
          ref: `A-ALOG-${base}-${String(i).padStart(2, '0')}`,
          actionKey: KEY,
          levelAtTime: 'do_and_tell',
          guardrails: [],
          headline: `Month pack line ${i}`,
          reasons: [],
          state: i % 11 === 0 ? 'failed' : 'done',
          surface: 'hint',
          costUsd: '0.0100',
          createdAt: new Date(base + i * 1_000),
        },
      })
    }
  })

  afterAll(async () => {
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  it('pages by keyset without gaps or repeats', async () => {
    const first = await log.listLog({ day: DAY, action: KEY }, owner, now)
    const r1 = first.days.flatMap((d) => d.rows)
    expect(r1).toHaveLength(50)
    expect(first.nextCursor).toBeTruthy()
    const second = await log.listLog({ day: DAY, action: KEY, cursor: first.nextCursor! }, owner, now)
    const r2 = second.days.flatMap((d) => d.rows)
    expect(r2).toHaveLength(5)
    const all = [...r1, ...r2].map((r) => r.headline)
    expect(new Set(all).size).toBe(55)
    expect(all[0]).toBe('Month pack line 54')
    expect(all.at(-1)).toBe('Month pack line 0')
    expect(second.nextCursor).toBeNull()
  })

  it('filters by outcome; costs show for the Owner, not for a Helper without margins', async () => {
    const failed = await log.listLog({ day: DAY, action: KEY, outcome: 'failed' }, owner, now)
    expect(failed.days.flatMap((d) => d.rows).map((r) => r.outcome.text)).toEqual(Array.from({ length: 5 }, () => 'Failed'))
    const ownerRow = failed.days[0]!.rows[0]!
    expect(ownerRow.cost).toBe('$0.01')
    expect(failed.header.costUsd).not.toBeNull()
    const asHelper = await log.listLog({ day: DAY, action: KEY, outcome: 'failed' }, helper, now)
    expect(asHelper.days[0]!.rows.every((r) => r.cost === null)).toBe(true)
    expect(asHelper.header.costUsd).toBeNull()
  })

  it('the CSV export is the Owner’s, with the filters, and is recorded', async () => {
    const helperUser = await db.user.findUniqueOrThrow({ where: { id: world.helperId } })
    h.user = { ...helperUser, role: 'helper' } as unknown as OpsUser
    expect((await route.GET(new Request(`http://x/api/assistant/log/export?day=${DAY}&action=${KEY}`))).status).toBe(403)
    const ownerUser = await db.user.findUniqueOrThrow({ where: { id: world.ownerId } })
    h.user = { ...ownerUser, role: 'owner', initials: 'KB' } as unknown as OpsUser
    const res = await route.GET(new Request(`http://x/api/assistant/log/export?day=${DAY}&action=${KEY}&outcome=failed`))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-disposition')).toBe(`attachment; filename="assistant-log-${DAY}.csv"`)
    const csv = await res.text()
    const lines = csv.trim().split('\n')
    expect(lines[0]).toBe('time,kind,actor,action_ref,action_key,headline,record,level,outcome,cost_usd')
    expect(lines).toHaveLength(6)
    expect(lines[1]).toContain(',failed,0.010000')
    const note = await db.activityEvent.findFirst({
      where: { actorId: world.ownerId, field: 'export' },
      orderBy: { at: 'desc' },
    })
    expect(note?.note).toMatch(/^KB exported the Assistant log/)
  })
})
