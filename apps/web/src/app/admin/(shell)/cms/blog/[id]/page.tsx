import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import { auth } from '../../../../../../lib/admin-auth'
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
        include: { hero: true, author: { select: { name: true } } },
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

  // Byline candidates. Any active staff member can hold a byline — the
  // editor previously hardcoded the logged-in user, so a post written by an
  // engineer and published by a sub-editor was credited to the sub-editor.
  const [authors, session] = await Promise.all([
    db.staffUser.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, role: true },
    }),
    auth(),
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
              publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
              publicUrl: `${storefrontUrl}/blog/${post.slug}`,
              heroImageUrl: resolveMediaUrl(post.hero?.storagePath ?? null),
              heroId: post.heroId,
              heroStoragePath: post.hero?.storagePath ?? null,
              authorName: post.author?.name ?? null,
              authorStaffId: post.authorStaffId,
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
      currentStaffId={session?.user?.id ?? null}
    />
  )
}
