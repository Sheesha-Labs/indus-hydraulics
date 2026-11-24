import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { AUTOPILOT_LEVELS, type AutopilotLevel } from '../state/labels'
import { catalogueDefs, defaultGuardrails } from './catalogue.fixture'
import type { GuardrailContext } from './guardrails'
import { compareLevels } from './levels'
import { effectiveLock } from './presets'
import { resolveLevel, type ResolveInput } from './resolve'

/**
 * Property tests (S07-T01 acceptance: ≥ 1,000 cases per property). Over arbitrary inputs the resolver never
 * returns a level more autonomous than the base, locked rows always return their lock, Never is never
 * upgraded, and adding a guardrail hit never raises the level (monotonicity).
 */
const RUNS = { numRuns: 2_000 }
const DEFS = catalogueDefs()
const GUARDS = defaultGuardrails()

const level = fc.constantFrom<AutopilotLevel>(...AUTOPILOT_LEVELS)
const ctxArb: fc.Arbitrary<GuardrailContext> = fc.record(
  {
    valueAed: fc.option(fc.double({ min: 0, max: 1e7, noNaN: true }), { nil: null }),
    valueUsd: fc.option(fc.double({ min: 0, max: 1e7, noNaN: true }), { nil: null }),
    counterpartyIsNew: fc.boolean(),
    minMarginPct: fc.option(fc.double({ min: -10, max: 80, noNaN: true }), { nil: null }),
    clientOnCreditHold: fc.boolean(),
    firstChaserApproved: fc.boolean(),
    chasersSent: fc.integer({ min: 0, max: 6 }),
    outsideHours: fc.constantFrom<'hours' | 'holiday' | 'ramadan' | null>(
      null,
      'hours',
      'holiday',
      'ramadan'
    ),
    overDailyCap: fc.boolean(),
    enquiryResearchUsd: fc.option(fc.double({ min: 0, max: 20, noNaN: true }), { nil: null }),
  },
  { requiredKeys: [] }
)
const inputArb: fc.Arbitrary<ResolveInput> = fc.record({
  def: fc.constantFrom(...DEFS),
  configuredLevel: fc.option(level, { nil: null }),
  mode: fc.constantFrom('careful', 'balanced', 'hands_off', 'custom' as const),
  ctx: ctxArb,
  guardrails: fc.subarray(GUARDS),
  research: fc.boolean(),
  external: fc.boolean(),
  state: fc.record({
    origin: fc.constantFrom('live', 'backfill', 'import', 'manual' as const),
    paused: fc.boolean(),
    budget: fc.constantFrom('ok', 'warn80', 'research_paused', 'hard_stop' as const),
    mailboxLive: fc.boolean(),
  }),
})

describe('resolveLevel properties', () => {
  it('is never more autonomous than the base level', () => {
    fc.assert(
      fc.property(inputArb, (i) => {
        const r = resolveLevel(i)
        expect(compareLevels(r.level, r.base)).toBeLessThanOrEqual(0)
        if (i.configuredLevel && !effectiveLock(i.def) && i.configuredLevel !== 'never')
          expect(compareLevels(r.base, i.configuredLevel)).toBeLessThanOrEqual(0)
      }),
      RUNS
    )
  })

  it('locked actions always return their locked level', () => {
    fc.assert(
      fc.property(inputArb, (i) => {
        const lock = effectiveLock(i.def)
        // The database keeps a locked row's setting equal to its lock (locked_level_guard).
        fc.pre(lock !== null && (i.configuredLevel === null || i.configuredLevel === lock))
        expect(resolveLevel(i).level).toBe(lock)
      }),
      RUNS
    )
  })

  it('never is never upgraded', () => {
    fc.assert(
      fc.property(inputArb, (i) => {
        fc.pre(i.def.key === 'supplier_payments' || i.configuredLevel === 'never')
        const r = resolveLevel(i)
        if (i.def.key === 'supplier_payments') {
          expect(r.level).toBe('never')
          expect(r.blocked).toBeDefined()
        } else {
          expect(compareLevels(r.level, 'never')).toBeLessThanOrEqual(0)
        }
      }),
      { ...RUNS, numRuns: 1_000 }
    )
  })

  it('adding a guardrail never raises the level (monotonicity)', () => {
    fc.assert(
      fc.property(inputArb, fc.constantFrom(...GUARDS), (i, extra) => {
        const without = resolveLevel({
          ...i,
          guardrails: i.guardrails.filter((g) => g.key !== extra.key),
        })
        const withIt = resolveLevel({
          ...i,
          guardrails: [...i.guardrails.filter((g) => g.key !== extra.key), extra],
        })
        expect(compareLevels(withIt.level, without.level)).toBeLessThanOrEqual(0)
        if (without.blocked) expect(withIt.blocked).toBeDefined()
      }),
      RUNS
    )
  })

  it('a worse context (more value, someone new, credit hold, lower margin, more chasers) never raises the level', () => {
    fc.assert(
      fc.property(inputArb, (i) => {
        const c = i.ctx
        const worse: GuardrailContext = {
          ...c,
          valueAed: Math.max(c.valueAed ?? 0, 1e9),
          valueUsd: Math.max(c.valueUsd ?? 0, 1e9),
          counterpartyIsNew: true,
          clientOnCreditHold: true,
          minMarginPct: Math.min(c.minMarginPct ?? 100, 1),
          firstChaserApproved: false,
          chasersSent: Math.max(c.chasersSent ?? 0, 3),
          outsideHours: c.outsideHours ?? 'hours',
          overDailyCap: true,
          enquiryResearchUsd: Math.max(c.enquiryResearchUsd ?? 0, 100),
        }
        const r = resolveLevel(i)
        const w = resolveLevel({ ...i, ctx: worse })
        expect(compareLevels(w.level, r.level)).toBeLessThanOrEqual(0)
        if (r.blocked) expect(w.blocked).toBeDefined()
      }),
      RUNS
    )
  })

  it('an external action under a live mailbox never waits; a non-external one never queues', () => {
    fc.assert(
      fc.property(inputArb, (i) => {
        const r = resolveLevel(i)
        if (!i.external) expect(r.queue).toBeUndefined()
        if (i.state.mailboxLive) expect(r.waitsForMailbox).toBeUndefined()
      }),
      RUNS
    )
  })
})
