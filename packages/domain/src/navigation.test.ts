import { describe, expect, it } from 'vitest'
import {
  ICON_NAMES,
  isAllowedIconName,
  isValidCustomUrl,
  MENU_LINK_TYPES,
  MENU_LOCATIONS,
  toNavChromeItems,
  type ResolvedNavItem,
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

describe('toNavChromeItems', () => {
  function resolved(over: Partial<ResolvedNavItem> = {}): ResolvedNavItem {
    return {
      id: 'ckxyz0000example',
      parentId: null,
      position: 3,
      label: 'Hoses',
      iconName: 'Truck',
      badge: 'New',
      description: 'A description nothing renders',
      href: '/c/hoses',
      openInNewTab: false,
      productCount: 412,
      promoImageUrl: '/promo.jpg',
      promoHeading: 'Promo',
      promoBody: 'Body',
      promoLinkUrl: '/promo',
      children: [],
      ...over,
    }
  }

  it('keeps only the fields the header chrome renders', () => {
    expect(toNavChromeItems([resolved()])).toEqual([{ label: 'Hoses', href: '/c/hoses' }])
  })

  it('drops the ten fields no client component reads', () => {
    const item = toNavChromeItems([resolved()])[0]
    expect(item).toBeDefined()
    for (const dropped of [
      'id',
      'parentId',
      'position',
      'iconName',
      'badge',
      'description',
      'productCount',
      'promoImageUrl',
      'promoHeading',
      'promoBody',
      'promoLinkUrl',
    ]) {
      expect(item).not.toHaveProperty(dropped)
    }
  })

  it('omits openInNewTab rather than serialising false', () => {
    expect(toNavChromeItems([resolved()])[0]).not.toHaveProperty('openInNewTab')
    expect(toNavChromeItems([resolved({ openInNewTab: true })])[0]).toHaveProperty(
      'openInNewTab',
      true,
    )
  })

  it('omits children rather than serialising an empty array on leaves', () => {
    expect(toNavChromeItems([resolved()])[0]).not.toHaveProperty('children')
  })

  it('projects the whole tree, at every depth', () => {
    const tree = resolved({
      children: [resolved({ label: 'Sub', children: [resolved({ label: 'Leaf' })] })],
    })
    expect(toNavChromeItems([tree])).toEqual([
      {
        label: 'Hoses',
        href: '/c/hoses',
        children: [
          { label: 'Sub', href: '/c/hoses', children: [{ label: 'Leaf', href: '/c/hoses' }] },
        ],
      },
    ])
  })

  it('carries promo fields only when asked, and never into children', () => {
    const tree = resolved({ children: [resolved({ label: 'Sub' })] })
    const item = toNavChromeItems([tree], { withPromo: true })[0]
    expect(item).toBeDefined()
    expect(item?.promoHeading).toBe('Promo')
    // The promo panel belongs to a top-level header item. Carrying these four
    // fields into 316 megamenu descendants is what this function prevents.
    expect(item?.children?.[0]).not.toHaveProperty('promoHeading')
  })

  it('is materially smaller than the resolved tree once serialised', () => {
    const tree = Array.from({ length: 40 }, (_, i) =>
      resolved({ label: `Cat ${i}`, children: [resolved({ label: `Sub ${i}` })] }),
    )
    const before = JSON.stringify(tree).length
    const after = JSON.stringify(toNavChromeItems(tree)).length
    expect(after).toBeLessThan(before * 0.35)
  })
})
