import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildBreadcrumbLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import BlogIndexView from '../../../../../components/blog/BlogIndexView'
import { getBlogIndexPage } from '../../../../../lib/blog-index'
import { getMasterPageContent } from '../../../../../lib/page-content'
import { pageMetadata, urlFor } from '../../../../../lib/seo'

type Props = { params: Promise<{ n: string }> }

function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const n = Number(raw)
  // Page 1 is /blog. Serving it here too would be a duplicate of the index
  // under a second URL, so it 404s rather than self-canonicalising.
  return n >= 2 ? n : null
}

/**
 * A deliberately tiny prerender list — the first couple of pages.
 *
 * The size is not the point; the function EXISTING is. A dynamic route with no
 * `generateStaticParams` is served fully dynamically and `no-store` however
 * statically renderable its code is, which is what this route was doing on
 * every request. With a list, the route switches to the incremental cache and
 * `dynamicParams` renders every unlisted entry on first request and caches it
 * from then on. See the long note on `/p/[slug]`.
 *
 * Length is paid in build minutes, so it stays small — see PR #412, where
 * oversized lists took the production build from 5 minutes to 16.
 */
export function generateStaticParams() {
  // Page 1 lives at /blog, so this route starts at 2. Two entries is enough to
  // switch the route to the incremental cache; deeper pages cache on first hit.
  return [{ n: '2' }, { n: '3' }]
}

export const dynamicParams = true

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params
  const page = parsePage(n)
  if (!page) return {}
  return pageMetadata({
    title: `Blog — page ${page}`,
    description: `Page ${page} of field notes, sizing guides and teardowns from Indus Hydraulics.`,
    path: `/blog/page/${page}`,
    // Deep pagination pages carry no unique content worth ranking, but they
    // must stay followable so crawlers can reach the articles on them.
    robots: { index: false, follow: true },
  })
}

export default async function BlogPaginatedPage({ params }: Props) {
  const { n } = await params
  const page = parsePage(n)
  if (!page) notFound()

  const [{ posts, topics, totalPosts, totalPages }, content] = await Promise.all([
    getBlogIndexPage(page),
    // Same document as /blog — a paged view is the same page with a different
    // slice of articles, so it must not drift from page one's wording.
    getMasterPageContent('blog'),
  ])
  if (posts.length === 0) notFound()

  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd({
          items: [
            { name: 'Home', url: urlFor('/') },
            { name: 'Blog', url: urlFor('/blog') },
            { name: `Page ${page}`, url: urlFor(`/blog/page/${page}`) },
          ],
        })}
      />
      <BlogIndexView
        posts={posts}
        topics={topics}
        totalPosts={totalPosts}
        page={page}
        totalPages={totalPages}
        content={content}
      />
    </>
  )
}
