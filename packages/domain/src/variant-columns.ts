/**
 * Turning a product's `ProductVariant[]` into a table a buyer can read.
 *
 * `ProductVariant.dimensions` is jsonb, so the rendering side has to answer
 * two questions the database will not: which columns exist for THIS product,
 * and what does the letter `E` mean. Both answers live here, as pure
 * functions, so the storefront, the admin and any exporter agree.
 *
 * ON NOT INVENTING MEANINGS
 *
 * Manufacturer dimension tables print bare letters — A, B, E, F, H — against a
 * drawing, and the drawing is the legend. We have the letters and not the
 * drawing. So the help text says which letter it is and points at the drawing;
 * it does not guess that `B` is "hex face to hose end". The two exceptions are
 * the columns whose source header states its own meaning: `W`, printed as
 * "W- HEX" / "W -NUT", and the tube O.D. column, printed as "Tube O.D.".
 *
 * Guessing here would be the same class of error the Molykote and industrial
 * coupling imports had to undo — a plausible spec value that nobody sourced,
 * copied down a whole category.
 */

export type VariantDimensionKey = 'OD' | 'W' | 'A' | 'B' | 'E' | 'F' | 'H'

export type VariantColumn = {
  /** Key inside `ProductVariant.dimensions`. */
  key: VariantDimensionKey
  /** Column heading. */
  label: string
  unit: 'mm'
  /** Tooltip / caption text. Never a guess — see the module note. */
  help: string
}

/**
 * Every dimension column we know how to render, in the order a table should
 * present them. A product shows the subset its own rows populate.
 */
export const VARIANT_DIMENSION_COLUMNS: readonly VariantColumn[] = [
  {
    key: 'OD',
    label: 'Tube O.D.',
    unit: 'mm',
    help: 'Outside diameter of the tube the port is cut for.',
  },
  {
    key: 'W',
    label: 'W',
    unit: 'mm',
    help: 'Nut / hex across flats — the spanner size.',
  },
  { key: 'A', label: 'A', unit: 'mm', help: 'Dimension A on the manufacturer dimension drawing.' },
  { key: 'B', label: 'B', unit: 'mm', help: 'Dimension B on the manufacturer dimension drawing.' },
  { key: 'E', label: 'E', unit: 'mm', help: 'Dimension E on the manufacturer dimension drawing.' },
  { key: 'F', label: 'F', unit: 'mm', help: 'Dimension F on the manufacturer dimension drawing.' },
  { key: 'H', label: 'H', unit: 'mm', help: 'Dimension H on the manufacturer dimension drawing.' },
]

export type VariantLike = {
  partNumber: string
  hoseDash?: number | null
  hoseInch?: string | null
  hoseDn?: number | null
  portLabel?: string | null
  competitorBrand?: string | null
  competitorMpn?: string | null
  dimensions?: unknown
}

/** Narrow `dimensions` jsonb to a numeric record without trusting its shape. */
export function variantDimensions(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : Number.NaN
    if (Number.isFinite(n)) out[k] = n
  }
  return out
}

/**
 * The dimension columns this set of variants actually populates, in canonical
 * order. A key no variant carries is dropped rather than rendered empty; a key
 * we have no label for is dropped rather than shown raw.
 */
export function variantDimensionColumns(variants: readonly VariantLike[]): VariantColumn[] {
  const present = new Set<string>()
  for (const v of variants) {
    for (const k of Object.keys(variantDimensions(v.dimensions))) present.add(k)
  }
  return VARIANT_DIMENSION_COLUMNS.filter((c) => present.has(c.key))
}

/**
 * Heading for the port column.
 *
 * A port value is either a thread — `1/4"-18`, `G1/2"-14`, `M18X1.5`, carrying
 * a pitch or an `M` prefix — or a flange nominal size, which is a bare inch
 * fraction (`3/4"`). The distinction is visible in the value itself, so it
 * does not need storing. An empty or mixed set falls back to the neutral
 * heading rather than picking a side.
 */
export function variantPortHeading(variants: readonly VariantLike[]): string {
  const labels = variants
    .map((v) => v.portLabel?.trim())
    .filter((l): l is string => Boolean(l))
  if (labels.length === 0) return 'Port'
  const isThread = (l: string) => /^M\d/i.test(l) || l.includes('-')
  if (labels.every(isThread)) return 'Thread'
  if (labels.every((l) => !isThread(l))) return 'Flange size'
  return 'Port'
}

/** True when at least one variant carries a competitor equivalent to show. */
export function hasVariantEquivalents(variants: readonly VariantLike[]): boolean {
  return variants.some((v) => Boolean(v.competitorMpn))
}

/**
 * The competitor brand shown in the equivalents column header. Returns null
 * when the rows disagree, so the header never asserts a single brand over a
 * mixed set.
 */
export function variantEquivalentBrand(variants: readonly VariantLike[]): string | null {
  const brands = new Set(
    variants.map((v) => v.competitorBrand).filter((b): b is string => Boolean(b)),
  )
  return brands.size === 1 ? [...brands][0]! : null
}

/**
 * Compact "-08 · 1/2" · DN12" style hose label, skipping the parts a variant
 * does not carry. Returns null when it carries none of them.
 */
export function variantHoseLabel(v: VariantLike): string | null {
  const parts: string[] = []
  if (v.hoseDash != null) parts.push(`-${String(v.hoseDash).padStart(2, '0')}`)
  if (v.hoseInch) parts.push(v.hoseInch)
  if (v.hoseDn != null) parts.push(`DN${v.hoseDn}`)
  return parts.length > 0 ? parts.join(' · ') : null
}

/**
 * Bore range across a set of variants, in the `-04 to -24` form the
 * `nominal_size_range` spec field already uses elsewhere in the catalogue.
 */
export function variantBoreRange(variants: readonly VariantLike[]): string | null {
  const dashes = variants
    .map((v) => v.hoseDash)
    .filter((d): d is number => typeof d === 'number')
  if (dashes.length === 0) return null
  const lo = Math.min(...dashes)
  const hi = Math.max(...dashes)
  const fmt = (n: number) => `-${String(n).padStart(2, '0')}`
  return lo === hi ? fmt(lo) : `${fmt(lo)} to ${fmt(hi)}`
}
