import type { Metadata } from 'next'
import { db } from '@indus/db'
import { PRODUCT_INDEX_MIN_CONTENT_SCORE, PRODUCT_INDEX_MIN_SIZE_ROWS, isProductIndexable } from '@indus/domain'

export const metadata: Metadata = { title: 'Sitemap — Indus Admin' }

/**
 * Sitemap previewer. Tells admins exactly what `/sitemap.xml` will emit.
 * The actual XML is computed by the storefront `app/sitemap.ts` using the
 * shared `buildSitemapEntries` helper, so this page just summarises counts
 * and exclusions — it doesn't need to refetch the same payload.
 */
export default async function SitemapPage() {
  const [gated, categories, brands, blogPosts, cmsPages, excluded, noindexed] = await Promise.all([
    // Calls `isProductIndexable` itself rather than restating it as a
    // `where`: the gate reads the size-table row count, which a count filter
    // cannot express, and a copy of the rule is a second thing to drift.
    db.product.findMany({
      where: { status: 'active', robotsIndex: true },
      select: {
        robotsIndex: true,
        contentScore: true,
        excludeFromSitemap: true,
        _count: { select: { variants: true } },
      },
    }),
    db.category.count({ where: { isPublished: true, excludeFromSitemap: false, robotsIndex: true } }),
    db.brand.count({ where: { isPublished: true, excludeFromSitemap: false, robotsIndex: true } }),
    db.blogPost.count({ where: { isPublished: true, excludeFromSitemap: false, robotsIndex: true } }),
    db.cmsPage.count({ where: { isPublished: true, excludeFromSitemap: false, robotsIndex: true } }),
    db.product.count({ where: { excludeFromSitemap: true } }),
    db.product.count({ where: { robotsIndex: false } }),
  ])
  const indexable = gated.filter((p) => isProductIndexable({ ...p, sizeRows: p._count.variants }))
  const products = indexable.filter((p) => !p.excludeFromSitemap).length
  const thin = gated.length - indexable.length

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
          <div className="col-span-2">
            <div className="text-ih-muted">
              Held back for thin content (products scoring below {PRODUCT_INDEX_MIN_CONTENT_SCORE} with
              fewer than {PRODUCT_INDEX_MIN_SIZE_ROWS} size-table rows)
            </div>
            <div className="font-medium text-[18px]">{thin}</div>
            <p className="mt-1 text-[12px] text-ih-muted">
              Out of the sitemap and marked noindex until an edit lifts the content score over the
              line or adds a size table. They re-enter both automatically.
            </p>
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
