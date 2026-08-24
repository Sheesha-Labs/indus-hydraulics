import Link from 'next/link'
import type { RelatedArticlesBlock } from '@indus/domain'
import type { RelatedArticle } from '../RelatedReading'

/**
 * In-article links to other articles.
 *
 * Deliberately not `RelatedReading`, which is the same data in a different
 * job: that is a full-width footer grid closing a product or category page,
 * this is a list sitting mid-article between two sections. Reusing the grid
 * here would put a page-ending section in the middle of a page.
 *
 * Slugs that do not resolve are skipped, and the block renders nothing at all
 * once every slug has been skipped — an empty "Related reading" heading is
 * worse than no heading.
 */
export default function RelatedArticlesBlockView({
  block,
  articlesBySlug,
}: {
  block: RelatedArticlesBlock
  articlesBySlug: Map<string, RelatedArticle>
}) {
  const articles = block.slugs
    .map((slug) => articlesBySlug.get(slug))
    .filter((a): a is RelatedArticle => Boolean(a))

  if (articles.length === 0) return null

  return (
    <aside className="border-ih-border bg-ih-surface-2 my-8 rounded-lg border px-5 py-4">
      <p className="mono text-ih-muted mb-3 text-[10.5px] uppercase tracking-[0.12em]">
        {block.heading ?? 'Related reading'}
      </p>
      <ul className="flex flex-col gap-3">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link href={`/blog/${article.slug}`} className="group flex items-baseline gap-3">
              <span aria-hidden="true" className="mono text-ih-accent shrink-0 text-[13px]">
                →
              </span>
              <span className="min-w-0">
                <span className="text-ih-ink group-hover:text-ih-accent block text-[15px] font-medium leading-[1.35]">
                  {article.title}
                </span>
                {article.excerpt && (
                  <span className="text-ih-muted mt-0.5 line-clamp-2 block text-[13.5px] leading-[1.5]">
                    {article.excerpt}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
