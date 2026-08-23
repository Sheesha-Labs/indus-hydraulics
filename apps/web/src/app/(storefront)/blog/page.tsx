import type { Metadata } from 'next'
import { buildBreadcrumbLd, buildCollectionLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import BlogIndexView from '../../../components/blog/BlogIndexView'
import { getMasterPageContent } from '../../../lib/page-content'
import { getBlogIndexPage } from '../../../lib/blog-index'
import { pageMetadata, urlFor } from '../../../lib/seo'

const DESCRIPTION =
  'Field notes, sizing guides and component teardowns from the engineers who specify, install and rebuild hydraulic systems across the GCC.'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Blog',
    description: DESCRIPTION,
    path: '/blog',
  }),
  // Feed discovery. Without this the RSS route exists but nothing announces
  // it, so no reader or crawler finds it without being told the URL.
  alternates: {
    canonical: urlFor('/blog'),
    types: { 'application/rss+xml': [{ url: urlFor('/blog/rss.xml'), title: 'Indus Hydraulics — Blog' }] },
  },
}

export default async function BlogIndexPage() {
  const [{ posts, topics, totalPosts, totalPages }, content] = await Promise.all([
    getBlogIndexPage(1),
    getMasterPageContent('blog'),
  ])

  return (
    <>
      <JsonLd
        data={[
          buildCollectionLd({
            name: 'Indus Hydraulics Blog',
            description: DESCRIPTION,
            url: urlFor('/blog'),
          }),
          buildBreadcrumbLd({
            items: [
              { name: 'Home', url: urlFor('/') },
              { name: 'Blog', url: urlFor('/blog') },
            ],
          }),
        ]}
      />
      <BlogIndexView
        posts={posts}
        topics={topics}
        totalPosts={totalPosts}
        page={1}
        totalPages={totalPages}
        content={content}
      />
    </>
  )
}
