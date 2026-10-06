import type { BlogBlocksInput } from '@indus/domain'

/**
 * Hose pillars and fittings, wave 2 — 2026-10-06.
 *
 * Four of the seven pillar guides the audit asked for — hydraulic hose,
 * hydraulic fittings, hose assembly and oilfield hose — plus the articles for
 * shelves still without one: braided and spiral crimp fittings, NPT / NPSM /
 * SAE hose fittings, the 316L stainless range, well service hose and riser
 * tensioner hose. The other three pillars shipped in wave 1.
 *
 * Same constraints as wave 1 (see ../2026-10-06-blog-industrial-hose-wave-1):
 * every figure from the live listing, standards only where our listings cite
 * them and only where the citation is right, links to the deepest shelf, no
 * prices or lead times. Pillars link every cluster article in their area, so
 * the hub carries the cluster and the cluster carries the hub.
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

export const AUTHOR_SLUG = 'ayush-bhatia'

export const VERIFIED_ON = '2026-10-06'
