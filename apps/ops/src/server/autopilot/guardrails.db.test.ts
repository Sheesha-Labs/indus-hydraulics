import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { resolveLevel } from '@indus/ops-core'
import { getGuardrailsPage } from '../../data/guardrails'
import { forgetGuardrails, loadGuardrails } from '../assistant/guardrail-context'
import { localDatabaseUrl } from '../mail-send/testing/fixture'
import { deleteHoliday, saveGuardrail, saveHoliday } from './guardrails'

/**
 * Board 100 on the local database (S07-T03): fixed rules cannot be saved, params are validated by kind, the
 * version is checked, the Helper is refused, a saved quotation threshold changes resolveLevel's result, and a
 * Ramadan range becomes one row per day that the editor can remove. Counts come from guardrail_trigger.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

describe.skipIf(!DB_URL)('guardrails · local database', () => {
  let ownerId = ''
  let saved: { params: unknown; enabled: boolean } | null = null
  const owner = () => ({ id: ownerId, role: 'owner' as const })

  beforeAll(async () => {
    ownerId = (
      await opsDb.user.findFirstOrThrow({ where: { role: 'owner' }, select: { id: true } })
    ).id
    const g = await opsDb.guardrail.findUniqueOrThrow({
      where: { key: 'value_threshold_quotation' },
    })
    saved = { params: g.params, enabled: g.enabled }
  })

  afterAll(async () => {
    if (saved)
      await opsDb.guardrail.update({
        where: { key: 'value_threshold_quotation' },
        data: {
          params: saved.params as never,
          enabled: saved.enabled,
          signoffStatus: 'awaiting',
          signedOffById: null,
          signedOffAt: null,
        },
      })
    forgetGuardrails()
  })

  const version = async (key: string) =>
    (await opsDb.guardrail.findUniqueOrThrow({ where: { key } })).version

  it('the two fixed rules cannot be saved', async () => {
    for (const key of ['fixed_client_prices', 'fixed_no_money']) {
      const v = await version(key)
      await expect(
        opsDb.$transaction((tx) =>
          saveGuardrail(tx, { key, enabled: false, params: {}, version: v }, owner())
        )
      ).rejects.toThrow(/Fixed rules/)
    }
  })

  it('params are validated by kind; a stale version and a Helper are refused', async () => {
    const v = await version('margin_floor')
    await expect(
      opsDb.$transaction((tx) =>
        saveGuardrail(
          tx,
          {
            key: 'margin_floor',
            enabled: true,
            params: { floorPct: 3, hardMinPct: 5 },
            version: v,
          },
          owner()
        )
      )
    ).rejects.toThrow(/hard minimum/)
    await expect(
      opsDb.$transaction((tx) =>
        saveGuardrail(
          tx,
          {
            key: 'margin_floor',
            enabled: true,
            params: { floorPct: 12, hardMinPct: 5 },
            version: v + 5,
          },
          owner()
        )
      )
    ).rejects.toThrow(/changed|conflict|someone/i)
    await expect(
      opsDb.$transaction((tx) =>
        saveGuardrail(
          tx,
          {
            key: 'margin_floor',
            enabled: true,
            params: { floorPct: 12, hardMinPct: 5 },
            version: v,
          },
          { id: ownerId, role: 'helper' }
        )
      )
    ).rejects.toThrow()
  })

  it('raising the saved quotation threshold changes resolveLevel’s result', async () => {
    const def = await opsDb.autopilotActionDef.findUniqueOrThrow({
      where: { key: 'follow_up_emails' },
    })
    const resolve = async () => {
      forgetGuardrails()
      return resolveLevel({
        def,
        external: true,
        configuredLevel: 'do_and_tell',
        mode: 'custom',
        ctx: { valueAed: 250_000 },
        guardrails: await loadGuardrails(opsDb),
        state: { origin: 'live', paused: false, budget: 'ok', mailboxLive: true },
      })
    }
    const v = await version('value_threshold_quotation')
    await opsDb.$transaction((tx) =>
      saveGuardrail(
        tx,
        {
          key: 'value_threshold_quotation',
          enabled: true,
          params: { appliesTo: 'quotation', currency: 'AED', amount: 200_000 },
          version: v,
        },
        owner()
      )
    )
    expect((await resolve()).level).toBe('draft_and_ask')
    const out = await opsDb.$transaction((tx) =>
      saveGuardrail(
        tx,
        {
          key: 'value_threshold_quotation',
          enabled: true,
          params: { appliesTo: 'quotation', currency: 'AED', amount: 300_000 },
          version: v + 1,
        },
        owner()
      )
    )
    expect(out.version).toBe(v + 2)
    expect((await resolve()).level).toBe('do_and_tell')
    const row = await opsDb.guardrail.findUniqueOrThrow({
      where: { key: 'value_threshold_quotation' },
    })
    expect(row.signoffStatus).toBe('signed_off')
  })

  it('counts come from guardrail_trigger', async () => {
    await opsDb.guardrailTrigger.create({
      data: {
        guardrailKey: 'credit_hold',
        actionKey: 'manual_reply',
        text: 'Client on credit hold',
      },
    })
    const page = await getGuardrailsPage({ role: 'owner' })
    const row = page.rows.find((r) => r.key === 'credit_hold')!
    expect(row.monthCount).toBeGreaterThanOrEqual(1)
    expect(page.last[0]?.detail).toContain('Client on credit hold')
    expect(page.rows.some((r) => r.key === 'fixed_no_money' && r.fixed)).toBe(true)
  })

  it('a Ramadan range becomes one row per day, and a row can be removed', async () => {
    const out = await opsDb.$transaction((tx) =>
      saveHoliday(
        tx,
        {
          country: 'AE',
          date: '2099-02-01',
          to: '2099-02-03',
          name: 'Ramadan (test)',
          kind: 'ramadan',
          hoursStart: '10:00',
          hoursEnd: '15:00',
        },
        owner()
      )
    )
    expect(out.dates).toEqual(['2099-02-01', '2099-02-02', '2099-02-03'])
    for (const id of out.ids) await opsDb.$transaction((tx) => deleteHoliday(tx, { id }, owner()))
    expect(await opsDb.holiday.count({ where: { id: { in: out.ids } } })).toBe(0)
    await expect(
      opsDb.$transaction((tx) =>
        saveHoliday(tx, { country: 'AE', date: '2099-03-01', name: 'x', kind: 'ramadan' }, owner())
      )
    ).rejects.toThrow(/hours/)
  })
})
