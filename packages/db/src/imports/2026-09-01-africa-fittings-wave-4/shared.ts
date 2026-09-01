import type { BlogBlocksInput } from '@indus/domain'

/**
 * Africa fittings sprint, wave 4 — the diagnostic layer for fittings.
 *
 * Waves 1 to 3 answered what a thread is, how to buy it and what an industry
 * runs. None of them answered the question a reader actually arrives with: a
 * symptom. The blog already has that layer for hose — `failure-analysis` and
 * `machine-down` are the two largest clusters on the site and both are built
 * symptom-first — and fittings had nothing equivalent.
 *
 * ## Why these ten and not the obvious ten
 *
 * The obvious list collided with four articles we already have:
 * `hydraulic-fitting-make-up-torque` teaches the flats-from-finger-tight
 * method, `removing-a-seized-hydraulic-fitting` covers extraction,
 * `cross-threaded-hydraulic-port` covers that specific damage, and
 * `stopping-an-npt-thread-leak` covers NPT sealing. Writing "how to torque a
 * fitting" against the first of those would split our own signal, which is the
 * mistake this whole sprint has been avoiding at country level.
 *
 * So every article here sits DOWNSTREAM of those: diagnosis rather than
 * technique. What the leak path tells you, how to read a joint after the fact,
 * when a damaged port is scrap. Each links to the technique article rather than
 * restating it.
 *
 * ## Constraints applied from the first line rather than in a later pass
 *
 * The 2026-09-01 fix pass found four defects across the previous forty
 * articles. All four are prevented here by construction:
 *
 *   - `BLOG_SEO` titles are written to a 40-character cap, because the
 *     storefront appends ' | Indus Hydraulics' and a 60-character title is
 *     truncated in the result page.
 *   - Every focus keyword appears verbatim in its own seoTitle and is a
 *     contiguous hyphen-joined phrase from its own slug.
 *   - Every description sits inside 120–160 characters.
 *   - Every article carries the keyword in its opening block, written in
 *     rather than retrofitted.
 *
 * Each also carries a reserved figure slot with a brief, so the image pass has
 * a position and a caption to work from without anyone re-reading the article.
 *
 * ## What this wave will not publish
 *
 * No torque tables. We hold no verified per-family values and the existing
 * article teaches the method that does not need them.
 *
 * No procedure that puts a damaged pressure-carrying part back into service.
 * Where the honest answer is "that component is scrap", the article says so.
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

/** The only real BlogAuthor row. */
export const AUTHOR_SLUG = 'ayush-bhatia'
