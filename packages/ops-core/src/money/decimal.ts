/**
 * A tiny fixed-point helper for money (CLAUDE.md §6.8: never floats). A value is a bigint holding the
 * amount × 10^4, the scale of the database's numeric(18,4). Parsing is exact: a string with non-zero
 * digits beyond 4 decimal places is refused rather than rounded silently.
 *
 * Rounding is half-up on the magnitude (half away from zero), so -2.345 rounds to -2.35 at 2 dp.
 * First version (S01-T08); S17 extends it.
 */

/** A decimal as a string, serialised from Prisma.Decimal. Never a float. */
export type DecimalString = string

/** amount × 10^4. */
export type Fixed = bigint

export const DECIMAL_SCALE = 4
const UNIT = 10n ** BigInt(DECIMAL_SCALE)
const DECIMAL = /^([+-])?(\d+)(?:\.(\d+))?$/

/** "1234.5" → 12345000n. Throws RangeError on anything that is not a plain decimal. */
export function parseDecimal(value: DecimalString): Fixed {
  const m = DECIMAL.exec(value.trim())
  if (!m) throw new RangeError(`not a decimal: "${value}"`)
  const [, sign, whole = '0', frac = ''] = m
  if (frac.length > DECIMAL_SCALE && /[1-9]/.test(frac.slice(DECIMAL_SCALE)))
    throw new RangeError(`more than ${DECIMAL_SCALE} decimal places: "${value}"`)
  const digits =
    BigInt(whole) * UNIT + BigInt(frac.slice(0, DECIMAL_SCALE).padEnd(DECIMAL_SCALE, '0'))
  return sign === '-' ? -digits : digits
}

function toFixed(v: Fixed | DecimalString): Fixed {
  return typeof v === 'bigint' ? v : parseDecimal(v)
}

/** n / d rounded half away from zero (d > 0). */
function divRound(n: bigint, d: bigint): bigint {
  const neg = n < 0n
  const q = ((neg ? -n : n) * 2n + d) / (2n * d)
  return neg ? -q : q
}

export function add(a: Fixed | DecimalString, b: Fixed | DecimalString): Fixed {
  return toFixed(a) + toFixed(b)
}

export function sub(a: Fixed | DecimalString, b: Fixed | DecimalString): Fixed {
  return toFixed(a) - toFixed(b)
}

/** a × b, rounded half-up back to 4 dp. */
export function mul(a: Fixed | DecimalString, b: Fixed | DecimalString): Fixed {
  return divRound(toFixed(a) * toFixed(b), UNIT)
}

/** Round to `dp` decimal places (0–4), half away from zero. The result keeps the 10^4 scale. */
export function round(v: Fixed | DecimalString, dp: number): Fixed {
  if (!Number.isInteger(dp) || dp < 0 || dp > DECIMAL_SCALE)
    throw new RangeError(`dp must be 0–${DECIMAL_SCALE}`)
  const step = 10n ** BigInt(DECIMAL_SCALE - dp)
  return divRound(toFixed(v), step) * step
}

export function isNegative(v: Fixed | DecimalString): boolean {
  return toFixed(v) < 0n
}

export function isZero(v: Fixed | DecimalString): boolean {
  return toFixed(v) === 0n
}

/** True when the value has no fractional part. */
export function isWhole(v: Fixed | DecimalString): boolean {
  return toFixed(v) % UNIT === 0n
}

export function compare(a: Fixed | DecimalString, b: Fixed | DecimalString): -1 | 0 | 1 {
  const d = toFixed(a) - toFixed(b)
  return d < 0n ? -1 : d > 0n ? 1 : 0
}

function parts(v: Fixed, dp: number): { neg: boolean; whole: string; frac: string } {
  const r = round(v, dp)
  const abs = r < 0n ? -r : r
  return {
    neg: r < 0n,
    whole: (abs / UNIT).toString(),
    frac: (abs % UNIT).toString().padStart(DECIMAL_SCALE, '0').slice(0, dp),
  }
}

/** Plain decimal string at `dp` places, rounded half-up: toDecimalString(12345000n, 2) → "1234.50". */
export function toDecimalString(
  v: Fixed | DecimalString,
  dp: number = DECIMAL_SCALE
): DecimalString {
  const p = parts(toFixed(v), dp)
  return `${p.neg ? '-' : ''}${p.whole}${dp > 0 ? `.${p.frac}` : ''}`
}

/**
 * Grouped digits at `dp` places, sign separated so the caller decides how a negative looks
 * (the UI uses brackets): formatDecimal("-1283", 2) → { negative: true, digits: "1,283.00" }.
 */
export function formatDecimal(
  v: Fixed | DecimalString,
  dp: number
): { negative: boolean; digits: string } {
  const p = parts(toFixed(v), dp)
  const grouped = p.whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return { negative: p.neg, digits: dp > 0 ? `${grouped}.${p.frac}` : grouped }
}
