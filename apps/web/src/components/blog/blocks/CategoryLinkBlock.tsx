import Link from 'next/link'
import type { CategoryLinkBlock } from '@indus/domain'
import type { EmbeddedCategory } from '../../../lib/blog-article'

/**
 * "Browse the range" card into /c/[slug].
 *
 * Renders only when the slug resolves to a published category. The block
 * carries its own `label` and `blurb` so an author can frame the link in the
 * article's own words, but the existence check comes from the database — an
 * unpublished or renamed category yields nothing rather than a broken link.
 */
export default function CategoryLinkBlockView({
  block,
  categoriesBySlug,
}: {
  block: CategoryLinkBlock
  categoriesBySlug: Map<string, EmbeddedCategory>
}) {
  const category = categoriesBySlug.get(block.slug)
  if (!category) return null

  return (
    <Link
      href={`/c/${category.slug}`}
      className="group my-6 flex items-center justify-between gap-4 rounded-lg border border-ih-border bg-ih-surface-2 px-5 py-4 transition-colors hover:border-ih-accent"
    >
      <div>
        <p className="text-[15px] font-medium text-ih-ink group-hover:text-ih-accent">
          {block.label}
        </p>
        <p className="mt-0.5 text-[13.5px] leading-[1.5] text-ih-muted">
          {block.blurb ?? category.shortDescription ?? `Browse ${category.name}`}
        </p>
      </div>
      <span aria-hidden="true" className="mono shrink-0 text-[14px] text-ih-accent">
        →
      </span>
    </Link>
  )
}
