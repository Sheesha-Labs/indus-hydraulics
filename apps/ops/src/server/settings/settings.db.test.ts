import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { OpsUser } from '../../lib/access-core'

/**
 * The settings service against the real local Postgres (role ops_app) after the S03 migrations
 * 3 and 4 are applied: every seeded value parses through getSetting, the version check, the
 * Helper refused on owner-only keys, the audit row committed in the SAME transaction as the value
 * (same xmin), the cache tag purged, an invalid stored value throwing, sign-off and the awaiting
 * list, and the two server actions through defineAction.
 *
 *   DATABASE_URL="postgresql://ops_app:ops_app_local@localhost:54329/<your db>" \
 *     bun run --filter @indus/ops test -- settings
 *
 * Skipped when DATABASE_URL is unset, and refused for any host but localhost: it writes rows.
 * Settings rows and sign-off states are put back afterwards. The activity_event rows it writes
 * stay (append-only by design), so point it at a throwaway database.
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
  revalidated: [] as unknown[][],
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: (...args: unknown[]) => {
    h.revalidated.push(args)
  },
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

const AWAITING = [
  'fx',
  'vat',
  'pricing.defaults',
  'landed.defaults',
  'assistant.budget',
  'research.cap',
  'links',
  'intake',
  'retention',
  'auth',
  'system_email.sender',
  'mail.label_names',
  'mailbox.consent',
  'mail.backfill_exclusions',
  'send.timing',
  'calendar.country_weekends',
  'send.attachment_names',
  'assistant.internal_undo_minutes', // S05-T02
  'ack.revert_by', // S08-T07
  'qualify.free_mail_domains', // S09-T04
  'qualify.rdap_enabled', // S09-T06
  'questions.clock', // S09-T07
  'supplier_docs.request', // S10-T04
  'suppliers.trust', // S10-T05
  'documents.reminders', // S10-T08
]

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

function loadOriginal(db: typeof import('@indus/ops-db').opsDb) {
  return db.settingsEntry.findMany({
    select: { key: true, value: true, signoffStatus: true, signedOffById: true, signedOffAt: true },
  })
}

describe.skipIf(!DB_URL)('settings service · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let get: typeof import('./get')
  let update: typeof import('./update')
  let signoff: typeof import('./signoff')
  let actions: typeof import('../../actions/settings')
  let registry: typeof import('./registry')
  let owner: OpsUser
  let helper: OpsUser
  /** Every settings row as the test found it, put back in afterAll. */
  let original: Awaited<ReturnType<typeof loadOriginal>> = []

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    get = await import('./get')
    update = await import('./update')
    signoff = await import('./signoff')
    actions = await import('../../actions/settings')
    registry = await import('./registry')
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
    // Every toggle on: owner-only settings must still refuse.
    helper = { ...hp, canSeeMargins: true, canSendSupplierMail: true, canEditChaserRules: true }
    original = await loadOriginal(db)
  })

  /** Put every row back as the test found it (tests run in random order; each starts clean). */
  async function restoreOriginal() {
    for (const { key, value, ...signoffState } of original) {
      await db.settingsEntry.update({
        where: { key },
        data: { value: value as object, ...signoffState },
      })
    }
  }

  beforeEach(async () => {
    await restoreOriginal()
    h.revalidated = []
    h.user = owner
  })

  afterAll(async () => {
    await restoreOriginal()
    await db.$disconnect()
  })

  it('seeds every registered key; every value parses through getSetting; starred keys await sign-off', async () => {
    const entries = await get.getSettingEntries(registry.SETTING_KEYS)
    expect(entries.map((e) => e.key)).toEqual(registry.SETTING_KEYS)
    for (const e of entries) {
      expect({ key: e.key, status: e.signoffStatus }).toEqual({
        key: e.key,
        status: AWAITING.includes(e.key) ? 'awaiting' : 'not_required',
      })
      expect({ key: e.key, ownerOnly: e.ownerOnly }).toEqual({
        key: e.key,
        ownerOnly: e.key !== 'setup.progress',
      })
    }
    expect(await get.getSetting('auth')).toEqual({
      sessionHours: 8,
      lockAttempts: 5,
      lockMinutes: 15,
      inviteDays: 7,
      resetMinutes: 30,
    })
    expect(Object.keys(await get.getSetting('system_email.sender')).sort()).toEqual([
      'from',
      'replyTo',
    ])
    expect(await get.getCompanyLegalName()).toBeNull()
  })

  it('seeds the six setup checklist steps, owner-only, in order', async () => {
    const steps = await db.checklistItem.findMany({
      where: { checklist: 'setup' },
      orderBy: { position: 'asc' },
      select: { key: true, label: true, position: true, ownerOnly: true, status: true },
    })
    expect(steps).toEqual([
      {
        key: 'company',
        label: 'Company and documents',
        position: 1,
        ownerOnly: true,
        status: 'todo',
      },
      {
        key: 'mailboxes',
        label: 'Connect mailboxes',
        position: 2,
        ownerOnly: true,
        status: 'todo',
      },
      {
        key: 'history',
        label: 'Bring in your history',
        position: 3,
        ownerOnly: true,
        status: 'todo',
      },
      { key: 'money', label: 'Money defaults', position: 4, ownerOnly: true, status: 'todo' },
      {
        key: 'assistant',
        label: 'How much should the Assistant do?',
        position: 5,
        ownerOnly: true,
        status: 'todo',
      },
      { key: 'invite', label: 'Invite your helper', position: 6, ownerOnly: true, status: 'todo' },
    ])
  })

  it('saves with the current version, refuses the stale one, and purges the tag only on success', async () => {
    const entry = await get.getSettingEntry('links')
    const saved = await update.updateSetting('links', { expiryDays: 45 }, entry.version, owner)
    expect(saved.version).toBe(entry.version + 1)
    expect(h.revalidated).toEqual([['ops:setting:links', { expire: 0 }]])
    expect(await get.getSetting('links')).toEqual({ expiryDays: 45 })

    h.revalidated = []
    const stale = await actions.updateSettingAction({
      key: 'links',
      value: { expiryDays: 30 },
      expectedVersion: entry.version,
    })
    expect(stale).toEqual({
      success: false,
      error: 'Someone changed this a moment ago. Reload and try again.',
    })
    expect(h.revalidated).toEqual([])
    expect(await get.getSetting('links')).toEqual({ expiryDays: 45 })
  })

  it('writes the activity_event row in the same transaction as the value (same xmin)', async () => {
    const entry = await get.getSettingEntry('retention')
    await update.updateSetting('retention', { years: 6 }, entry.version, owner)
    const subjectId = update.settingSubjectId('retention')
    const [value] = await db.$queryRaw<{ x: string }[]>`
      SELECT xmin::text AS x FROM ops.settings_entry WHERE "key" = 'retention'`
    const [event] = await db.$queryRaw<
      { x: string; before: unknown; after: unknown; field: string }[]
    >`
      SELECT xmin::text AS x, "before", "after", "field" FROM ops.activity_event
      WHERE "subjectType" = 'settings' AND "subjectId" = ${subjectId}::uuid
      ORDER BY "at" DESC LIMIT 1`
    expect(event?.x).toBe(value?.x)
    expect(event).toMatchObject({ field: 'retention', before: entry.value, after: { years: 6 } })
  })

  it('refuses the Helper on every owner-only key and lets them save setup.progress', async () => {
    h.user = helper
    for (const key of registry.SETTING_KEYS.filter((k) => k !== 'setup.progress')) {
      const entry = await get.getSettingEntry(key)
      const res = await actions.updateSettingAction({
        key,
        value: entry.value,
        expectedVersion: entry.version,
      } as never)
      expect({ key, res }).toEqual({
        key,
        res: { success: false, error: "You don't have access to do that." },
      })
    }
    const progress = await get.getSettingEntry('setup.progress')
    const ok = await actions.updateSettingAction({
      key: 'setup.progress',
      value: { welcomeSeenBy: [helper.id] },
      expectedVersion: progress.version,
    })
    expect(ok).toEqual({
      success: true,
      data: { key: 'setup.progress', version: progress.version + 1 },
    })
  })

  it('returns field errors keyed value.<field> for a value outside its schema', async () => {
    const entry = await get.getSettingEntry('pricing.defaults')
    const res = await actions.updateSettingAction({
      key: 'pricing.defaults',
      value: { ...entry.value, floorPct: 30 },
      expectedVersion: entry.version,
    })
    expect(res).toEqual({
      success: false,
      error: 'Check the highlighted fields.',
      fieldErrors: { 'value.floorPct': 'The floor cannot be above the default margin.' },
    })
  })

  // 'retention' is read by no other test (S04 send-queue tests read 'undo' in parallel).
  it('throws, logged, when a stored value no longer fits its schema', async () => {
    const before = await db.settingsEntry.findUniqueOrThrow({ where: { key: 'retention' } })
    const spy = vi.spyOn(console, 'error').mockReturnValue(undefined)
    try {
      await db.settingsEntry.update({
        where: { key: 'retention' },
        data: { value: { notAField: 'five' } },
      })
      await expect(get.getSetting('retention')).rejects.toBeInstanceOf(get.InvalidSettingError)
      expect(spy).toHaveBeenCalled()
    } finally {
      spy.mockRestore()
      await db.settingsEntry.update({
        where: { key: 'retention' },
        data: { value: before.value as object },
      })
    }
  })

  it('lists the awaiting keys, lets only the Owner sign one off, and drops it from the list', async () => {
    const awaiting = await signoff.listAwaiting()
    expect(awaiting.map((a) => a.key).sort()).toEqual([...AWAITING].sort())

    h.user = helper
    expect(await actions.markSignedOffAction({ key: 'vat' })).toEqual({
      success: false,
      error: "You don't have access to do that.",
    })

    h.user = owner
    const res = await actions.markSignedOffAction({ key: 'vat' })
    expect(res.success && res.data.alreadySignedOff).toBe(false)
    expect(h.revalidated).toEqual([['ops:setting:vat', { expire: 0 }]])
    expect((await get.getSettingEntry('vat')).signoffStatus).toBe('signed_off')
    expect((await signoff.listAwaiting()).map((a) => a.key)).not.toContain('vat')

    expect(await actions.markSignedOffAction({ key: 'currency' })).toEqual({
      success: false,
      error: 'This setting does not need a sign-off.',
    })
  })
})
