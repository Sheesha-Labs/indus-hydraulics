import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { OpsUser } from '../../lib/access-core'

/**
 * First-run progress and Setup 1 saves against the real local Postgres (role ops_app):
 * welcome-once in tip_state, markStep rules, the checklist arithmetic from the seeded rows, the
 * Setup 1 save marking the company step, and the autosave conflict path through the action.
 *
 *   DATABASE_URL="postgresql://ops_app:ops_app_local@localhost:54329/<your db>?schema=ops" \
 *     bun run --filter @indus/ops test -- progress.db
 *
 * Skipped without DATABASE_URL; refused for any host but localhost. Every write runs inside a
 * transaction that is rolled back, so the shared rows other DB tests assert on (checklist 'todo',
 * an empty company profile) never change, whatever order or parallelism the suite runs in.
 */

function localDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  try {
    return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(raw).hostname) ? raw : undefined
  } catch {
    return undefined
  }
}

const DB_URL = localDatabaseUrl()

const h = vi.hoisted(() => ({ user: null as OpsUser | null }))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))
vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: () => undefined,
}))
vi.mock('../../lib/env', () => ({ env: () => ({ OPS_READ_ONLY: undefined, APP_ENV: 'test' }) }))
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

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  initials: true,
  role: true,
  canSeeMargins: true,
  canSendSupplierMail: true,
  canEditChaserRules: true,
} as const

class Rollback extends Error {}

