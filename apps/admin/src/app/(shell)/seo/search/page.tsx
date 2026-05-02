import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Search OS — Indus Admin' }

/**
 * Search admin: synonyms, search redirects, boosts, query analytics.
 * Schema tables (`SearchSynonym`, `SearchRedirect`, `SearchBoost`,
 * `SearchQueryLog`) ship in this PR; the CRUD UI + storefront FTS rewrite
 * land in Phase 2.
 */
export default function SeoSearchPage() {
  return (
    <div className="max-w-[640px] border border-dashed border-[var(--color-border)] p-8 text-[13px] text-[var(--color-muted)]">
      <h2 className="text-[18px] font-semibold text-[var(--color-primary)] mb-2">
        On-site search OS
      </h2>
      <p className="mb-2">
        Phase 2 ships: synonym groups, query → URL redirects, per-entity boosts, top-queries
        and zero-result reports.
      </p>
      <p className="font-mono text-[11px]">
        Storefront search switches from Prisma <code>OR contains</code> to Postgres
        <code> websearch_to_tsquery</code> + <code>pg_trgm</code> typo fallback in the same phase.
      </p>
    </div>
  )
}
