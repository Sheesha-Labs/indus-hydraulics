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
