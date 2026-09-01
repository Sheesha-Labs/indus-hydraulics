import type { BlogBlocksInput } from '@indus/domain'

/**
 * Africa fittings sprint, wave 1 — threads by machine origin.
 *
 * ## Why this cluster
 *
 * `fitting-identification` held seven articles and all seven answered the
 * question from the fitting's side: here is a thread, what is it. Nobody had
 * written the question from the machine's side: here is a machine that arrived
 * from China, or Japan, or India, what am I likely to find on it and what will
 * I need in the van.
 *
 * That is the question a mixed-import fleet actually asks, and mixed-import
 * fleets are the norm across the African markets we ship to. A quarry outside
 * Kumasi can be running a Chinese wheel loader, a used Japanese excavator and
 * a European crusher on the same site, and the workshop that stocks for one of
 * them is wrong for the other two.
 *
 * ## The honesty constraint that shaped every article here
 *
 * **We hold no verified per-OEM thread data.** Port and thread conventions vary
 * by model, by year and by the market a machine was built for, and a used
 * machine has whatever the last three repairs left on it. So no article in this
 * wave publishes an OEM-by-OEM table as fact.
 *
 * What each one does instead: name the standard families to expect for machines
 * of that origin, give the physical tells that separate them, say what a
 * workshop should therefore carry, and state plainly that the fitting in front
 * of you is settled by measurement rather than by the badge on the machine.
 * Where two standards are genuinely easy to confuse — JIS 30° and Komatsu 30°
 * being the worst of them — the confusion is the subject rather than a footnote.
 *
 * ## What it does not do
 *
 * No country is named in a title. `/markets/nigeria` and its siblings own the
 * commercial country term; these articles link up to them and let the generated
 * reach section carry the geography. Same rule as the GCC sprint.
 *
 * No prices, no lead times in days, no claim about what proportion of any
 * country's fleet is of any origin — that is a statistic we have not measured.
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

/** The only real BlogAuthor row. The four fabricated ones were deleted 2026-09-01. */
export const AUTHOR_SLUG = 'ayush-bhatia'
