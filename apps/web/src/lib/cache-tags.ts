import 'server-only'
import { updateTag } from 'next/cache'

/**
 * Storefront cache tags, and the helpers admin actions call to purge them.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * The storefront caches its expensive reads with `unstable_cache(..., { tags })`
 * and long revalidate windows: products and category pages 3600s, brands,
 * industries and settings 300s, navigation 60s. Before the merge the admin was
 * a separate deployment with a separate Data Cache, so it could not purge any
 * of them. Editors' changes simply waited out the timer — **up to an hour**.
 *
 * The code said so plainly (lib/navigation.ts, lib/store-settings.ts,
 * app/(storefront)/layout.tsx all carry a "admin should call revalidateTag —
 * not wired today" comment) and 11 of the 13 tags had no invalidator at all.
 * One of the two that did, `updateTag('navigation')`, was a **dead string**:
 * the storefront's navigation caches are tagged `nav-menu`, `nav-brands` and
 * `nav-industries`, so it purged nothing.
 *
 * One app, one Data Cache. `updateTag` now works in-process.
 *
 * ── Why a module rather than scattered updateTag calls ──────────────────────
 *
 * A tag is a bare string on both sides. A typo — or a rename on one side only —
 * fails silently and looks exactly like a cache that has not expired yet, which
 * is how `navigation` survived. Naming them once here means there is a single
 * place to audit, and `cache-tags.test.ts` asserts that every tag the
 * storefront actually registers appears in this map.
 */

/** Every tag the storefront registers with `unstable_cache`. */
export const STOREFRONT_TAGS = {
  /** Homepage brand rail + published-brand count. */
  brands: 'brands',
  /** Megamenu brand column. */
  navBrands: 'nav-brands',
  /** Homepage category grid. */
  categories: 'categories',
  /** Homepage featured products. */
  products: 'products',
  /** Active-SKU count in the site header. */
  productCount: 'product-count',
  /** Homepage blog rail. */
  blogPosts: 'blog-posts',
  /** Megamenu structure. */
  navMenu: 'nav-menu',
  /** Megamenu industries column. */
  navIndustries: 'nav-industries',
  /** Industries list, detail and sitemap entries. */
  industries: 'industries',
  /** Footer contact details, /services store settings. */
  storeSettings: 'store-settings',
  /** Organization + WebSite JSON-LD in the storefront layout. */
  seoSettings: 'seo-settings',
  /** Replacement / cross-reference lookups. */
  crossReferences: 'cross-references',
  /** Homepage hero slides. */
  homepageHero: 'homepage-hero',
  /** Section documents behind Pages & Blocks. */
  pageContent: 'page-content',
  /** Footer social profiles — the pill row and the Organization `sameAs`. */
  footerSocials: 'footer-socials',
} as const

export type StorefrontTag = (typeof STOREFRONT_TAGS)[keyof typeof STOREFRONT_TAGS]

function purge(...tags: StorefrontTag[]): void {
  for (const tag of new Set(tags)) updateTag(tag)
}

/** Brand created, updated, deleted, or published/unpublished. */
export function invalidateBrands(): void {
  purge(STOREFRONT_TAGS.brands, STOREFRONT_TAGS.navBrands)
}

/** Category created, updated, deleted, or re-parented. */
export function invalidateCategories(): void {
  purge(STOREFRONT_TAGS.categories, STOREFRONT_TAGS.navMenu)
}

/**
 * Product created, updated, deleted, or status-changed.
 *
 * Also purges the SKU count, which the site header renders on every page — a
 * product going active/inactive changes it, and it is cached separately.
 */
export function invalidateProducts(): void {
  purge(STOREFRONT_TAGS.products, STOREFRONT_TAGS.productCount)
}

/** Industry created, updated, deleted, or its content blocks edited. */
export function invalidateIndustries(): void {
  purge(STOREFRONT_TAGS.industries, STOREFRONT_TAGS.navIndustries)
}

/** Navigation menu or its items reordered/edited. */
export function invalidateNavigation(): void {
  purge(STOREFRONT_TAGS.navMenu, STOREFRONT_TAGS.navBrands, STOREFRONT_TAGS.navIndustries)
}

/** Blog post published, updated, or unpublished. */
export function invalidateBlogPosts(): void {
  purge(STOREFRONT_TAGS.blogPosts)
}

/** Store settings saved — footer contact details, legal name, logo. */
export function invalidateStoreSettings(): void {
  purge(STOREFRONT_TAGS.storeSettings)
}

/**
 * The Footer editor saved.
 *
 * Wider than the screen it is named after, because that one screen writes to
 * four places: nav items in both footer menus, `store_settings`, and
 * `footer_socials` — which the storefront layout also reads for the
 * Organization JSON-LD's `sameAs`. Purging only the socials tag would leave a
 * corrected phone number sitting behind the 300s store-settings window, and
 * an editor who saves and sees nothing change is the failure this editor
 * exists to remove.
 */
export function invalidateFooter(): void {
  purge(
    STOREFRONT_TAGS.footerSocials,
    STOREFRONT_TAGS.storeSettings,
    STOREFRONT_TAGS.seoSettings,
    STOREFRONT_TAGS.navMenu
  )
}

/** SEO settings saved — Organization / WebSite JSON-LD overrides. */
/**
 * Purge everything a media file's alt text or caption can surface on.
 *
 * Deliberately broad. A `media` row is reachable from products, categories,
 * brands, industries, blog posts, the homepage hero and the site logos, and
 * which of those a given file feeds is only knowable by resolving the whole
 * usage index — thirty-odd queries, to save a few cache entries on an edit
 * that happens a handful of times a day.
 *
 * Over-purging costs a re-render; under-purging leaves stale alt text on a
 * live page, which is an accessibility and SEO regression that nothing
 * surfaces. The trade is one-sided, so this errs wide.
 */
export function invalidateMediaConsumers(): void {
  purge(
    STOREFRONT_TAGS.products,
    STOREFRONT_TAGS.categories,
    STOREFRONT_TAGS.brands,
    STOREFRONT_TAGS.industries,
    STOREFRONT_TAGS.blogPosts,
    STOREFRONT_TAGS.homepageHero,
    STOREFRONT_TAGS.storeSettings
  )
}

export function invalidateSeoSettings(): void {
  purge(STOREFRONT_TAGS.seoSettings)
}

/** Product cross-references edited. */
export function invalidateCrossReferences(): void {
  purge(STOREFRONT_TAGS.crossReferences)
}

/** Homepage hero slides edited. */
export function invalidateHomepageHero(): void {
  purge(STOREFRONT_TAGS.homepageHero)
}

/**
 * A page's sections were reordered, hidden or re-worded in Pages & Blocks.
 *
 * One tag for every page, not one per page. The documents share a cache entry
 * keyed by content key, and an edit is a handful of times a day against pages
 * that revalidate hourly anyway — a wider purge costs one re-render and a
 * narrower one risks an editor saving and seeing nothing change, which is the
 * failure this whole editor exists to avoid.
 */
export function invalidatePageContent(): void {
  purge(STOREFRONT_TAGS.pageContent)
}
