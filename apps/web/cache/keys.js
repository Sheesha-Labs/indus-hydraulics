'use strict'

const { createHash } = require('node:crypto')

/**
 * Pure helpers behind the Redis cache handler.
 *
 * Separated from the handler itself so they can be tested without a Redis
 * server or a Next runtime — the staleness rule in particular is the thing that
 * decides whether an editor's "unpublish" actually unpublishes.
 */

/**
 * The cache namespace, which is what decides whether a deploy keeps or drops
 * the cache.
 *
 * This is the whole reason for self-hosting the cache. Vercel gives every
 * deployment its own ISR cache and will not reuse the previous one, so each
 * deploy left ~1,790 URLs cold. Here the namespace is derived from the CLIENT
 * BUILD rather than from the deployment:
 *
 *   - content-only deploy (no source change) -> identical chunk hashes ->
 *     identical namespace -> the cache carries over.
 *   - code deploy -> different chunk hashes -> new namespace.
 *
 * The second case is not a missed optimisation, it is required. Cached HTML
 * embeds `<script src="/_next/static/chunks/<hash>.js">`; serving it after those
 * chunks have been replaced gives the visitor a page whose scripts 404.
 */
/**
 * @param {string | null} buildManifest
 * @param {string} fallback
 * @returns {string}
 */
function cacheNamespace(buildManifest, fallback) {
  if (!buildManifest) return fallback
  return createHash('sha256').update(buildManifest).digest('hex').slice(0, 12)
}

/**
 * Has any of an entry's tags been revalidated since the entry was written?
 *
 * `revalidatedAt` comes from a Redis hash shared by every instance. Next's own
 * FileSystemCache keeps this in a per-process Map, which is why self-hosting it
 * unchanged breaks the admin CMS: one instance purges, the others never hear,
 * and a restart resurrects everything that was purged.
 *
 * Ties count as stale. Equal millisecond timestamps mean the write and the purge
 * are indistinguishable in order, and serving content an editor believes they
 * removed is the worse of the two errors.
 */
/**
 * @param {number} entryLastModified
 * @param {readonly string[]} tags
 * @param {Readonly<Record<string, number | undefined>>} revalidatedAt
 * @returns {boolean}
 */
function isStale(entryLastModified, tags, revalidatedAt) {
  for (const tag of tags) {
    const at = revalidatedAt[tag]
    if (typeof at === 'number' && at >= entryLastModified) return true
  }
  return false
}

/**
 * The tags attached to a cached entry.
 *
 * Next puts them in different places depending on what was cached: route
 * handlers and pages carry them in a response header, fetch entries carry them
 * on the context. Missing either means an entry that no purge can ever reach.
 */
/**
 * @param {unknown} value
 * @param {readonly string[] | undefined} ctxTags
 * @param {readonly string[] | undefined} softTags
 * @returns {string[]}
 */
function tagsFor(value, ctxTags, softTags) {
  /** @type {Set<string>} */
  const out = new Set()
  for (const t of ctxTags ?? []) out.add(t)
  for (const t of softTags ?? []) out.add(t)

  const headers = value == null ? undefined : /** @type {any} */ (value).headers
  const header = headers?.['x-next-cache-tags']
  if (typeof header === 'string') {
    for (const t of header.split(',')) {
      const trimmed = t.trim()
      if (trimmed) out.add(trimmed)
    }
  }
  return [...out]
}

module.exports = { cacheNamespace, isStale, tagsFor }
