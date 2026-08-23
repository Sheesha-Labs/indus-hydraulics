import { str } from '@indus/domain'
import PolicyLayout, { PolicySectionBody, type PolicySection } from './PolicyLayout'
import type { PageContent } from '../lib/page-content'

/**
 * A policy page rendered from its section document.
 *
 * The clauses used to be JSX in the route file with their numbers typed into
 * the titles — "7. International transfers". They are sections now, so a
 * clause can be re-worded, hidden or moved, and the number is DERIVED from
 * where it sits. Moving a clause and leaving a stale number behind is the one
 * failure this shape makes impossible.
 *
 * The "on this page" rail is built from the same list in the same order, so it
 * cannot drift from the document either.
 */
export default function PolicyPage({
  slug,
  content,
}: {
  slug: 'privacy' | 'terms' | 'shipping' | 'returns' | 'warranty'
  content: PageContent
}) {
  const intro = content.values('intro')

  // Every enabled clause, in the editor's order, minus the intro — which is
  // the page's own title block rather than a clause.
  const clauses = content.order
    .filter((key) => key !== 'intro')
    .map((key) => ({ key, values: content.values(key) }))
    .filter((clause) => str(clause.values, 'heading') !== null)

  const nav: PolicySection[] = clauses.map((clause, i) => ({
    id: clause.key,
    title: `${i + 1}. ${str(clause.values, 'heading')}`,
  }))

  return (
    <PolicyLayout
      slug={slug}
      title={str(intro, 'title') ?? ''}
      effectiveLine={str(intro, 'effective_line') ?? undefined}
      sections={nav}
    >
      {clauses.map((clause, i) => (
        <PolicySectionBody
          key={clause.key}
          id={clause.key}
          title={`${i + 1}. ${str(clause.values, 'heading')}`}
        >
          {/* Author-written HTML, sanitised against an allow-list when it was
              saved — see `sanitiseRichText` in the master-page action. It is
              rendered inside `.ih-rich-text` because the sanitiser strips
              class attributes, so a list's bullets come from the element
              selector rather than from a utility on the element. */}
          <div
            className="ih-rich-text"
            dangerouslySetInnerHTML={{ __html: str(clause.values, 'body') ?? '' }}
          />
        </PolicySectionBody>
      ))}
    </PolicyLayout>
  )
}
