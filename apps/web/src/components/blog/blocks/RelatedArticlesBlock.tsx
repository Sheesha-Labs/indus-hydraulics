import Link from 'next/link'
import type { RelatedArticlesBlock } from '@indus/domain'
import type { RelatedArticle } from '../RelatedReading'

/**
 * Links to other articles.
 *
 * Deliberately not `RelatedReading`, which is the same data in a different
 * job: that is a full-width footer grid closing a product or category page.
 *
 * `inline` is the block where an author put it (topic hubs, or a second
 * related block mid-article). `step` is the article's "What next → Read next"
 * step: the heading is the step's, and the list runs two-up on wide screens.
 *
 * Slugs that do not resolve are skipped, and the block renders nothing at all
 * once every slug has been skipped — an empty heading is worse than none.
 */
export function resolvedRelated(block: RelatedArticlesBlock, articlesBySlug: Map<string, RelatedArticle>) {
  return block.slugs
    .map((slug) => articlesBySlug.get(slug))
    .filter((a): a is RelatedArticle => Boolean(a))
}

export default function RelatedArticlesBlockView({
  block,
  articlesBySlug,
  variant = 'inline',
}: {
  block: RelatedArticlesBlock
  articlesBySlug: Map<string, RelatedArticle>
  variant?: 'inline' | 'step'
}) {
  const articles = resolvedRelated(block, articlesBySlug)
  if (articles.length === 0) return null

  const step = variant === 'step'
  const heading = step ? 'Read next' : (block.heading ?? 'Related reading')

  return (
    <nav aria-label={heading} className="min-w-0">
      {step ? (
        <h3 className="mb-1.5 text-[15px] font-semibold text-ih-ink">{heading}</h3>
      ) : (
        <h2 className="mb-1.5 text-[15px] font-semibold text-ih-ink">{heading}</h2>
      )}
      <ol
        className={`m-0 grid list-none grid-cols-1 p-0 ${
          step ? 'min-[761px]:grid-cols-2 min-[761px]:gap-x-8' : ''
        }`}
      >
        {articles.map((article) => (
          <li key={article.slug} className="min-w-0 border-b border-ih-border">
            <Link href={`/blog/${article.slug}`} className="group flex flex-col gap-1 py-3.5">
              <span className="text-[15px] font-medium leading-[1.4] text-ih-ink transition-colors duration-150 group-hover:text-ih-accent motion-reduce:transition-none">
                {article.title}
              </span>
              {article.excerpt && (
                <span className="line-clamp-2 text-[13.5px] leading-[1.55] text-ih-ink-2">{article.excerpt}</span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
