import type { MenuLocation } from './navigation'

/**
 * What each navigation surface actually is, as the admin needs to describe it.
 *
 * One editor serves all five menus, and the five are not alike: a megamenu
 * root is a "Section" with two useful levels beneath it, a footer root is a
 * "Column" with one, and a header root is a link with none. Without this the
 * editor has to either speak in `NavMenuItem` ("root", "child") — which is the
 * schema's vocabulary, not the editor's — or grow a switch per surface at
 * every label site.
 *
 * `renderedDepth` is the load-bearing field. Every one of these surfaces
 * silently drops items below a certain depth, and until now nothing said so
 * anywhere: the megamenu holds ~83 depth-3 items that no visitor has ever
 * seen, because `SiteHeaderClient` is a fixed three-column panel and resolves
 * the tree arbitrarily deep regardless. An editor could add a fourth level,
 * save it, see it listed in the admin, and never learn it does not exist.
 */
export interface NavSurface {
  location: MenuLocation
  /** Plural, for the hub card and empty states. */
  title: string
  /** One line on what draws this menu, in a visitor's terms. */
  renders: string
  /**
   * What a row is called at each depth, 0-indexed. The last entry repeats for
   * anything deeper.
   */
  levelNouns: string[]
  /**
   * The deepest depth (0-indexed) the storefront actually renders. Items below
   * it are kept in the database and never drawn. `null` = no known ceiling.
   */
  renderedDepth: number | null
  /** Whether a row at depth 0 may carry a promo tile. */
  supportsPromo: boolean
  /**
   * Set when nothing on the storefront reads this menu at all. The string is
   * shown to the editor in place of the usual "this is live" framing.
   */
  notWired?: string
}

export const NAV_SURFACES: Record<MenuLocation, NavSurface> = {
  primary_header: {
    location: 'primary_header',
    title: 'Header links',
    renders: 'The row of links across the top of every page, beside the logo.',
    levelNouns: ['Link'],
    // A header item's children are never drawn — the header is one flat row.
    renderedDepth: 0,
    supportsPromo: false,
  },
  primary_megamenu: {
    location: 'primary_megamenu',
    title: 'Megamenu',
    renders: 'The panel that opens under “Products”. Three columns, left to right.',
    levelNouns: ['Section', 'Group', 'Link'],
    // SiteHeaderClient draws a fixed three-column panel: L1 picks the section,
    // L2 the group, L3 the links. Depth 3 and below is retained and dropped.
    renderedDepth: 2,
    supportsPromo: true,
  },
  footer_main: {
    location: 'footer_main',
    title: 'Footer columns',
    renders: 'The link columns in the footer, between the brand block and the contact block.',
    levelNouns: ['Column', 'Link'],
    renderedDepth: 1,
    supportsPromo: false,
  },
  footer_legal: {
    location: 'footer_legal',
    title: 'Bottom bar links',
    renders: 'The small links beside the copyright line, at the very bottom.',
    levelNouns: ['Link'],
    renderedDepth: 0,
    supportsPromo: false,
  },
  mobile_drawer: {
    location: 'mobile_drawer',
    title: 'Mobile drawer',
    renders: 'Nothing, today.',
    levelNouns: ['Link'],
    renderedDepth: 0,
    supportsPromo: false,
    notWired:
      'Nothing on the storefront reads this menu. The mobile drawer is assembled in SiteHeaderClient from the header links, the megamenu’s top level and the brand list — so items added here are saved and never drawn. Edit Header links or the Megamenu instead.',
  },
}

/** What to call a row at this depth on this surface. */
export function navLevelNoun(surface: NavSurface, depth: number): string {
  const nouns = surface.levelNouns
  return nouns[Math.min(depth, nouns.length - 1)] ?? 'Item'
}

/** True when an item at this depth is kept but never drawn on the storefront. */
export function isBeyondRenderedDepth(surface: NavSurface, depth: number): boolean {
  return surface.renderedDepth !== null && depth > surface.renderedDepth
}
