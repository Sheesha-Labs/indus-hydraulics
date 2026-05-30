import { describe, it, expect } from 'vitest'
import { slugify, slugifyLastPathSegment, MAX_SKU_LENGTH } from './sku'

describe('slugify', () => {
  it('lowercases + replaces spaces with dashes', () => {
    expect(slugify('Bosch Rexroth A10VSO')).toBe('bosch-rexroth-a10vso')
  })
  it('collapses runs of non-alphanumerics to single dash', () => {
    expect(slugify('a // b __ c')).toBe('a-b-c')
  })
  it('trims leading/trailing dashes', () => {
    expect(slugify('---hello---')).toBe('hello')
  })
  it('caps at MAX_SKU_LENGTH', () => {
    const long = 'x'.repeat(MAX_SKU_LENGTH + 10)
    expect(slugify(long).length).toBe(MAX_SKU_LENGTH)
  })
  it('strips diacritics', () => {
    expect(slugify('café-é')).toBe('cafe-e')
  })
  it('returns empty string for nonsense input', () => {
    expect(slugify('!!!@@@###')).toBe('')
  })
})

describe('slugifyLastPathSegment', () => {
  it('takes the last segment of a normal path', () => {
    expect(slugifyLastPathSegment('https://competitor.com/products/a10vso-axial-pump')).toBe(
      'a10vso-axial-pump',
    )
  })
  it('ignores trailing slash', () => {
    expect(slugifyLastPathSegment('https://x.com/products/a10vso/')).toBe('a10vso')
  })
  it('ignores query strings', () => {
    expect(slugifyLastPathSegment('https://x.com/p/abc?utm=1')).toBe('abc')
  })
  it('ignores fragments', () => {
    expect(slugifyLastPathSegment('https://x.com/p/abc#section')).toBe('abc')
  })
  it('returns empty string when no path segments', () => {
    expect(slugifyLastPathSegment('https://x.com/')).toBe('')
  })
  it('returns empty string for invalid URL', () => {
    expect(slugifyLastPathSegment('not a url')).toBe('')
  })
})
