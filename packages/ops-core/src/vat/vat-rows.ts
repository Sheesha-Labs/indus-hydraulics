import {
  add,
  compare,
  mul,
  parseDecimal,
  round,
  sub,
  toDecimalString,
  type DecimalString,
} from '../money/decimal'

/**
 * The VAT rows a quotation, proforma or tax invoice prints (05 §3.9). One home for the arithmetic so the
 * HTML VatBlock and the PDF show the same figures; VatBlock only renders what this returns.
 *
 * - standard: UAE standard rate 5% on the whole subtotal.
 * - zero_rated_export: 0% on the whole subtotal.
 * - mixed: export lines at 0%, the local portion at 5%.
 *
 * VAT is rounded half-up to 2 dp and the total adds that rounded VAT. When the document currency is not
 * AED and a rate is given, a muted row shows the VAT in AED (the rounded VAT × the rate, rounded to 2 dp),
 * which UAE tax invoices must state. First version (S01-T08); S17 extends it.
 */
export type VatMode = 'standard' | 'zero_rated_export' | 'mixed'

export interface VatRow {
  key: 'subtotal' | 'export' | 'local' | 'vat' | 'total' | 'vat_aed'
  label: string
  /** 2 dp, unformatted: "10938.00". */
  value: DecimalString
  /** Currency of `value`. */
  ccy: string
  kind?: 'total' | 'muted'
}

/** UAE standard rate (Federal Decree-Law No. 8 of 2017), not a configurable default. */
export const VAT_STANDARD_RATE: DecimalString = '0.05'

const money = (v: bigint): DecimalString => toDecimalString(round(v, 2), 2)

export function vatRows(
  mode: VatMode,
  subtotal: DecimalString,
  localPortion: DecimalString,
  aedRate?: DecimalString,
  ccy: string = 'AED'
): VatRow[] {
  const sub2 = round(subtotal, 2)
  if (sub2 < 0n) throw new RangeError('subtotal must not be negative')

  const row = (key: VatRow['key'], label: string, v: bigint, kind?: VatRow['kind']): VatRow => ({
    key,
    label,
    value: money(v),
    ccy,
    ...(kind ? { kind } : {}),
  })

  let base: bigint
  const rows: VatRow[] = []
  if (mode === 'mixed') {
    const local = round(localPortion, 2)
    if (local < 0n || compare(local, sub2) > 0)
      throw new RangeError('localPortion must be between 0 and the subtotal')
    base = local
    rows.push(row('export', 'Export lines (0%)', sub(sub2, local)))
    rows.push(row('local', 'Local lines', local))
  } else {
    base = mode === 'standard' ? sub2 : 0n
    rows.push(row('subtotal', 'Sub total', sub2))
  }

  const vat = round(mul(base, VAT_STANDARD_RATE), 2)
  const vatLabel =
    mode === 'standard'
      ? 'VAT · standard rate (5%)'
      : mode === 'zero_rated_export'
        ? 'VAT · zero-rated export (0%)'
        : 'VAT 5% on local lines'
  rows.push(row('vat', vatLabel, vat))
  rows.push(row('total', `Total (${ccy})`, add(sub2, vat), 'total'))

  if (aedRate !== undefined && ccy !== 'AED' && vat !== 0n) {
    const rate = parseDecimal(aedRate)
    if (rate <= 0n) throw new RangeError('aedRate must be positive')
    rows.push({
      key: 'vat_aed',
      label: `VAT in AED at ${toDecimalString(rate)}`,
      value: money(round(mul(vat, rate), 2)),
      ccy: 'AED',
      kind: 'muted',
    })
  }
  return rows
}
