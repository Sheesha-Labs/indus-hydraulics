import { describe, expect, it } from 'vitest'
import { formatIban, ibanValid, parseBankBlock, withCheckDigits } from './bank'
import { BANK_GATE_REASON, clientDocumentApprovalGate } from './gates'

// Built at run time: the repository never holds an IBAN-shaped literal (public-repo-secrets.test.ts).
const IBAN = withCheckDigits('AE', '0330000010000000001')

describe('IBAN', () => {
  it('mod-97: computed check digits pass, a changed digit fails, the neutral zero IBAN fails', () => {
    expect(ibanValid(IBAN)).toBe(true)
    expect(ibanValid(IBAN.replace(/1$/, '2'))).toBe(false)
    expect(ibanValid('AE00 0000 0000 0000 0000 000')).toBe(false)
    expect(formatIban(IBAN)).toMatch(/^AE\d{2} 0330 0000 1000 0000 001$/)
  })
})

describe('parseBankBlock (a neutral estimate layout)', () => {
  const estimate = [
    'Sub Total 1,000.00',
    'Total USD 1,000.00',
    'Notes',
    'Thank you for your business.',
    'Bank Details',
    'Bank Name: TEST BANK',
    'Account Name: Example Trading LLC',
    `IBAN: ${formatIban(IBAN)}`,
    'SWIFT: TESTAEADXXX',
    'Currency: AED',
    'Terms & Conditions',
    '1. Prices are ex-works.',
  ].join('\n')

  it('finds the block, its fields and its printed lines; the IBAN passes mod-97', () => {
    expect(parseBankBlock(estimate)).toEqual({
      printLines: [
        'Bank Name: TEST BANK',
        'Account Name: Example Trading LLC',
        `IBAN: ${formatIban(IBAN)}`,
        'SWIFT: TESTAEADXXX',
        'Currency: AED',
      ],
      bankName: 'TEST BANK',
      accountName: 'Example Trading LLC',
      iban: IBAN,
      ibanValid: true,
      swift: 'TESTAEADXXX',
      branch: null,
      currency: 'AED',
    })
  })

  it('a wrong IBAN is reported invalid; no IBAN, no block', () => {
    const bad = parseBankBlock(estimate.replace(formatIban(IBAN), 'AE00 0000 0000 0000 0000 000'))
    expect(bad).toMatchObject({ ibanValid: false, bankName: 'TEST BANK' })
    expect(parseBankBlock('Total 1,000.00\nThank you')).toBeNull()
  })
})

describe('clientDocumentApprovalGate', () => {
  const confirmed = {
    currency: 'AED',
    confirmedAt: new Date(),
    showOnDocuments: true,
    archivedAt: null,
  }
  it('refuses every client kind until a block is confirmed; never gates supplier documents', () => {
    for (const kind of ['quotation', 'oa', 'pi', 'invoice', 'cn'] as const)
      expect(clientDocumentApprovalGate({ kind, currency: 'USD', ownBankAccounts: [] })).toEqual({
        allowed: false,
        reason: BANK_GATE_REASON,
      })
    for (const kind of ['rfq', 'po', 'pl', 'dn'] as const)
      expect(
        clientDocumentApprovalGate({ kind, currency: 'USD', ownBankAccounts: [] }).allowed
      ).toBe(true)
  })

  it('a confirmed account for the currency, or a confirmed AED account, allows it; unconfirmed or hidden does not', () => {
    expect(
      clientDocumentApprovalGate({
        kind: 'quotation',
        currency: 'USD',
        ownBankAccounts: [confirmed],
      }).allowed
    ).toBe(true)
    expect(
      clientDocumentApprovalGate({
        kind: 'invoice',
        currency: 'USD',
        ownBankAccounts: [{ ...confirmed, confirmedAt: null }],
      }).allowed
    ).toBe(false)
    expect(
      clientDocumentApprovalGate({
        kind: 'invoice',
        currency: 'EUR',
        ownBankAccounts: [{ ...confirmed, currency: 'EUR', showOnDocuments: false }],
      }).allowed
    ).toBe(false)
  })
})
