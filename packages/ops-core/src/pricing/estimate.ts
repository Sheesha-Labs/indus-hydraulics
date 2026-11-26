import {
  add,
  compare,
  mul,
  parseDecimal,
  round,
  sub,
  toDecimalString,
  type DecimalString,
  type Fixed,
} from '../money/decimal'

/**
 * The Overview's estimate snapshot (board 05, S09-T03) on the C38 formula, in AED, with fixed-point maths only:
 *
 *   base    = supplier unit price × qty × locked FX (AED per unit of the quote currency)
 *   landed  = base + components; each component is data (an AED amount), an override (an AED amount), or, when
 *             missing, the fallback percentage of base: freight 4 · insurance 0.5 · duty 5 · bank 1 %
 *   sell    = landed / (1 − margin)          margin: the line's own, else the default
 *   margin  = (sell − landed) / sell
 *
 * Only lines with a selected quote line are priced. It is a snapshot: the margin floor (C12) is not applied
 * here; Pricing (S17) applies it. `fallbackUsed` names every default that stood in, e.g. "Freight at 4%
 * default", so the card can say so.
 */

export const LANDED_COMPONENTS = [
  'freight',
  'insurance',
  'duty',
  'bank',
  'inspection',
  'packing',
  'other',
] as const
export type LandedComponent = (typeof LANDED_COMPONENTS)[number]

/** The four components with a C38 fallback percentage. */
export const FALLBACK_COMPONENTS = ['freight', 'insurance', 'duty', 'bank'] as const
export type FallbackComponent = (typeof FALLBACK_COMPONENTS)[number]

export type ComponentValue =
  | { basis: 'data' | 'override'; amountAed: DecimalString }
  | { basis: 'default_pct'; pct: DecimalString }

export interface EstimateLine {
  qty: DecimalString
  selected?: {
    unitPrice: DecimalString
    currency: string
    /** AED per one unit of `currency`, as locked on the quote. */
    fxToAed: DecimalString
    components?: Partial<Record<LandedComponent, ComponentValue>>
  } | null
  /** Percent, e.g. "18" (the line's trade default or a person's choice). */
  marginPct?: DecimalString | null
}

export interface EstimateDefaults {
  /** Percent. */
  marginPct: DecimalString
  /** Percent of base per fallback component (C38: 4 · 0.5 · 5 · 1). */
  landedPct: Record<FallbackComponent, DecimalString>
}

export const C38_FALLBACK_PCT: Record<FallbackComponent, DecimalString> = {
  freight: '4',
  insurance: '0.5',
  duty: '5',
  bank: '1',
}

export interface EstimateSnapshot {
  pricedLines: number
  unpricedLines: number
  /** AED, 2 dp. */
  landedAed: DecimalString
  sellAed: DecimalString
  gpAed: DecimalString
  /** Percent, 1 dp; null when nothing is priced. */
  marginPct: DecimalString | null
  /** "Freight at 4% default", in component order, once each. */
  fallbackUsed: string[]
}

const HUNDRED = parseDecimal('100')
const UNIT = 10_000n

/** a / b at 4 dp, half away from zero (b ≠ 0). */
function div(a: Fixed, b: Fixed): Fixed {
  const n = a * UNIT
  const neg = n < 0n !== b < 0n
  const an = n < 0n ? -n : n
  const ab = b < 0n ? -b : b
  const q = (an * 2n + ab) / (2n * ab)
  return neg ? -q : q
}

const pctOf = (base: Fixed, pct: DecimalString): Fixed => div(mul(base, pct), HUNDRED)

const WORD: Record<FallbackComponent, string> = {
  freight: 'Freight',
  insurance: 'Insurance',
  duty: 'Duty',
  bank: 'Bank charges',
}

export function estimateSnapshot(i: {
  lines: readonly EstimateLine[]
  defaults: EstimateDefaults
}): EstimateSnapshot {
  let landed = 0n
  let sell = 0n
  let priced = 0
  const used = new Set<FallbackComponent>()
  for (const l of i.lines) {
    const s = l.selected
    if (!s) continue
    priced += 1
    const base = mul(mul(s.unitPrice, l.qty), s.fxToAed)
    let lineLanded = base
    for (const c of LANDED_COMPONENTS) {
      const v = s.components?.[c]
      if (v) {
        lineLanded = add(
          lineLanded,
          v.basis === 'default_pct' ? pctOf(base, v.pct) : parseDecimal(v.amountAed)
        )
        if (v.basis === 'default_pct' && (FALLBACK_COMPONENTS as readonly string[]).includes(c))
          used.add(c as FallbackComponent)
      } else if ((FALLBACK_COMPONENTS as readonly string[]).includes(c)) {
        const fc = c as FallbackComponent
        lineLanded = add(lineLanded, pctOf(base, i.defaults.landedPct[fc]))
        used.add(fc)
      }
    }
    const m = parseDecimal(l.marginPct ?? i.defaults.marginPct)
    const keep = sub(HUNDRED, m)
    if (compare(keep, 0n) <= 0) throw new RangeError('margin must be below 100%')
    const lineSell = div(mul(lineLanded, HUNDRED), keep)
    landed = add(landed, lineLanded)
    sell = add(sell, lineSell)
  }
  const gp = sub(sell, landed)
  return {
    pricedLines: priced,
    unpricedLines: i.lines.length - priced,
    landedAed: toDecimalString(round(landed, 2), 2),
    sellAed: toDecimalString(round(sell, 2), 2),
    gpAed: toDecimalString(round(gp, 2), 2),
    marginPct:
      priced === 0 || sell === 0n
        ? null
        : toDecimalString(round(div(mul(gp, HUNDRED), sell), 1), 1),
    fallbackUsed: FALLBACK_COMPONENTS.filter((c) => used.has(c)).map(
      (c) => `${WORD[c]} at ${trimPct(i.defaults.landedPct[c])}% default`
    ),
  }
}

function trimPct(p: DecimalString): string {
  return p.includes('.') ? p.replace(/0+$/, '').replace(/\.$/, '') : p
}
