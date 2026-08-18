import type { Metadata } from 'next'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'Sitemap — Indus Admin' }

/**
 * Sitemap previewer. Tells admins exactly what `/sitemap.xml` will emit.
 * The actual XML is computed by the storefront `app/sitemap.ts` using the
 * shared `buildSitemapEntries` helper, so this page just summarises counts
 * and exclusions — it doesn't need to refetch the same payload.
 */
export default async function SitemapPage() {
  const [products, categories, brands, blogPosts, cmsPages, excluded, noindexed] = await Promise.all([
    db.product.count({ where: { status: 'active', excludeFromSitemap: false, robotsIndex: true } }),
    db.category.count({ where: { isPublished: true, excludeFromSitemap: false, robotsIndex: true } }),
    db.brand.count({ where: { isPublished: true, excludeFromSitemap: false, robotsIndex: true } }),
    db.blogPost.count({ where: { isPublished: true, excludeFromSitemap: false, robotsIndex: true } }),
    db.cmsPage.count({ where: { isPublished: true, excludeFromSitemap: false, robotsIndex: true } }),
    db.product.count({ where: { excludeFromSitemap: true } }),
    db.product.count({ where: { robotsIndex: false } }),
  ])

  const total = products + categories + brands + blogPosts + cmsPages

  return (
    <div className="max-w-[800px]">
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Tile label="Products" value={products} />
        <Tile label="Categories" value={categories} />
        <Tile label="Brands" value={brands} />
        <Tile label="Blog posts" value={blogPosts} />
        <Tile label="CMS pages" value={cmsPages} />
        <Tile label="Total URLs" value={total} accent />
      </div>

      <div className="border border-ih-border p-4 mb-4">
        <h3 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-3">
          Exclusions
        </h3>
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <div className="text-ih-muted">Excluded from sitemap (products)</div>
            <div className="font-medium text-[18px]">{excluded}</div>
          </div>
          <div>
            <div className="text-ih-muted">Noindexed (products)</div>
            <div className="font-medium text-[18px]">{noindexed}</div>
          </div>
        </div>
      </div>

      <a
        href="/sitemap.xml"
        target="_blank"
        rel="noopener"
        className="inline-block h-9 px-4 border border-ih-border grid place-items-center font-mono text-[12px] hover:bg-ih-surface-2"
      >
        Open /sitemap.xml ↗
      </a>

      <p className="mt-4 font-mono text-[11px] text-ih-muted">
        Per-entity sitemap priority &amp; changefreq overrides are configured from the SEO drawer
        on each entity edit page. A sitemap-index split (when total &gt; 50k URLs) lands in
        Phase 2.
      </p>
    </div>
  )
}

function Tile({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="border border-ih-border bg-ih-surface p-4">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
        {label}
      </div>
      <div className={`text-[28px] font-medium mt-1 ${accent ? 'text-ih-accent' : ''}`}>
        {value}
      </div>
    </div>
  )
}
