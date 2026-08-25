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

export type VariantDimensionKey =
  | 'OD'
  | 'hoseOD'
  | 'burstPressure'
  | 'vacuum'
  | 'bendRadius'
  | 'weightPerMetre'
  | 'weldPrepOd'
  | 'weldPrepId'
  | 'W'
  | 'S1'
  | 'S2'
  | 'S3'
  | 'S4'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'E'
  | 'F'
  | 'H'
  | 'L'
  | 'L1'
  | 'L2'
  | 'L3'
  | 'L4'
  | 'L5'
  | 'L6'

/**
 * Keys inside `dimensions` whose value is a string rather than a millimetre
 * figure — an O-ring size is `12.0×2.0`, not a number. They render in their own
 * columns after the numeric ones.
 */
export type VariantTextKey = 'oRing'

export type VariantColumn = {
  /** Key inside `ProductVariant.dimensions`. */
  key: VariantDimensionKey
  /** Column heading. */
  label: string
  /**
   * A fitting's table is millimetres throughout. A hose's is not — it prints a
   * burst pressure in bar, a vacuum rating in bar and a weight per metre — so
   * the unit travels with the column rather than being assumed by the renderer.
   */
  unit: 'mm' | 'bar' | 'kg/m'
  /** Tooltip / caption text. Never a guess — see the module note. */
  help: string
}

/**
 * Every dimension column we know how to render, in the order a table should
 * present them. A product shows the subset its own rows populate.
 *
 * The numbered runs — S1..S4, D..D4, L..L6 — come from the adapter catalogue,
 * which needs more of them than a hose fitting does: an adapter has two or
 * three ends, so it prints a length and an across-flats for each. They carry
 * no more meaning than the bare letters do, for the same reason.
 */
