import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import { mediaUrl } from '../../../../lib/media'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await db.blogPost.findUnique({ where: { slug, isPublished: true } })
  if (!post) return {}
  return {
    title: post.seoTitle ?? `${post.title}`,
    description: post.seoDescription ?? post.excerpt ?? undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params

  const post = await db.blogPost.findUnique({
    where: { slug, isPublished: true },
    include: { hero: true, author: { select: { name: true } } },
  })

  if (!post) notFound()

  return (
    <div className="max-w-[780px] mx-auto px-8 py-10 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-[12px] text-[var(--color-muted)] mb-6">
        <Link href={`/${locale}`} className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="opacity-40">/</span>
        <Link href={`/${locale}/blog`} className="hover:text-[var(--color-primary)]">Blog</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-primary)] truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* Tags */}
      {(post.tags as string[]).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {(post.tags as string[]).map((tag) => (
            <span key={tag} className="font-mono text-[10px] px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-muted)] capitalize">
              {tag}
            </span>
          ))}
        </div>
      )}

      <h1 className="text-[clamp(24px,4vw,38px)] font-semibold tracking-[-0.02em] leading-[1.15] mb-4">
        {post.title}
      </h1>

      <div className="flex items-center gap-3 pb-6 border-b border-[var(--color-border)] font-mono text-[12px] text-[var(--color-muted)]">
        <span>{post.author?.name ?? 'Indus Hydraulics'}</span>
        {post.publishedAt && (
          <>
            <span className="opacity-40">·</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </>
        )}
      </div>

      {/* Hero image */}
      {post.hero && (
        <div className="my-6 aspect-[16/7] relative overflow-hidden border border-[var(--color-border)]">
          <Image
            src={mediaUrl(post.hero.storagePath)}
            alt={post.hero.alt ?? post.title}
            fill
            className="object-cover"
            sizes="780px"
            priority
          />
        </div>
      )}

      {/* Body */}
      <div
        className="prose prose-sm max-w-none mt-6 text-[var(--color-body)] leading-[1.7]
          prose-headings:font-semibold prose-headings:text-[var(--color-primary)] prose-headings:tracking-tight
          prose-h2:text-[20px] prose-h3:text-[17px]
          prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
          prose-code:font-mono prose-code:text-[13px] prose-code:bg-[var(--color-deep)] prose-code:px-1 prose-code:py-0.5
          prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-accent)] prose-blockquote:pl-4 prose-blockquote:italic"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      {/* Back link */}
      <div className="mt-12 pt-6 border-t border-[var(--color-border)]">
        <Link href={`/${locale}/blog`} className="font-mono text-[12px] text-[var(--color-accent)] hover:underline">
          ← Back to Blog
        </Link>
      </div>
    </div>
  )
}
