import type { CategoryLinkBlock } from '@indus/domain'
import type { EmbeddedCategory } from '../../../lib/blog-article'
import LinkCard from './LinkCard'

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
    <LinkCard
      href={`/c/${category.slug}`}
      eyebrow="Catalogue"
      label={block.label}
      blurb={block.blurb ?? category.shortDescription ?? `Browse ${category.name}`}
    />
  )
}
