import { describe, expect, test } from 'vitest'
import {
  buildMediaUsageIndex,
  canRemoveStorageObject,
  canTrash,
  collectHtmlMediaUrls,
  collectMediaIdsFromBlocks,
  deriveMediaState,
  emptyMediaUsageIndex,
  htmlMentionsStoragePath,
  isAbsoluteMediaUrl,
  matchesStateFilter,
  mediaFolderFor,
  MEDIA_FOLDER_LABELS,
  MEDIA_FOLDER_ORDER,
  MEDIA_USAGE_KIND_LABELS,
  MEDIA_USAGE_KIND_ORDER,
  normaliseMediaUrl,
  sortUsages,
  summariseUsage,
  type MediaFolder,
  type MediaUsage,
  type MediaUsageKind,
} from './media-usage'

function usage(over: Partial<MediaUsage> = {}): MediaUsage {
  return {
    kind: 'product',
    id: 'p1',
    label: 'Parker 3/8 hose',
    role: 'Image',
    href: '/admin/products/p1/edit',
    live: false,
    internal: false,
    ...over,
  }
}

describe('deriveMediaState', () => {
  test('is unused when nothing references the file', () => {
    expect(deriveMediaState([])).toBe('unused')
  })

  test('is live when any usage is on a published surface', () => {
    expect(deriveMediaState([usage({ live: false }), usage({ live: true })])).toBe('live')
  })

  test('live beats internal — one published usage is enough to matter', () => {
    expect(
      deriveMediaState([usage({ kind: 'rfq', internal: true }), usage({ live: true })])
    ).toBe('live')
  })

  test('is internal only when every usage is internal', () => {
    expect(
      deriveMediaState([
        usage({ kind: 'rfq', internal: true }),
        usage({ kind: 'quote', internal: true }),
      ])
    ).toBe('internal')
  })

  test('a mix of internal and draft is attached, not internal', () => {
    expect(deriveMediaState([usage({ kind: 'rfq', internal: true }), usage()])).toBe('attached')
  })

  test('is attached when used only by unpublished records', () => {
    expect(deriveMediaState([usage(), usage()])).toBe('attached')
  })
})

