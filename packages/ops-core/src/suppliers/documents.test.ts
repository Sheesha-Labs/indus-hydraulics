import { describe, expect, it } from 'vitest'
import { isSelectableSupplier, outstandingKinds, requiredDocuments } from './documents'

const today = new Date(Date.UTC(2026, 10, 27))
const d = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day))

describe('required documents', () => {
  it('counts nine, with approvals optional when the line card has no trade', () => {
    const none = requiredDocuments([], { hasTrades: false, today })
    expect(none.rows).toHaveLength(9)
    expect(none.of).toBe(8)
    expect(none.inCount).toBe(0)
    expect(outstandingKinds(none.rows)).not.toContain('approval')
    expect(requiredDocuments([], { hasTrades: true, today }).of).toBe(9)
  })

  it('takes the best live document per kind; an expired one is expired', () => {
    const r = requiredDocuments(
      [
        { kind: 'trade_licence', status: 'received', expiresAt: null },
        { kind: 'iso_certificate', status: 'received', expiresAt: d(2026, 1, 1) },
        { kind: 'code_of_conduct', status: 'awaiting_signature', expiresAt: null },
        { kind: 'nda', status: 'signed', expiresAt: null },
        { kind: 'ownership_declaration', status: 'requested', expiresAt: null },
        { kind: 'vat_certificate', status: 'received', expiresAt: null, archivedAt: d(2026, 5, 1) },
      ],
      { hasTrades: true, today }
    )
    const s = Object.fromEntries(r.rows.map((x) => [x.kind, x.status]))
    expect(s).toMatchObject({
      trade_licence: 'received',
      iso_certificate: 'expired',
      code_of_conduct: 'awaiting_signature',
      nda: 'signed',
      ownership_declaration: 'requested',
      vat_certificate: 'missing',
    })
    expect(r.inCount).toBe(2)
    expect(outstandingKinds(r.rows)).toEqual([
      'vat_certificate',
      'iso_certificate',
      'approval',
      'bank_letter',
      'company_profile',
      'ownership_declaration',
    ])
  })

  it('a valid replacement beats an expired copy', () => {
    const r = requiredDocuments(
      [
        { kind: 'iso_certificate', status: 'received', expiresAt: d(2026, 1, 1) },
        { kind: 'iso_certificate', status: 'received', expiresAt: d(2028, 1, 1) },
      ],
      { hasTrades: false, today }
    )
    expect(r.rows.find((x) => x.kind === 'iso_certificate')!.status).toBe('received')
  })
})

describe('isSelectableSupplier', () => {
  it.each([
    [{ tier: 'contact_only', onboardingStatus: null }, true],
    [{ tier: 'trial', onboardingStatus: 'approved_trial' }, true],
    [{ tier: 'approved', onboardingStatus: 'approved' }, true],
    [{ tier: 'contact_only', onboardingStatus: 'draft' }, false],
    [{ tier: 'contact_only', onboardingStatus: 'proposed' }, false],
    [{ tier: 'contact_only', onboardingStatus: 'under_review' }, false],
    [{ tier: 'contact_only', onboardingStatus: 'rejected' }, false],
    [{ tier: 'approved', onboardingStatus: 'suspended' }, false],
    [{ tier: 'blocked', onboardingStatus: null }, false],
  ])('%o → %s', (p, ok) => {
    expect(isSelectableSupplier(p)).toBe(ok)
  })
})