export const VARIANT_DIMENSION_COLUMNS: readonly VariantColumn[] = [
  {
    key: 'OD',
    label: 'Tube O.D.',
    unit: 'mm',
    help: 'Outside diameter of the tube the port is cut for.',
  },
  /*
    Hose columns. Unlike the lettered fitting dimensions these are not read off
    a drawing — the hose catalogue heads each column with what it is, so the
    help text is the source's own meaning rather than a pointer to a legend.
  */
  {
    key: 'hoseOD',
    label: 'O.D.',
    unit: 'mm',
    help: 'Outside diameter of the hose, which is what a clamp or a ferrule has to close on.',
  },
  {
    key: 'burstPressure',
    label: 'Min burst',
    unit: 'bar',
    help: 'Minimum burst pressure. A test figure, never a working limit — never select on it.',
  },
  {
    key: 'vacuum',
    label: 'Vacuum',
    unit: 'bar',
    help: 'Vacuum the hose is rated to hold on suction duty, as published.',
  },
  {
    key: 'bendRadius',
    label: 'Min bend radius',
    unit: 'mm',
    help: 'Tightest centreline radius the hose may be bent to at full working pressure.',
  },
  {
    key: 'weightPerMetre',
    label: 'Weight',
    unit: 'kg/m',
    help: 'Weight of the hose per metre, as published.',
  },
  {
    key: 'weldPrepOd',
    label: 'Weld prep O.D.',
    unit: 'mm',
    help: 'Outside diameter of the weld preparation, as the source table heads it.',
  },
  {
    key: 'weldPrepId',
    label: 'Weld prep I.D.',
    unit: 'mm',
    help: 'Inside diameter of the weld preparation, as the source table heads it.',
  },
  {
    key: 'W',
    label: 'W',
    unit: 'mm',
    help: 'Nut / hex across flats — the spanner size.',
  },
  { key: 'S1', label: 'S1', unit: 'mm', help: 'Dimension S1 on the manufacturer dimension drawing.' },
  { key: 'S2', label: 'S2', unit: 'mm', help: 'Dimension S2 on the manufacturer dimension drawing.' },
  { key: 'S3', label: 'S3', unit: 'mm', help: 'Dimension S3 on the manufacturer dimension drawing.' },
  { key: 'S4', label: 'S4', unit: 'mm', help: 'Dimension S4 on the manufacturer dimension drawing.' },
  { key: 'A', label: 'A', unit: 'mm', help: 'Dimension A on the manufacturer dimension drawing.' },
  { key: 'B', label: 'B', unit: 'mm', help: 'Dimension B on the manufacturer dimension drawing.' },
  { key: 'C', label: 'C', unit: 'mm', help: 'Dimension C on the manufacturer dimension drawing.' },
  { key: 'D', label: 'D', unit: 'mm', help: 'Dimension D on the manufacturer dimension drawing.' },
  { key: 'D1', label: 'D1', unit: 'mm', help: 'Dimension D1 on the manufacturer dimension drawing.' },
  { key: 'D2', label: 'D2', unit: 'mm', help: 'Dimension D2 on the manufacturer dimension drawing.' },
  { key: 'D3', label: 'D3', unit: 'mm', help: 'Dimension D3 on the manufacturer dimension drawing.' },
  { key: 'D4', label: 'D4', unit: 'mm', help: 'Dimension D4 on the manufacturer dimension drawing.' },
  { key: 'E', label: 'E', unit: 'mm', help: 'Dimension E on the manufacturer dimension drawing.' },
  { key: 'F', label: 'F', unit: 'mm', help: 'Dimension F on the manufacturer dimension drawing.' },
  { key: 'H', label: 'H', unit: 'mm', help: 'Dimension H on the manufacturer dimension drawing.' },
  { key: 'L', label: 'L', unit: 'mm', help: 'Dimension L on the manufacturer dimension drawing.' },
  { key: 'L1', label: 'L1', unit: 'mm', help: 'Dimension L1 on the manufacturer dimension drawing.' },
  { key: 'L2', label: 'L2', unit: 'mm', help: 'Dimension L2 on the manufacturer dimension drawing.' },
  { key: 'L3', label: 'L3', unit: 'mm', help: 'Dimension L3 on the manufacturer dimension drawing.' },
  { key: 'L4', label: 'L4', unit: 'mm', help: 'Dimension L4 on the manufacturer dimension drawing.' },
  { key: 'L5', label: 'L5', unit: 'mm', help: 'Dimension L5 on the manufacturer dimension drawing.' },
  { key: 'L6', label: 'L6', unit: 'mm', help: 'Dimension L6 on the manufacturer dimension drawing.' },
]

export type VariantTextColumn = { key: VariantTextKey; label: string; help: string }

/**
 * Non-numeric columns. `S1`/`S2` deliberately are NOT here: the master
 * catalogue prints them as bare letters against a drawing, exactly like A/B/C,
 * and calling either one "across flats" would be the guess this module exists
 * to avoid — even though that is what they almost certainly are.
 */
export const VARIANT_TEXT_COLUMNS: readonly VariantTextColumn[] = [
  {
    key: 'oRing',
    label: 'O-ring',
    help: 'O-ring size supplied with the fitting, as inside diameter × section.',
  },
]

export type VariantLike = {
  partNumber: string
  hoseDash?: number | null
  hoseInch?: string | null
  hoseDn?: number | null
  portLabel?: string | null
  port2Label?: string | null
  port3Label?: string | null
  weightG?: number | null
  pressureBar?: number | null
  competitorBrand?: string | null
  competitorMpn?: string | null
  dimensions?: unknown
}

/** One threaded end of a fitting that has more than one. */
export type VariantEndColumn = {
  key: 'portLabel' | 'port2Label' | 'port3Label'
  label: string
  help: string
}

