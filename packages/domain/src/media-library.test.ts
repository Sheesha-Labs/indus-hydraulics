import { describe, expect, test } from 'vitest'
import {
  compareMedia,
  DEFAULT_MEDIA_SORT,
  formatBytes,
  matchesMediaSearch,
  MEDIA_PAGE_SIZE,
  MEDIA_SORT_LABELS,
  mediaThumbnailSrc,
  parseMediaSort,
  selectMediaPage,
  type MediaListFilters,
  type MediaListItem,
  type MediaListRow,
  type MediaSort,
} from './media-library'

function item(over: Partial<MediaListItem> = {}): MediaListItem {
  return {
    id: 'm1',
    originalFilename: 'HP001.png',
    alt: 'Hydraulic hose fitting',
    caption: null,
    kind: 'image',
    bytes: 1024,
    createdAt: new Date('2026-05-01T00:00:00Z'),
    storagePath: 'https://x.supabase.co/storage/v1/object/public/product-images/HP001.png',
    ...over,
  }
}

function row(over: Partial<MediaListItem> = {}, extra: Partial<MediaListRow> = {}): MediaListRow {
  return { item: item(over), state: 'live', folder: 'products', ...extra }
}

// Typed as MediaListFilters rather than `as const`: the latter narrows each
// field to its literal, so `{ ...ALL_FILTERS, kind: 'image' }` would not typecheck.
const ALL_FILTERS: MediaListFilters = {
  query: '',
  kind: 'all',
  state: 'all',
  folder: 'all',
  trashed: false,
}

describe('parseMediaSort', () => {
  test('accepts every declared sort', () => {
    for (const key of Object.keys(MEDIA_SORT_LABELS) as MediaSort[]) {
      expect(parseMediaSort(key)).toBe(key)
    }
  })

  test('falls back rather than trusting the URL', () => {
    for (const junk of ['', '  ', 'bogus', 'constructor', '__proto__', undefined, null]) {
      expect(parseMediaSort(junk as string | undefined | null)).toBe(DEFAULT_MEDIA_SORT)
    }
  })
})

describe('compareMedia', () => {
  const older = item({ id: 'a', createdAt: new Date('2026-01-01'), bytes: 10, originalFilename: 'b.png' })
  const newer = item({ id: 'b', createdAt: new Date('2026-06-01'), bytes: 99, originalFilename: 'a.png' })

  test('newest and oldest are inverses', () => {
    expect(compareMedia('newest')(older, newer)).toBeGreaterThan(0)
    expect(compareMedia('oldest')(older, newer)).toBeLessThan(0)
  })

  test('largest and smallest are inverses', () => {
    expect(compareMedia('largest')(older, newer)).toBeGreaterThan(0)
    expect(compareMedia('smallest')(older, newer)).toBeLessThan(0)
  })

  test('name sorts naturally, so file 10 follows file 9', () => {
    const names = ['HP10.png', 'HP9.png', 'HP1.png'].map((n, i) =>
      item({ id: String(i), originalFilename: n })
    )
    expect(names.sort(compareMedia('name')).map((i) => i.originalFilename)).toEqual([
      'HP1.png',
      'HP9.png',
      'HP10.png',
    ])
  })

  test('is a total order even when the primary key ties', () => {
    // A bulk import stamps many rows with the same createdAt. Without the id
    // tiebreak their order can differ between requests, and a row then shows on
    // two pages or on neither.
    const t = new Date('2026-05-01T00:00:00Z')
    const a = item({ id: 'aaa', createdAt: t })
    const b = item({ id: 'bbb', createdAt: t })
    expect(compareMedia('newest')(a, b)).toBeLessThan(0)
    expect(compareMedia('newest')(b, a)).toBeGreaterThan(0)
    expect(compareMedia('newest')(a, a)).toBe(0)
  })
})

describe('matchesMediaSearch', () => {
  test('an empty query matches everything', () => {
    for (const q of ['', '   ']) expect(matchesMediaSearch(item(), q)).toBe(true)
  })

  test('matches filename, alt and caption', () => {
    const i = item({ originalFilename: 'HP001.png', alt: 'Brass fitting', caption: 'On the rig' })
    expect(matchesMediaSearch(i, 'hp001')).toBe(true)
    expect(matchesMediaSearch(i, 'brass')).toBe(true)
    expect(matchesMediaSearch(i, 'rig')).toBe(true)
    expect(matchesMediaSearch(i, 'gearbox')).toBe(false)
  })

  test('is case-insensitive and ignores surrounding whitespace', () => {
    expect(matchesMediaSearch(item({ alt: 'Hydraulic Hose' }), '  HYDRAULIC ')).toBe(true)
  })

  test('survives null alt and caption', () => {
    const i = item({ alt: null, caption: null, originalFilename: 'x.png' })
    expect(matchesMediaSearch(i, 'x')).toBe(true)
    expect(matchesMediaSearch(i, 'null')).toBe(false)
  })
})

