import { describe, expect, it } from 'vitest'
import { vatRows, type VatRow } from './vat-rows'

const flat = (rows: VatRow[]) => rows.map((r) => [r.key, r.label, r.value, r.ccy, r.kind ?? ''])

describe('vatRows', () => {
  it('standard 5% on an AED quotation', () => {
    expect(flat(vatRows('standard', '1000.00', '1000.00'))).toEqual([
      ['subtotal', 'Sub total', '1000.00', 'AED', ''],
      ['vat', 'VAT · standard rate (5%)', '50.00', 'AED', ''],
      ['total', 'Total (AED)', '1050.00', 'AED', 'total'],
    ])
  })

  it('zero-rated export: 0% on the whole subtotal, no AED line', () => {
    expect(flat(vatRows('zero_rated_export', '12400.00', '0', '3.6725', 'USD'))).toEqual([
      ['subtotal', 'Sub total', '12400.00', 'USD', ''],
      ['vat', 'VAT · zero-rated export (0%)', '0.00', 'USD', ''],
      ['total', 'Total (USD)', '12400.00', 'USD', 'total'],
    ])
  })

  it('mixed: export lines at 0%, local portion at 5%', () => {
    expect(flat(vatRows('mixed', '12400.00', '4960.00', undefined, 'USD'))).toEqual([
      ['export', 'Export lines (0%)', '7440.00', 'USD', ''],
      ['local', 'Local lines', '4960.00', 'USD', ''],
      ['vat', 'VAT 5% on local lines', '248.00', 'USD', ''],
      ['total', 'Total (USD)', '12648.00', 'USD', 'total'],
    ])
  })

  it('USD quotation with the VAT line in AED', () => {
    expect(flat(vatRows('standard', '12400.00', '12400.00', '3.6725', 'USD'))).toEqual([
      ['subtotal', 'Sub total', '12400.00', 'USD', ''],
      ['vat', 'VAT · standard rate (5%)', '620.00', 'USD', ''],
      ['total', 'Total (USD)', '13020.00', 'USD', 'total'],
      ['vat_aed', 'VAT in AED at 3.6725', '2276.95', 'AED', 'muted'],
    ])
  })

  it('mixed USD quotation also states the VAT in AED', () => {
    const rows = vatRows('mixed', '12400.00', '4960.00', '3.6725', 'USD')
    expect(rows.at(-1)).toEqual({
      key: 'vat_aed',
      label: 'VAT in AED at 3.6725',
      value: '910.78',
      ccy: 'AED',
      kind: 'muted',
    })
  })

  it('rounds VAT half-up to 2 dp and totals the rounded VAT', () => {
    const rows = vatRows('standard', '1234.50', '1234.50')
    expect(rows.find((r) => r.key === 'vat')?.value).toBe('61.73')
    expect(rows.find((r) => r.key === 'total')?.value).toBe('1296.23')
  })

  it('never adds an AED line to an AED document', () => {
    expect(vatRows('standard', '100', '100', '1').map((r) => r.key)).toEqual([
      'subtotal',
      'vat',
      'total',
    ])
  })

  it('refuses impossible inputs', () => {
    expect(() => vatRows('mixed', '100.00', '150.00')).toThrow(RangeError)
    expect(() => vatRows('mixed', '100.00', '-1.00')).toThrow(RangeError)
    expect(() => vatRows('standard', '-1.00', '0')).toThrow(RangeError)
    expect(() => vatRows('standard', '100.00', '0', '0', 'USD')).toThrow(RangeError)
    expect(() => vatRows('standard', 'abc', '0')).toThrow(RangeError)
  })
})
