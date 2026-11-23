/**
 * Every cache tag Ops registers or purges (05-map-frontend §7.1), mirroring the website's
 * `cache-tags.ts` discipline (root CLAUDE.md §12.3): a tag is a bare string on both sides, so a
 * rename on one side alone just misses and looks exactly like a cache that has not expired.
 * Register and purge only through these helpers.
 *
 * Console data is per-user and live, so pages are dynamic; only slow-changing reference data is
 * cached (settings now; numbering patterns, FX locks and the template list when their sprints
 * land).
 */

/** Prefix of every Ops tag, so an Ops tag never collides with a storefront tag in a shared log. */
export const OPS_TAG_PREFIX = 'ops:' as const

export const opsTags = {
  /** Every settings row at once (a script that edits many rows, a cutover). */
  settings: 'ops:settings',
  /** One settings row, `ops:setting:<key>`, e.g. `ops:setting:pricing.defaults`. */
  setting: (key: string) => `ops:setting:${key}` as const,
} as const
