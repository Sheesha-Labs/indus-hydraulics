import 'server-only'

/**
 * Keyset pagination for every index (05-map-frontend §7.4, apps/ops/CLAUDE.md §6.1): 50 rows a
 * page, ordered by (sort column, id) so ties on the sort column never repeat or skip a row, and
 * an opaque base64url cursor in the `cursor` search param. No OFFSET: its cost grows with the
 * page number and it shifts under inserts.
 *
 *   const cursor = decodeCursor(params.cursor, 'receivedAt', 'date')
 *   const rows = await opsDb.enquiry.findMany({
 *     where: { AND: [filters, keysetWhere('receivedAt', params.dir, cursor)] },
 *     orderBy: keysetOrderBy('receivedAt', params.dir),
 *     take: PAGE_SIZE + 1,
 *     select: { id: true, ref: true, receivedAt: true },
 *   })
 *   const page = takePage(rows, 'receivedAt', (r) => r.receivedAt)
 *
 * The sort column must be NOT NULL (or the query must order a non-null expression): a NULL
 * compares as unknown and would drop rows from every page after it. Ids are UUIDv7, whose text
 * order is their uuid order, so `id` is a valid tie-breaker.
 */

export const PAGE_SIZE = 50

export type SortDir = 'asc' | 'desc'
export type SortKind = 'string' | 'number' | 'date'
type ValueOf<K extends SortKind> = K extends 'date' ? Date : K extends 'number' ? number : string

export type SortValue = string | number | Date

/** Where the next page starts: after the row with this sort value and id. */
export type Cursor<V extends SortValue = SortValue> = { field: string; value: V; id: string }

const TAG = { string: 's', number: 'n', date: 'd' } as const
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_CURSOR_LENGTH = 1024

function kindOf(value: SortValue): SortKind {
  if (value instanceof Date) return 'date'
  return typeof value === 'number' ? 'number' : 'string'
}

/** An opaque base64url cursor over (field, sort value, id). */
export function encodeCursor(cursor: Cursor): string {
  const kind = kindOf(cursor.value)
  const value = cursor.value instanceof Date ? cursor.value.toISOString() : cursor.value
  return Buffer.from(JSON.stringify([cursor.field, TAG[kind], value, cursor.id])).toString(
    'base64url'
  )
}

/**
 * The cursor in a search param, or null for none, a malformed one, or one made for another sort
 * field or kind (the person changed the sort and kept the old link): the index then shows page 1.
 * Never throws, so a hand-edited URL cannot fail a page.
 */
export function decodeCursor<K extends SortKind>(
  raw: string | null | undefined,
  field: string,
  kind: K
): Cursor<ValueOf<K>> | null {
  if (!raw || raw.length > MAX_CURSOR_LENGTH || !/^[A-Za-z0-9_-]+$/.test(raw)) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!Array.isArray(parsed) || parsed.length !== 4) return null
  const [f, tag, value, id] = parsed as unknown[]
  if (f !== field || tag !== TAG[kind] || typeof id !== 'string' || !UUID.test(id)) return null

  if (kind === 'string') {
    return typeof value === 'string' ? { field, value: value as ValueOf<K>, id } : null
  }
  if (kind === 'number') {
    return typeof value === 'number' && Number.isFinite(value)
      ? { field, value: value as ValueOf<K>, id }
      : null
  }
  if (typeof value !== 'string') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : { field, value: date as ValueOf<K>, id }
}

type Op = 'gt' | 'lt'
type Compare<V> = Partial<Record<Op, V>>
type After<F extends string, V> = Record<F, Compare<V>>
type Tie<F extends string, V> = Record<F, V> & { id: Compare<string> }

export type KeysetWhere<F extends string, V> =
  | { OR: [After<F, V>, Tie<F, V>] }
  | Record<string, never>

/**
 * The Prisma `where` fragment for the page after `cursor`, `{}` for the first page:
 * (field > v) OR (field = v AND id > cursorId), with `<` for descending order.
 */
export function keysetWhere<F extends string, V extends SortValue>(
  field: F,
  dir: SortDir,
  cursor: Cursor<V> | null
): KeysetWhere<F, V> {
  if (!cursor || cursor.field !== field) return {}
  const op: Op = dir === 'asc' ? 'gt' : 'lt'
  return {
    OR: [
      { [field]: { [op]: cursor.value } } as After<F, V>,
      { [field]: cursor.value, id: { [op]: cursor.id } } as Tie<F, V>,
    ],
  }
}

/** The matching `orderBy`: the sort column, then id in the same direction. */
export function keysetOrderBy<F extends string>(
  field: F,
  dir: SortDir
): [Record<F, SortDir>, { id: SortDir }] {
  return [{ [field]: dir } as Record<F, SortDir>, { id: dir }]
}

export type Page<R> = { rows: R[]; nextCursor: string | null }

/**
 * Cut a `take: size + 1` result to one page and build the next cursor from its last row.
 * `nextCursor` is null on the last page.
 */
export function takePage<R extends { id: string }>(
  rows: readonly R[],
  field: string,
  valueOf: (row: R) => SortValue,
  size: number = PAGE_SIZE
): Page<R> {
  if (rows.length <= size) return { rows: [...rows], nextCursor: null }
  const page = rows.slice(0, size)
  const last = page[page.length - 1]
  if (!last) return { rows: page, nextCursor: null }
  return { rows: page, nextCursor: encodeCursor({ field, value: valueOf(last), id: last.id }) }
}
