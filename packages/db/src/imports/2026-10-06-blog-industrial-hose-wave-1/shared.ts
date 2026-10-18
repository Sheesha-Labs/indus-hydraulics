import type { BlogBlocksInput } from '@indus/domain'

/**
 * Industrial hose cluster, wave 1 — 2026-10-06.
 *
 * The 2026-10-05 audit counted five industrial-hose articles against 332
 * industrial-hose products, and 27 of the 36 industrial-hose shelves with no
 * article linking to them or to any of their parts. This wave is the cluster
 * those shelves were missing: three pillar guides (industrial hose by
 * application, industrial hose couplings, metal hose) and the articles that
 * hang off them — one per coupling family, one per application the catalogue
 * actually stocks, one per metal hose construction.
 *
 * ## Constraints written in from the first line
 *
 *   - Every figure is from the live listing it describes: working pressure,
 *     burst, temperature range, safety factor, size range, materials and the
 *     standard printed on the hose or quoted on the coupling page. Nothing is
 *     quoted from memory, and where a listing is silent the article is too.
 *   - A standard is cited only where our own listings cite it. The cam and
 *     groove pages also claim "ISO 16028-compatible cam geometry"; ISO 16028 is
 *     the hydraulic flat-face coupler standard, so that line is not repeated.
 *   - `BLOG_SEO` titles are written to the 41-character cap, keywords are a
 *     contiguous phrase from the slug, descriptions sit in 120–160 characters.
 *   - Every article links down to the deepest shelf that answers it and embeds
 *     the parts it names; related reading comes from `BLOG_CROSS_LINKS`.
 *   - No prices, no lead times, no compatibility verdicts we cannot evidence.
 */
export type BlogArticleSeed = {
  slug: string
  title: string
  excerpt: string
  categorySlug: string
  authorSlug: string
  seoTitle?: string
  seoDescription?: string
  focusKeyword?: string
  publishedAt: string
  bodyBlocks: BlogBlocksInput
}

/** The only published BlogAuthor row. */
export const AUTHOR_SLUG = 'ayush-bhatia'

/** The date the figures in this wave were read from the live listings. */
export const VERIFIED_ON = '2026-10-06'
