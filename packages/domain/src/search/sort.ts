/**
 * Search-result sort modes. The URL `sort` param maps to one of these;
 * `parseSortParam` defends against arbitrary user input.
 *
 * - `relevance`: default. Orders by the FTS rank score we already computed
 *   in the SQL pass. The page sorts by score in JS, so no orderBy is
 *   produced here (returns null).
 * - `price_asc` / `price_desc`: orders by `listPrice`. Products without a
 *   listPrice (null) are placed LAST so the catalogue isn't dominated by
 *   "Request quote" rows when sorting by price.
 * - `newest`: most recently updated first.
 * - `name_asc` / `name_desc`: alphabetical by title.
 */

export type SortMode =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'name_asc'
  | 'name_desc'

export const SORT_MODES: ReadonlyArray<SortMode> = [
  'relevance',
  'price_asc',
  'price_desc',
  'newest',
  'name_asc',
  'name_desc',
]

export const SORT_LABELS: Record<SortMode, string> = {
  relevance: 'Best match',
  price_asc: 'Price ↑',
  price_desc: 'Price ↓',
  newest: 'Newest',
  name_asc: 'Name A → Z',
  name_desc: 'Name Z → A',
}

export function parseSortParam(raw: string | undefined | null): SortMode {
  if (!raw) return 'relevance'
  return SORT_MODES.includes(raw as SortMode) ? (raw as SortMode) : 'relevance'
}

/**
 * Prisma-orderBy for the secondary product fetch in /search. Returns
 * `null` for `relevance` (the page sorts in JS by FTS score). Each non-
 * relevance order returns a tuple so ties break on `id` for stable
 * pagination.
 *
 * `price_asc` / `price_desc` use `{ sort, nulls: 'last' }` so listPrice =
 * null products sink to the bottom regardless of direction.
 */
export type ProductOrderBy =
  | null
  | Array<Record<string, 'asc' | 'desc' | { sort: 'asc' | 'desc'; nulls: 'first' | 'last' }>>

export function sortToOrderBy(mode: SortMode): ProductOrderBy {
  switch (mode) {
    case 'relevance':
      return null
    case 'price_asc':
      return [{ listPrice: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }]
    case 'price_desc':
      return [{ listPrice: { sort: 'desc', nulls: 'last' } }, { id: 'asc' }]
    case 'newest':
      return [{ updatedAt: 'desc' }, { id: 'asc' }]
    case 'name_asc':
      return [{ title: 'asc' }, { id: 'asc' }]
    case 'name_desc':
      return [{ title: 'desc' }, { id: 'asc' }]
  }
}
