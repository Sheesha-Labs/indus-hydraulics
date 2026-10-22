import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import {
  blogPostModifiedAt,
  blogReferencedArticleSlugs,
  blogVideoBlocks,
  buildArticleLd,
  buildBreadcrumbLd,
  buildFaqLd,
  buildVideoLd,
  estimateReadingMinutes,
  shouldShowUpdatedDate,
  youtubeVideoId,
} from '@indus/domain'
import { JsonLd, buildMailtoHref, buildWhatsappHref } from '@indus/ui'
import BlogArticleLayout from '../../../../components/blog/BlogArticleLayout'
import { resolveBlogArticle } from '../../../../lib/blog-article'
import { searchIconUrl } from '../../../../lib/brand-identity'
import { getMoreFromBlogCategory } from '../../../../lib/related-reading'
import { BASE_URL, ORG_ID, SITE_NAME, crawlableImageUrl, pageMetadata, urlFor } from '../../../../lib/seo'
import { getStoreSettings } from '../../../../lib/store-settings'
import { staticParamsOrNone } from '../../../../lib/static-params'

type Props = { params: Promise<{ slug: string }> }

/**
 * A deliberately tiny prerender list — the most recent posts.
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
const STATIC_POST_LIMIT = 5

async function staticParamsFromDb() {
  const rows = await db.blogPost.findMany({
    where: { status: 'published' },
    select: { slug: true },
    orderBy: { publishedAt: 'desc' },
    take: STATIC_POST_LIMIT,
  })
  return rows.map(({ slug }) => ({ slug }))
}

export async function generateStaticParams() {
  return staticParamsOrNone('/blog/[slug]', staticParamsFromDb)
}

/** A post published since the last deploy is served on demand, not 404'd. */
export const dynamicParams = true

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [post, seoSetting] = await Promise.all([
    db.blogPost.findUnique({
      where: { slug, isPublished: true },
      include: {
        hero: true,
        category: { select: { name: true, isPublished: true } },
        blogAuthor: { select: { slug: true, isPublished: true } },
      },
    }),
    db.seoSetting.findFirst({
      select: { defaultMetaTitleTemplate: true, defaultMetaDescription: true },
    }),
  ])
  if (!post) return {}

  const ogMedia = post.ogImageMediaId
    ? await db.media.findUnique({
        where: { id: post.ogImageMediaId },
        select: { storagePath: true, alt: true },
      })
    : null
  const ogPath = post.ogImageMediaId ? (ogMedia?.storagePath ?? null) : (post.hero?.storagePath ?? null)
  const ogAlt = post.ogImageMediaId
    ? (ogMedia?.alt ?? null)
    : post.hero
      ? (post.hero.alt ?? post.title)
      : null

  return pageMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? null,
    path: `/blog/${post.slug}`,
    canonicalUrl: post.canonicalUrl,
    robots: { index: post.robotsIndex, follow: post.robotsFollow },
    ogImagePath: ogPath,
    ogImageAlt: ogAlt,
    titleTemplate: seoSetting?.defaultMetaTitleTemplate ?? null,
    defaultDescription: seoSetting?.defaultMetaDescription ?? null,
    article: {
      publishedTime: post.publishedAt,
      modifiedTime: blogPostModifiedAt(post),
      section: post.category?.isPublished ? post.category.name : null,
      tags: readTags(post.tags),
      authors:
        post.blogAuthor?.isPublished ? [urlFor(`/blog/author/${post.blogAuthor.slug}`)] : null,
    },
  })
}

