import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
import BlogArticleRenderer from '../../../../components/blog/BlogArticleRenderer'
import BlogArticleRail from '../../../../components/blog/BlogArticleRail'
import BlogToc from '../../../../components/blog/BlogToc'
import RelatedReading from '../../../../components/blog/RelatedReading'
import { resolveBlogArticle } from '../../../../lib/blog-article'
import { searchIconUrl } from '../../../../lib/brand-identity'
import { mediaUrl } from '../../../../lib/media'
import { getMoreFromBlogCategory } from '../../../../lib/related-reading'
import { BASE_URL, ORG_ID, SITE_NAME, crawlableImageUrl, pageMetadata, urlFor } from '../../../../lib/seo'
import { getStoreSettings } from '../../../../lib/store-settings'

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

export async function generateStaticParams() {
  const rows = await db.blogPost.findMany({
    where: { status: 'published' },
    select: { slug: true },
    orderBy: { publishedAt: 'desc' },
    take: STATIC_POST_LIMIT,
  })
  return rows.map(({ slug }) => ({ slug }))
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

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }

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
    imageCaption: post.hero ? (post.hero.alt ?? post.title) : null,
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

  const railProducts = [...article.productsBySku.values()]

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
    // A div, not a second <main>: the storefront layout already provides the
    // page's one main landmark, and two of them is an accessibility error.
    <div className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
      <JsonLd data={[articleLd, breadcrumbLd, ...(faqLd ? [faqLd] : []), ...videoLds]} />

      <nav className="mono flex items-center gap-2 pt-8 text-[12px] text-ih-muted">
        <Link href="/" className="hover:text-ih-ink">
          Home
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/blog" className="hover:text-ih-ink">
          Blog
        </Link>
        {category && (
          <>
            <span className="opacity-40">/</span>
            <Link href={`/blog/c/${category.slug}`} className="hover:text-ih-ink">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <header className="max-w-[780px] pb-8 pt-6">
        {category && (
          <Link
            href={`/blog/c/${category.slug}`}
            className="mono mb-3 inline-block bg-ih-navy px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white hover:opacity-90"
          >
            {category.name}
          </Link>
        )}
        <h1 className="mb-4 font-serif text-[clamp(30px,4.5vw,46px)] font-normal leading-[1.1] tracking-[-0.02em]">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mb-5 text-[17px] leading-[1.55] text-ih-muted">{post.excerpt}</p>
        )}
        <div className="mono flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ih-border pt-4 text-[12px] text-ih-muted">
          {authorProfileUrl ? (
            <Link href={`/blog/author/${post.blogAuthor!.slug}`} className="hover:text-ih-accent">
              {bylineName}
            </Link>
          ) : (
            <span>{bylineName}</span>
          )}
          {post.blogAuthor?.jobTitle && (
            <>
              <span className="opacity-40">·</span>
              <span>{post.blogAuthor.jobTitle}</span>
            </>
          )}
          {post.publishedAt && (
            <>
              <span className="opacity-40">·</span>
              <time dateTime={post.publishedAt.toISOString()}>
                {post.publishedAt.toLocaleDateString('en-GB', DATE_FORMAT)}
              </time>
            </>
          )}
          {showUpdated && modifiedAt && (
            <>
              <span className="opacity-40">·</span>
              <span>
                Updated{' '}
                <time dateTime={modifiedAt.toISOString()}>
                  {modifiedAt.toLocaleDateString('en-GB', DATE_FORMAT)}
                </time>
              </span>
            </>
          )}
          <span className="opacity-40">·</span>
          <span>{readingMinutes} min read</span>
        </div>
        {reviewer && (
          <p className="mono mt-2 text-[12px] text-ih-muted">
            Technically reviewed by{' '}
            {reviewer.href ? (
              <Link href={reviewer.href} className="text-ih-ink hover:text-ih-accent">
                {reviewer.name}
              </Link>
            ) : (
              <span className="text-ih-ink">{reviewer.name}</span>
            )}
            {reviewer.jobTitle ? <>, {reviewer.jobTitle}</> : null}
            {post.reviewedAt ? (
              <>
                {' '}
                on{' '}
                <time dateTime={post.reviewedAt.toISOString()}>
                  {post.reviewedAt.toLocaleDateString('en-GB', DATE_FORMAT)}
                </time>
              </>
            ) : null}
          </p>
        )}
      </header>

      {post.hero && (
        <div className="relative mb-2 aspect-[16/7] max-w-[1100px] overflow-hidden border border-ih-border">
          <Image
            src={mediaUrl(post.hero.storagePath)}
            alt={post.hero.alt ?? post.title}
            fill
            className="object-cover"
            sizes="(max-width: 1100px) 100vw, 1100px"
            priority
          />
        </div>
      )}

      {/*
        grid-cols-1 is load-bearing, not decoration — the same trap documented
        on the service case page. A `grid` with no grid-template-columns creates
        one implicit `auto` column sized to max-content, so on mobile the column
        grows to the longest TOC link instead of the viewport and the whole page
        scrolls sideways. Tailwind's grid-cols-1 is repeat(1, minmax(0,1fr)).
      */}
      <div className="grid grid-cols-1 items-start gap-12 py-10 pb-20 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="min-w-0 lg:sticky lg:top-24">
          <BlogToc entries={article.toc} estimatedMinutes={readingMinutes} />
        </aside>

        {hasBlocks ? (
          <BlogArticleRenderer article={article} contact={contact} />
        ) : (
          // min-w-0 for the same reason the renderer carries it: as a grid item
          // this defaults to min-width:auto, so a wide table or long code line
          // sets the column width and nothing constrains it.
          //
          // Styling is `ih-rich-text` (globals.css). The eleven `prose*` classes
          // that were here compiled to nothing — @tailwindcss/typography is not
          // installed — while preflight still stripped heading sizes and list
          // markers, so a legacy post rendered as one undifferentiated block.
          <div
            className="ih-rich-text min-w-0 max-w-none"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        )}

        <aside className="min-w-0 lg:sticky lg:top-24">
          <BlogArticleRail products={railProducts} />
        </aside>
      </div>

      {category && (
        <RelatedReading
          articles={moreFromTopic}
          heading={`More on ${category.name}`}
          eyebrow="Keep reading"
        />
      )}

      <div className="border-t border-ih-border py-6">
        <Link href="/blog" className="mono text-[12px] text-ih-accent hover:underline">
          ← Back to Blog
        </Link>
      </div>
    </div>
  )
}
