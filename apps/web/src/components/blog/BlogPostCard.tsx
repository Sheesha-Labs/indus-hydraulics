import Image from 'next/image'
import Link from 'next/link'
import { mediaUrl } from '../../lib/media'

export type BlogPostCardData = {
  slug: string
  title: string
  excerpt: string | null
  publishedAt: Date | null
  readingMinutes: number | null
  heroPath: string | null
  heroAlt: string | null
  categoryName: string | null
  categorySlug: string | null
  authorName: string | null
}

/**
 * Shared article card — used by the index, the category hubs and the author
 * pages. One component rather than three near-identical grids, so a change to
 * how an article is summarised lands everywhere at once.
 */
export default function BlogPostCard({ post }: { post: BlogPostCardData }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/blog/${post.slug}`} className="flex flex-col gap-3">
        <div className="relative aspect-[4/3] overflow-hidden border border-ih-border bg-ih-surface-2">
          {post.heroPath ? (
            <Image
              src={mediaUrl(post.heroPath)}
              alt={post.heroAlt ?? post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <span className="mono absolute inset-0 grid place-items-center text-[11px] text-ih-muted-2">
              Indus Hydraulics
            </span>
          )}
        </div>
        <h3 className="text-[17px] font-semibold leading-[1.25] tracking-[-0.01em] text-ih-ink group-hover:text-ih-accent">
          {post.title}
        </h3>
      </Link>
      {post.excerpt && (
        <p className="mt-1.5 line-clamp-2 text-[14px] leading-[1.5] text-ih-muted">{post.excerpt}</p>
      )}
      <div className="mono mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ih-muted">
        {post.categoryName && post.categorySlug && (
          <>
            <Link href={`/blog/c/${post.categorySlug}`} className="hover:text-ih-accent">
              {post.categoryName.toUpperCase()}
            </Link>
            <span className="opacity-40">·</span>
          </>
        )}
        {post.publishedAt && (
          <time dateTime={post.publishedAt.toISOString()}>
            {post.publishedAt.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </time>
        )}
        {post.readingMinutes && (
          <>
            <span className="opacity-40">·</span>
            <span>{post.readingMinutes} MIN</span>
          </>
        )}
      </div>
    </article>
  )
}
