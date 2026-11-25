import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { can } from '../../lib/access-core'
import { localDatabaseUrl } from '../mail-send/testing/fixture'
import {
  acceptSuggestion,
  dismissSuggestion,
  levelAudit,
  saveActionRules,
  setActionLevel,
} from './levels'
import { refreshSuggestions } from './suggestions'

/**
 * Board 98 / 99 writes on the local database (S07-T02): locked and over-the-max levels refused, one change
 * turns the mode label to Custom (and back), rules validated and version-checked, the Helper refused except
 * #13's rules with the flag, and the nightly earned-suggestion job (25 clean approvals → one level up).
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

const KEY = 'extract_lines'
const SUGGEST_KEY = 'link_move_merge'

describe.skipIf(!DB_URL)('Autopilot levels · local database', () => {
  let ownerId = ''
  let saved: { key: string; level: string; rules: unknown }[] = []
  let savedMode: unknown = null

  beforeAll(async () => {
    const owner = await opsDb.user.findFirst({ where: { role: 'owner' }, select: { id: true } })
    ownerId = owner?.id ?? ''
    const rows = await opsDb.autopilotSetting.findMany({
      select: { actionKey: true, level: true, rules: true },
    })
    saved = rows.map((r) => ({ key: r.actionKey, level: r.level, rules: r.rules }))
    savedMode = (await opsDb.settingsEntry.findUnique({ where: { key: 'assistant.mode' } }))?.value
  })

  afterAll(async () => {
    for (const r of saved) {
      await opsDb.autopilotSetting.update({
        where: { actionKey: r.key },
        data: {
          level: r.level as never,
          rules: r.rules as never,
          signoffStatus: 'awaiting',
          signedOffById: null,
          signedOffAt: null,
        },
      })
    }
    if (savedMode)
      await opsDb.settingsEntry.update({
        where: { key: 'assistant.mode' },
        data: { value: savedMode as never },
      })
    await opsDb.autopilotSuggestion
      .deleteMany({ where: { actionKey: SUGGEST_KEY } })
      .catch(() => undefined)
  })

  const owner = () => ({ id: ownerId, role: 'owner' as const })
  const version = async (key: string) =>
    (await opsDb.autopilotSetting.findUniqueOrThrow({ where: { actionKey: key } })).version

  it('refuses a locked row and a level above the max', async () => {
    await expect(
      opsDb.$transaction((tx) =>
        setActionLevel(
          tx,
          { actionKey: 'send_quotation', level: 'do_and_tell', version: 0 },
          owner()
        )
      )
    ).rejects.toThrow(/not an Autopilot setting|fixed/i)
    const v = await version('order_ack_proforma')
    await expect(
      opsDb.$transaction((tx) =>
        setActionLevel(
          tx,
          { actionKey: 'order_ack_proforma', level: 'do_and_tell', version: v },
          owner()
        )
      )
    ).rejects.toThrow(/up to Draft and ask/)
  })

  it('refuses a Helper and a stale version', async () => {
    const v = await version(KEY)
    await expect(
      opsDb.$transaction((tx) =>
        setActionLevel(
          tx,
          { actionKey: KEY, level: 'suggest', version: v },
          { id: ownerId, role: 'helper' }
        )
      )
    ).rejects.toThrow()
    await expect(
      opsDb.$transaction((tx) =>
        setActionLevel(tx, { actionKey: KEY, level: 'suggest', version: v + 7 }, owner())
      )
    ).rejects.toThrow()
  })

  it('one change makes the mode Custom and the log says who changed what', async () => {
    // Start from a clean Careful preset.
    const defs = await opsDb.autopilotActionDef.findMany({
      select: { key: true, defaultCareful: true, configurable: true, lockedLevel: true },
    })
    const v = await version(KEY)
    const target =
      (await opsDb.autopilotSetting.findUniqueOrThrow({ where: { actionKey: KEY } })).level ===
      'suggest'
        ? 'off'
        : 'suggest'
    const out = await opsDb.$transaction((tx) =>
      setActionLevel(tx, { actionKey: KEY, level: target, version: v }, owner())
    )
    expect(out.mode).toBe('custom')
    expect(out.version).toBe(v + 1)
    const audit = levelAudit(out, 'KB')
    expect(audit[0]?.note).toMatch(/^KB changed Extract lines: .+ → (Suggest|Off)$/)
    const row = await opsDb.autopilotSetting.findUniqueOrThrow({ where: { actionKey: KEY } })
    expect(row.signoffStatus).toBe('signed_off')
    expect(defs.length).toBeGreaterThan(30)
    const mode = await opsDb.settingsEntry.findUniqueOrThrow({ where: { key: 'assistant.mode' } })
    expect((mode.value as { mode: string }).mode).toBe('custom')
  })

  it('rules: validated, version-checked, Helper only for #13 with the flag', async () => {
    const v = await version('chase_suppliers')
    await expect(
      opsDb.$transaction((tx) =>
        saveActionRules(
          tx,
          { actionKey: 'chase_suppliers', rules: { max: 4 }, version: v },
          owner()
        )
      )
    ).rejects.toThrow(/Invalid|max/)
    const good = {
      firstAfterWorkingDays: 1,
      everyWorkingDays: 3,
      max: 2,
      askCallAfterLast: true,
      skipOutOfOffice: true,
      noFridayAfter: '14:00',
      noWeekends: true,
      askNewSupplier: true,
      askRfqAboveUsd50k: true,
      askTrialSupplier: false,
    }
    const helper = { id: ownerId, role: 'helper' as const }
    const out = await opsDb.$transaction((tx) =>
      saveActionRules(tx, { actionKey: 'chase_suppliers', rules: good, version: v }, helper)
    )
    expect(out.after.everyWorkingDays).toBe(3)
    const ackVersion = await version('ack_email')
    await expect(
      opsDb.$transaction((tx) =>
        saveActionRules(tx, { actionKey: 'ack_email', rules: {}, version: ackVersion }, helper)
      )
    ).rejects.toThrow()
    expect(
      can(
        {
          role: 'helper',
          canSeeMargins: false,
          canSendSupplierMail: false,
          canEditChaserRules: true,
        },
        'edit_chaser_rules'
      )
    ).toBe(true)
    expect(
      can(
        {
          role: 'helper',
          canSeeMargins: false,
          canSendSupplierMail: false,
          canEditChaserRules: false,
        },
        'edit_chaser_rules'
      )
    ).toBe(false)
  })

  it('the nightly job suggests one level up after 25 clean approvals, Not now hides it, Accept applies it', async () => {
    await opsDb.autopilotSuggestion
      .deleteMany({ where: { actionKey: SUGGEST_KEY } })
      .catch(() => undefined)
    const setting = await opsDb.autopilotSetting.findUniqueOrThrow({
      where: { actionKey: SUGGEST_KEY },
    })
    // A level change starts the count again: history is read since the latest level (or mode) change.
    if (setting.level !== 'draft_and_ask')
      await opsDb.autopilotSetting.update({
        where: { actionKey: SUGGEST_KEY },
        data: { level: 'draft_and_ask' },
      })
    const since = (
      await opsDb.activityEvent.create({
        data: {
          actorKind: 'user',
          actorId: ownerId,
          subjectType: 'settings',
          subjectId: randomUUID(),
          kind: 'settings',
          field: `autopilot.${SUGGEST_KEY}.level`,
          note: 'test: level changed',
        },
        select: { at: true },
      })
    ).at
    const base = Date.now()
    for (let i = 0; i < 25; i += 1) {
      await opsDb.assistantAction.create({
        data: {
          ref: `A-99-01-01-${String(9000 + i)}-${randomUUID().slice(0, 4)}`.slice(0, 40),
          actionKey: SUGGEST_KEY,
          levelAtTime: 'draft_and_ask',
          subjectType: 'enquiry',
          subjectId: randomUUID(),
          headline: `Merge test ${i}`,
          reasons: [],
          checks: [],
          state: 'done',
          decidedById: ownerId,
          decidedAt: new Date(base + i),
          createdAt: new Date(since.getTime() + 1 + i),
          idempotencyKey: `t07-suggest:${randomUUID()}`,
          origin: 'live',
          surface: 'review',
        },
      })
    }
    const res = await refreshSuggestions(new Date(base + 60_000))
    expect(res.created + res.updated).toBeGreaterThanOrEqual(1)
    const s = await opsDb.autopilotSuggestion.findFirstOrThrow({
      where: { actionKey: SUGGEST_KEY, acceptedAt: null },
    })
    expect(s.toLevel).toBe('do_and_tell')
    expect(s.streak).toBe(25)

    const snoozed = await opsDb.$transaction((tx) => dismissSuggestion(tx, { id: s.id }))
    expect(new Date(snoozed.until).getTime()).toBeGreaterThan(Date.now() + 13 * 86_400_000)

    const v = await version(SUGGEST_KEY)
    const accepted = await opsDb.$transaction((tx) =>
      acceptSuggestion(tx, { id: s.id, version: v }, owner())
    )
    expect(accepted.to).toBe('do_and_tell')
    const after = await opsDb.autopilotSuggestion.findUniqueOrThrow({ where: { id: s.id } })
    expect(after.acceptedAt).not.toBeNull()
  })
})