describe('canTrash', () => {
  test('allows only unused files', () => {
    expect(canTrash({ state: 'unused', indexPartial: false }).allowed).toBe(true)
    for (const state of ['live', 'attached', 'internal'] as const) {
      const d = canTrash({ state, indexPartial: false })
      expect(d.allowed, state).toBe(false)
      expect(d.reason, state).toMatch(/in use/i)
    }
  })

  test('blocks everything when the index is incomplete — including unused files', () => {
    // The dangerous case: a broken lookup makes a live file look unused.
    const d = canTrash({ state: 'unused', indexPartial: true })
    expect(d.allowed).toBe(false)
    expect(d.reason).toMatch(/couldn't be checked/i)
  })

  test('partial is checked before state, so the reason names the real problem', () => {
    expect(canTrash({ state: 'live', indexPartial: true }).reason).toMatch(/couldn't be checked/i)
  })

  test('names what is holding the file when usages are supplied', () => {
    const d = canTrash({
      state: 'live',
      indexPartial: false,
      usages: [usage({ live: true }), usage({ live: true }), usage({ kind: 'blog_post' })],
    })
    expect(d.reason).toBe('In use — detach it first. Used in 2 products · 1 blog post.')
  })

  test('omits the detail when no usages are supplied', () => {
    expect(canTrash({ state: 'live', indexPartial: false }).reason).toBe(
      'In use — detach it first.'
    )
  })
})

describe('canRemoveStorageObject', () => {
  // 227 of 665 rows currently share a storagePath. Removing the object for one
  // of them would 404 every sibling, including live datasheets.
  test('allows removal only when no other row shares the path', () => {
    expect(canRemoveStorageObject({ otherRowsSharingPath: 0 })).toBe(true)
    expect(canRemoveStorageObject({ otherRowsSharingPath: 1 })).toBe(false)
    expect(canRemoveStorageObject({ otherRowsSharingPath: 13 })).toBe(false)
  })

  test('treats a negative count as no siblings rather than trusting it', () => {
    expect(canRemoveStorageObject({ otherRowsSharingPath: -1 })).toBe(true)
  })
})

describe('the index keeps partial and failedSources in step', () => {
  test('an empty index is not partial', () => {
    const i = emptyMediaUsageIndex()
    expect(i.partial).toBe(false)
    expect(i.failedSources).toEqual([])
    expect(i.byAsset.size).toBe(0)
  })

  test('any failed source makes it partial', () => {
    expect(buildMediaUsageIndex(new Map(), ['blog_posts']).partial).toBe(true)
  })

  test('deduplicates and sorts failed sources', () => {
    const i = buildMediaUsageIndex(new Map(), ['products', 'blog_posts', 'products'])
    expect(i.failedSources).toEqual(['blog_posts', 'products'])
  })

  test('no failed sources means not partial', () => {
    expect(buildMediaUsageIndex(new Map([['m1', [usage()]]])).partial).toBe(false)
  })
})

describe('summariseUsage', () => {
  test('says so plainly when nothing uses the file', () => {
    expect(summariseUsage([])).toBe('Not used anywhere')
  })

  test('counts per kind and pluralises', () => {
    expect(summariseUsage([usage(), usage()])).toBe('2 products')
    expect(summariseUsage([usage({ kind: 'category' })])).toBe('1 category')
    expect(summariseUsage([usage({ kind: 'category' }), usage({ kind: 'category' })])).toBe(
      '2 categories'
    )
  })

  test('reports kinds in display order, not first-seen order', () => {
    expect(
      summariseUsage([usage({ kind: 'quote' }), usage({ kind: 'blog_post' }), usage()])
    ).toBe('1 product · 1 blog post · 1 quote')
  })

  test('handles the irregular and invariant plurals', () => {
    expect(summariseUsage([usage({ kind: 'industry' }), usage({ kind: 'industry' })])).toBe(
      '2 industries'
    )
    expect(summariseUsage([usage({ kind: 'rfq' }), usage({ kind: 'rfq' })])).toBe('2 RFQs')
    expect(summariseUsage([usage({ kind: 'site_settings' })])).toBe('1 site setting')
  })

  test('every kind has a label, and no label is left as a raw key', () => {
    for (const kind of MEDIA_USAGE_KIND_ORDER) {
      const label = MEDIA_USAGE_KIND_LABELS[kind]
      expect(label, kind).toBeDefined()
      expect(label.one.length, kind).toBeGreaterThan(0)
      expect(label.many.length, kind).toBeGreaterThan(0)
      expect(label.one, kind).not.toContain('_')
      expect(label.many, kind).not.toContain('_')
    }
  })

  test('the order list covers every kind exactly once', () => {
    const keys = Object.keys(MEDIA_USAGE_KIND_LABELS) as MediaUsageKind[]
    expect([...MEDIA_USAGE_KIND_ORDER].sort()).toEqual([...keys].sort())
    expect(new Set(MEDIA_USAGE_KIND_ORDER).size).toBe(MEDIA_USAGE_KIND_ORDER.length)
  })
})

describe('sortUsages', () => {
  test('puts live usages first', () => {
    const out = sortUsages([usage({ label: 'B' }), usage({ label: 'A', live: true })])
    expect(out.map((u) => u.label)).toEqual(['A', 'B'])
  })

  test('then groups by kind in display order', () => {
    const out = sortUsages([
      usage({ kind: 'quote', label: 'Q' }),
      usage({ kind: 'product', label: 'P' }),
      usage({ kind: 'blog_post', label: 'B' }),
    ])
    expect(out.map((u) => u.kind)).toEqual(['product', 'blog_post', 'quote'])
  })

  test('then alphabetically by label', () => {
    const out = sortUsages([usage({ label: 'Zeta' }), usage({ label: 'Alpha' })])
    expect(out.map((u) => u.label)).toEqual(['Alpha', 'Zeta'])
  })

  test('does not mutate its input', () => {
    const input = [usage({ label: 'Z' }), usage({ label: 'A' })]
    const before = input.map((u) => u.label)
    sortUsages(input)
    expect(input.map((u) => u.label)).toEqual(before)
  })
})

describe('matchesStateFilter', () => {
  test('all passes everything through', () => {
    for (const s of ['live', 'attached', 'internal', 'unused'] as const) {
      expect(matchesStateFilter(s, 'all')).toBe(true)
    }
  })

  test('a specific filter matches only itself', () => {
    expect(matchesStateFilter('unused', 'unused')).toBe(true)
    expect(matchesStateFilter('live', 'unused')).toBe(false)
  })
})

describe('collectMediaIdsFromBlocks', () => {
  test('finds figure imageIds at any depth', () => {
    const blocks = [
      { type: 'prose', html: '<p>hi</p>' },
      { type: 'figure', imageId: 'm1', caption: 'A pump' },
      { type: 'columns', children: [{ type: 'figure', imageId: 'm2', caption: 'B' }] },
    ]
    expect(collectMediaIdsFromBlocks(blocks).sort()).toEqual(['m1', 'm2'])
  })

  test('picks up galleryImageIds arrays', () => {
    expect(collectMediaIdsFromBlocks({ galleryImageIds: ['g1', 'g2'] }).sort()).toEqual([
      'g1',
      'g2',
    ])
  })

  test('deduplicates', () => {
    const blocks = [
      { type: 'figure', imageId: 'm1' },
      { type: 'figure', imageId: 'm1' },
      { galleryImageIds: ['m1'] },
    ]
    expect(collectMediaIdsFromBlocks(blocks)).toEqual(['m1'])
  })

  test('ignores empty, whitespace and non-string values', () => {
    const blocks = [
      { type: 'figure', imageId: '' },
      { type: 'figure', imageId: '   ' },
      { type: 'figure', imageId: null },
      { type: 'figure', imageId: 42 },
      { galleryImageIds: [null, 7, '', 'ok'] },
    ]
    expect(collectMediaIdsFromBlocks(blocks)).toEqual(['ok'])
  })

  test('trims surrounding whitespace', () => {
    expect(collectMediaIdsFromBlocks([{ imageId: '  m1  ' }])).toEqual(['m1'])
  })

  test('collects from disabled or hidden blocks too', () => {
    // A block toggled off is still holding the file — deleting it would break
    // the post the moment it is toggled back on.
    expect(collectMediaIdsFromBlocks([{ type: 'figure', imageId: 'm1', enabled: false }])).toEqual([
      'm1',
    ])
  })

  test('survives junk', () => {
    for (const junk of [null, undefined, 'string', 42, true, {}, [], [[[]]]]) {
      expect(() => collectMediaIdsFromBlocks(junk)).not.toThrow()
      expect(collectMediaIdsFromBlocks(junk)).toEqual([])
    }
  })

  test('terminates on a self-referential document', () => {
    const cyclic: Record<string, unknown> = { type: 'figure', imageId: 'm1' }
    cyclic.self = cyclic
    expect(collectMediaIdsFromBlocks(cyclic)).toEqual(['m1'])
  })
})

describe('collectHtmlMediaUrls', () => {
  const BASE = 'https://x.supabase.co/storage/v1/object/public/product-images'

  test('extracts an img src', () => {
    expect(collectHtmlMediaUrls(`<p>a</p><img src="${BASE}/a.jpg" alt="a">`)).toEqual([
      `${BASE}/a.jpg`,
    ])
  })

  test('finds references outside img src — srcset, source, css, links', () => {
    const html = `
      <img srcset="${BASE}/a.jpg 1x, ${BASE}/b.jpg 2x">
      <div style="background-image:url(${BASE}/c.jpg)"></div>
      <a href="${BASE}/d.pdf">datasheet</a>`
    expect(collectHtmlMediaUrls(html).sort()).toEqual(
      [`${BASE}/a.jpg`, `${BASE}/b.jpg`, `${BASE}/c.jpg`, `${BASE}/d.pdf`].sort()
    )
  })

  test('strips query strings and fragments so the same object matches', () => {
    expect(collectHtmlMediaUrls(`<img src="${BASE}/a.jpg?width=800&quality=75">`)).toEqual([
      `${BASE}/a.jpg`,
    ])
  })

  test('decodes entity-encoded ampersands', () => {
    // A URL inside an HTML attribute is entity-encoded; the stored path is not.
    expect(collectHtmlMediaUrls(`<img src="${BASE}/a.jpg?w=1&amp;h=2">`)).toEqual([`${BASE}/a.jpg`])
  })

  test('deduplicates repeated references', () => {
    expect(
      collectHtmlMediaUrls(`<img src="${BASE}/a.jpg"><img src="${BASE}/a.jpg">`)
    ).toEqual([`${BASE}/a.jpg`])
  })

  test('returns nothing for empty, null and undefined bodies', () => {
    expect(collectHtmlMediaUrls('')).toEqual([])
    expect(collectHtmlMediaUrls(null)).toEqual([])
    expect(collectHtmlMediaUrls(undefined)).toEqual([])
  })

  test('returns nothing for HTML with no URLs', () => {
    expect(collectHtmlMediaUrls('<p>No images here at all.</p>')).toEqual([])
  })
})

describe('normaliseMediaUrl', () => {
  test('is idempotent', () => {
    const once = normaliseMediaUrl('https://x.co/a.jpg?w=1#frag')
    expect(normaliseMediaUrl(once)).toBe(once)
    expect(once).toBe('https://x.co/a.jpg')
  })

  test('drops a trailing slash', () => {
    expect(normaliseMediaUrl('https://x.co/a/')).toBe('https://x.co/a')
  })
})

describe('the non-URL fallback', () => {
  test('recognises which paths the fast path covers', () => {
    expect(isAbsoluteMediaUrl('https://x.supabase.co/storage/a.jpg')).toBe(true)
    expect(isAbsoluteMediaUrl('http://x.co/a.jpg')).toBe(true)
    expect(isAbsoluteMediaUrl('product-documents/rfq/a.pdf')).toBe(false)
    expect(isAbsoluteMediaUrl('2026/INDUS-Q1-r1.pdf')).toBe(false)
  })

  test('matches a bucket-prefixed key mentioned in a body', () => {
    const html = '<a href="/dl?key=product-documents/rfq/a.pdf">spec</a>'
    expect(htmlMentionsStoragePath(html, 'product-documents/rfq/a.pdf')).toBe(true)
    expect(htmlMentionsStoragePath(html, 'product-documents/rfq/b.pdf')).toBe(false)
  })

  test('is false for empty inputs rather than matching everything', () => {
    // An empty needle must not report "found" — that would mark every asset
    // used and quietly disable the whole delete path.
    expect(htmlMentionsStoragePath('<p>x</p>', '')).toBe(false)
    expect(htmlMentionsStoragePath('<p>x</p>', '   ')).toBe(false)
    expect(htmlMentionsStoragePath(null, 'a/b.pdf')).toBe(false)
    expect(htmlMentionsStoragePath('', 'a/b.pdf')).toBe(false)
  })
})

describe('mediaFolderFor', () => {
  test('a file nothing references lands in Unused', () => {
    expect(mediaFolderFor({ mediaKind: 'image', usages: [] })).toBe('unused')
  })

  test('files by the most prominent usage, not the first one found', () => {
    // A product photo that also appears in a blog post belongs under Products —
    // that is where someone looking for it would go first.
    const usages = [usage({ kind: 'blog_post' }), usage({ kind: 'product' })]
    expect(mediaFolderFor({ mediaKind: 'image', usages })).toBe('products')
    expect(mediaFolderFor({ mediaKind: 'image', usages: [...usages].reverse() })).toBe('products')
  })

  test('a non-image on a product is a document, not a product', () => {
    // Otherwise 41 PDFs bury 341 photos in the same folder.
    expect(mediaFolderFor({ mediaKind: 'document', usages: [usage({ kind: 'product' })] })).toBe(
      'documents'
    )
    expect(mediaFolderFor({ mediaKind: 'cad', usages: [usage({ kind: 'product' })] })).toBe(
      'documents'
    )
    expect(mediaFolderFor({ mediaKind: 'image', usages: [usage({ kind: 'product' })] })).toBe(
      'products'
    )
  })

  test('the three blog kinds share one folder', () => {
    for (const kind of ['blog_post', 'blog_category', 'blog_author'] as const) {
      expect(mediaFolderFor({ mediaKind: 'image', usages: [usage({ kind })] }), kind).toBe('blog')
    }
  })

  test('RFQ attachments get their own folder; quotes and imports are documents', () => {
    expect(mediaFolderFor({ mediaKind: 'document', usages: [usage({ kind: 'rfq' })] })).toBe('rfq')
    expect(mediaFolderFor({ mediaKind: 'document', usages: [usage({ kind: 'quote' })] })).toBe(
      'documents'
    )
    expect(mediaFolderFor({ mediaKind: 'document', usages: [usage({ kind: 'import' })] })).toBe(
      'documents'
    )
  })

  test('every usage kind maps to a folder, and every folder has a label', () => {
    for (const kind of MEDIA_USAGE_KIND_ORDER) {
      const folder = mediaFolderFor({ mediaKind: 'image', usages: [usage({ kind })] })
      expect(MEDIA_FOLDER_ORDER, `${kind} mapped to an unlisted folder`).toContain(folder)
      expect(MEDIA_FOLDER_LABELS[folder], kind).toBeTruthy()
    }
    expect([...MEDIA_FOLDER_ORDER].sort()).toEqual(
      (Object.keys(MEDIA_FOLDER_LABELS) as MediaFolder[]).sort()
    )
  })
})

describe('the safety property, end to end', () => {
  // The invariant the feature rests on: a file is only ever deletable when the
  // index is complete AND nothing references it.
  test('deletion requires both a complete index and zero usages', () => {
    const cases: Array<{ usages: MediaUsage[]; partial: boolean; expected: boolean }> = [
      { usages: [], partial: false, expected: true },
      { usages: [], partial: true, expected: false },
      { usages: [usage()], partial: false, expected: false },
      { usages: [usage({ live: true })], partial: false, expected: false },
      { usages: [usage({ kind: 'rfq', internal: true })], partial: false, expected: false },
      { usages: [usage()], partial: true, expected: false },
    ]
    for (const c of cases) {
      const state = deriveMediaState(c.usages)
      expect(
        canTrash({ state, indexPartial: c.partial, usages: c.usages }).allowed,
        `${state}/partial=${c.partial}`
      ).toBe(c.expected)
    }
  })
})
