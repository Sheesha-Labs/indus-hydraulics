import { describe, expect, it } from 'vitest'
import { storageUrlForMediaPath, toCrawlableMediaUrl } from './crawlable-media'

const SUPABASE = 'https://abc123.supabase.co'
const BASE = 'https://indushydraulics.com'
const storage = (bucket: string, key: string) =>
  `${SUPABASE}/storage/v1/object/public/${bucket}/${key}`

describe('toCrawlableMediaUrl', () => {
  it('maps a public product image onto the same-origin route', () => {
    expect(
      toCrawlableMediaUrl(storage('product-images', 'products/IH-1/IH-1.png'), BASE, SUPABASE),
    ).toBe(`${BASE}/media/product-images/products/IH-1/IH-1.png`)
  })

  it('maps blog and service images too', () => {
    expect(toCrawlableMediaUrl(storage('blog-images', 'x/hero.jpg'), BASE, SUPABASE)).toBe(
      `${BASE}/media/blog-images/x/hero.jpg`,
    )
    expect(toCrawlableMediaUrl(storage('service-images', 'y.webp'), BASE, SUPABASE)).toBe(
      `${BASE}/media/service-images/y.webp`,
    )
  })

  it('tolerates a trailing slash on the base URL', () => {
    expect(toCrawlableMediaUrl(storage('blog-images', 'a.jpg'), `${BASE}/`, SUPABASE)).toBe(
      `${BASE}/media/blog-images/a.jpg`,
    )
  })

  it('leaves everything it does not re-serve untouched', () => {
    const cases = [
      // A supplier-hosted file.
      'https://www.dupont.com/content/dam/x.pdf',
      'http://products.sealfast.com/images/x.jpg',
      // Another project's storage.
      'https://other.supabase.co/storage/v1/object/public/product-images/a.png',
      // A private bucket, a document, an SVG, an upper-case extension.
      storage('product-documents', 'a.pdf'),
      storage('product-images', 'docs/a.pdf'),
      storage('product-images', 'logo.svg'),
      storage('product-images', 'a.PNG'),
      // Not a public-object path.
      `${SUPABASE}/storage/v1/object/sign/product-images/a.png`,
      '',
      'not a url',
    ]
    for (const url of cases) expect(toCrawlableMediaUrl(url, BASE, SUPABASE)).toBe(url)
  })

  it('is a no-op when the storage host is unknown', () => {
    const url = storage('product-images', 'a.png')
    expect(toCrawlableMediaUrl(url, BASE, undefined)).toBe(url)
  })
})

describe('storageUrlForMediaPath', () => {
  it('resolves a bucket and key back to the storage URL', () => {
    expect(storageUrlForMediaPath(['product-images', 'products', 'IH-1', 'IH-1.png'], SUPABASE)).toBe(
      storage('product-images', 'products/IH-1/IH-1.png'),
    )
  })

  it('re-encodes decoded segments', () => {
    expect(storageUrlForMediaPath(['blog-images', 'a b.jpg'], SUPABASE)).toBe(
      storage('blog-images', 'a%20b.jpg'),
    )
  })

  it('round-trips with toCrawlableMediaUrl', () => {
    const original = storage('product-images', 'products/9f2c/hose-1.jpg')
    const crawlable = toCrawlableMediaUrl(original, BASE, SUPABASE)
    const segments = new URL(crawlable).pathname.split('/').slice(2).map(decodeURIComponent)
    expect(storageUrlForMediaPath(segments, SUPABASE)).toBe(original)
  })

  it('refuses private buckets, traversal, empty segments, SVGs and non-images', () => {
    const refused: string[][] = [
      ['product-documents', 'a.png'],
      ['product-images', '..', 'product-documents', 'a.png'],
      ['product-images', '.', 'a.png'],
      ['product-images', '', 'a.png'],
      ['product-images', 'a/b.png'],
      ['product-images', 'logo.svg'],
      ['product-images', 'a.pdf'],
      ['product-images'],
      [],
    ]
    for (const segments of refused) expect(storageUrlForMediaPath(segments, SUPABASE)).toBeNull()
  })

  it('refuses everything when the storage host is unknown', () => {
    expect(storageUrlForMediaPath(['product-images', 'a.png'], undefined)).toBeNull()
  })
})
