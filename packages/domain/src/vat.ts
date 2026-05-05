/**
 * Computes the VAT rate that should appear on a quote, given the ship-to
 * country, an optional engineer-supplied override, and the store's default
 * rate. Single source of truth — both the admin Send-Quote composer and
 * the PDF renderer must call this function rather than duplicating the
 * UAE-vs-export rule.
 *
 * Rule (UAE FTA): UAE ship-to → use `defaultRate` (currently 5%). Any
 * other country → zero-rated export (rate 0, no VAT line). The legal
 * entity's TRN still appears on the PDF header — that's purely cosmetic
 * and lives outside this function.
 *
 * Override semantics: when `override` is provided (including 0) the
 * engineer's per-quote choice wins. This matches the existing composer
 * behaviour, where setting the rate explicitly overrides the country
 * inference.
 */
export type VatComputation = {
  /** Rate as a percentage, 0–100. */
  rate: number
  /** Display label for the PDF ("VAT @ 5%"). `undefined` hides the line. */
  label: string | undefined
  /** True when zero-rated because of non-UAE ship-to (informational). */
  isExport: boolean
}

export type ComputeVatRateInput = {
  /** ISO-3166 alpha-2 country code, case-insensitive. `null`/missing treated as non-UAE. */
  shipToCountryCode?: string | null
  /** Engineer-supplied per-quote rate. Wins when defined, even if 0. */
  override?: number
  /** Store default UAE-domestic rate, e.g. `5`. Defaults to 5 when omitted. */
  defaultRate?: number
}

export function computeVatRate(input: ComputeVatRateInput): VatComputation {
  if (typeof input.override === 'number') {
    return {
      rate: input.override,
      label: input.override > 0 ? `VAT @ ${input.override.toFixed(0)}%` : undefined,
      isExport: false,
    }
  }
  const isUae = input.shipToCountryCode?.toUpperCase() === 'AE'
  if (isUae) {
    const rate = input.defaultRate ?? 5
    return {
      rate,
      label: rate > 0 ? `VAT @ ${rate.toFixed(0)}%` : undefined,
      isExport: false,
    }
  }
  return { rate: 0, label: undefined, isExport: true }
}
