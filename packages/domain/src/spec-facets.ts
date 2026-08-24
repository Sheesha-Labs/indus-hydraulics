/**
 * Spec facets: turning `ProductSpec` rows into the filter panel on a category
 * page, and back again from a URL.
 *
 * ── Why this needed rules rather than "show every filterable spec" ──
 *
 * `ProductSpec.isFilterable` is set on ~2,000 rows, and a good third of what
 * it marks does not work as a facet:
 *
 *   · `Series` on quick couplers has 29 distinct values across 29 products.
 *     It is an identifier wearing a spec's clothes — every option would
 *     narrow the list to exactly one item.
 *   · `Max Working Pressure` on BSP adapters has ONE distinct value across
 *     44 products. Every option is a no-op.
 *   · `Body Configuration` on the same category holds both `45 elbow` and
 *     `45-elbow`, and both `90 elbow` and `90-elbow` — two data vintages in
 *     one column, which naively faceted shows the same option twice.
 *
 * So a facet has to earn its place by actually partitioning the products, and
 * values have to be compared on a normalised key rather than raw text.
 */

export interface SpecFacetRow {
  productId: string
  label: string
  value: string
}

export interface SpecFacetValue {
  /** URL-safe key. Stable across the spelling variants it merges. */
  key: string
  /** The most common raw spelling, shown to the reader. */
  label: string
  count: number
}

export interface SpecFacet {
  /** URL-safe key for the spec label. */
  key: string
  label: string
  values: SpecFacetValue[]
}

/** A facet is dropped once it would draw more options than a panel can carry. */
export const MAX_FACET_VALUES = 24

/**
 * The comparison key for a value.
 *
 * Case and separators only — `45 elbow` and `45-elbow` are the same option,
 * spelled by two different imports. Deliberately NOT a fuzzy match: `bonded-seal`
 * and `Bonded seal washer` also coexist in the data and are NOT merged, because
 * deciding they are the same thing is a catalogue correction, not something a
 * display helper should do silently.
 */
export function normaliseFacetValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

/** URL-safe key for a spec label — `Port A Sealing` becomes `port-a-sealing`. */
export function facetLabelKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Build the facet panel for one category's products.
 *
 * A spec label survives when it has at least two distinct values AND at least
 * two of those values cover more than one product. The second half is what
 * rejects an identifier column: `Series`, with 29 values over 29 products,
 * clears "two distinct values" easily and never groups anything.
 */
