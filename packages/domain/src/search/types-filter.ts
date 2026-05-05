/**
 * Multi-type search results — `types` URL param.
 *
 * The search results page indexes three result kinds: `products`,
 * `datasheets`, and `articles` (blog posts). The user can narrow with
 * sidebar checkboxes; the URL serialises which are checked as a
 * comma-separated list. An empty / missing param is treated as "all
 * three" so unbookmarked URLs (and SEO-crawled URLs) always render
 * something.
 *
 * Order is preserved (so labels render in deterministic order) and
 * duplicates are deduped. Unknown tokens are silently dropped.
 */

export type SearchType = 'products' | 'datasheets' | 'articles'

export const SEARCH_TYPES: ReadonlyArray<SearchType> = [
  'products',
  'datasheets',
  'articles',
]

export const SEARCH_TYPE_LABELS: Record<SearchType, string> = {
  products: 'Products',
  datasheets: 'Datasheets',
  articles: 'Articles',
}

export function parseTypesParam(raw: string | undefined | null): SearchType[] {
  if (!raw || !raw.trim()) return [...SEARCH_TYPES]
  const tokens = raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
  const valid = tokens.filter((t): t is SearchType =>
    SEARCH_TYPES.includes(t as SearchType),
  )
  if (valid.length === 0) return [...SEARCH_TYPES]
  // Dedupe while preserving order.
  const seen = new Set<SearchType>()
  const out: SearchType[] = []
  for (const t of valid) {
    if (!seen.has(t)) {
      seen.add(t)
      out.push(t)
    }
  }
  return out
}

export function isTypeSelected(types: SearchType[], type: SearchType): boolean {
  return types.includes(type)
}

/**
 * Toggle a type in a list. Returns a new list with the type added or
 * removed. If removing the last selected type, returns all types (since
 * an empty `types` URL param is interpreted as "all" by `parseTypesParam`,
 * we mirror that intent in the toggle helper).
 */
export function toggleType(types: SearchType[], type: SearchType): SearchType[] {
  const has = types.includes(type)
  if (has) {
    const next = types.filter((t) => t !== type)
    return next.length === 0 ? [...SEARCH_TYPES] : next
  }
  return [...types, type]
}

/**
 * Serialises the list back to a URL-friendly comma string. Returns `null`
 * when the list equals the full set so the URL stays clean (the param is
 * omitted rather than written as `?types=products,datasheets,articles`).
 */
export function serializeTypesParam(types: SearchType[]): string | null {
  if (types.length === SEARCH_TYPES.length && SEARCH_TYPES.every((t) => types.includes(t))) {
    return null
  }
  return types.join(',')
}
