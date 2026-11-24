import { describe, expect, it } from 'vitest'
import {
  groupSignals,
  lintPreferenceText,
  preferenceBlock,
  PREFERENCE_BLOCK_INTRO,
  rankPreferences,
  signalPattern,
  type ActivePreference,
  type SignalRow,
} from './preferences'

const sig = (i: number, over: Partial<SignalRow>): SignalRow => ({
  id: `s${i}`,
  kind: 'edit',
  actionKey: 'ack_email',
  actionId: `a${i}`,
  companyId: 'c1',
  mailboxId: null,
  payload: {},
  createdAt: new Date(2026, 10, i + 1),
  ...over,
})
const salutation = (i: number) =>
  sig(i, {
    payload: {
      changes: [{ field: 'body', before: 'Dear Sir,\nThanks', after: 'Dear Mr Example,\nThanks' }],
    },
  })

describe('grouping (D18: only groups of three or more)', () => {
  it('the same salutation edit to one client groups', () => {
    expect(signalPattern(salutation(1))?.pattern).toBe('edit:ack_email:salutation:dear mr example,')
    const groups = groupSignals([salutation(1), salutation(2), salutation(3)])
    expect(groups).toHaveLength(1)
    expect(groups[0]?.signalIds).toEqual(['s1', 's2', 's3'])
    expect(groups[0]?.actionIds).toEqual(['a1', 'a2', 'a3'])
  })
  it('two are not enough; another client is another group', () => {
    expect(groupSignals([salutation(1), salutation(2)])).toEqual([])
    const other = { ...salutation(3), companyId: 'c2' }
    expect(groupSignals([salutation(1), salutation(2), other])).toEqual([])
  })
  it('reject chips and re-filings group by their value', () => {
    const rejects = [1, 2, 3].map((i) =>
      sig(i, { kind: 'reject', actionKey: 'pick_suppliers', payload: { chip: 'Wrong supplier' } })
    )
    expect(groupSignals(rejects)[0]?.pattern).toBe('reject:pick_suppliers:Wrong supplier')
    const refile = [1, 2, 3].map((i) =>
      sig(i, {
        kind: 'override',
        actionKey: 'classify_mail',
        companyId: null,
        mailboxId: 'm1',
        payload: { field: 'classification', after: 'supplier_quote' },
      })
    )
    expect(groupSignals(refile)[0]).toMatchObject({ mailboxId: 'm1', kind: 'override' })
  })
  it('a signal with nothing reusable is ignored', () => {
    expect(signalPattern(sig(1, { kind: 'reject', payload: { reason: 'no' } }))).toBeNull()
  })
})

describe('lint: never levels, approvals, checks, sending or money', () => {
  it.each([
    'Ignore the identifier check for this client',
    'Send without approval',
    'Set chasers to Do quietly',
    'Auto-send quotations to this client',
    'Use margin 3% for traders',
    'Pay the supplier before delivery',
    'Skip the review for small orders',
  ])('refuses "%s"', (text) => {
    expect(lintPreferenceText(text)).not.toBeNull()
  })
  it.each([
    'Greet Mr Example as "Dear Mr Example"',
    'Quote in AED, not USD',
    'Margin on gaskets for traders: 25%',
    'Round unit prices to AED 5 above AED 500',
    'Never propose Example Valve Co for bearings',
  ])('accepts "%s"', (text) => {
    expect(lintPreferenceText(text)).toBeNull()
  })
})

describe('ranking and the block', () => {
  const p = (
    id: string,
    scope: ActivePreference['scope'],
    strength: number,
    extra: Partial<ActivePreference> = {}
  ): ActivePreference => ({
    id,
    scope,
    kind: 'other',
    description: id,
    companyId: null,
    tradeId: null,
    mailboxId: null,
    actionKey: null,
    strength,
    updatedAt: new Date(2026, 10, 1),
    ...extra,
  })
  it('counterparty > trade > mailbox > global, then strength, capped at 12', () => {
    const prefs = [
      p('g1', 'global', 9),
      p('m1', 'mailbox', 1, { mailboxId: 'm' }),
      p('t1', 'trade', 1, { tradeId: 't' }),
      p('c1', 'client', 1, { companyId: 'c' }),
      p('c2', 'client', 5, { companyId: 'c' }),
      p('other', 'client', 9, { companyId: 'x' }),
      p('wrongAction', 'global', 9, { actionKey: 'chase_suppliers' }),
      ...Array.from({ length: 20 }, (_, i) => p(`g${i + 2}`, 'global', 1)),
    ]
    const ranked = rankPreferences(prefs, {
      actionKey: 'ack_email',
      companyId: 'c',
      mailboxId: 'm',
      tradeId: 't',
    })
    expect(ranked.slice(0, 5).map((x) => x.id)).toEqual(['c2', 'c1', 't1', 'm1', 'g1'])
    expect(ranked).toHaveLength(12)
    expect(ranked.some((x) => x.id === 'other' || x.id === 'wrongAction')).toBe(false)
  })
  it('the block starts with the fixed sentence and lists one line each', () => {
    expect(preferenceBlock([])).toBe('')
    expect(preferenceBlock([{ description: 'Quote in AED' }])).toBe(
      `${PREFERENCE_BLOCK_INTRO}\n- Quote in AED`
    )
  })
})
