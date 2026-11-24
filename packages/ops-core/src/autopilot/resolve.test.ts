import { describe, expect, it } from 'vitest'
import type { AutopilotLevel } from '../state/labels'
import { catalogueDefs, defaultGuardrails } from './catalogue.fixture'
import type { GuardrailContext } from './guardrails'
import { sendsExternally } from './keys'
import { compareLevels } from './levels'
import { effectiveLock, presetLevel } from './presets'
import { ASKED_BECAUSE, baseLevel, resolveLevel, type ResolveInput } from './resolve'
import type { AutopilotModeOrCustom } from './types'

const DEFS = catalogueDefs()
const GUARDS = defaultGuardrails()
const LIVE = { origin: 'live', paused: false, budget: 'ok', mailboxLive: true } as const

function input(
  key: string,
  over: Partial<ResolveInput> = {},
  ctx: GuardrailContext = {}
): ResolveInput {
  const def = DEFS.find((d) => d.key === key)!
  return {
    def,
    external: sendsExternally(key),
    research: key === 'research_suppliers',
    configuredLevel: null,
    mode: 'careful',
    ctx,
    guardrails: GUARDS,
    state: LIVE,
    ...over,
  }
}

/** One context per guardrail, each alone (S07-T01 table). */
const ALONE: Record<string, GuardrailContext> = {
  value_quotation: { valueAed: 250_000 },
  value_rfq: { valueUsd: 60_000 },
  first_contact: { counterpartyIsNew: true, counterpartyName: 'Example Valve Co' },
  margin_floor: { minMarginPct: 9.8 },
  credit_hold: { clientOnCreditHold: true, clientName: 'Sample Client LLC' },
  working_hours: { outsideHours: 'hours' },
  holiday: { outsideHours: 'holiday' },
  daily_cap: { overDailyCap: true },
  research_cap: { enquiryResearchUsd: 5 },
}
const ASKING = new Set([
  'value_quotation',
  'value_rfq',
  'first_contact',
  'margin_floor',
  'credit_hold',
])
const MODES: readonly AutopilotModeOrCustom[] = ['careful', 'balanced', 'hands_off', 'custom']

describe('resolveLevel · every key × mode × guardrail alone (S07-T01 table)', () => {
  for (const def of DEFS) {
    for (const mode of MODES) {
      const configured: AutopilotLevel | null = mode === 'custom' ? null : presetLevel(mode, def)
      it(`${def.key} · ${mode}`, () => {
        const lock = effectiveLock(def)
        const base = baseLevel(def, configured, mode)
        const plain = resolveLevel(input(def.key, { mode, configuredLevel: configured }))
        expect(plain.base).toBe(base)
        if (lock) expect(plain.level).toBe(lock)
        expect(compareLevels(plain.level, base)).toBeLessThanOrEqual(0)

        for (const [name, ctx] of Object.entries(ALONE)) {
          const r = resolveLevel(input(def.key, { mode, configuredLevel: configured }, ctx))
          expect(compareLevels(r.level, base), name).toBeLessThanOrEqual(0)
          if (lock) expect(r.level, name).toBe(lock)
          const external = sendsExternally(def.key)
          if (ASKING.has(name) && lock === null) {
            const asks = r.hits.some((h) => h.effect === 'ask')
            if (asks) {
              expect(compareLevels(r.level, 'draft_and_ask'), name).toBeLessThanOrEqual(0)
              expect(
                r.reasons.some((t) => t.startsWith(ASKED_BECAUSE)),
                name
              ).toBe(true)
            }
          }
          if ((name === 'working_hours' || name === 'holiday') && external && !r.blocked) {
            expect(r.queue, name).toBe('working_hours')
          }
          if (name === 'daily_cap' && external && !r.blocked) expect(r.queue).toBe('cap')
          if (!external) expect(r.queue, name).toBeUndefined()
        }

        expect(resolveLevel(input(def.key, { state: { ...LIVE, paused: true } })).blocked).toBe(
          plain.blocked === 'origin' || plain.blocked === 'never' || plain.blocked === 'off'
            ? plain.blocked
            : 'paused'
        )
        expect(
          resolveLevel(input(def.key, { state: { ...LIVE, origin: 'backfill' } })).blocked
        ).toBe('origin')
        const hard = resolveLevel(input(def.key, { state: { ...LIVE, budget: 'hard_stop' } }))
        expect(['budget', 'never', 'off', 'escalate']).toContain(hard.blocked)
        const down = resolveLevel(input(def.key, { state: { ...LIVE, mailboxLive: false } }))
        if (external(def.key) && !down.blocked) expect(down.waitsForMailbox).toBe(true)
        else expect(down.waitsForMailbox).toBeUndefined()
      })
    }
  }
})

function external(key: string) {
  return sendsExternally(key)
}

describe('resolveLevel · fixed rows', () => {
  it('#20 and #28 are Draft and ask whatever the mode or setting says', () => {
    for (const key of ['send_quotation', 'supplier_pos']) {
      for (const mode of MODES) {
        const r = resolveLevel(input(key, { mode, configuredLevel: 'do_quietly' }))
        expect(r.level).toBe('draft_and_ask')
        expect(r.blocked).toBeUndefined()
      }
    }
  })
  it('#32 is Never and blocked', () => {
    const r = resolveLevel(input('supplier_payments', { configuredLevel: 'do_quietly' }))
    expect(r.level).toBe('never')
    expect(r.blocked).toBe('never')
    expect(r.hits.map((h) => h.key)).toContain('fixed_no_money')
  })
  it('priced client sends never go above Draft and ask, even with a stray setting', () => {
    for (const key of ['order_ack_proforma', 'advance_reminders', 'payment_reminders']) {
      const r = resolveLevel(input(key, { configuredLevel: 'do_quietly', mode: 'hands_off' }))
      expect(compareLevels(r.level, 'draft_and_ask')).toBeLessThanOrEqual(0)
      expect(r.hits.map((h) => h.key)).toContain('fixed_client_prices')
    }
  })
  it('correction_email is capped at Draft and ask', () => {
    const r = resolveLevel(input('correction_email', { configuredLevel: 'do_quietly' }))
    expect(r.level).toBe('draft_and_ask')
  })
  it('Off blocks the run', () => {
    expect(resolveLevel(input('extract_lines', { configuredLevel: 'off' })).blocked).toBe('off')
  })
})

