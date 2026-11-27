import { describe, expect, it } from 'vitest'
import { ibanWithCheckDigits } from './iban'
import {
  bankChangeRisk,
  canPaySupplier,
  checklistAllowsTrial,
  detectBankChangeRequest,
  suggestApprovedPromotion,
  tierChecklist,
} from './promotion'

describe('tierChecklist', () => {
  it('all good', () => {
    const rows = tierChecklist({
      licenceEvidence: true,
      domainAgeDays: 900,
      domainMatchesName: true,
      blocked: false,
      screening: 'clear',
      bank: 'verified',
    })
    expect(rows.map((r) => r.mark)).toEqual(['ok', 'ok', 'ok', 'ok', 'ok'])
    expect(checklistAllowsTrial(rows)).toBe(true)
  })
  it('marks young domains, blocks, hits and pending banks bad; missing evidence none', () => {
    const rows = tierChecklist({
      licenceEvidence: false,
      domainAgeDays: 20,
      domainMatchesName: true,
      blocked: true,
      screening: 'hit',
      bank: 'pending',
    })
    expect(rows.map((r) => r.mark)).toEqual(['none', 'bad', 'bad', 'bad', 'bad'])
    expect(checklistAllowsTrial(rows)).toBe(false)
    const none = tierChecklist({
      licenceEvidence: true,
      domainAgeDays: null,
      domainMatchesName: false,
      blocked: false,
      screening: 'open',
      bank: 'none',
    })
    expect(none.map((r) => r.mark)).toEqual(['ok', 'none', 'ok', 'none', 'none'])
    expect(checklistAllowsTrial(none)).toBe(true)
  })
})

describe('suggestApprovedPromotion', () => {
  const base = {
    tier: 'trial',
    deliveredOnTime: 3,
    deliveredLate: 0,
    qualityClaims: 0,
    approvedAfterPos: 3,
  }
  it('after three good POs on trial only', () => {
    expect(suggestApprovedPromotion(base)).toBe(true)
    expect(suggestApprovedPromotion({ ...base, deliveredOnTime: 2 })).toBe(false)
    expect(suggestApprovedPromotion({ ...base, deliveredLate: 1 })).toBe(false)
    expect(suggestApprovedPromotion({ ...base, qualityClaims: 1 })).toBe(false)
    expect(suggestApprovedPromotion({ ...base, tier: 'approved' })).toBe(false)
  })
})

describe('canPaySupplier', () => {
  const now = new Date(Date.UTC(2026, 10, 27, 12))
  const acc = (
    p: Partial<{
      status: string
      currency: string | null
      coolingOffUntil: Date | null
      supersededAt: Date | null
    }>
  ) => ({
    status: 'verified',
    currency: 'EUR',
    coolingOffUntil: null,
    supersededAt: null,
    ...p,
  })
  it.each([
    [{ tier: 'blocked', accounts: [acc({})] }, 'blocked'],
    [
      { tier: 'trial', accounts: [acc({}), acc({ status: 'pending_verification' })] },
      'bank_change_pending',
    ],
    [{ tier: 'trial', accounts: [] }, 'no_verified_account'],
    [
      { tier: 'trial', accounts: [acc({ currency: 'USD' })], currency: 'EUR' },
      'no_verified_account',
    ],
    [{ tier: 'trial', accounts: [acc({ supersededAt: now })] }, 'no_verified_account'],
    [
      { tier: 'trial', accounts: [acc({ coolingOffUntil: new Date(now.getTime() + 3_600_000) })] },
      'cooling_off',
    ],
  ])('%o → %s', (i, reason) => {
    const r = canPaySupplier({ now, ...i })
    expect(r.allowed).toBe(false)
    expect((r as { reason: string }).reason).toBe(reason)
  })
  it('pays a verified account after its cooling-off', () => {
    expect(
      canPaySupplier({
        tier: 'approved',
        now,
        accounts: [acc({ coolingOffUntil: new Date(now.getTime() - 1) })],
      })
    ).toEqual({ allowed: true })
    expect(
      canPaySupplier({
        tier: 'approved',
        now,
        currency: 'EUR',
        accounts: [acc({ currency: null })],
      })
    ).toEqual({ allowed: true })
  })
})

describe('detectBankChangeRequest', () => {
  const iban = ibanWithCheckDigits('IT', 'X0542811101000000123456')
  const facts = {
    knownIbanLast4: [] as string[],
    lookalikeDomain: false,
    firstEmailFromAddress: false,
    domainAgeDays: null,
  }
  it('finds a change request by phrase or by a new IBAN, with flags', () => {
    const d = detectBankChangeRequest({
      ...facts,
      text: `Please note our bank has changed. Kindly remit the balance now to ${iban}.`,
      lookalikeDomain: true,
    })
    expect(d.isRequest).toBe(true)
    expect(d.ibans).toEqual([iban])
    expect(d.flags.urgency).toBe(true)
    expect(bankChangeRisk(d)).toBe('high')
    expect(detectBankChangeRequest({ ...facts, text: `Payment to ${iban} please` }).isRequest).toBe(
      true
    )
  })
  it('ordinary supplier mail is not a change request', () => {
    for (const text of [
      'Please find our quotation attached, valid 30 days, delivery 6 weeks.',
      'Our bank details are on the invoice as before.',
      'We received your payment, thank you.',
    ])
      expect(detectBankChangeRequest({ ...facts, text }).isRequest).toBe(false)
    expect(
      detectBankChangeRequest({
        ...facts,
        text: `Pay to ${iban} as usual`,
        knownIbanLast4: [iban.slice(-4)],
      }).isRequest
    ).toBe(false)
  })
  it('medium risk without a flag; young domain is high', () => {
    const d = detectBankChangeRequest({
      ...facts,
      text: 'Please update our bank details as attached.',
    })
    expect(bankChangeRisk(d)).toBe('medium')
    expect(bankChangeRisk({ ...d, flags: { ...d.flags, domainAgeDays: 3 } })).toBe('high')
    expect(bankChangeRisk({ ...d, flags: { ...d.flags, firstEmailFromAddress: true } })).toBe(
      'high'
    )
  })
})
