// Mirrors `MenuLocation` enum in packages/db/prisma/schema.prisma
export type MenuLocation =
  | 'primary_header'
  | 'primary_megamenu'
  | 'footer_main'
  | 'footer_legal'
  | 'mobile_drawer'

// Mirrors `MenuLinkType` enum in packages/db/prisma/schema.prisma
export type MenuLinkType =
  | 'none'
  | 'category'
  | 'brand'
  | 'industry'
  | 'cms_page'
  | 'product'
  | 'custom_url'

export const MENU_LOCATIONS: readonly MenuLocation[] = [
  'primary_header',
  'primary_megamenu',
  'footer_main',
  'footer_legal',
  'mobile_drawer',
] as const

export const MENU_LOCATION_LABELS: Record<MenuLocation, string> = {
  primary_header: 'Primary header',
  primary_megamenu: 'Megamenu (Products)',
  footer_main: 'Footer — main',
  footer_legal: 'Footer — legal',
  mobile_drawer: 'Mobile drawer',
}

export const MENU_LINK_TYPES: readonly MenuLinkType[] = [
  'none',
  'category',
  'brand',
  'industry',
  'cms_page',
  'product',
  'custom_url',
] as const

export const MENU_LINK_TYPE_LABELS: Record<MenuLinkType, string> = {
  none: 'No link (label only)',
  category: 'Category',
  brand: 'Brand',
  industry: 'Industry',
  cms_page: 'CMS page',
  product: 'Product',
  custom_url: 'Custom URL',
}

const ALLOWED_ICON_NAMES = [
  'Wrench',
  'Cog',
  'Cylinder',
  'Gauge',
  'Filter',
  'Hammer',
  'Package',
  'Sparkles',
  'Star',
  'Tag',
  'Truck',
  'Zap',
] as const
export type AllowedIconName = (typeof ALLOWED_ICON_NAMES)[number]
export const ICON_NAMES: readonly AllowedIconName[] = ALLOWED_ICON_NAMES

export function isAllowedIconName(value: string): value is AllowedIconName {
  return (ALLOWED_ICON_NAMES as readonly string[]).includes(value)
}

const INTERNAL_PATH_REGEX = /^\/(?!\/).+/
const HTTPS_URL_REGEX = /^https:\/\/.+/

export function isValidCustomUrl(url: string): boolean {
  if (!url || url.length > 2048) return false
  return INTERNAL_PATH_REGEX.test(url) || HTTPS_URL_REGEX.test(url)
}

export interface ResolvedNavItem {
  id: string
  parentId: string | null
  position: number
  label: string
  iconName: string | null
  badge: string | null
  description: string | null
  href: string | null
  openInNewTab: boolean
  productCount: number | null
  promoImageUrl: string | null
  promoHeading: string | null
  promoBody: string | null
  promoLinkUrl: string | null
  children: ResolvedNavItem[]
}

export interface ResolvedNavMenu {
  id: string
  slug: string
  name: string
  location: MenuLocation
  isPublished: boolean
  publishedAt: Date | null
  items: ResolvedNavItem[]
}

/**
 * The subset of a nav item the header chrome actually renders.
 *
 * WHY THIS TYPE EXISTS — 2026-09-10.
 *
 * `SiteHeader` is a server component and `SiteHeaderClient` is a client one,
 * so every field of every item handed across that boundary is serialised into
 * the RSC flight payload of EVERY page on the site. The menu carries 316 items
 * across three levels and `ResolvedNavItem` carries fourteen fields. Measured
 * on production: 205 KB of the 277 KB a product page weighed — 74% of the
 * document — against roughly 5 KB of visible text. A text-to-markup ratio of
 * 1.9%, on a domain where 1,733 URLs sat in "Discovered – currently not
 * indexed" and 83% of them had never been fetched at all.
 *
 * Ten of the fourteen fields are read by NO client component: `iconName`,
 * `badge`, `description`, `productCount`, `parentId`, `position`, and the four
 * `promo*` fields — those last are read, but only for the two top-level header
 * items that open the brands and industries panels, never for the 316 megamenu
 * items. `id` is read only as a React key, which the index and label supply for
 * free on a list that never reorders client-side.
 *
 * Projecting to this shape before the boundary removes ~137 KB from every page
 * on the site. Nothing about what renders changes.
 *
 * KEEP THIS TYPE MINIMAL. A field added here is a field multiplied by every
 * page Google has to download to reach the text.
 */
export interface NavChromeItem {
  label: string
  href: string | null
  /** `true` or absent — never `false`. The payload carries 316 of these. */
  openInNewTab?: true
  /** Absent rather than `[]` on leaves, for the same reason. */
  children?: NavChromeItem[]
  /** Top-level header items only; see `toNavChromeItems`. */
  promoImageUrl?: string | null
  promoHeading?: string | null
  promoBody?: string | null
  promoLinkUrl?: string | null
}

/**
 * Project resolved nav items down to what the client chrome reads.
 *
 * `withPromo` applies to the passed level ONLY and is deliberately not
 * inherited by children: the promo panel is a property of a top-level header
 * item, and carrying those four fields down into 316 megamenu descendants is
 * most of what this function exists to prevent.
 */
export function toNavChromeItems(
  items: readonly ResolvedNavItem[],
  opts: { withPromo?: boolean } = {},
): NavChromeItem[] {
  return items.map((item) => {
    const out: NavChromeItem = { label: item.label, href: item.href }
    if (item.openInNewTab) out.openInNewTab = true
    const children = toNavChromeItems(item.children)
    if (children.length > 0) out.children = children
    if (opts.withPromo) {
      if (item.promoImageUrl) out.promoImageUrl = item.promoImageUrl
      if (item.promoHeading) out.promoHeading = item.promoHeading
      if (item.promoBody) out.promoBody = item.promoBody
      if (item.promoLinkUrl) out.promoLinkUrl = item.promoLinkUrl
    }
    return out
  })
}
