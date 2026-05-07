/**
 * Convert a free-text title into a URL-safe kebab-case slug.
 *
 * Mirrors the slugify in apps/admin/src/app/(shell)/products/import/actions.ts:71
 * — when that admin importer is refactored to consume this module (follow-up PR),
 * the duplicate copy there will be deleted.
 *
 * Rules:
 *   - Lowercase
 *   - Non-alphanumerics → single hyphen
 *   - Trim leading/trailing hyphens
 *   - Cap at 180 chars (Product.slug is `String` with no DB cap, but storefront
 *     URL ergonomics prefer < 200)
 *   - Empty result falls back to `product-<timestamp>` so a slug is never blank
 */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 180) || `product-${Date.now()}`
  )
}

/**
 * Dedupe a slug against a set of already-claimed slugs by appending `-2`,
 * `-3`, … until unique. Mutates the set so subsequent calls dedupe correctly.
 *
 * Used when a single import batch contains multiple products whose titles
 * collapse to the same slug. NOT used for cross-batch dedupe — that's done
 * by checking the `products` table directly.
 */
export function dedupeSlugInBatch(slug: string, claimed: Set<string>): string {
  if (!claimed.has(slug)) {
    claimed.add(slug)
    return slug
  }
  let n = 2
  while (claimed.has(`${slug}-${n}`)) n += 1
  const next = `${slug}-${n}`
  claimed.add(next)
  return next
}