describe.skipIf(!DB_URL)('first-run progress · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let progress: typeof import('./progress')
  let company: typeof import('./company')
  let actions: typeof import('../../actions/setup')
  let owner: OpsUser
  let helper: OpsUser

  /** Run `fn` in a transaction and roll it back; returns what `fn` returned. */
  async function rolledBack<T>(
    fn: (tx: import('@indus/ops-db').Prisma.TransactionClient) => Promise<T>
  ) {
    let out: T | undefined
    await db
      .$transaction(async (tx) => {
        out = await fn(tx)
        throw new Rollback()
      })
      .catch((e: unknown) => {
        if (!(e instanceof Rollback)) throw e
      })
    return out as T
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    progress = await import('./progress')
    company = await import('./company')
    actions = await import('../../actions/setup')
    const o = await db.user.findFirst({
      where: { role: 'owner', status: 'active' },
      select: USER_SELECT,
    })
    const hp = await db.user.findFirst({
      where: { role: 'helper', status: 'active' },
      select: USER_SELECT,
    })
    if (!o || !hp) throw new Error('seed an active owner and helper first (SEED_DEMO=1 db:seed)')
    owner = o
    helper = hp
  })

  beforeEach(() => {
    h.user = owner
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  it('welcome once: unseen until marked, then seen; marking twice is harmless', async () => {
    const seen = await rolledBack(async (tx) => {
      await tx.tipState.deleteMany({ where: { userId: owner.id, tipKey: progress.WELCOME_TIP } })
      const before = await progress.isWelcomeSeen(owner.id, tx)
      await progress.markWelcomeSeen(owner.id, tx)
      await progress.markWelcomeSeen(owner.id, tx)
      const after = await progress.isWelcomeSeen(owner.id, tx)
      const rows = await tx.tipState.count({ where: { userId: owner.id, tipKey: 'welcome.seen' } })
      return { before, after, rows }
    })
    expect(seen).toEqual({ before: false, after: true, rows: 1 })
  })

  it('reads the six seeded steps; markStep done records who; skipped never overwrites done', async () => {
    const out = await rolledBack(async (tx) => {
      await tx.checklistItem.updateMany({
        where: { checklist: 'setup' },
        data: { status: 'todo', doneById: null, doneAt: null },
      })
      const start = await progress.getSetupProgress(tx)
      await progress.markStep('company', 'done', owner.id, tx)
      await progress.markStep('company', 'skipped', owner.id, tx)
      await progress.markStep('mailboxes', 'skipped', owner.id, tx)
      const row = await tx.checklistItem.findUniqueOrThrow({
        where: { checklist_key: { checklist: 'setup', key: 'company' } },
        select: { status: true, doneById: true, doneAt: true },
      })
      const after = await progress.getSetupProgress(tx)
      await progress.markStep('company', 'in_progress', owner.id, tx)
      const reopened = await tx.checklistItem.findUniqueOrThrow({
        where: { checklist_key: { checklist: 'setup', key: 'company' } },
        select: { status: true, doneById: true },
      })
      return { start, row, after, reopened }
    })
    expect([out.start.done, out.start.total, out.start.next]).toEqual([0, 6, 'company'])
    expect(out.row.status).toBe('done')
    expect(out.row.doneById).toBe(owner.id)
    expect(out.row.doneAt).toBeInstanceOf(Date)
    expect([out.after.done, out.after.next]).toEqual([2, 'history'])
    expect(out.reopened).toEqual({ status: 'in_progress', doneById: null })
  })

  it('a Setup 1 save stores the profile, keeps copiedFrom, and marks company done only when complete', async () => {
    const out = await rolledBack(async (tx) => {
      const ctx = {
        user: owner,
        requestId: 'test',
        tx,
        withTx: <R>(fn: (t: typeof tx) => Promise<R>) => fn(tx),
      }
      const entry = await tx.settingsEntry.findUniqueOrThrow({
        where: { key: 'company.profile' },
        select: { version: true, value: true },
      })
      // No logo yet (an e2e run may have uploaded one), so the profile alone cannot complete step 1.
      await tx.settingsEntry.update({
        where: { key: 'company.assets' },
        data: { value: { logoFileId: null, stampFileId: null, signatures: {} } },
      })
      // As the copy script leaves it: copied, unconfirmed.
      await tx.settingsEntry.update({
        where: { key: 'company.profile' },
        data: { value: { ...(entry.value as object), copiedFrom: 'website' } },
      })
      const profile = {
        legalName: 'Example Valve Co',
        tradingName: 'Example Valve',
        trn: '000000000000000',
        addressLines: ['Unit 1', 'Dubai'],
        phone: '',
        website: '',
        copiedFrom: null,
        confirmedAt: null,
      }
      const first = await company.saveCompanyProfile(ctx, profile, entry.version, false)
      const stepAfterProfile = await tx.checklistItem.findUniqueOrThrow({
        where: { checklist_key: { checklist: 'setup', key: 'company' } },
        select: { status: true },
      })
      const confirmed = await company.saveCompanyProfile(ctx, profile, first.version, true)
      const stored = await tx.settingsEntry.findUniqueOrThrow({
        where: { key: 'company.profile' },
        select: { value: true, version: true },
      })
      // The logo completes the step.
      const assets = await tx.settingsEntry.findUniqueOrThrow({
        where: { key: 'company.assets' },
        select: { version: true },
      })
      const withLogo = await company.saveCompanyAssets(
        ctx,
        { kind: 'logo' },
        {
          bucket: 'ops-company',
          key: 'company-profile/logo/0193a5b2-7c1d-7e3f-8a9b-0c1d2e3f4a5b-logo.png',
          mime: 'image/png',
          sizeBytes: 68,
          sha256: 'a'.repeat(64),
        },
        'logo.png',
        assets.version
      )
      const audit = await tx.activityEvent.count({
        where: {
          subjectType: 'settings',
          field: { in: ['company.profile', 'company.assets'] },
          actorId: owner.id,
        },
      })
      return { first, stepAfterProfile, confirmed, stored, withLogo, audit }
    })
    expect(out.first.complete).toBe(false)
    expect(out.stepAfterProfile.status).toBe('todo')
    const value = out.stored.value as Record<string, unknown>
    expect(value['copiedFrom']).toBe('website')
    expect(typeof value['confirmedAt']).toBe('string')
    expect(out.stored.version).toBe(out.confirmed.version)
    expect(out.withLogo.complete).toBe(true)
    expect(out.withLogo.fileId).toMatch(/^[0-9a-f-]{36}$/)
    expect(out.audit).toBeGreaterThanOrEqual(3)
  })

  it('autosave conflict: a stale version is refused with the reload sentence and nothing changes', async () => {
    const before = await db.settingsEntry.findUniqueOrThrow({
      where: { key: 'company.profile' },
      select: { version: true, value: true },
    })
    const res = await actions.saveCompanyProfileAction({
      profile: before.value as never,
      expectedVersion: before.version + 7,
    })
    expect(res).toEqual({
      success: false,
      error: expect.stringMatching(/^Someone changed this a moment ago\. Reload and try again\./),
    })
    const after = await db.settingsEntry.findUniqueOrThrow({
      where: { key: 'company.profile' },
      select: { version: true },
    })
    expect(after.version).toBe(before.version)
  })

  it('the setup actions are Owner only', async () => {
    h.user = helper
    const before = await db.settingsEntry.findUniqueOrThrow({
      where: { key: 'company.profile' },
      select: { version: true, value: true },
    })
    const res = await actions.saveCompanyProfileAction({
      profile: before.value as never,
      expectedVersion: before.version,
    })
    expect(res.success).toBe(false)
    const upload = await actions.startCompanyUploadAction({
      slot: { kind: 'logo' },
      filename: 'logo.png',
      size: 10,
      mime: 'image/png',
    })
    expect(upload.success).toBe(false)
  })
})
