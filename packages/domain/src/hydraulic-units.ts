/**
 * Unit conversions for hydraulic pressure and hose sizing.
 *
 * Pure functions in the domain package so they are unit-tested rather than
 * trusted. A converter that is quietly wrong is worse than no converter: it
 * is the kind of thing someone uses to specify a hose and never re-checks.
 *
 * The pressure factors are exact by definition, not approximations:
 *   1 bar  ≡ 100 000 Pa   (SI derived, exact)
 *   1 MPa  ≡ 1 000 000 Pa (exact)
 *   1 psi  ≡ 6 894.757293168361 Pa, from the exact definitions of the
 *           pound-force (4.448 221 615 260 5 N) and the inch (0.0254 m).
 */

export const PA_PER_BAR = 100_000
export const PA_PER_MPA = 1_000_000
/** Exact: lbf (4.4482216152605 N) / in² (0.0254² m²). */
export const PA_PER_PSI = 6_894.757293168361

export type PressureUnit = 'psi' | 'bar' | 'mpa'

const TO_PASCALS: Record<PressureUnit, number> = {
  psi: PA_PER_PSI,
  bar: PA_PER_BAR,
  mpa: PA_PER_MPA,
}

/** Convert a pressure between psi, bar and MPa. */
export function convertPressure(value: number, from: PressureUnit, to: PressureUnit): number {
  if (!Number.isFinite(value)) return Number.NaN
  return (value * TO_PASCALS[from]) / TO_PASCALS[to]
}

/** All three units at once — what a converter UI actually needs. */
export function pressureInAllUnits(
  value: number,
  from: PressureUnit,
): Record<PressureUnit, number> {
  return {
    psi: convertPressure(value, from, 'psi'),
    bar: convertPressure(value, from, 'bar'),
    mpa: convertPressure(value, from, 'mpa'),
  }
}

/**
 * Hose and tube dash sizes.
 *
 * The dash number is the nominal inside diameter in sixteenths of an inch:
 * -8 is 8/16" = 1/2". That is a definition, which is why this is arithmetic
 * rather than a lookup table.
 *
 * Two cautions the UI repeats, because both cause real ordering mistakes:
 *
 *  - It is NOMINAL. Actual bore varies by construction, and a compact hose in
 *    a given dash size does not necessarily share the bore of a standard one.
 *  - The same dash convention is used for JIC/SAE fitting sizes, where it
 *    refers to the tube OD the fitting suits — NOT the hose bore. A -8 hose
 *    and a -8 fitting are a matched pair by convention, not by measurement.
 */
export interface DashSize {
  dash: number
  inchFraction: string
  inches: number
  millimetres: number
}

/** Dash sizes in common use for hydraulic hose. */
export const COMMON_DASH_SIZES = [4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48] as const

export function dashToSize(dash: number): DashSize | null {
  if (!Number.isInteger(dash) || dash <= 0) return null
  const inches = dash / 16
  return {
    dash,
    inchFraction: reduceSixteenths(dash),
    inches,
    millimetres: inches * 25.4,
  }
}

export function dashSizeTable(): DashSize[] {
  return COMMON_DASH_SIZES.map((d) => dashToSize(d)!).filter(Boolean)
}

/** Reduce n/16 to its lowest terms, e.g. 8 → "1/2", 16 → "1", 20 → "1-1/4". */
function reduceSixteenths(sixteenths: number): string {
  const whole = Math.floor(sixteenths / 16)
  const remainder = sixteenths % 16
  if (remainder === 0) return String(whole)
  const divisor = gcd(remainder, 16)
  const fraction = `${remainder / divisor}/${16 / divisor}`
  return whole === 0 ? fraction : `${whole}-${fraction}`
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}