/** `tags` is a JSON column holding string[]; anything else reads as none. */
function readTags(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((t): t is string => typeof t === 'string') : []
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  const [post, settings] = await Promise.all([
    db.blogPost.findUnique({
      where: { slug, isPublished: true },
      include: {
        hero: true,
        author: { select: { name: true } },
        blogAuthor: {
          select: {
            slug: true,
            name: true,
            jobTitle: true,
            credentials: true,
            isPublished: true,
            linkedinUrl: true,
          },
        },
        category: { select: { id: true, slug: true, name: true, isPublished: true } },
        // The technical reviewer. Their public profile, when they have one, is
        // what the "Reviewed by" line links to and what the markup names.
        reviewedBy: {
          select: {
            name: true,
            blogAuthorProfile: {
              where: { isPublished: true },
              select: { slug: true, name: true, jobTitle: true, linkedinUrl: true },
              take: 1,
            },
          },
        },
      },
    }),
    getStoreSettings(),
  ])

  if (!post) notFound()

  const article = await resolveBlogArticle(post.bodyBlocks, post.slug)

  // Migration path. Posts written before the block editor still hold their
  // content in `body` as HTML. Rendering blocks *only* would blank every
  // existing article the moment this template shipped, so the legacy prose
  // stays the fallback until a post has been moved across. `bodyBlocks`
  // defaults to `[]`, which is exactly the "not migrated yet" signal.
  const hasBlocks = article.blocks.length > 0

  const readingMinutes =
    post.readingMinutes ?? (hasBlocks ? estimateReadingMinutes(article.blocks) : 5)

  // Public byline first, staff fallback. Until every post has a BlogAuthor,
  // dropping the staff name would leave articles bylineless — worse for
  // E-E-A-T than an internal name.
  const bylineName = post.blogAuthor?.name ?? post.author?.name ?? SITE_NAME
  const authorProfileUrl =
    post.blogAuthor && post.blogAuthor.isPublished
      ? urlFor(`/blog/author/${post.blogAuthor.slug}`)
      : null

  const postUrl = urlFor(`/blog/${post.slug}`)
  const category = post.category?.isPublished ? post.category : null
  // One date for every surface that states it — see `blogPostModifiedAt`.
  const modifiedAt = blogPostModifiedAt(post)
  const showUpdated = shouldShowUpdatedDate(post.publishedAt, modifiedAt)

  const reviewerProfile = post.reviewedBy?.blogAuthorProfile[0] ?? null
  const reviewer = post.reviewedBy
    ? {
        name: reviewerProfile?.name ?? post.reviewedBy.name,
        url: reviewerProfile ? urlFor(`/blog/author/${reviewerProfile.slug}`) : null,
        href: reviewerProfile ? `/blog/author/${reviewerProfile.slug}` : null,
        jobTitle: reviewerProfile?.jobTitle ?? null,
        sameAs: reviewerProfile?.linkedinUrl ? [reviewerProfile.linkedinUrl] : null,
      }
    : null

  const articleLd = buildArticleLd({
    type: 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? null,
    url: postUrl,
    imageUrl: crawlableImageUrl(post.hero?.storagePath),
    imageCaption: post.hero ? (post.heroCaption ?? post.hero.alt ?? post.title) : null,
    authorName: bylineName,
    authorUrl: authorProfileUrl,
    authorJobTitle: post.blogAuthor?.jobTitle ?? null,
    authorSameAs: post.blogAuthor?.linkedinUrl ? [post.blogAuthor.linkedinUrl] : null,
    reviewer,
    reviewedAt: post.reviewedAt,
    articleSection: category?.name ?? null,
    keywords: readTags(post.tags),
    publishedAt: post.publishedAt ?? null,
    modifiedAt,
    publisherId: ORG_ID,
    publisherName: SITE_NAME,
    // The same-origin mark the Organization node uses. `settings.logoUrl` is a
    // storage URL, served `x-robots-tag: none`.
    publisherLogoUrl: searchIconUrl(settings, BASE_URL),
    override: post.jsonLdOverride ?? undefined,
  })

  // Read back out of the blocks, like the FAQ, so the markup cannot describe a
  // video the page does not show.
  const videoLds = blogVideoBlocks(article.blocks).flatMap((video) => {
    const id = youtubeVideoId(video.url)
    if (!id) return []
    return [
      buildVideoLd({
        name: video.title,
        description: video.description ?? video.caption ?? post.excerpt ?? null,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        uploadDate: video.uploadDate,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        contentUrl: `https://www.youtube.com/watch?v=${id}`,
        duration: video.duration ?? null,
      }),
    ]
  })

  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Blog', url: urlFor('/blog') },
      ...(category ? [{ name: category.name, url: urlFor(`/blog/c/${category.slug}`) }] : []),
      { name: post.title, url: postUrl },
    ],
  })

  // Read back out of the blocks rather than stored separately, so the visible
  // accordion and the structured data cannot disagree. Returns null when the
  // article carries no faq_block, and JsonLd skips nulls.
  const faqLd = buildFaqLd({ faqs: article.faqs })

  const contact = {
    whatsappUrl: buildWhatsappHref(settings.contactPhone, `Enquiry: ${post.title}`),
    emailUrl: buildMailtoHref(settings.contactEmail, `${post.title} — enquiry`),
    phone: settings.contactPhone,
  }

  // More from the same topic, skipping anything the article already links to
  // in a related_articles block. Automatic, so no article ends in a dead end
  // and older posts keep receiving links as new ones are published.
  const moreFromTopic = category
    ? await getMoreFromBlogCategory(category.id, [
        post.slug,
        ...blogReferencedArticleSlugs(article.blocks),
      ])
    : []

  return (
    <>
      <JsonLd data={[articleLd, breadcrumbLd, ...(faqLd ? [faqLd] : []), ...videoLds]} />
      <BlogArticleLayout
        title={post.title}
        excerpt={post.excerpt}
        category={category ? { name: category.name, slug: category.slug } : null}
        byline={{
          name: bylineName,
          href: authorProfileUrl ? `/blog/author/${post.blogAuthor!.slug}` : null,
          jobTitle: post.blogAuthor?.jobTitle ?? null,
        }}
        reviewer={reviewer ? { name: reviewer.name, href: reviewer.href, jobTitle: reviewer.jobTitle } : null}
        reviewedAt={post.reviewedAt}
        publishedAt={post.publishedAt}
        updatedAt={showUpdated ? modifiedAt : null}
        readingMinutes={readingMinutes}
        hero={post.hero ? { storagePath: post.hero.storagePath, alt: post.hero.alt } : null}
        heroCaption={post.heroCaption}
        url={postUrl}
        article={hasBlocks ? article : null}
        legacyBody={post.body}
        contact={contact}
        moreFromTopic={moreFromTopic}
      />
    </>
  )
}
