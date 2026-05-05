/**
 * Computes the per-quote money lines (subtotal, discount, VAT, shipping,
 * total). Lifted out of the PDF package so admin (Send-Quote composer
 * preview) and PDF rendering share one implementation — historical bug
 * pattern: the composer's "live total preview" drifts from the rendered
 * PDF when one half is updated and the other isn't.
 *
 * Rounding: each output is rounded to 2 decimal places at the end.
 * Intermediate calculations stay full-precision so we don't accumulate
 * rounding error across many lines.
 *
 * VAT base: post-discount subtotal (matches UAE FTA convention).
 */
export type QuoteLine = {
  qty: number
  /** Unit rate in the quote's currency. */
  rate: number
}

export type QuoteTotals = {
  subtotal: number
  discountTotal: number
  vatAmount: number
  shipping: number
  total: number
}

export type ComputeQuoteTotalsInput = {
  lines: ReadonlyArray<QuoteLine>
  /** VAT percentage (0–100). 0 produces no VAT amount. */
  vatRatePct: number
  /** Global discount applied before VAT. Defaults to 0. */
  discountTotal?: number
  /** Shipping added after VAT. Defaults to 0. */
  shipping?: number
}

export function computeQuoteTotals(input: ComputeQuoteTotalsInput): QuoteTotals {
  const subtotal = input.lines.reduce((sum, l) => sum + l.qty * l.rate, 0)
  const discountTotal = input.discountTotal ?? 0
  const vatAmount = (subtotal - discountTotal) * (input.vatRatePct / 100)
  const shipping = input.shipping ?? 0
  const total = subtotal - discountTotal + vatAmount + shipping
  return {
    subtotal: round2(subtotal),
    discountTotal: round2(discountTotal),
    vatAmount: round2(vatAmount),
    shipping: round2(shipping),
    total: round2(total),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
