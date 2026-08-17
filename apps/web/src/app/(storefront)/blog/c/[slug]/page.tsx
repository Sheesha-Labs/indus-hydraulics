import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import { buildBreadcrumbLd, buildCollectionLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import BlogPostCard from '../../../../../components/blog/BlogPostCard'
import { listBlogPosts } from '../../../../../lib/blog-posts'
import { pageMetadata, urlFor } from '../../../../../lib/seo'

type Props = { params: Promise<{ slug: string }> }

/**
 * Category hub.
 *
 * This is the ranking asset, not a filter view. A category with its own URL
 * accumulates the internal links from every article in it, which is what lets
 * a topic rank rather than just its individual pages. The previous `tags[0]`
 * string could never do that — it had nowhere to point.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [category, seoSetting] = await Promise.all([
    db.blogCategory.findUnique({ where: { slug, isPublished: true } }),
    db.seoSetting.findFirst({
      select: { defaultMetaTitleTemplate: true, defaultMetaDescription: true },
    }),
  ])
  if (!category) return {}

  return pageMetadata({
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description ?? null,
    path: `/blog/c/${category.slug}`,
    canonicalUrl: category.canonicalUrl,
    robots: { index: category.robotsIndex, follow: category.robotsFollow },
    titleTemplate: seoSetting?.defaultMetaTitleTemplate ?? null,
    defaultDescription: seoSetting?.defaultMetaDescription ?? null,
  })
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params

  const category = await db.blogCategory.findUnique({ where: { slug, isPublished: true } })
  if (!category) notFound()

  const posts = await listBlogPosts({ categoryId: category.id })
  const hubUrl = urlFor(`/blog/c/${category.slug}`)

  const collectionLd = buildCollectionLd({
    name: category.name,
    description: category.description ?? null,
    url: hubUrl,
    override: category.jsonLdOverride ?? undefined,
  })
  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Blog', url: urlFor('/blog') },
      { name: category.name, url: hubUrl },
    ],
  })

  return (
    <main className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
      <JsonLd data={[collectionLd, breadcrumbLd]} />

      <nav className="mono flex items-center gap-2 pt-8 text-[12px] text-ih-muted">
        <Link href="/" className="hover:text-ih-ink">
          Home
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/blog" className="hover:text-ih-ink">
          Blog
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-ih-ink">{category.name}</span>
      </nav>

      <header className="max-w-[720px] border-b border-ih-border py-8">
        <p className="mono mb-3 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
          Topic
        </p>
        <h1 className="mb-3 font-serif text-[clamp(32px,4.5vw,48px)] font-normal leading-[1.08] tracking-[-0.02em]">
          {category.name}
        </h1>
        {(category.heroCopy ?? category.description) && (
          <p className="text-[17px] leading-[1.55] text-ih-muted">
            {category.heroCopy ?? category.description}
          </p>
        )}
        <p className="mono mt-4 text-[12px] text-ih-muted">
          <b className="text-ih-ink">{posts.length}</b> {posts.length === 1 ? 'article' : 'articles'}
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="my-12 border border-dashed border-ih-border py-16 text-center">
          <p className="text-ih-muted">No articles in this topic yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 py-10 pb-20 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}
