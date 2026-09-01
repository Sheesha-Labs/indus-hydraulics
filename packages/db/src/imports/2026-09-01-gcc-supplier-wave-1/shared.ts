import type { BlogBlocksInput } from '@indus/domain'

/**
 * GCC supplier sprint, wave 1 — conformity and documentation.
 *
 * ## Why this cluster exists
 *
 * The blog holds 93 articles and every one of them is technical: why a hose
 * failed, what a standard says, how a machine is re-hosed. None of it answers
 * the question a Gulf buyer asks *before* placing a first cross-border order,
 * which is not "which hose" but "what has to travel with it, and will it clear".
 *
 * `/markets/saudi-arabia` and its five siblings already answer part of that at
 * the country level, and they own the commercial term — "hydraulic hose
 * supplier in Saudi Arabia" is their H1. **Nothing in this wave competes for
 * that phrase.** Each article takes one question underneath it and links back
 * up. A second page chasing the country term would split our own signal and
 * reproduce the doorway-page shape documented in
 * `research/alfeeltrading-seo-teardown.md`.
 *
 * ## The sourcing rule, and where it bit
 *
 * Conformity scope is a checkable fact and it is also the fact most often
 * stated wrongly by suppliers. Two things were verified before writing and
 * changed what the articles say:
 *
 *   - **The Gulf conformity mark does not apply to hydraulic hose.** G-Mark is
 *     scoped to low-voltage electrical equipment and toys, with the list being
 *     extended across household electrical goods. Hose is outside it. Article
 *     02 says so plainly rather than implying a mark we cannot supply.
 *   - **Kuwait, Qatar, Oman and Bahrain each run a different regime**, and
 *     three of the four are nothing like SABER. Article 09 separates them
 *     instead of writing "GCC requirements" as though there were one set.
 *
 * Where scope depends on the tariff line rather than on the product family —
 * which is most of Saudi Arabia — the articles say the scope is settled per HS
 * code and per part number, and that we settle it at quotation. They do not
 * assert that a hydraulic hose is or is not a regulated product in general,
 * because that is not a general fact.
 *
 * ## What this wave will not claim
 *
 * No approval we do not hold. Operator vendor systems — Aramco, ADNOC, PDO,
 * KOC — are written entirely from the buyer's side: what the regime asks of a
 * supplier, and what a buyer should ask for. There is no sentence anywhere in
 * this wave that says we are on any of those lists.
 *
 * No prices and no lead times in days beyond the transit figures already
 * published on the market pages, which are approved copy.
 *
 * Copy that already exists on `/markets/saudi-arabia` — SABER is prepared by us
 * against the part numbers on the order, sour-service documentation travels
 * with the consignment — is reused as written. It is approved; restating it in
 * new words would only create a second version to keep in step.
 */
export type BlogArticleSeed = {
  slug: string
  title: string
  excerpt: string
  /** BlogCategory slug — must already exist when the import runs. */
  categorySlug: string
  /** BlogAuthor slug — must already exist. */
  authorSlug: string
  seoTitle?: string
  seoDescription?: string
  focusKeyword?: string
  publishedAt: string
  /** The authoring type, not the parsed one. */
  bodyBlocks: BlogBlocksInput
}

/**
 * Every article in this wave carries the same byline.
 *
 * The four named authors published before 2026-09-01 were fabricated and have
 * been deleted; `ayush-bhatia` is the only real `BlogAuthor` row. Copying an
 * old wave's `authorSlug` would fail the import at the author lookup, which is
 * the correct behaviour and is why it is written here once.
 */
export const AUTHOR_SLUG = 'ayush-bhatia'
