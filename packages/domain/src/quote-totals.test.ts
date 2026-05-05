import { describe, expect, test } from 'vitest'

import { computeQuoteTotals } from './quote-totals'

describe('computeQuoteTotals', () => {
  test('subtotal sums qty * rate per line', () => {
    const t = computeQuoteTotals({
      lines: [
        { qty: 2, rate: 100 },
        { qty: 3, rate: 50 },
      ],
      vatRatePct: 0,
    })
    expect(t.subtotal).toBe(350)
  })

  test('VAT applied on the post-discount subtotal (UAE FTA convention)', () => {
    const t = computeQuoteTotals({
      lines: [{ qty: 1, rate: 1000 }],
      vatRatePct: 5,
      discountTotal: 100,
    })
    // (1000 - 100) * 5% = 45
    expect(t.vatAmount).toBe(45)
  })

  test('shipping is added after VAT, not subject to VAT', () => {
    const t = computeQuoteTotals({
      lines: [{ qty: 1, rate: 1000 }],
      vatRatePct: 5,
      shipping: 50,
    })
    expect(t.vatAmount).toBe(50) // 1000 * 5%
    expect(t.total).toBe(1100) // 1000 + 50 vat + 50 ship
  })

  test('zero-rated export → vatAmount is 0', () => {
    const t = computeQuoteTotals({
      lines: [{ qty: 1, rate: 1000 }],
      vatRatePct: 0,
    })
    expect(t.vatAmount).toBe(0)
    expect(t.total).toBe(1000)
  })

  test('all components round to 2 decimal places', () => {
    const t = computeQuoteTotals({
      lines: [{ qty: 3, rate: 33.333 }],
      vatRatePct: 5,
    })
    // subtotal = 99.999, vat = 5.0 (rounded), total = 105.0
    expect(t.subtotal).toBe(100)
    expect(t.vatAmount).toBe(5)
    expect(t.total).toBe(105)
  })

  test('combines discount + shipping + VAT correctly', () => {
    const t = computeQuoteTotals({
      lines: [
        { qty: 5, rate: 200 }, // 1000
        { qty: 2, rate: 300 }, // 600
      ],
      vatRatePct: 5,
      discountTotal: 100,
      shipping: 50,
    })
    expect(t.subtotal).toBe(1600)
    expect(t.discountTotal).toBe(100)
    expect(t.vatAmount).toBe(75) // (1600 - 100) * 5%
    expect(t.shipping).toBe(50)
    expect(t.total).toBe(1625) // 1500 + 75 + 50
  })

  test('empty lines → all zeros', () => {
    const t = computeQuoteTotals({ lines: [], vatRatePct: 5 })
    expect(t).toEqual({ subtotal: 0, discountTotal: 0, vatAmount: 0, shipping: 0, total: 0 })
  })
})
