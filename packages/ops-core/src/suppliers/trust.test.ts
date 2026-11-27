import { describe, expect, it } from 'vitest'
import {
  callbackRefusal,
  canApprove,
  reproposeAfter,
  reproposeAllowed,
  requiresRescreen,
  SCREENING_LISTS,
  screeningComplete,
  trialLimits,
} from './trust'

const all = SCREENING_LISTS.map((l) => l.label)
const clear = all.map((listName) => ({ listName, result: 'clear' as const }))

describe('screeningComplete', () => {
  it('complete when every list has a non-open result', () => {
    expect(screeningComplete(clear)).toEqual({ complete: true, hits: [], possible: [], open: [] })
  })
  it('lists open, error, hit and possible rows; the latest row per list wins', () => {
    const r = screeningComplete([
      ...clear.slice(0, 4),
      { listName: all[4]!, result: 'hit' },
      { listName: all[5]!, result: 'error' },
      { listName: all[6]!, result: 'possible_match' },
      { listName: all[0]!, result: 'open' },
    ])
    expect(r.complete).toBe(false)
    expect(r.open).toEqual([all[0], all[5]])
    expect(r.hits).toEqual([all[4]])
    expect(r.possible).toEqual([all[6]])
  })
  it('a missing list is open; custom required lists', () => {
    expect(screeningComplete([]).open).toHaveLength(7)
    expect(screeningComplete([{ listName: 'X', result: 'clear' }], ['X']).complete).toBe(true)
  })
})

describe('canApprove', () => {
  const ok = { complete: true, hits: [] as string[], possible: [] as string[] }
  it('reject needs a reason', () => {
    expect(
      canApprove({ decision: 'reject', screening: ok, bankVerified: false, openDocuments: [] })
        .allowed
    ).toBe(false)
    expect(
      canApprove({
        decision: 'reject',
        screening: ok,
        bankVerified: false,
        openDocuments: [],
        rejectReason: '  ',
      }).allowed
    ).toBe(false)
    expect(
      canApprove({
        decision: 'reject',
        screening: ok,
        bankVerified: false,
        openDocuments: [],
        rejectReason: 'Counterfeit',
      }).allowed
    ).toBe(true)
  })
  it('approve needs complete screening, no hit or possible match, a genuine call-back and every document', () => {
    expect(
      canApprove({ decision: 'approve', screening: ok, bankVerified: true, openDocuments: [] })
    ).toEqual({ allowed: true, reasons: [], conditions: [] })
    const bad = canApprove({
      decision: 'approve',
      screening: { complete: false, hits: ['UN'], possible: ['EU'] },
      bankVerified: false,
      openDocuments: ['nda'],
    })
    expect(bad.allowed).toBe(false)
    expect(bad.reasons).toHaveLength(5)
  })
  it('trial allows the code of conduct and ownership declaration to wait, as a condition', () => {
    const t = canApprove({
      decision: 'approve_trial',
      screening: ok,
      bankVerified: true,
      openDocuments: ['code_of_conduct', 'ownership_declaration'],
    })
    expect(t.allowed).toBe(true)
    expect(t.conditions).toEqual([
      'first PO blocked until code of conduct and ownership declaration are in',
    ])
    const one = canApprove({
      decision: 'approve_trial',
      screening: ok,
      bankVerified: true,
      openDocuments: ['code_of_conduct'],
    })
    expect(one.conditions).toEqual(['first PO blocked until code of conduct is in'])
    expect(
      canApprove({
        decision: 'approve_trial',
        screening: ok,
        bankVerified: true,
        openDocuments: ['nda'],
      }).allowed
    ).toBe(false)
    expect(
      canApprove({
        decision: 'approve_trial',
        screening: ok,
        bankVerified: true,
        openDocuments: [],
      }).conditions
    ).toEqual([])
  })
})

describe('limits, re-screening, re-proposal', () => {
  const s = {
    trialPos: 3,
    trialPerPoUsd: 25000,
    trialTpiEachPo: true,
    rescreenDays: 90,
    rescreenAboveUsd: 50000,
  }
  const now = new Date(Date.UTC(2026, 10, 27))
  it('trial limits come from the settings', () => {
    expect(trialLimits(s)).toEqual({ pos: 3, perPoUsd: 25000, tpiEachPo: true })
  })
  it('re-screens when never screened, after 90 days, or above USD 50,000', () => {
    expect(requiresRescreen({ lastScreenedAt: null, now, settings: s })).toBe(true)
    expect(
      requiresRescreen({
        lastScreenedAt: new Date(now.getTime() - 91 * 86_400_000),
        now,
        settings: s,
      })
    ).toBe(true)
    expect(
      requiresRescreen({
        lastScreenedAt: new Date(now.getTime() - 10 * 86_400_000),
        now,
        settings: s,
      })
    ).toBe(false)
    expect(
      requiresRescreen({
        lastScreenedAt: new Date(now.getTime() - 10 * 86_400_000),
        now,
        poValueUsd: 50001,
        settings: s,
      })
    ).toBe(true)
    expect(
      requiresRescreen({
        lastScreenedAt: new Date(now.getTime() - 10 * 86_400_000),
        now,
        poValueUsd: null,
        settings: s,
      })
    ).toBe(false)
  })
  it('re-proposal 6 months after a rejection', () => {
    const rejected = new Date(Date.UTC(2026, 4, 1))
    expect(reproposeAfter(rejected, 6).toISOString().slice(0, 10)).toBe('2026-11-01')
    expect(reproposeAllowed(rejected, new Date(Date.UTC(2026, 9, 31)), 6)).toBe(false)
    expect(reproposeAllowed(rejected, new Date(Date.UTC(2026, 10, 1)), 6)).toBe(true)
    expect(reproposeAllowed(null, now, 6)).toBe(true)
  })
})

describe('callbackRefusal', () => {
  const base = {
    numberSource: 'registry' as const,
    numberDialled: '+90 212 000 4400',
    numbersInEmail: [] as string[],
    registryPhone: '+90 (212) 000 4400',
  }
  it('accepts the registry number', () => {
    expect(callbackRefusal(base)).toBeNull()
    expect(callbackRefusal({ ...base, registryPhone: null })).toBeNull()
    expect(
      callbackRefusal({ ...base, numberSource: 'verified_record', registryPhone: '+1 555 0000' })
    ).toBeNull()
  })
  it('refuses another source, a short number, a number from the email and a different registry number', () => {
    expect(callbackRefusal({ ...base, numberSource: 'other' })).toMatch(
      /registry or a verified record/
    )
    expect(callbackRefusal({ ...base, numberDialled: '123' })).toMatch(/Write the number/)
    expect(callbackRefusal({ ...base, numbersInEmail: ['0090 212 000 4400'] })).toMatch(
      /appears in the email/
    )
    expect(callbackRefusal({ ...base, numbersInEmail: [''] })).toBeNull()
    expect(callbackRefusal({ ...base, numberDialled: '+90 212 999 1111' })).toMatch(
      /not the registry number/
    )
  })
})
