import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Structured Data — Indus Admin' }

/**
 * Global Organization + WebSite JSON-LD editor. Per-entity overrides live
 * in each entity's SEO drawer (also Phase 2). The storefront already emits
 * these at runtime via `buildOrgLd` / `buildWebsiteLd` — this page lets
 * admins add `sameAs`, `contactPoint`, custom properties.
 */
export default function StructuredDataPage() {
  return (
    <div className="max-w-[640px] border border-dashed border-[var(--color-border)] p-8 text-[13px] text-[var(--color-muted)]">
      <h2 className="text-[18px] font-semibold text-[var(--color-primary)] mb-2">
        Structured data globals
      </h2>
      <p className="mb-3">
        The storefront already emits Organization &amp; WebSite JSON-LD on every page using the
        admin-managed defaults. Custom <code>sameAs</code>, <code>contactPoint</code>, and
        per-type overrides land in <strong>Phase 2</strong>.
      </p>
      <p className="font-mono text-[11px]">
        Per-entity JSON-LD override is exposed today via the Prisma <code>jsonLdOverride</code>{' '}
        column on every SEO-aware entity (Product, Category, Brand, Industry, BlogPost, CmsPage).
      </p>
    </div>
  )
}
