import { describe, expect, it } from 'vitest'
import {
  checkCandidates,
  locateTermsSection,
  offerRefIn,
  approvalRuleLabel,
  approvalRuleSchema,
  evaluateApprovalRule,
  parseVariables,
  renderClause,
  resolveTerms,
  termsForDocument,
  type PresetClauseInput,
} from './index'

describe('variables', () => {
  it('lists the variables a body uses and any unknown name', () => {
    expect(
      parseVariables('{advance_pct}% ADVANCE; BALANCE {balance_days} DAYS, {advance_pct} {advnce}')
    ).toEqual({ names: ['advance_pct', 'balance_days'], unknown: ['advnce'] })
  })

  it('fills, then upper-cases (Zoho style); unknown and missing variables are errors', () => {
    expect(
      renderClause('{advance_pct}% advance against proforma; balance {balance_days} days', {
        advance_pct: 30,
        balance_days: '60',
      })
    ).toEqual({ ok: true, text: '30% ADVANCE AGAINST PROFORMA; BALANCE 60 DAYS' })
    expect(renderClause('Delivery {site}', { site: 'Example site, Ruwais' })).toEqual({
      ok: true,
      text: 'DELIVERY EXAMPLE SITE, RUWAIS',
    })
    expect(renderClause('{advnce_pct}% advance', { advance_pct: 30 })).toEqual({
      ok: false,
      error: '{advnce_pct} is not a variable.',
    })
    expect(renderClause('{days} days', {})).toEqual({ ok: false, error: 'Fill {days}.' })
    expect(renderClause('{days} days', { days: 'sixty' })).toMatchObject({ ok: false })
    expect(renderClause('{advance_pct}%', { advance_pct: 130 })).toMatchObject({ ok: false })
  })
})

describe('approval rules', () => {
  it('evaluates in code; a missing value needs approval', () => {
    const over60 = approvalRuleSchema.parse({ kind: 'payment_days_over', days: 60 })
    expect(evaluateApprovalRule(over60, { days: 90 })).toEqual({
      needsApproval: true,
      reason: 'Payment at 90 days is over 60 days',
    })
    expect(evaluateApprovalRule(over60, { balance_days: 60 }).needsApproval).toBe(false)
    expect(evaluateApprovalRule(over60, {}).needsApproval).toBe(true)
    expect(evaluateApprovalRule({ kind: 'always' }, {}).needsApproval).toBe(true)
    const adv = { kind: 'advance_pct_below', pct: 30 } as const
    expect(evaluateApprovalRule(adv, { advance_pct: 20 }).needsApproval).toBe(true)
    expect(evaluateApprovalRule(adv, { advance_pct: 30 }).needsApproval).toBe(false)
    expect(evaluateApprovalRule(null, {})).toEqual({ needsApproval: false, reason: null })
    expect(approvalRuleLabel(over60)).toBe('Approval above 60 days')
    expect(() => approvalRuleSchema.parse({ kind: 'payment_days_over', days: 60, x: 1 })).toThrow()
  })
})

describe('resolveTerms', () => {
  const clause = (p: Partial<PresetClauseInput>): PresetClauseInput => ({
    code: 'P1',
    title: 'Payment',
    category: 'payment',
    body: '100% advance with order',
    locked: false,
    approvalRule: null,
    defaults: {},
    values: {},
    position: 0,
    ...p,
  })

  it('orders by category, fills defaults < preset < enquiry < override, flags approval', () => {
    const preset = {
      clauses: [
        clause({ code: 'D1', category: 'delivery', title: 'Delivery', body: '{incoterm} {site}' }),
        clause({
          code: 'P4',
          body: '{days} days from delivery',
          approvalRule: { kind: 'payment_days_over', days: 60 },
          defaults: { days: 30 },
          values: { days: 45 },
        }),
      ],
    }
    const out = resolveTerms(preset, {}, { incoterm: 'DAP', site: 'Example site' })
    expect(out.map((t) => [t.code, t.text, t.needsApproval])).toEqual([
      ['P4', '45 DAYS FROM DELIVERY', false],
      ['D1', 'DAP EXAMPLE SITE', false],
    ])
    const over = resolveTerms(preset, { P4: { days: 90 } }, { incoterm: 'DAP', site: 'X' })
    expect(over[0]).toMatchObject({
      text: '90 DAYS FROM DELIVERY',
      needsApproval: true,
      reason: 'Payment at 90 days is over 60 days',
    })
  })

  it('a clause that cannot print is held with its error, and left out of the document rows', () => {
    const out = resolveTerms({
      clauses: [clause({}), clause({ code: 'P2', body: '{balance_days} days', position: 1 })],
    })
    expect(out[1]).toMatchObject({ error: 'Fill {balance_days}.', text: '' })
    expect(termsForDocument(out)).toEqual([{ label: 'Payment', text: '100% ADVANCE WITH ORDER' }])
  })
})

describe('import from offer (deterministic parts)', () => {
  const offer = [
    'QUOTATION',
    'INDUS/Q10001-R2',
    'Bill To Sample Client LLC',
    '1 Gate valve 2 pcs 100.00',
    'Terms & Conditions',
    'PAYMENT: 30% ADVANCE, BALANCE 60 DAYS',
    'DELIVERY: EX-WORKS DUBAI',
    'Authorized Signature',
    'Owner Example',
  ].join('\n')

  it('finds the terms section and the offer number', () => {
    expect(locateTermsSection(offer)).toBe(
      'PAYMENT: 30% ADVANCE, BALANCE 60 DAYS\nDELIVERY: EX-WORKS DUBAI'
    )
    expect(offerRefIn(offer)).toBe('INDUS/Q10001-R2')
    expect(locateTermsSection('no terms here')).toBeNull()
  })

  it('checks candidates: known categories, known variables only', () => {
    expect(
      checkCandidates([
        { category: 'payment', title: 'Advance', body: '{advance_pct}% advance, balance {balnce} days' },
        { category: 'weather', title: '', body: 'Mill certificates 3.1' },
        { category: 'payment', title: 'x', body: 'ab' },
      ])
    ).toEqual([
      {
        category: 'payment',
        title: 'Advance',
        body: '{advance_pct}% advance, balance balnce days',
        variables: ['advance_pct'],
      },
      { category: 'documents', title: 'Imported clause', body: 'Mill certificates 3.1', variables: [] },
    ])
  })
})
