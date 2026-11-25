import { parseMoney, type DecimalConvention } from '../money/parse'

/**
 * Quantities (S08-T02, 08 §2.5 "qty is never inferred"). The model returns the quantity as PRINTED; code reads the
 * number. One number, optionally followed by a unit ("10", "10 nos", "1,000 m"). Anything else — two numbers
 * ("10+2 spare"), a range, "approx.", words only — is not a quantity code will vouch for, and the line is Unsure.
 * A European "1.000" is decided by the document's convention (voted across every number in it), never per value.
 */
export type QtyProblem =
  'not_stated' | 'several_numbers' | 'approximate' | 'ambiguous_separator' | 'not_positive'

export interface ParsedQty {
  value: number | null
  /** Text after the number, for the unit normaliser ("nos" in "10 nos"). */
  unitText: string | null
  problem: QtyProblem | null
}

const APPROX =
  /\b(approx\.?|approximately|about|around|ca\.?|circa|min\.?|minimum|max\.?|maximum|upto|up to)\b|[~≈±<>]/i
const NUMBER = /\d[\d.,'  ]*\d|\d/g

export function parseQuantity(
  printed: string | null | undefined,
  convention: DecimalConvention
): ParsedQty {
  const raw = (printed ?? '').trim()
  if (!raw) return { value: null, unitText: null, problem: 'not_stated' }
  if (APPROX.test(raw)) return { value: null, unitText: null, problem: 'approximate' }
  const numbers = raw.match(NUMBER) ?? []
  if (!numbers.length) return { value: null, unitText: null, problem: 'not_stated' }
  if (numbers.length > 1 || /\d\s*[-–+x×/]\s*\d/i.test(raw))
    return { value: null, unitText: null, problem: 'several_numbers' }
  const token = numbers[0]!
  // Digits alone need no convention; a separator ("1.000") is decided by the document's vote.
  const digits = token.replace(/[\s\u00A0']/g, '')
  const value = /^\d+$/.test(digits) ? Number(digits) : parseMoney(digits, convention)
  if (value === null) return { value: null, unitText: null, problem: 'ambiguous_separator' }
  if (value <= 0) return { value: null, unitText: null, problem: 'not_positive' }
  const after = raw
    .slice(raw.indexOf(token) + token.length)
    .replace(/^[\s.:-]+/, '')
    .trim()
  return { value, unitText: after || null, problem: null }
}

/** The number from a printed quantity alone, for comparing with the model's own reading. */
export function sameQty(a: number | null | undefined, b: number | null | undefined): boolean {
  if (a === null || a === undefined || b === null || b === undefined) return false
  return Math.abs(a - b) < 1e-9
}
