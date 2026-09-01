import type { BlogBlocksInput } from '@indus/domain'

/**
 * Africa fittings sprint, wave 2 — buying fittings with no stockist nearby.
 *
 * Wave 1 answered "what is this thread". This wave answers the question that
 * follows it and is the one with money attached: how do I get the part, how do
 * I judge what arrives, and what should have been on the shelf already.
 *
 * ## Why it needs its own hub
 *
 * `fitting-identification` is about the part in your hand. `procurement-export`
 * is about hose orders and already carries nine of them. Neither is the home
 * for kitting, arrival inspection, plating choice and substitution — those are
 * a buying discipline rather than an identification skill or a hose topic, and
 * burying them under either heading would put them where nobody searching for
 * them would look.
 *
 * The hub ships with a body and a focus keyword from creation. Eleven hubs
 * shipped empty in August 2026 and needed a whole retrofit wave to fix it.
 *
 * ## What this wave will not say
 *
 * No prices, and no lead times in days. Transit figures belong to the market
 * pages, which publish them per lane and keep them current.
 *
 * No claim about the quality of any named brand, and no claim that unbranded
 * parts are unsafe as a class — `unbranded-hydraulic-fittings` already sets
 * that position and this wave stays consistent with it. The arrival-inspection
 * article describes what to check on any fitting from any source.
 *
 * No stock or availability promise beyond what `stock-posture.ts` supports.
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
