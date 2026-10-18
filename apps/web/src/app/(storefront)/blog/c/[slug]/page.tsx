import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import { buildBreadcrumbLd, buildCollectionLd } from '@indus/domain'
import { JsonLd, buildMailtoHref, buildWhatsappHref } from '@indus/ui'
import BlogTopicHub from '../../../../../components/blog/BlogTopicHub'
import { resolveBlogArticle } from '../../../../../lib/blog-article'
import { getBlogTopics } from '../../../../../lib/blog-index'
import { listBlogPosts } from '../../../../../lib/blog-posts'
import { pageMetadata, urlFor } from '../../../../../lib/seo'
import { getStoreSettings } from '../../../../../lib/store-settings'

type Props = { params: Promise<{ slug: string }> }

/**
 * Category hub.
 *
 * This is the ranking asset, not a filter view. A category with its own URL
 * accumulates the internal links from every article in it, which is what lets
 * a topic rank rather than just its individual pages. The previous `tags[0]`
 * string could never do that — it had nowhere to point.
 */
/**
 * A deliberately tiny prerender list — the busiest topics.
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
const STATIC_TOPIC_LIMIT = 5

export async function generateStaticParams() {
  const rows = await db.blogCategory.findMany({
    select: { slug: true },
    orderBy: { posts: { _count: 'desc' } },
    take: STATIC_TOPIC_LIMIT,
  })
  return rows.map(({ slug }) => ({ slug }))
}

export const dynamicParams = true

export const revalidate = 3600

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

  const [posts, settings, topics] = await Promise.all([
    listBlogPosts({ categoryId: category.id }),
    getStoreSettings(),
    getBlogTopics(),
  ])
  const hubUrl = urlFor(`/blog/c/${category.slug}`)

  // A hub with no body is every hub as it shipped: header, then the articles.
  // `resolveBlogArticle` is only worth its two queries when there is one.
  const hubBody = category.bodyBlocks ? await resolveBlogArticle(category.bodyBlocks) : null
  const contact = {
    whatsappUrl: buildWhatsappHref(settings.contactPhone, `Enquiry: ${category.name}`),
    emailUrl: buildMailtoHref(settings.contactEmail, `${category.name} — enquiry`),
    phone: settings.contactPhone,
  }

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
    // A fragment, not the <main> this used to be: the storefront layout already
    // provides the page's one main landmark, and two of them is an error.
    <>
      <JsonLd data={[collectionLd, breadcrumbLd]} />
      <BlogTopicHub
        category={{ name: category.name, slug: category.slug, lede: category.heroCopy ?? category.description }}
        posts={posts}
        body={hubBody && hubBody.blocks.length > 0 ? hubBody : null}
        topics={topics}
        contact={contact}
      />
    </>
  )
}
