import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { OpsUser } from '../../lib/access-core'

/**
 * The seeded Autopilot catalogue and the preset transaction (S03-T06) against the real local Postgres
 * (role ops_app), after `…_ops_autopilot_catalogue_seed.sql`:
 *
 *   * 73 definitions (32 + 41; S05 added manual_reply and ooo_facts, S06 override_value, outbound_attention and
 *     instruction, S08 request_original and resolve_extracted_line), one setting each, Careful active; the locked and capped rows; no
 *     external send above Draft and ask under Careful except the two allowed exceptions;
 *   * ops.locked_level_guard() refuses Do and tell on #20, #26, #27, #31 and anything but Never on #32;
 *   * applyAutopilotPreset: one transaction writes exactly the configurable, unlocked rows whose level
 *     changes (version + 1), the assistant.mode setting and, with presetAudit, one activity_event;
 *     locked and non-configurable rows are untouched under every mode; Careful after Balanced restores
 *     every level; a stale version and a Helper are refused through the action, nothing written;
 *   * Setup 4's save marks checklist 'money' done in the same transaction; floor above margin is
 *     refused with a field error.
 *
 *   DATABASE_URL="postgresql://ops_app:ops_app_local@localhost:54329/<your db>?schema=ops" \
 *     bun run --filter @indus/ops test -- autopilot
 *
 * Skipped without DATABASE_URL; refused for any host but localhost. Every write runs inside a
 * transaction that is rolled back (the refused actions write nothing), so the rows other DB tests and
 * e2e read (Careful, checklist 'todo') never change, whatever order or parallelism the suite runs in.
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

const DEF_SELECT = {
  key: true,
  configurable: true,
  lockedLevel: true,
  maxLevel: true,
  defaultCareful: true,
  defaultBalanced: true,
  defaultHandsOff: true,
  position: true,
  signoffStatus: true,
} as const

class Rollback extends Error {}

type Db = typeof import('@indus/ops-db').opsDb
type Tx = import('@indus/ops-db').Prisma.TransactionClient

describe.skipIf(!DB_URL)('Autopilot catalogue and presets · local database', () => {
  let db: Db
  let core: typeof import('@indus/ops-core')
  let presets: typeof import('./presets')
  let audit: typeof import('../../lib/audit')
  let autopilotActions: typeof import('../../actions/autopilot')
  let setupActions: typeof import('../../actions/setup')
  let money: typeof import('../setup/money')
  let owner: OpsUser
  let helper: OpsUser

  /** Run `fn` in a transaction and roll it back; returns what `fn` returned. */
  async function rolledBack<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    let out: T | undefined
    await db
      .$transaction(
        async (tx) => {
          out = await fn(tx)
          throw new Rollback()
        },
        { timeout: 20_000 }
      )
      .catch((e: unknown) => {
        if (!(e instanceof Rollback)) throw e
      })
    return out as T
  }

  async function snapshot(tx: Tx | Db) {
    const rows = await tx.autopilotSetting.findMany({
      select: { actionKey: true, level: true, version: true, rules: true },
      orderBy: { actionKey: 'asc' },
    })
    return new Map(rows.map((r) => [r.actionKey, r]))
  }

  async function modeEntry(tx: Tx | Db) {
    return tx.settingsEntry.findUniqueOrThrow({
      where: { key: 'assistant.mode' },
      select: { value: true, version: true },
    })
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    core = await import('@indus/ops-core')
    presets = await import('./presets')
    audit = await import('../../lib/audit')
    autopilotActions = await import('../../actions/autopilot')
    setupActions = await import('../../actions/setup')
    money = await import('../setup/money')
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
    helper = { ...hp, canSeeMargins: true, canSendSupplierMail: true, canEditChaserRules: true }
  })

  beforeEach(() => {
    h.user = owner
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  it('seeds 32 catalogue and 41 system definitions, each with a setting at Careful', async () => {
    const defs = await db.autopilotActionDef.findMany({
      select: DEF_SELECT,
      orderBy: { position: 'asc' },
    })
    const settings = await snapshot(db)
    expect(defs.filter((d) => d.position <= 32)).toHaveLength(32)
    expect(defs.filter((d) => d.position >= 101)).toHaveLength(41)
    expect(defs.map((d) => d.key).sort()).toEqual([...core.ACTION_KEYS].sort())
    expect(defs.every((d) => d.signoffStatus === 'awaiting')).toBe(true)
    for (const d of defs)
      expect([d.key, settings.get(d.key)?.level]).toEqual([d.key, d.defaultCareful])
    expect(settings.get('chase_suppliers')?.rules).toEqual({ firstNeedsApproval: true })
    expect((await modeEntry(db)).value).toEqual({ mode: 'careful' })
  })

  it('locks #20 and #28 at Draft and ask and #32 at Never; caps #26, #27, #31', async () => {
    const defs = await db.autopilotActionDef.findMany({
      where: { OR: [{ lockedLevel: { not: null } }, { maxLevel: { not: null } }] },
      select: { key: true, lockedLevel: true, maxLevel: true },
    })
    const locked = Object.fromEntries(
      defs.filter((d) => d.lockedLevel).map((d) => [d.key, d.lockedLevel])
    )
    const capped = Object.fromEntries(
      defs.filter((d) => d.maxLevel).map((d) => [d.key, d.maxLevel])
    )
    expect(locked).toEqual(core.LOCKED_LEVELS)
    expect(capped).toEqual(core.MAX_LEVELS)
    expect([locked['send_quotation'], locked['supplier_pos'], locked['supplier_payments']]).toEqual(
      ['draft_and_ask', 'draft_and_ask', 'never']
    )
  })

  it('no external send runs above Draft and ask under Careful, chase_suppliers and ack_website aside', async () => {
    const defs = await db.autopilotActionDef.findMany({ select: DEF_SELECT })
    expect(core.carefulSendViolations(defs)).toEqual([])
    const settings = await snapshot(db)
    const above = core.SENDS_EXTERNALLY.filter((k) => {
      const level = settings.get(k)?.level
      return level === 'do_and_tell' || level === 'do_quietly'
    })
    expect(above.sort()).toEqual(['ack_website', 'chase_suppliers'])
  })

  it('the database refuses Do and tell on the priced client sends and loosening #32', async () => {
    for (const key of core.PRICED_CLIENT_SENDS) {
      for (const level of ['do_and_tell', 'do_quietly'] as const) {
        await expect(
          rolledBack((tx) =>
            tx.autopilotSetting.update({ where: { actionKey: key }, data: { level } })
          )
        ).rejects.toThrow(/is locked at|allows at most/)
      }
    }
    await expect(
      rolledBack((tx) =>
        tx.autopilotSetting.update({
          where: { actionKey: 'supplier_payments' },
          data: { level: 'draft_and_ask' },
        })
      )
    ).rejects.toThrow(/is locked at never/)
    // Lowering a capped row is allowed.
    const lowered = await rolledBack((tx) =>
      tx.autopilotSetting.update({
        where: { actionKey: 'payment_reminders' },
        data: { level: 'suggest' },
        select: { level: true },
      })
    )
    expect(lowered.level).toBe('suggest')
  })

  it('one transaction: exactly the configurable unlocked rows change, the mode setting, one activity_event', async () => {
    const out = await rolledBack(async (tx) => {
      const defs = await tx.autopilotActionDef.findMany({ select: DEF_SELECT })
      const before = await snapshot(tx)
      const mode = await modeEntry(tx)
      const eventsBefore = await tx.activityEvent.count({ where: { field: 'assistant.mode' } })
      const result = await presets.applyAutopilotPreset(tx, 'balanced', mode.version, owner)
      await audit.writeAudit(tx, owner.id, presets.presetAudit(result))
      const after = await snapshot(tx)
      const modeAfter = await modeEntry(tx)
      const events = await tx.activityEvent.findMany({
        where: { field: 'assistant.mode' },
        orderBy: { at: 'desc' },
        select: { note: true, before: true, after: true },
      })
      return { defs, before, after, mode, modeAfter, result, eventsBefore, events }
    })
    const expected = core.presetLevels('balanced', out.defs)
    const changedKeys = [...expected]
      .filter(([k, l]) => out.before.get(k)?.level !== l)
      .map(([k]) => k)
    expect(changedKeys.length).toBeGreaterThan(0)
    expect(out.result).toMatchObject({
      mode: 'balanced',
      previous: 'careful',
      changed: changedKeys.length,
      version: out.mode.version + 1,
    })
    for (const d of out.defs) {
      const b = out.before.get(d.key)
      const a = out.after.get(d.key)
      const changes = changedKeys.includes(d.key)
      const want = changes
        ? [d.key, expected.get(d.key), (b?.version ?? 0) + 1]
        : [d.key, b?.level, b?.version]
      expect([d.key, a?.level, a?.version]).toEqual(want)
    }
    expect(out.after.get('create_enquiry')?.level).toBe('do_and_tell')
    expect(out.after.get('chase_suppliers')?.rules).toEqual({ firstNeedsApproval: true })
    expect(out.modeAfter).toEqual({ value: { mode: 'balanced' }, version: out.mode.version + 1 })
    expect(out.events).toHaveLength(out.eventsBefore + 1)
    expect(out.events[0]).toEqual({
      note: `Autopilot set to Balanced · ${changedKeys.length} actions changed`,
      before: { mode: 'careful' },
      after: { mode: 'balanced' },
    })
  })

  it('locked and non-configurable rows are untouched under every mode; Careful restores every level', async () => {
    const out = await rolledBack(async (tx) => {
      const defs = await tx.autopilotActionDef.findMany({ select: DEF_SELECT })
      const start = await snapshot(tx)
      const runs: Record<string, Map<string, { level: string; version: number }>> = {}
      for (const mode of ['hands_off', 'balanced', 'careful'] as const) {
        const { version } = await modeEntry(tx)
        await presets.applyAutopilotPreset(tx, mode, version, owner)
        runs[mode] = await snapshot(tx)
      }
      return { defs, start, runs }
    })
    const fixed = out.defs
      .filter((d) => !d.configurable || d.lockedLevel !== null)
      .map((d) => d.key)
    expect(fixed.sort()).toEqual(
      [
        'send_quotation',
        'supplier_pos',
        'supplier_payments',
        'decide_equivalent',
        'claim_draft',
        'cancel_reissue_document',
        'revert_change',
        'bank_change_alert',
        'import_history',
        'update_fx_rates',
        'ooo_facts', // S05: a fact reader, not configurable
        // S06: a person's correction, a send that needs a person, a typed instruction
        'override_value',
        'outbound_attention',
        'instruction',
        // S08: an Unsure extracted line is always a person's question
        'resolve_extracted_line',
      ].sort()
    )
    for (const run of Object.values(out.runs)) {
      for (const key of fixed) {
        expect([key, run.get(key)?.level, run.get(key)?.version]).toEqual([
          key,
          out.start.get(key)?.level,
          out.start.get(key)?.version,
        ])
      }
    }
    const handsOff = core.presetLevels('hands_off', out.defs)
    for (const [key, level] of handsOff)
      expect([key, out.runs['hands_off']?.get(key)?.level]).toEqual([key, level])
    // Hands-off never lifts a priced client send above Draft and ask.
    for (const key of core.PRICED_CLIENT_SENDS) {
      expect(out.runs['hands_off']?.get(key)?.level).toBe('draft_and_ask')
    }
    for (const d of out.defs) {
      expect([d.key, out.runs['careful']?.get(d.key)?.level]).toEqual([
        d.key,
        out.start.get(d.key)?.level,
      ])
    }
  })

  it('the action refuses a Helper and a stale version; nothing is written', async () => {
    const before = await snapshot(db)
    const mode = await modeEntry(db)
    h.user = helper
    const refused = await autopilotActions.applyAutopilotPresetAction({
      mode: 'balanced',
      expectedVersion: mode.version,
    })
    expect(refused).toEqual({ success: false, error: "You don't have access to do that." })
    h.user = owner
    const stale = await autopilotActions.applyAutopilotPresetAction({
      mode: 'hands_off',
      expectedVersion: mode.version + 1000,
    })
    expect(stale).toEqual({
      success: false,
      error: 'Someone changed this a moment ago. Reload and try again.',
    })
    expect(await snapshot(db)).toEqual(before)
    expect(await modeEntry(db)).toEqual(mode)
  })

  it('the service refuses a Helper even when called directly', async () => {
    await expect(
      rolledBack(async (tx) => {
        const { version } = await modeEntry(tx)
        return presets.applyAutopilotPreset(tx, 'balanced', version, helper)
      })
    ).rejects.toThrow('Not allowed')
  })

  it('Setup 4: a save marks checklist money done in its transaction; floor above margin is refused', async () => {
    const out = await rolledBack(async (tx) => {
      const ctx = {
        user: owner,
        requestId: 'test',
        tx,
        withTx: <R>(fn: (t: Tx) => Promise<R>) => fn(tx),
      }
      const entry = await tx.settingsEntry.findUniqueOrThrow({
        where: { key: 'pricing.defaults' },
        select: { value: true, version: true },
      })
      const value = { ...(entry.value as Record<string, unknown>), marginPct: 20 }
      const saved = await money.saveMoneySetting(
        ctx,
        'pricing.defaults',
        value as Parameters<typeof money.saveMoneySetting<'pricing.defaults'>>[2],
        entry.version
      )
      const step = await tx.checklistItem.findUniqueOrThrow({
        where: { checklist_key: { checklist: 'setup', key: 'money' } },
        select: { status: true, doneById: true },
      })
      const stored = await tx.settingsEntry.findUniqueOrThrow({
        where: { key: 'pricing.defaults' },
        select: { value: true, version: true },
      })
      return { saved, step, stored, version: entry.version }
    })
    expect(out.saved.version).toBe(out.version + 1)
    expect(out.step).toEqual({ status: 'done', doneById: owner.id })
    expect((out.stored.value as { marginPct: number }).marginPct).toBe(20)

    const pricing = await db.settingsEntry.findUniqueOrThrow({
      where: { key: 'pricing.defaults' },
      select: { value: true, version: true },
    })
    const bad = await setupActions.saveMoneySettingAction({
      key: 'pricing.defaults',
      value: {
        ...(pricing.value as Record<string, unknown>),
        marginPct: 10,
        floorPct: 12,
      } as never,
      expectedVersion: pricing.version,
    })
    expect(bad.success).toBe(false)
    expect(bad.success ? {} : bad.fieldErrors).toMatchObject({
      'value.floorPct': 'The floor cannot be above the default margin.',
    })
    const step = await db.checklistItem.findUniqueOrThrow({
      where: { checklist_key: { checklist: 'setup', key: 'money' } },
      select: { status: true },
    })
    expect(step.status).toBe('todo')
  })
})
