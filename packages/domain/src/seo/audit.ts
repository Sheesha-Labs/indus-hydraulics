/**
 * Audit-log diff helpers. The actual DB write happens at the server-action
 * layer (so it stays in the same Prisma transaction as the SEO mutation);
 * this module just produces the JSON payloads the audit row stores.
 *
 * Core idea: only record fields that ACTUALLY changed. Storing the whole
 * entity makes diffs noisy and makes "Revert" ambiguous when later changes
 * touched unrelated fields.
 */

export type AuditEntry = {
  field: string
  before: unknown
  after: unknown
}

const NEUTRAL_KEYS = new Set([
  'updatedAt',
  'seoUpdatedAt',
  'seoUpdatedById',
  'createdAt',
])

export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (a === null || b === null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const ka = Object.keys(a as Record<string, unknown>)
  const kb = Object.keys(b as Record<string, unknown>)
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    if (!isEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) {
      return false
    }
  }
  return true
}

/**
 * Diff two snapshots and return per-field audit entries for fields that
 * changed. Bookkeeping fields (updatedAt, seoUpdatedAt, seoUpdatedById,
 * createdAt) are filtered out — they would always show up and add noise.
 */
export function diffSnapshots(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): AuditEntry[] {
  const fields = new Set<string>([...Object.keys(before), ...Object.keys(after)])
  const entries: AuditEntry[] = []
  for (const field of fields) {
    if (NEUTRAL_KEYS.has(field)) continue
    const a = before[field]
    const b = after[field]
    if (!isEqual(a, b)) entries.push({ field, before: a, after: b })
  }
  return entries
}

/**
 * Project an entity to just its SEO-relevant fields so the audit log doesn't
 * record changes to unrelated columns (e.g. the title of a Product changed
 * for catalogue reasons, not SEO reasons).
 */
export const SEO_AUDITED_FIELDS = [
  'seoTitle',
  'seoDescription',
  'canonicalUrl',
  'robotsIndex',
  'robotsFollow',
  'ogImageMediaId',
  'focusKeyword',
  'sitemapPriority',
  'sitemapChangeFreq',
  'excludeFromSitemap',
  'jsonLdOverride',
] as const

export type SeoAuditedField = (typeof SEO_AUDITED_FIELDS)[number]

export function projectSeoFields<T extends Record<string, unknown>>(
  entity: T,
): Partial<Record<SeoAuditedField, unknown>> {
  const out: Partial<Record<SeoAuditedField, unknown>> = {}
  for (const f of SEO_AUDITED_FIELDS) {
    if (f in entity) out[f] = entity[f]
  }
  return out
}