export function buildSpecFacets(rows: SpecFacetRow[]): SpecFacet[] {
  const byLabel = new Map<string, Map<string, { raw: Map<string, number>; products: Set<string> }>>()

  for (const row of rows) {
    const value = row.value.trim()
    if (!value) continue
    const key = normaliseFacetValue(value)
    if (!key) continue

    let values = byLabel.get(row.label)
    if (!values) {
      values = new Map()
      byLabel.set(row.label, values)
    }
    let bucket = values.get(key)
    if (!bucket) {
      bucket = { raw: new Map(), products: new Set() }
      values.set(key, bucket)
    }
    bucket.raw.set(value, (bucket.raw.get(value) ?? 0) + 1)
    bucket.products.add(row.productId)
  }

  const facets: SpecFacet[] = []
  for (const [label, values] of byLabel) {
    if (values.size < 2 || values.size > MAX_FACET_VALUES) continue
    const grouping = [...values.values()].filter((b) => b.products.size > 1).length
    if (grouping < 2) continue

    const out: SpecFacetValue[] = [...values.entries()]
      .map(([key, bucket]) => ({
        key,
        // The dominant spelling wins the label, so the merged option reads as
        // whichever variant the catalogue mostly uses.
        label: [...bucket.raw.entries()].sort(
          (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
        )[0]![0],
        count: bucket.products.size,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

    facets.push({ key: facetLabelKey(label), label, values: out })
  }

  // Most-partitioning facet first: the one with the most options is usually the
  // one a reader wants (configuration, thread), and a two-value yes/no facet is
  // usually a refinement.
  return facets.sort(
    (a, b) => b.values.length - a.values.length || a.label.localeCompare(b.label),
  )
}

// ─── URL round-trip ─────────────────────────────────────────────────────────

export type SpecFilter = Map<string, Set<string>>

/**
 * `body-configuration:straight,90elbow;port-a-sealing:orb`
 *
 * Both halves are the NORMALISED keys, never the raw text. That is not
 * cosmetic: real values include `JIS 30° cone (60° included), BSP thread` — a
 * comma inside a value — and labels include `Figure / Pressure Series`. Either
 * would break a delimiter-separated URL built from raw text, and the failure
 * would be a filter that silently drops half its selection.
 */
export function parseSpecFilter(raw: string | undefined | null): SpecFilter {
  const filter: SpecFilter = new Map()
  if (!raw) return filter
  for (const group of raw.split(';')) {
    const separator = group.indexOf(':')
    if (separator < 1) continue
    const labelKey = group.slice(0, separator).trim()
    const values = group
      .slice(separator + 1)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
    if (!labelKey || values.length === 0) continue
    const existing = filter.get(labelKey) ?? new Set<string>()
    for (const value of values) existing.add(value)
    filter.set(labelKey, existing)
  }
  return filter
}

export function serialiseSpecFilter(filter: SpecFilter): string | undefined {
  const parts: string[] = []
  for (const [labelKey, values] of [...filter.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (values.size === 0) continue
    parts.push(`${labelKey}:${[...values].sort().join(',')}`)
  }
  return parts.length > 0 ? parts.join(';') : undefined
}

/** Add or remove one value, returning a new filter. */
export function toggleSpecValue(
  filter: SpecFilter,
  labelKey: string,
  valueKey: string,
): SpecFilter {
  const next: SpecFilter = new Map([...filter].map(([k, v]) => [k, new Set(v)]))
  const values = next.get(labelKey) ?? new Set<string>()
  if (values.has(valueKey)) values.delete(valueKey)
  else values.add(valueKey)
  if (values.size === 0) next.delete(labelKey)
  else next.set(labelKey, values)
  return next
}

export function countSelected(filter: SpecFilter): number {
  let total = 0
  for (const values of filter.values()) total += values.size
  return total
}

/**
 * Drop selections that no longer exist in this category's facets.
 *
 * A URL outlives the data it names — a shared link, a bookmark, a crawler's
 * copy. Without this, a removed value stays in the filter and silently matches
 * nothing, so the page reads "0 products" with a filter chip the reader cannot
 * find in the panel to switch off.
 */
export function pruneSpecFilter(filter: SpecFilter, facets: SpecFacet[]): SpecFilter {
  const known = new Map(facets.map((f) => [f.key, new Set(f.values.map((v) => v.key))]))
  const next: SpecFilter = new Map()
  for (const [labelKey, values] of filter) {
    const allowed = known.get(labelKey)
    if (!allowed) continue
    const kept = new Set([...values].filter((v) => allowed.has(v)))
    if (kept.size > 0) next.set(labelKey, kept)
  }
  return next
}

/**
 * Which products satisfy every selected facet.
 *
 * Values within one facet are OR — "straight or 90-elbow" is one question with
 * two acceptable answers. Facets are AND — narrowing by configuration AND by
 * sealing. That is what every catalogue filter does, and the opposite of either
 * makes the panel useless: OR across facets widens as you click, and AND within
 * a facet returns nothing whenever two values are picked.
 */
export function productIdsMatching(rows: SpecFacetRow[], filter: SpecFilter): Set<string> | null {
  if (filter.size === 0) return null

  const facetKeyByLabel = new Map<string, string>()
  const matchesPerFacet = new Map<string, Set<string>>()

  for (const row of rows) {
    const labelKey = facetKeyByLabel.get(row.label) ?? facetLabelKey(row.label)
    facetKeyByLabel.set(row.label, labelKey)
    const wanted = filter.get(labelKey)
    if (!wanted) continue
    if (!wanted.has(normaliseFacetValue(row.value))) continue
    const set = matchesPerFacet.get(labelKey) ?? new Set<string>()
    set.add(row.productId)
    matchesPerFacet.set(labelKey, set)
  }

  // Intersect the per-facet matches, smallest first so the running set shrinks
  // as fast as it can.
  const perFacet = [...filter.keys()]
    .map((labelKey) => matchesPerFacet.get(labelKey) ?? new Set<string>())
    .sort((a, b) => a.size - b.size)

  const [first, ...rest] = perFacet
  let result = new Set<string>(first ?? [])
  for (const matched of rest) {
    if (result.size === 0) break
    result = new Set([...result].filter((id) => matched.has(id)))
  }
  return result
}