describe('selectMediaPage', () => {
  const many = (n: number): MediaListRow[] =>
    Array.from({ length: n }, (_, i) =>
      row({
        id: `m${String(i).padStart(3, '0')}`,
        originalFilename: `f${i}.png`,
        createdAt: new Date(2026, 0, 1, 0, 0, i),
      })
    )

  test('reports totals of what matched, not of what fits on the page', () => {
    const out = selectMediaPage(many(100), { filters: ALL_FILTERS, sort: 'newest', page: 1 })
    expect(out.total).toBe(100)
    expect(out.visible).toHaveLength(MEDIA_PAGE_SIZE)
    expect(out.totalPages).toBe(Math.ceil(100 / MEDIA_PAGE_SIZE))
    expect(out.from).toBe(1)
    expect(out.to).toBe(MEDIA_PAGE_SIZE)
  })

  test('pages do not overlap and cover everything exactly once', () => {
    const rows = many(100)
    const seen: string[] = []
    for (let p = 1; p <= 3; p++) {
      seen.push(
        ...selectMediaPage(rows, { filters: ALL_FILTERS, sort: 'newest', page: p }).visible.map(
          (r) => r.item.id
        )
      )
    }
    expect(new Set(seen).size).toBe(100)
    expect(seen).toHaveLength(100)
  })

  test('clamps an out-of-range page instead of showing nothing', () => {
    const rows = many(10)
    for (const page of [0, -5, 99]) {
      const out = selectMediaPage(rows, { filters: ALL_FILTERS, sort: 'newest', page })
      expect(out.visible.length, `page ${page}`).toBe(10)
      expect(out.page).toBe(1)
    }
  })

  test('an empty result reports 0 of 0 rather than 1 of 0', () => {
    const out = selectMediaPage([], { filters: ALL_FILTERS, sort: 'newest', page: 1 })
    expect(out.total).toBe(0)
    expect(out.from).toBe(0)
    expect(out.to).toBe(0)
    expect(out.totalPages).toBe(1)
  })

  test('filters by kind, state and folder independently', () => {
    const rows: MediaListRow[] = [
      row({ id: 'a', kind: 'image' }, { state: 'live', folder: 'products' }),
      row({ id: 'b', kind: 'document' }, { state: 'unused', folder: 'documents' }),
      row({ id: 'c', kind: 'image' }, { state: 'unused', folder: 'blog' }),
    ]
    const pick = (f: Partial<MediaListFilters>) =>
      selectMediaPage(rows, {
        filters: { ...ALL_FILTERS, ...f },
        sort: 'newest',
        page: 1,
      }).visible.map((r) => r.item.id)

    expect(pick({ kind: 'image' }).sort()).toEqual(['a', 'c'])
    expect(pick({ state: 'unused' }).sort()).toEqual(['b', 'c'])
    expect(pick({ folder: 'documents' })).toEqual(['b'])
    expect(pick({ kind: 'image', state: 'unused' })).toEqual(['c'])
  })

  test('combines search with the other filters', () => {
    const rows: MediaListRow[] = [
      row({ id: 'a', originalFilename: 'pump.png' }, { state: 'live' }),
      row({ id: 'b', originalFilename: 'pump.pdf', kind: 'document' }, { state: 'unused' }),
    ]
    const out = selectMediaPage(rows, {
      filters: { ...ALL_FILTERS, query: 'pump', kind: 'image' },
      sort: 'newest',
      page: 1,
    })
    expect(out.visible.map((r) => r.item.id)).toEqual(['a'])
    expect(out.total).toBe(1)
  })

  test('does not mutate the rows it was given', () => {
    const rows = many(5)
    const order = rows.map((r) => r.item.id)
    selectMediaPage(rows, { filters: ALL_FILTERS, sort: 'largest', page: 1 })
    expect(rows.map((r) => r.item.id)).toEqual(order)
  })
})

describe('formatBytes', () => {
  test('scales through the units', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1024)).toBe('1.0 KB')
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB')
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB')
    expect(formatBytes(1024 ** 4)).toBe('1.0 TB')
  })

  test('drops the decimal above 10 so a column stays one width', () => {
    expect(formatBytes(9.4 * 1024 * 1024)).toBe('9.4 MB')
    expect(formatBytes(12 * 1024 * 1024)).toBe('12 MB')
    expect(formatBytes(999 * 1024 * 1024)).toBe('999 MB')
  })

  test('does not run past the largest unit', () => {
    expect(formatBytes(1024 ** 6)).toMatch(/TB$/)
  })

  test('returns a dash for nonsense rather than NaN', () => {
    expect(formatBytes(Number.NaN)).toBe('—')
    expect(formatBytes(-1)).toBe('—')
    expect(formatBytes(Number.POSITIVE_INFINITY)).toBe('—')
  })
})

describe('mediaThumbnailSrc', () => {
  test('renders an image stored as an absolute URL', () => {
    const url = 'https://x.supabase.co/storage/v1/object/public/product-images/a.png'
    expect(mediaThumbnailSrc({ kind: 'image', storagePath: url })).toBe(url)
  })

  test('returns null for documents and CAD, which have no thumbnail', () => {
    const url = 'https://x.supabase.co/a.pdf'
    expect(mediaThumbnailSrc({ kind: 'document', storagePath: url })).toBeNull()
    expect(mediaThumbnailSrc({ kind: 'cad', storagePath: url })).toBeNull()
  })

  test('returns null for the storage-path shapes that cannot be rendered directly', () => {
    // A bucket-prefixed key points into the PRIVATE documents bucket and needs a
    // signed URL; a bare key has no bucket at all. Emitting either into an
    // <img src> yields a broken image, which is worse than a type tile.
    expect(mediaThumbnailSrc({ kind: 'image', storagePath: 'product-documents/a/b.png' })).toBeNull()
    expect(mediaThumbnailSrc({ kind: 'image', storagePath: '2026/quote-r1.png' })).toBeNull()
    expect(mediaThumbnailSrc({ kind: 'image', storagePath: '' })).toBeNull()
  })
})
