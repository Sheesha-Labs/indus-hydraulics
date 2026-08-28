import { describe, expect, it } from 'vitest'
import { cacheNamespace, isStale, tagsFor } from '../../cache/keys.js'

describe('cacheNamespace', () => {
  it('is identical for an identical client build, so a content-only deploy keeps the cache', () => {
    // The entire point of self-hosting the cache.
    const manifest = '{"chunks":["a1b2.js","c3d4.js"]}'
    expect(cacheNamespace(manifest, 'x')).toBe(cacheNamespace(manifest, 'y'))
  })

  it('changes when the client build changes, because cached HTML names its chunks', () => {
    // Not an optimisation — serving old HTML after the chunks are replaced
    // gives the visitor a page whose scripts 404.
    expect(cacheNamespace('{"chunks":["a1b2.js"]}', 'x')).not.toBe(
      cacheNamespace('{"chunks":["e5f6.js"]}', 'x'),
    )
  })

  it('falls back when the manifest cannot be read rather than sharing one namespace', () => {
    expect(cacheNamespace(null, 'build-id-42')).toBe('build-id-42')
  })
})

describe('isStale', () => {
  it('is false when no tag has been revalidated', () => {
    expect(isStale(1000, ['products'], {})).toBe(false)
  })

  it('is false when the purge predates the entry', () => {
    expect(isStale(1000, ['products'], { products: 500 })).toBe(false)
  })

  it('is true when a tag was revalidated after the entry was written', () => {
    expect(isStale(1000, ['products'], { products: 1500 })).toBe(true)
  })

  it('is false when the entry is newer than the purge', () => {
    // The entry was regenerated after the purge, so it is already fresh.
    expect(isStale(2000, ['products'], { products: 1500 })).toBe(false)
  })

  it('treats an exact tie as stale', () => {
    // Same millisecond: the order is unknowable, and serving content an editor
    // believes they removed is the worse of the two errors.
    expect(isStale(1000, ['products'], { products: 1000 })).toBe(true)
  })

  it('is stale if ANY tag is stale, not only the first', () => {
    expect(isStale(1000, ['a', 'b', 'c'], { c: 1500 })).toBe(true)
  })

  it('ignores tags that carry no timestamp', () => {
    expect(isStale(1000, ['a'], { a: undefined })).toBe(false)
  })
})

describe('tagsFor', () => {
  it('reads tags from the response header pages and route handlers carry', () => {
    const value = { headers: { 'x-next-cache-tags': 'products,categories' } }
    expect(tagsFor(value, undefined, undefined).sort()).toEqual(['categories', 'products'])
  })

  it('merges context tags and soft tags with header tags, without duplicates', () => {
    const value = { headers: { 'x-next-cache-tags': 'products' } }
    expect(tagsFor(value, ['products', 'brands'], ['nav-menu']).sort()).toEqual([
      'brands',
      'nav-menu',
      'products',
    ])
  })

  it('trims whitespace, so a spaced header still purges', () => {
    const value = { headers: { 'x-next-cache-tags': ' products , categories ' } }
    expect(tagsFor(value, undefined, undefined).sort()).toEqual(['categories', 'products'])
  })

  it('returns nothing rather than throwing on an entry with no tags at all', () => {
    expect(tagsFor(null, undefined, undefined)).toEqual([])
    expect(tagsFor({}, undefined, undefined)).toEqual([])
  })
})
