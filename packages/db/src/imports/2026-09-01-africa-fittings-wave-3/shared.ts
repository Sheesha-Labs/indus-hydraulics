import type { BlogBlocksInput } from '@indus/domain'

/**
 * Africa fittings sprint, wave 3 — where the demand actually is.
 *
 * Waves 1 and 2 were horizontal: identify a thread, buy it well. This wave is
 * vertical. One article per industry that actually runs hydraulics across the
 * African markets we ship to, written from the equipment that industry uses
 * rather than from a country's name.
 *
 * ## The rule that keeps this out of doorway territory
 *
 * Each article has to be about the WORK, not about the place. A piece on copper
 * concentrator plant is the same piece whether the plant is in Zambia or Chile —
 * what makes it a Zambian article is the lane, the resupply distance and the
 * fleet mix, and those get one paragraph and a link to the market page, not the
 * headline. Country names appear in titles here for the first time in the
 * sprint, and never in the form "hydraulic fittings supplier in X": that phrase
 * belongs to `/markets/{slug}` and a blog article competing for it would split
 * our own signal.
 *
 * The market-card budget was raised from 12 articles to 18 for this wave — see
 * the note in `blog-cross-links.test.ts`. Eight of these ten carry a card,
 * because eight of them genuinely are about a place. Two do not.
 *
 * ## What this wave must not claim
 *
 * No production statistics, no reserve figures, no market shares. We have not
 * measured any of them and a supplier quoting them is decorating.
 *
 * No named mine, plant, port or operator as a customer, and no implication of
 * one. Where an article names a place it is naming an industrial geography that
 * is public knowledge, not a reference.
 *
 * No claim of local presence, local stock or a branch anywhere. Everything
 * ships from Dubai, which is what the market pages already say.
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