describe('resolveLevel · action rules', () => {
  it('#13 asks until the first chaser was approved, then follows the setting', () => {
    const first = resolveLevel(input('chase_suppliers', { configuredLevel: 'do_and_tell' }, {}))
    expect(first.level).toBe('draft_and_ask')
    expect(first.hits[0]?.key).toBe('rule:chaser_first')
    const later = resolveLevel(
      input('chase_suppliers', { configuredLevel: 'do_and_tell' }, { firstChaserApproved: true })
    )
    expect(later.level).toBe('do_and_tell')
  })
  it('#13 stops after the last chaser and asks a person to escalate', () => {
    const r = resolveLevel(
      input(
        'chase_suppliers',
        { configuredLevel: 'do_and_tell' },
        { firstChaserApproved: true, chasersSent: 3 }
      )
    )
    expect(r.blocked).toBe('escalate')
  })
  it('#11 asks before a new supplier gets its first email', () => {
    const r = resolveLevel(
      input('research_suppliers', { configuredLevel: 'do_and_tell' }, { counterpartyIsNew: true })
    )
    expect(r.level).toBe('draft_and_ask')
  })
  it('#19 asks under the floor and refuses under the hard minimum', () => {
    const under = resolveLevel(
      input('price_quotation', { configuredLevel: 'do_and_tell' }, { minMarginPct: 9.8 })
    )
    expect(under.level).toBe('draft_and_ask')
    expect(under.reasons).toContain(`${ASKED_BECAUSE}Margin 9.8% is below the 12% floor`)
    const refused = resolveLevel(
      input('price_quotation', { configuredLevel: 'do_and_tell' }, { minMarginPct: 4 })
    )
    expect(refused.blocked).toBe('never')
  })
  it('the #19 floor follows the saved guardrail, enabled or not', () => {
    const guards = defaultGuardrails(false).map((g) =>
      g.kind === 'margin_floor' ? { ...g, params: { floorPct: 8, hardMinPct: 3 } } : g
    )
    const r = resolveLevel(
      input(
        'price_quotation',
        { configuredLevel: 'do_and_tell', guardrails: guards },
        { minMarginPct: 9 }
      )
    )
    expect(r.level).toBe('do_and_tell')
  })
})

describe('resolveLevel · guardrail texts and switches', () => {
  it('names the guardrail that asked', () => {
    const r = resolveLevel(
      input(
        'send_supplier_rfqs',
        { configuredLevel: 'do_and_tell', mode: 'balanced' },
        { counterpartyIsNew: true, counterpartyName: 'Example Valve Co', valueUsd: 60_000 }
      )
    )
    expect(r.level).toBe('draft_and_ask')
    expect(r.reasons).toContain(`${ASKED_BECAUSE}First email to Example Valve Co`)
    expect(r.reasons).toContain(`${ASKED_BECAUSE}Value above USD 50,000`)
  })
  it('a disabled guardrail does not fire; a fixed one always does', () => {
    const off = defaultGuardrails(false)
    const r = resolveLevel(
      input(
        'send_supplier_rfqs',
        { configuredLevel: 'do_and_tell', guardrails: off },
        { counterpartyIsNew: true }
      )
    )
    expect(r.level).toBe('do_and_tell')
    const p = resolveLevel(input('order_ack_proforma', { guardrails: off }))
    expect(p.hits.map((h) => h.key)).toContain('fixed_client_prices')
  })
  it('raising the quotation threshold changes the result', () => {
    const raised = GUARDS.map((g) =>
      g.key === 'value_threshold_quotation'
        ? { ...g, params: { appliesTo: 'quotation', currency: 'AED', amount: 300_000 } }
        : g
    )
    const ctx = { valueAed: 250_000 }
    const before = resolveLevel(input('follow_up_emails', { configuredLevel: 'do_and_tell' }, ctx))
    const after = resolveLevel(
      input('follow_up_emails', { configuredLevel: 'do_and_tell', guardrails: raised }, ctx)
    )
    expect(before.level).toBe('draft_and_ask')
    expect(after.level).toBe('do_and_tell')
  })
  it('outside hours keeps the level and queues', () => {
    const r = resolveLevel(
      input(
        'chase_suppliers',
        { configuredLevel: 'do_and_tell' },
        { firstChaserApproved: true, outsideHours: 'hours' }
      )
    )
    expect(r.level).toBe('do_and_tell')
    expect(r.queue).toBe('working_hours')
    expect(r.hits[0]?.text).toBe('Outside working hours · queued for 08:30')
  })
  it('research cap stops research for the enquiry', () => {
    const r = resolveLevel(
      input('research_suppliers', { configuredLevel: 'do_and_tell' }, { enquiryResearchUsd: 5.2 })
    )
    expect(r.blocked).toBe('budget')
  })
  it('research_paused stops research only', () => {
    const state = { ...LIVE, budget: 'research_paused' } as const
    expect(resolveLevel(input('research_suppliers', { state })).blocked).toBe('budget')
    expect(resolveLevel(input('classify_mail', { state })).blocked).toBeUndefined()
  })
})
