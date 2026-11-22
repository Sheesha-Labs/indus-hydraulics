import { describe, expect, it } from 'vitest'
import {
  PAGE_SIZE,
  decodeCursor,
  encodeCursor,
  keysetOrderBy,
  keysetWhere,
  takePage,
  type Cursor,
  type Page,
  type SortDir,
  type SortValue,
} from './pagination'

const id = (n: number) => `01936f7e-0000-7000-8000-${String(n).padStart(12, '0')}`

type Row = { id: string; receivedAt: Date; value: number }

/** Rows with deliberate ties on both sort columns. */
const ROWS: Row[] = [
  { id: id(1), receivedAt: new Date('2026-11-01T08:00:00Z'), value: 100 },
  { id: id(2), receivedAt: new Date('2026-11-01T08:00:00Z'), value: 100 },
  { id: id(3), receivedAt: new Date('2026-11-01T08:00:00Z'), value: 50 },
  { id: id(4), receivedAt: new Date('2026-11-02T08:00:00Z'), value: 100 },
  { id: id(5), receivedAt: new Date('2026-11-02T08:00:00Z'), value: 75 },
  { id: id(6), receivedAt: new Date('2026-11-03T08:00:00Z'), value: 50 },
  { id: id(7), receivedAt: new Date('2026-11-03T08:00:00Z'), value: 100 },
]

const cmp = (a: SortValue, b: SortValue) => {
  const x = a instanceof Date ? a.getTime() : a
  const y = b instanceof Date ? b.getTime() : b
  return x < y ? -1 : x > y ? 1 : 0
}

/** Evaluate the Prisma fragments the way Postgres would, over ROWS. */
function query(
  field: 'receivedAt' | 'value',
  dir: SortDir,
  cursor: Cursor | null,
  take: number
): Row[] {
  const where = keysetWhere(field, dir, cursor) as {
    OR?: [Record<string, Record<string, SortValue>>, Record<string, unknown>]
  }
  const matches = (row: Row) => {
    if (!where.OR) return true
    const [after, tie] = where.OR
    const [op, v] = Object.entries(after[field] ?? {})[0] as [string, SortValue]
    const sign = op === 'gt' ? 1 : -1
    if (cmp(row[field], v) * sign > 0) return true
    const idFilter = tie.id as Record<string, string>
    const [idOp, idV] = Object.entries(idFilter)[0] as [string, string]
    return cmp(row[field], tie[field] as SortValue) === 0 && (idOp === 'gt' ? row.id > idV : row.id < idV)
  }
  const [primary, secondary] = keysetOrderBy(field, dir)
  const s = primary[field] === 'asc' ? 1 : -1
  const t = secondary.id === 'asc' ? 1 : -1
  return ROWS.filter(matches)
    .sort((a, b) => cmp(a[field], b[field]) * s || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0) * t)
    .slice(0, take)
}

function walk(field: 'receivedAt' | 'value', dir: SortDir, size: number): string[][] {
  const kind = field === 'receivedAt' ? 'date' : 'number'
  const pages: string[][] = []
  let raw: string | null = null
  for (let guard = 0; guard < 20; guard++) {
    const cursor = decodeCursor(raw, field, kind)
    const page: Page<Row> = takePage(
      query(field, dir, cursor, size + 1),
      field,
      (r: Row) => r[field],
      size
    )
    pages.push(page.rows.map((r) => r.id.slice(-1)))
    if (!page.nextCursor) return pages
    raw = page.nextCursor
  }
  throw new Error('pagination did not terminate')
}

describe('keyset pagination', () => {
  it('pages through ties on a date column once each, in order, both directions', () => {
    expect(walk('receivedAt', 'asc', 2)).toEqual([['1', '2'], ['3', '4'], ['5', '6'], ['7']])
    expect(walk('receivedAt', 'desc', 2)).toEqual([['7', '6'], ['5', '4'], ['3', '2'], ['1']])
  })

  it('pages through ties on a number column, page boundary inside a tie', () => {
    expect(walk('value', 'asc', 3)).toEqual([['3', '6', '5'], ['1', '2', '4'], ['7']])
    expect(walk('value', 'desc', 2).flat()).toEqual(['7', '4', '2', '1', '5', '6', '3'])
  })

  it('returns one page and no cursor when everything fits', () => {
    const page = takePage(ROWS, 'value', (r) => r.value)
    expect(page.rows).toHaveLength(ROWS.length)
    expect(page.nextCursor).toBeNull()
    expect(PAGE_SIZE).toBe(50)
  })

  it('gives the first page for no cursor', () => {
    expect(keysetWhere('receivedAt', 'asc', null)).toEqual({})
  })

  it('orders by the column, then id, in the same direction', () => {
    expect(keysetOrderBy('receivedAt', 'desc')).toEqual([{ receivedAt: 'desc' }, { id: 'desc' }])
  })
})

describe('cursor encoding', () => {
  it('round-trips each kind and is base64url', () => {
    const at = new Date('2026-11-22T09:30:00.000Z')
    const date = encodeCursor({ field: 'receivedAt', value: at, id: id(1) })
    expect(date).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeCursor(date, 'receivedAt', 'date')).toEqual({ field: 'receivedAt', value: at, id: id(1) })
    const num = encodeCursor({ field: 'value', value: 12.5, id: id(2) })
    expect(decodeCursor(num, 'value', 'number')?.value).toBe(12.5)
    const str = encodeCursor({ field: 'client', value: 'Sample Client LLC', id: id(3) })
    expect(decodeCursor(str, 'client', 'string')?.value).toBe('Sample Client LLC')
  })

  it('rejects a cursor for another field or kind, so a changed sort starts at page 1', () => {
    const c = encodeCursor({ field: 'receivedAt', value: new Date(), id: id(1) })
    expect(decodeCursor(c, 'deadline', 'date')).toBeNull()
    expect(decodeCursor(c, 'receivedAt', 'string')).toBeNull()
  })

  it('never throws on garbage', () => {
    const bad = [
      undefined,
      '',
      'not base64!',
      Buffer.from('{"a":1}').toString('base64url'),
      Buffer.from('["value","n","NaN","x"]').toString('base64url'),
      Buffer.from(`["value","n",1,"not-a-uuid"]`).toString('base64url'),
      Buffer.from(`["receivedAt","d","yesterday","${id(1)}"]`).toString('base64url'),
      'A'.repeat(5000),
    ]
    for (const raw of bad) {
      expect(decodeCursor(raw, 'value', 'number')).toBeNull()
      expect(decodeCursor(raw, 'receivedAt', 'date')).toBeNull()
    }
  })
})
