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
    <div className="border-ih-border text-ih-muted max-w-[640px] rounded-lg border p-8 text-[13px]">
      <h2 className="text-ih-ink mb-2 text-[18px] font-medium">Structured data globals</h2>
      <p className="mb-3">
        The storefront already emits Organization &amp; WebSite JSON-LD on every page using the
        admin-managed defaults. Custom <code>sameAs</code>, <code>contactPoint</code>, and per-type
        overrides land in <strong>Phase 2</strong>.
      </p>
      <p className="text-[11px] tabular-nums">
        Per-entity JSON-LD override is exposed today via the Prisma <code>jsonLdOverride</code>{' '}
        column on every SEO-aware entity (Product, Category, Brand, Industry, BlogPost, CmsPage).
      </p>
    </div>
  )
}
