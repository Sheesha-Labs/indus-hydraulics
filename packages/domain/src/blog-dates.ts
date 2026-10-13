/**
 * When a blog post last changed, as one answer for every surface that states
 * it: the sitemap `<lastmod>`, Article JSON-LD `dateModified`, `og:modified_time`
 * and the "Updated" line under the byline.
 *
 * They used to disagree. The sitemap took the newer of `seoUpdatedAt` and
 * `publishedAt` — so an edit to the article body never moved it — while the
 * JSON-LD read `updatedAt`. A crawler comparing the two saw a page that had
 * changed and a sitemap insisting it had not.
 *
 * `updatedAt` is the content signal here. Unlike products, nothing bulk-touches
 * blog rows outside an import, and an import is a content change. A review
 * sign-off counts too: it changes what the page says.
 */

export type BlogPostDates = {
  publishedAt?: Date | null
  updatedAt?: Date | null
  seoUpdatedAt?: Date | null
  reviewedAt?: Date | null
}

function valid(d: Date | null | undefined): d is Date {
  return d instanceof Date && !Number.isNaN(d.getTime())
}

/** The newest of the post's dates, or null when it has none. */
export function blogPostModifiedAt(post: BlogPostDates): Date | null {
  let newest: Date | null = null
  for (const d of [post.publishedAt, post.updatedAt, post.seoUpdatedAt, post.reviewedAt]) {
    if (valid(d) && (!newest || d > newest)) newest = d
  }
  return newest
}

/**
 * How long after publication a change has to land before the page announces
 * "Updated". Fixes made in the week a post goes out are part of publishing it;
 * a reader told an article was updated the day after it appeared learns
 * nothing, and the date beside the byline should mean something.
 */
export const BLOG_UPDATED_LABEL_MIN_DAYS = 7

const DAY_MS = 24 * 60 * 60 * 1000

/** Whether to show an "Updated <date>" line beside the published date. */
export function shouldShowUpdatedDate(
  publishedAt: Date | null | undefined,
  modifiedAt: Date | null | undefined,
): boolean {
  if (!valid(publishedAt) || !valid(modifiedAt)) return false
  return modifiedAt.getTime() - publishedAt.getTime() >= BLOG_UPDATED_LABEL_MIN_DAYS * DAY_MS
}

/** A `<input type="date">` value as UTC midnight, or null when blank or malformed. */
export function parseDateInput(raw: string | null | undefined): Date | null {
  const v = (raw ?? '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null
  const d = new Date(`${v}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? null : d
}

/**
 * The review date to store for a save.
 *
 * - No reviewer: no date. A date with nobody behind it is a claim no one made.
 * - An explicit date: that date.
 * - The same reviewer as before, no new date: the sign-off stands.
 * - A new reviewer, no date: today — they are signing it off now.
 */
export function resolveReviewedAt(input: {
  reviewerId: string | null
  explicit: Date | null
  existing: Date | null
  existingReviewerId: string | null
  now: Date
}): Date | null {
  if (!input.reviewerId) return null
  if (input.explicit) return input.explicit
  if (input.existing && input.existingReviewerId === input.reviewerId) return input.existing
  return input.now
}
