import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import { parseBlogBlocks } from '@indus/domain'
import BlogPostEditorClient from './BlogPostEditorClient'

export const metadata: Metadata = { title: 'Edit Post — Indus Admin' }

type Props = { params: Promise<{ id: string }> }

function resolveMediaUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null
  if (storagePath.startsWith('http')) return storagePath
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''
  return base ? `${base}/${storagePath}` : storagePath
}

export default async function BlogPostEditorPage({ params }: Props) {
  const { id } = await params
  const isNew = id === 'new'

  const post = isNew
    ? null
    : await db.blogPost.findUnique({
        where: { id },
        include: {
        hero: true,
        author: { select: { name: true } },
        blogAuthor: { select: { name: true } },
        category: { select: { name: true } },
      },
      })
  if (!isNew && !post) notFound()

  // Recent media for the OG picker + the currently-attached OG image. Skip on
  // the "new" path since there's no SEO drawer there yet.
  const [recentMedia, ogMedia] = isNew
    ? [[] as Array<{ id: string; storagePath: string; alt: string | null; originalFilename: string }>, null as { storagePath: string } | null]
    : await Promise.all([
        db.media.findMany({
          where: { kind: 'image' },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: { id: true, storagePath: true, alt: true, originalFilename: true },
        }),
        post?.ogImageMediaId
          ? db.media.findUnique({
              where: { id: post.ogImageMediaId },
              select: { storagePath: true },
            })
          : Promise.resolve(null),
      ])

  // Byline candidates are BlogAuthors — public profiles with a page at
  // /blog/author/[slug] — not staff users. A byline is not a login: an
  // outside contributor needs one without an admin account, and a warehouse
  // user should not become a public page merely by existing.
  // The body's insert dialog browses the library, so it wants more than the
  // 50 most-recent the OG picker shows. Cheap: four columns, ids and paths.
  const bodyMedia = isNew
    ? []
    : await db.media.findMany({
        where: { kind: 'image' },
        orderBy: { createdAt: 'desc' },
        take: 300,
        select: { id: true, storagePath: true, alt: true, originalFilename: true },
      })

  const [authors, categories] = await Promise.all([
    db.blogAuthor.findMany({
      where: { isPublished: true },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, jobTitle: true },
    }),
    db.blogCategory.findMany({
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, isPublished: true },
    }),
  ])

  const storefrontUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com').replace(
    /\/$/,
    '',
  )

  return (
    <BlogPostEditorClient
      isNew={isNew}
      post={
        post
          ? {
              id: post.id,
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              body: post.body,
              tags: (post.tags as string[]) ?? [],
              isPublished: post.isPublished,
              status: post.status,
              publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
              updatedAt: post.updatedAt.toISOString(),
              readingMinutes: post.readingMinutes,
              // Parsed here rather than in the client so an invalid block is
              // dropped once, server-side, where it can be logged — the editor
              // then only ever holds blocks the storefront would render.
              bodyBlocks: parseBlogBlocks(post.bodyBlocks).blocks,
              publicUrl: `${storefrontUrl}/blog/${post.slug}`,
              heroImageUrl: resolveMediaUrl(post.hero?.storagePath ?? null),
              heroId: post.heroId,
              heroStoragePath: post.hero?.storagePath ?? null,
              authorName: post.blogAuthor?.name ?? post.author?.name ?? null,
              blogAuthorId: post.blogAuthorId,
              categoryId: post.categoryId,
              categoryName: post.category?.name ?? null,
              seoTitle: post.seoTitle,
              seoDescription: post.seoDescription,
              canonicalUrl: post.canonicalUrl,
              focusKeyword: post.focusKeyword,
              robotsIndex: post.robotsIndex,
              robotsFollow: post.robotsFollow,
              ogImageMediaId: post.ogImageMediaId,
              ogImageStoragePath: ogMedia?.storagePath ?? null,
              sitemapPriority:
                post.sitemapPriority != null ? Number(post.sitemapPriority) : null,
              sitemapChangeFreq: post.sitemapChangeFreq,
              excludeFromSitemap: post.excludeFromSitemap,
              jsonLdOverride: post.jsonLdOverride
                ? JSON.stringify(post.jsonLdOverride, null, 2)
                : null,
            }
          : null
      }
      recentImages={recentMedia.map((m) => ({
        id: m.id,
        storagePath: m.storagePath,
        alt: m.alt,
        originalFilename: m.originalFilename,
      }))}
      authors={authors}
      categories={categories}
      bodyMedia={bodyMedia}
    />
  )
}