/**
 * The end columns a set of variants populates.
 *
 * A hose fitting has one port and gets a single column headed by what the
 * value is — `variantPortHeading` can read "thread" or "flange size" off the
 * value itself. An adapter has two or three ends and no such tell: `9/16"X18`
 * is the same thread on a JIC 37° male, an ORFS male and an SAE O-ring boss,
 * and only the seat differs. Naming those columns after a seat we cannot see
 * would be the guess this module exists to avoid, so they are numbered and the
 * listing's own title says which end is which.
 */
export function variantEndColumns(variants: readonly VariantLike[]): VariantEndColumn[] {
  const has2 = variants.some((v) => Boolean(v.port2Label))
  const has3 = variants.some((v) => Boolean(v.port3Label))
  if (!has2 && !has3) return []
  const help = 'Thread or flange nominal size at this end, exactly as the manufacturer prints it.'
  const cols: VariantEndColumn[] = [
    { key: 'portLabel', label: 'End 1', help },
    { key: 'port2Label', label: 'End 2', help },
  ]
  if (has3) cols.push({ key: 'port3Label', label: 'End 3', help })
  return cols
}

/** True when at least one variant carries a published weight. */
export function hasVariantWeights(variants: readonly VariantLike[]): boolean {
  return variants.some((v) => typeof v.weightG === 'number')
}

/** True when at least one variant carries a published working pressure. */
export function hasVariantPressures(variants: readonly VariantLike[]): boolean {
  return variants.some((v) => typeof v.pressureBar === 'number')
}

/**
 * Is this a table of hose, or of fittings?
 *
 * Read from the ROWS, not passed in by the page. A hose row carries at least
 * one of the hose-only columns; a fitting row never does. Deriving it means a
 * product cannot end up with hose data under a fitting's footnotes because
 * somebody forgot a prop — which matters, because one of those footnotes
 * offers every size in 316 stainless and that is nonsense on a rubber hose.
 */
export function variantTableKind(variants: readonly VariantLike[]): 'hose' | 'fitting' {
  const hoseKeys: VariantDimensionKey[] = ['hoseOD', 'burstPressure', 'vacuum', 'bendRadius', 'weightPerMetre']
  const isHose = variants.some((v) => {
    const dims = variantDimensions(v.dimensions)
    return hoseKeys.some((k) => k in dims)
  })
  return isHose ? 'hose' : 'fitting'
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

/** Narrow one `dimensions` entry to a string, for the text columns. */
export function variantText(value: unknown, key: VariantTextKey): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const v = (value as Record<string, unknown>)[key]
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

/** Text columns this set of variants populates, in canonical order. */
export function variantTextColumns(variants: readonly VariantLike[]): VariantTextColumn[] {
  return VARIANT_TEXT_COLUMNS.filter((c) => variants.some((v) => variantText(v.dimensions, c.key)))
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
  // A hammer union names a pipe end, not a port: `2" butt weld, Sch XXS` or
  // `3" LP thread`. That is visible in the value, same as the thread test
  // below, so it does not need storing either.
  const isPipeEnd = (l: string) => /\b(butt weld|socket weld|lp thread|line pipe|npt)\b/i.test(l)
  if (labels.every(isPipeEnd)) return 'End connection'
  const isThread = (l: string) => /^M\d/i.test(l) || l.includes('-')
  if (labels.every(isThread)) return 'Thread'
  if (labels.every((l) => !isThread(l))) return 'Flange size'
  return 'Port'
}

/**
 * Heading for the size column.
 *
 * A hose fitting is ordered by the bore it crimps onto, and the catalogue
 * always states that bore as a dash size or a DN as well as an inch. A line
 * component — a hammer union, a pipe union — is ordered by nominal line size
 * and has neither. So the presence of `hoseDash` / `hoseDn` across the set is
 * what separates the two, and it is a property of the data rather than a
 * guess about the product.
 */
export function variantSizeHeading(variants: readonly VariantLike[]): string {
  const hasBoreCode = variants.some((v) => v.hoseDash != null || v.hoseDn != null)
  return hasBoreCode ? 'Hose bore' : 'Nominal size'
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
