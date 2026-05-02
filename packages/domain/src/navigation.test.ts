import { describe, expect, it } from 'vitest'
import {
  ICON_NAMES,
  isAllowedIconName,
  isValidCustomUrl,
  MENU_LINK_TYPES,
  MENU_LOCATIONS,
} from './navigation'

describe('navigation', () => {
  it('exposes the expected menu locations', () => {
    expect(MENU_LOCATIONS).toContain('primary_header')
    expect(MENU_LOCATIONS).toContain('primary_megamenu')
    expect(MENU_LOCATIONS).toContain('footer_main')
    expect(MENU_LOCATIONS).toContain('footer_legal')
    expect(MENU_LOCATIONS).toContain('mobile_drawer')
  })

  it('exposes the expected link types', () => {
    expect(MENU_LINK_TYPES).toEqual([
      'none',
      'category',
      'brand',
      'industry',
      'cms_page',
      'product',
      'custom_url',
    ])
  })

  describe('isValidCustomUrl', () => {
    it('accepts internal paths starting with /', () => {
      expect(isValidCustomUrl('/about')).toBe(true)
      expect(isValidCustomUrl('/c/hydraulic-pumps?sub=gear')).toBe(true)
    })

    it('accepts https URLs', () => {
      expect(isValidCustomUrl('https://example.com')).toBe(true)
      expect(isValidCustomUrl('https://example.com/path?q=1')).toBe(true)
    })

    it('rejects http (insecure) URLs', () => {
      expect(isValidCustomUrl('http://example.com')).toBe(false)
    })

    it('rejects URLs without protocol or leading slash', () => {
      expect(isValidCustomUrl('example.com')).toBe(false)
      expect(isValidCustomUrl('about')).toBe(false)
    })

    it('rejects javascript: and other schemes', () => {
      expect(isValidCustomUrl('javascript:alert(1)')).toBe(false)
      expect(isValidCustomUrl('mailto:hi@example.com')).toBe(false)
      expect(isValidCustomUrl('//evil.example.com')).toBe(false)
    })

    it('rejects empty strings and lone slashes', () => {
      expect(isValidCustomUrl('')).toBe(false)
      expect(isValidCustomUrl('/')).toBe(false)
    })

    it('rejects pathological lengths', () => {
      const longPath = '/' + 'a'.repeat(2050)
      expect(isValidCustomUrl(longPath)).toBe(false)
    })
  })

  describe('isAllowedIconName', () => {
    it('accepts every name in the allowlist', () => {
      for (const name of ICON_NAMES) {
        expect(isAllowedIconName(name)).toBe(true)
      }
    })

    it('rejects unknown names', () => {
      expect(isAllowedIconName('NotAnIcon')).toBe(false)
      expect(isAllowedIconName('')).toBe(false)
      expect(isAllowedIconName('wrench')).toBe(false) // case-sensitive
    })
  })
})
