import { describe, expect, it } from 'vitest'
import { AUTONOMY_ORDER, compareLevels } from './levels'
import { resolveLevelInterim, type ResolveInterimInput } from './resolve-interim'

const DEF = {
  key: 'classify_mail',
  lockedLevel: null,
  maxLevel: null,
  defaultCareful: 'do_quietly',
  defaultBalanced: 'do_quietly',
  defaultHandsOff: 'do_quietly',
} as const

const base: ResolveInterimInput = {
  def: DEF,
  setting: { level: 'do_quietly' },
  origin: 'live',
  paused: false,
  budget: 'ok',
  mailboxLive: true,
  external: false,
}

describe('resolveLevelInterim', () => {
  it('uses the setting for a live, unpaused action', () => {
    const r = resolveLevelInterim(base)
    expect(r.level).toBe('do_quietly')
    expect(r.blocked).toBeUndefined()
  })

  it('falls back to the Careful default when no setting row exists', () => {
    expect(resolveLevelInterim({ ...base, setting: null }).level).toBe('do_quietly')
  })

  it.each(['backfill', 'import'] as const)('blocks %s origin entirely', (origin) => {
    expect(resolveLevelInterim({ ...base, origin }).blocked).toBe('origin')
  })

  it('blocks when paused, off, never or out of budget', () => {
    expect(resolveLevelInterim({ ...base, paused: true }).blocked).toBe('paused')
    expect(resolveLevelInterim({ ...base, setting: { level: 'off' } }).blocked).toBe('off')
    expect(resolveLevelInterim({ ...base, budget: 'hard_stop' }).blocked).toBe('budget')
    expect(resolveLevelInterim({ ...base, budget: 'research_paused' }).blocked).toBeUndefined()
    expect(
      resolveLevelInterim({ ...base, budget: 'research_paused', research: true }).blocked
    ).toBe('budget')
    const payments = { ...DEF, key: 'supplier_payments', lockedLevel: 'never' as const }
    expect(
      resolveLevelInterim({ ...base, def: payments, setting: { level: 'never' } }).blocked
    ).toBe('never')
  })

  it('honours fixed rules from code even when the row forgot its lock', () => {
    const quotation = { ...DEF, key: 'send_quotation' }
    expect(resolveLevelInterim({ ...base, def: quotation }).level).toBe('draft_and_ask')
  })

  it('caps at the row max and at Draft and ask for priced client sends', () => {
    const capped = { ...DEF, key: 'regret_client', maxLevel: 'draft_and_ask' as const }
    expect(resolveLevelInterim({ ...base, def: capped }).level).toBe('draft_and_ask')
    const priced = { ...DEF, key: 'order_ack_proforma' }
    expect(resolveLevelInterim({ ...base, def: priced }).level).toBe('draft_and_ask')
  })

  it('lets an external effect wait for the mailbox instead of blocking', () => {
    const r = resolveLevelInterim({ ...base, external: true, mailboxLive: false })
    expect(r.waitsForMailbox).toBe(true)
    expect(r.blocked).toBeUndefined()
  })

  it('is never more autonomous than the setting', () => {
    for (const setting of AUTONOMY_ORDER) {
      for (const lockedLevel of [null, ...AUTONOMY_ORDER]) {
        const r = resolveLevelInterim({
          ...base,
          def: { ...DEF, lockedLevel },
          setting: { level: setting },
        })
        expect(compareLevels(r.level, setting), `${setting} / ${lockedLevel}`).toBeLessThanOrEqual(
          0
        )
      }
    }
  })
})
