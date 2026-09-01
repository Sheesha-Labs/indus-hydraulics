/**
 * Parsing money out of supplier quotations.
 *
 * This is the most dangerous parsing in the whole pipeline. `1.234,56` is
 * twelve hundred euros in Germany and one euro twenty-three in the US, and
 * both readings are perfectly plausible numbers — a misparse does not throw,
 * it produces a price that is wrong by 1000× and looks fine on a quote.
 *
 * Two defences, both non-optional:
 *
 *  1. The decimal convention is decided PER DOCUMENT by voting across every
 *     number in it, never per value. A single "1.234" is genuinely ambiguous;
 *     the same document containing "1.234,56" anywhere resolves it.
 *  2. Where a line states quantity, unit price and total, they are cross-checked.
 *     A 1000× error survives step 1 only if it also survives arithmetic.
 *
 * When neither resolves it, the answer is `null` — a value a human must supply.
 * Guessing a price is never the safer option.
 */

export type DecimalConvention = 'dot' | 'comma' | 'ambiguous'

/** Currency symbols and codes seen on GCC-facing supplier quotations. */
const CURRENCY_TOKENS =
  /(?:AED|USD|EUR|GBP|SAR|QAR|OMR|KWD|BHD|INR|CNY|RMB|TRY|JPY|CHF|SEK|PLN|DHS?|RS\.?|[$€£¥₹﷼])/gi

