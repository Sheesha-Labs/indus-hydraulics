import {
  add,
  compare,
  formatDecimal,
  mul,
  parseDecimal,
  round,
  sub,
  toDecimalString,
  type DecimalString,
  type Fixed,
} from '../money/decimal'
import { vatRows, type VatMode, type VatRow } from '../vat/vat-rows'
import type { VatTreatment } from './safe'

/**
 * Document arithmetic (S11-T01). Every figure a document prints is computed here in fixed-point decimals and
 * handed to the renderers as strings; renderers never compute (ADR-14). VAT goes through vatRows, the one
 * home of the VAT rule (05 §3.9).
 */

const two = (v: Fixed | DecimalString): DecimalString => toDecimalString(round(v, 2), 2)

/** "1,650.00"; negatives in brackets, as the documents print them. */
export function money(v: Fixed | DecimalString): string {
  const f = formatDecimal(v, 2)
  return f.negative ? `(${f.digits})` : f.digits
}

/** Quantity as printed: no trailing zeros ("24", "2.5"). */
export function qty(v: DecimalString): string {
  const s = toDecimalString(v)
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s
}

/** qty × rate, rounded half-up to 2 dp. */
export function lineAmount(q: DecimalString, rate: DecimalString): DecimalString {
  return two(mul(q, rate))
}

export interface TotalsLine {
  /** null for a line without a price ("Price to follow", "Not quoted"). */
  amount: DecimalString | null
  vat?: VatTreatment
}

export interface DocTotals {
  mode: VatMode
  subTotal: DecimalString
  discount: DecimalString | null
  freight: DecimalString | null
  /** subTotal − discount + freight. */
  net: DecimalString
  vat: DecimalString
  total: DecimalString
  /** The VAT in AED when the document is not in AED and VAT applies. */
  vatAed: DecimalString | null
  rows: VatRow[]
}

/** Standard where every priced line is standard, zero-rated where every one is zero, otherwise mixed. */
export function vatMode(lines: readonly TotalsLine[]): VatMode {
  const priced = lines.filter((l) => l.amount !== null)
  const std = priced.filter((l) => (l.vat ?? 'standard') === 'standard').length
  if (std === priced.length) return 'standard'
  if (std === 0) return 'zero_rated_export'
  return 'mixed'
}

export function documentTotals(i: {
  lines: readonly TotalsLine[]
  currency: string
  discount?: DecimalString
  freight?: DecimalString
  aedRate?: DecimalString
}): DocTotals {
  const mode = vatMode(i.lines)
  const subTotal = i.lines.reduce<Fixed>((s, l) => (l.amount === null ? s : add(s, l.amount)), 0n)
  const discount = i.discount ? round(i.discount, 2) : 0n
  const freight = i.freight ? round(i.freight, 2) : 0n
  if (discount < 0n || freight < 0n) throw new RangeError('discount and freight are not negative')
  if (mode === 'mixed' && (discount || freight))
    throw new RangeError('A discount or freight on a mixed-VAT document must be split by line')
  const net = add(sub(subTotal, discount), freight)
  if (net < 0n) throw new RangeError('the discount is larger than the sub total')
  const local = i.lines.reduce<Fixed>(
    (s, l) => (l.amount !== null && (l.vat ?? 'standard') === 'standard' ? add(s, l.amount) : s),
    0n
  )
  const rows = vatRows(mode, two(net), two(local), i.aedRate, i.currency)
  const vat = rows.find((r) => r.key === 'vat')!.value
  const total = rows.find((r) => r.key === 'total')!.value
  // The sum of the rows is the sub total: the invariant every document prints.
  if (
    compare(
      i.lines.reduce<Fixed>((s, l) => add(s, l.amount ?? '0'), 0n),
      subTotal
    ) !== 0
  )
    throw new Error('line amounts do not add up to the sub total')
  return {
    mode,
    subTotal: two(subTotal),
    discount: discount ? two(discount) : null,
    freight: freight ? two(freight) : null,
    net: two(net),
    vat,
    total,
    vatAed: rows.find((r) => r.key === 'vat_aed')?.value ?? null,
    rows,
  }
}

/** pct% of value, 2 dp ("30" → 30%). */
export function percentOf(value: DecimalString, pct: DecimalString): DecimalString {
  return two(mul(value, toDecimalString(parseDecimal(pct) / 100n)))
}
