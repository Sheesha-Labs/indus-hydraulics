import { describe, it, expect } from 'vitest'
import * as cheerio from 'cheerio'
import {
  resolveAsset,
  pickFromSrcset,
  extractImageCandidates,
  isProbedImageAcceptable,
} from './resolveAsset'

const PAGE = 'https://example.com/products/a10vso'

describe('resolveAsset', () => {
  it('resolves a path-relative URL against the page URL', () => {
    expect(resolveAsset(PAGE, '../images/a.jpg')).toBe('https://example.com/images/a.jpg')
  })
  it('resolves a protocol-relative URL', () => {
    expect(resolveAsset(PAGE, '//cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg')
  })
  it('keeps an absolute URL unchanged', () => {
    expect(resolveAsset(PAGE, 'https://other.com/a.jpg')).toBe('https://other.com/a.jpg')
  })
  it('rejects javascript: URIs', () => {
    expect(resolveAsset(PAGE, 'javascript:void(0)')).toBeNull()
  })
  it('rejects data: URIs', () => {
    expect(resolveAsset(PAGE, 'data:image/png;base64,…')).toBeNull()
  })
  it('returns null for empty/whitespace input', () => {
    expect(resolveAsset(PAGE, '')).toBeNull()
    expect(resolveAsset(PAGE, '   ')).toBeNull()
    expect(resolveAsset(PAGE, undefined)).toBeNull()
  })
})

describe('pickFromSrcset', () => {
  it('picks the highest-w descriptor', () => {
    const srcset = 'a.jpg 320w, b.jpg 640w, c.jpg 1280w'
    expect(pickFromSrcset(srcset)).toBe('c.jpg')
  })
  it('falls back to last entry when no descriptors', () => {
    expect(pickFromSrcset('a.jpg, b.jpg, c.jpg')).toBe('c.jpg')
  })
  it('returns null on empty input', () => {
    expect(pickFromSrcset('')).toBeNull()
  })
  it('tolerates extra whitespace', () => {
    expect(pickFromSrcset('  a.jpg 320w  ,  b.jpg 800w  ')).toBe('b.jpg')
  })
})

describe('extractImageCandidates', () => {
  it('grabs <img> src', () => {
    const $ = cheerio.load('<html><body><img src="/img/a.jpg" alt="A" width="600" height="400"></body></html>')
    const out = extractImageCandidates($, PAGE)
    expect(out).toEqual([{ url: 'https://example.com/img/a.jpg', alt: 'A' }])
  })
  it('prefers srcset (highest-res) over src', () => {
    const $ = cheerio.load(
      `<html><body><img src="small.jpg" srcset="small.jpg 320w, big.jpg 1280w" width="600" height="600"></body></html>`,
    )
    const out = extractImageCandidates($, PAGE)
    expect(out.map((i) => i.url)).toEqual(['https://example.com/products/big.jpg'])
  })
  it('falls back to data-src for lazy-loaded images', () => {
    const $ = cheerio.load(`<html><body><img data-src="/lazy.jpg" width="600" height="600"></body></html>`)
    const out = extractImageCandidates($, PAGE)
    expect(out.map((i) => i.url)).toEqual(['https://example.com/lazy.jpg'])
  })
  it('filters SVGs by extension', () => {
    const $ = cheerio.load(`<html><body><img src="/logo.svg" width="600" height="600"></body></html>`)
    const out = extractImageCandidates($, PAGE)
    expect(out).toEqual([])
  })
  it('filters icon-sized images (width or height < 100)', () => {
    const $ = cheerio.load(
      `<html><body><img src="/icon.png" width="32" height="32"><img src="/real.png" width="600" height="600"></body></html>`,
    )
    const out = extractImageCandidates($, PAGE)
    expect(out.map((i) => i.url)).toEqual(['https://example.com/real.png'])
  })
  it('deduplicates identical URLs', () => {
    const $ = cheerio.load(
      `<html><body><img src="/a.jpg" width="600" height="600"><img src="/a.jpg" width="600" height="600"></body></html>`,
    )
    const out = extractImageCandidates($, PAGE)
    expect(out.length).toBe(1)
  })
  it('honours scope selector when supplied', () => {
    const $ = cheerio.load(`
      <html><body>
        <img src="/outside.jpg" width="600" height="600">
        <div class="gallery"><img src="/inside.jpg" width="600" height="600"></div>
      </body></html>`)
    const out = extractImageCandidates($, PAGE, '.gallery')
    expect(out.map((i) => i.url)).toEqual(['https://example.com/inside.jpg'])
  })
})

describe('isProbedImageAcceptable', () => {
  it.each([
    ['image/jpeg', true],
    ['image/png', true],
    ['image/webp', true],
    ['image/gif', true],
    ['image/jpeg; charset=binary', true],
  ])('accepts %s', (ct, expected) => {
    expect(isProbedImageAcceptable(ct)).toBe(expected)
  })
  it.each([
    ['image/svg+xml'],
    ['text/html'],
    ['application/octet-stream'],
  ])('rejects %s', (ct) => {
    expect(isProbedImageAcceptable(ct)).toBe(false)
  })
  it('accepts undefined (unknown → trust until ingest)', () => {
    expect(isProbedImageAcceptable(undefined)).toBe(true)
  })
})
