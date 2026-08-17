import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildBreadcrumbLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import BlogIndexView from '../../../../../components/blog/BlogIndexView'
import { getBlogIndexPage } from '../../../../../lib/blog-index'
import { pageMetadata, urlFor } from '../../../../../lib/seo'

type Props = { params: Promise<{ n: string }> }

function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const n = Number(raw)
  // Page 1 is /blog. Serving it here too would be a duplicate of the index
  // under a second URL, so it 404s rather than self-canonicalising.
  return n >= 2 ? n : null
}

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

  const { posts, topics, totalPosts, totalPages } = await getBlogIndexPage(page)
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
      />
    </>
  )
}
