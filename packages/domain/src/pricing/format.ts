/**
 * Single source of truth for catalogue price formatting.
 *
 * The `Currency` enum is the Prisma enum from packages/db/prisma/schema.prisma
 * (USD | INR | EUR | AED | SAR). Both server and client use this helper so
 * the rendered string is identical everywhere — no drift between the admin
 * preview, PLP cards, PDP, search results, and the customer-facing compare
 * page.
 *
 * Rendering rules:
 *   - `null` listPrice → `{ isQuoteOnly: true, primary: '', compareAt: undefined }`.
 *     Caller renders a "Request quote" CTA in place of a price.
 *   - `compareAtPrice <= listPrice` → compareAt suppressed. Never display a
 *     fake or negative discount.
 *   - Negative inputs are clamped to 0. (Should never happen with the Zod
 *     gate in admin — defensive against raw bad data.)
 *   - `Intl.NumberFormat('en-US', { currency, ... })` produces a deterministic
 *     output across server + client given the same inputs.
 *
 * Banker's-rounding is intentional (it's the V8 default for Intl). The
 * fraction-digit policy is `minimumFractionDigits: 0, maximumFractionDigits: 2`
 * so whole-dollar prices render as `$2,890` (matching the design) while
 * fractional prices retain cents.
 */

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'AED' | 'SAR'

export type FormatPriceInput = {
  listPrice: number | null | undefined
  currency: CurrencyCode
  compareAtPrice?: number | null | undefined
  /** Locale override; defaults to 'en-US' for stable global formatting. */
  locale?: string
}

export type FormattedPrice = {
  /** Primary visible price (e.g. "$2,890"). Empty string when isQuoteOnly. */
  primary: string
  /** Optional strike-through price; undefined when not displayed. */
  compareAt: string | undefined
  /** True when no public listPrice exists; render "Request quote" instead. */
  isQuoteOnly: boolean
  /** Whole-percent discount when compareAt is set, else undefined. */
  discountPct?: number
}

export function formatPrice(input: FormatPriceInput): FormattedPrice {
  const { listPrice, currency, compareAtPrice, locale = 'en-US' } = input

  if (listPrice === null || listPrice === undefined) {
    return { primary: '', compareAt: undefined, isQuoteOnly: true }
  }

  const safeList = Math.max(0, listPrice)
  const primary = formatOne(safeList, locale, currency)

  if (
    compareAtPrice === null ||
    compareAtPrice === undefined ||
    compareAtPrice <= safeList
  ) {
    return { primary, compareAt: undefined, isQuoteOnly: false }
  }

  const safeCompare = compareAtPrice
  const compareAt = formatOne(safeCompare, locale, currency)
  const discountPct = Math.round(((safeCompare - safeList) / safeCompare) * 100)
  return { primary, compareAt, isQuoteOnly: false, discountPct }
}

// Whole-dollar prices render without `.00` to match the catalogue design
// ("$2,890" — not "$2,890.00"). Fractional prices force 2 decimals so 2890.5
// renders as "$2,890.50", not "$2,890.5". The 1e-9 tolerance avoids
// floating-point misclassification (e.g. 2890.000000001 won't read as
// fractional).
function formatOne(value: number, locale: string, currency: CurrencyCode): string {
  const hasCents = Math.abs(value - Math.round(value)) > 1e-9
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }
  try {
    return new Intl.NumberFormat(locale, opts).format(value)
  } catch {
    // Bad currency code — extremely rare in practice. Fall back to a
    // no-currency decimal so the page still renders something.
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(value)
  }
}
