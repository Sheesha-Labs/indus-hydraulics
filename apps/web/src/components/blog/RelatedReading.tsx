import Link from 'next/link'

export type RelatedArticle = {
  slug: string
  title: string
  excerpt: string | null
  readingMinutes: number | null
  categoryName: string | null
  categorySlug: string | null
}

/**
 * "Related reading" — articles that reference this product or category.
 *
 * This is the return leg of the internal-link loop. Articles link down into
 * the catalogue through product_embed and category_link blocks; this sends
 * equity and readers back the other way, and gives a commercial page the
 * informational context a cold visitor needs before they will ask for a
 * quote.
 *
 * Renders nothing when there is nothing to show — a "Related reading" heading
 * over an empty list is worse than no section.
 */
export default function RelatedReading({
  articles,
  heading = 'Related reading',
  eyebrow = 'From the blog',
}: {
  articles: RelatedArticle[]
  heading?: string
  eyebrow?: string
}) {
  if (articles.length === 0) return null

  return (
    <section className="border-t border-ih-border pb-16 pt-8">
      <div className="mb-6">
        <p className="mono mb-2 text-[11px] uppercase tracking-[0.16em] text-ih-muted">{eyebrow}</p>
        <h2 className="text-[28px] font-semibold tracking-[-0.02em]">{heading}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="group flex min-w-0 flex-col border border-ih-border bg-ih-surface p-5 transition-colors hover:border-ih-accent"
          >
            {article.categoryName && (
              <p className="mono mb-2 text-[10.5px] uppercase tracking-[0.12em] text-ih-muted">
                {article.categoryName}
              </p>
            )}
            <h3 className="mb-2 text-[16px] font-semibold leading-[1.3] text-ih-ink group-hover:text-ih-accent">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="line-clamp-3 text-[13.5px] leading-[1.5] text-ih-muted">
                {article.excerpt}
              </p>
            )}
            {article.readingMinutes && (
              <p className="mono mt-auto pt-3 text-[11px] text-ih-muted-2">
                {article.readingMinutes} min read
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