/** Everything that can sit between digits without being a separator. */
const SPACE_CLASS = /[\s  '’]/g

/**
 * Classify one numeric string.
 *
 * Returns the convention it PROVES, or 'ambiguous' when it proves nothing.
 * Only a number carrying both separators, or a separator followed by a digit
 * run that cannot be a thousands group, proves anything on its own.
 */
export function classifyNumber(raw: string): DecimalConvention {
  const s = raw.replace(CURRENCY_TOKENS, '').replace(SPACE_CLASS, '').trim()
  if (!/\d/.test(s)) return 'ambiguous'

  const lastDot = s.lastIndexOf('.')
  const lastComma = s.lastIndexOf(',')

  // Both present: whichever comes last is the decimal separator.
  if (lastDot >= 0 && lastComma >= 0) {
    return lastDot > lastComma ? 'dot' : 'comma'
  }

  const sep = lastDot >= 0 ? '.' : lastComma >= 0 ? ',' : null
  if (!sep) return 'ambiguous'

  const idx = lastDot >= 0 ? lastDot : lastComma
  const after = s.slice(idx + 1)
  const before = s.slice(0, idx)

  // A group of exactly 3 digits could be either. Anything else is decisive.
  if (!/^\d+$/.test(after)) return 'ambiguous'
  if (after.length === 3) {
    // Two or more separators of the same kind means thousands grouping.
    const count = (s.match(new RegExp(`\\${sep}`, 'g')) ?? []).length
    if (count >= 2) return sep === '.' ? 'comma' : 'dot'
    // "0.500" style — a leading zero before the separator reads as decimal.
    if (/^0+$/.test(before)) return sep === '.' ? 'dot' : 'comma'
    return 'ambiguous'
  }

  // 1, 2, or 4+ digits after the separator: it is a decimal point.
  return sep === '.' ? 'dot' : 'comma'
}

/**
 * Decide the convention for a whole document by voting.
 *
 * Ties resolve to 'ambiguous' rather than to a default. A document that
 * genuinely mixes conventions is a document a human must read.
 */
export function detectDecimalConvention(samples: string[]): DecimalConvention {
  let dot = 0
  let comma = 0

  for (const sample of samples) {
    const verdict = classifyNumber(sample)
    if (verdict === 'dot') dot += 1
    else if (verdict === 'comma') comma += 1
  }

  if (dot === 0 && comma === 0) return 'ambiguous'
  if (dot === comma) return 'ambiguous'
  return dot > comma ? 'dot' : 'comma'
}

/**
 * Parse one money value under a known convention.
 *
 * Returns null when the value cannot be read unambiguously — including when
 * the convention is 'ambiguous' and the number itself does not settle it.
 */
export function parseMoney(raw: string, convention: DecimalConvention): number | null {
  if (typeof raw !== 'string') return null
  const cleaned = raw.replace(CURRENCY_TOKENS, '').replace(SPACE_CLASS, '').trim()
  if (!cleaned || !/\d/.test(cleaned)) return null
  if (!/^[-+]?[\d.,]+$/.test(cleaned)) return null

  const negative = cleaned.startsWith('-')
  const body = cleaned.replace(/^[-+]/, '')

  const own = classifyNumber(body)
  const effective = own !== 'ambiguous' ? own : convention
  if (effective === 'ambiguous') return null

  const decimalSep = effective === 'dot' ? '.' : ','
  const groupSep = effective === 'dot' ? ',' : '.'

  const parts = body.split(decimalSep)
  if (parts.length > 2) return null

  const intPart = parts[0]!.split(groupSep).join('')
  const fracPart = parts[1] ?? ''

  if (!/^\d*$/.test(intPart) || !/^\d*$/.test(fracPart)) return null
  if (intPart === '' && fracPart === '') return null

  const value = Number(`${intPart || '0'}.${fracPart || '0'}`)
  if (!Number.isFinite(value)) return null

  return negative ? -value : value
}

/**
 * Parse every value in a document under one voted convention.
 *
 * Prefer this over calling `parseMoney` value by value — voting is the whole
 * defence, and it only works when the vote sees the whole document.
 */
export function parseMoneyDocument(values: string[]): {
  convention: DecimalConvention
  parsed: Array<number | null>
} {
  const convention = detectDecimalConvention(values)
  return { convention, parsed: values.map((v) => parseMoney(v, convention)) }
}

export type LineCheck = {
  ok: boolean
  /** Set when the three numbers disagree. */
  reason: 'total_mismatch' | 'insufficient_data' | null
  /** qty × unit, for showing the human what was expected. */
  expectedTotal: number | null
}

/**
 * Cross-check quantity × unit price against a stated total.
 *
 * This is the second line of defence: a decimal misparse on the unit price
 * that survives voting will almost always fail here, because the total was
 * parsed under the same convention and would be wrong by a different factor.
 *
 * Tolerance is 1% by default, which absorbs rounding and small discounts
 * without absorbing a 10× error.
 */
export function crossCheckLineTotal(input: {
  qty: number | null
  unitPrice: number | null
  statedTotal: number | null
  tolerancePct?: number
}): LineCheck {
  const { qty, unitPrice, statedTotal } = input
  if (qty == null || unitPrice == null || statedTotal == null) {
    return { ok: true, reason: 'insufficient_data', expectedTotal: null }
  }

  const expected = qty * unitPrice
  if (expected === 0 && statedTotal === 0) {
    return { ok: true, reason: null, expectedTotal: 0 }
  }

  const tolerance = (input.tolerancePct ?? 1) / 100
  const denominator = Math.max(Math.abs(expected), Math.abs(statedTotal))
  const drift = Math.abs(expected - statedTotal) / denominator

  return drift <= tolerance
    ? { ok: true, reason: null, expectedTotal: expected }
    : { ok: false, reason: 'total_mismatch', expectedTotal: expected }
}

/**
 * Flag an offer whose unit price is wildly out of line with its peers.
 *
 * The last catch for a decimal error that survived both earlier checks: if
 * five suppliers quote around 40 and one quotes 40,000, the outlier is a
 * parsing artefact far more often than it is a real price.
 *
 * Uses the median, not the mean — a single 1000× outlier drags a mean so far
 * that it stops flagging itself.
 */
export function isPriceOutlier(price: number, peers: number[], factor = 20): boolean {
  const usable = peers.filter((p) => Number.isFinite(p) && p > 0)
  if (usable.length < 2 || price <= 0) return false

  const sorted = [...usable].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!
  if (median <= 0) return false

  return price > median * factor || price < median / factor
}
