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

type Props = {
  post: BlogPostCardData
  /**
   * `default` — the 4:3 card on the topic hubs and author pages.
   * `grid` — the blog index's four-up grid: 16:9 image, whole-card link, and
   * a text-left / 96px-thumbnail row at 760px and below.
   */
  variant?: 'default' | 'grid'
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Shared article card — used by the index, the category hubs and the author
 * pages. One component rather than three near-identical grids, so a change to
 * how an article is summarised lands everywhere at once.
 */
export default function BlogPostCard({ post, variant = 'default' }: Props) {
  if (variant === 'grid') return <GridCard post={post} />

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
          <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
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

/*
  Image `sizes` for the index grid, tracking its column count: one 96px
  thumbnail on a phone, then 2, 3 and 4 columns inside 48px gutters with 24px
  between cards, capped at the 1440 container (318px a card).
*/
const GRID_SIZES =
  '(max-width: 760px) 96px, (max-width: 960px) calc((100vw - 120px) / 2), (max-width: 1180px) calc((100vw - 144px) / 3), (max-width: 1440px) calc((100vw - 168px) / 4), 318px'

/**
 * The index grid card.
 *
 * The title link's ::after covers the whole <article>, so the image, excerpt
 * and meta are all part of one link without nesting anchors. The topic link
 * sits above that overlay (z-index 1) and carries its own 40px hit target —
 * the negative margin keeps the extra height out of the layout.
 */
function GridCard({ post }: { post: BlogPostCardData }) {
  const alt = post.heroAlt ?? post.title

  return (
    <article className="group relative grid min-w-0 grid-cols-[minmax(0,1fr)_96px] items-start gap-4 border-b border-ih-border py-[18px] last:border-b-0 min-[761px]:flex min-[761px]:flex-col min-[761px]:items-stretch min-[761px]:gap-0 min-[761px]:border-b-0 min-[761px]:py-0">
      <div className="relative col-start-2 row-start-1 aspect-square overflow-hidden rounded-md bg-ih-surface-3 min-[761px]:aspect-video min-[761px]:rounded-lg">
        {post.heroPath ? (
          <Image
            src={mediaUrl(post.heroPath)}
            alt={alt}
            fill
            sizes={GRID_SIZES}
            className="object-cover transition-opacity duration-150 group-hover:opacity-90 motion-reduce:transition-none"
          />
        ) : null}
      </div>

      <div className="col-start-1 row-start-1 flex min-w-0 flex-1 flex-col gap-1.5 min-[761px]:gap-2 min-[761px]:pt-4">
        {post.categoryName && post.categorySlug && (
          <Link
            href={`/blog/c/${post.categorySlug}`}
            className="relative z-[1] -my-[13px] inline-flex min-h-10 items-center self-start font-mono text-[10.5px] font-medium uppercase leading-[1.3] tracking-[0.1em] text-ih-accent transition-colors duration-150 hover:text-ih-accent-hover hover:underline hover:underline-offset-[3px] motion-reduce:transition-none"
          >
            {post.categoryName}
          </Link>
        )}
        <h3 className="text-[15px] font-medium leading-[1.32] tracking-[-0.015em] text-pretty text-ih-ink min-[761px]:text-[16.5px]">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors duration-150 after:absolute after:inset-0 after:content-[''] group-hover:text-ih-accent motion-reduce:transition-none"
          >
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="hidden text-[13px] leading-[1.55] text-ih-ink-2 min-[761px]:line-clamp-3">
            {post.excerpt}
          </p>
        )}
        {(post.publishedAt || post.readingMinutes) && (
          <p className="mt-auto flex flex-wrap gap-x-2 gap-y-1 pt-1 font-mono text-[11px] tracking-[0.02em] text-ih-muted">
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()} className="whitespace-nowrap">
                {formatDate(post.publishedAt)}
              </time>
            )}
            {post.publishedAt && post.readingMinutes ? <span aria-hidden="true">·</span> : null}
            {post.readingMinutes ? (
              <span className="whitespace-nowrap">{post.readingMinutes} min read</span>
            ) : null}
          </p>
        )}
      </div>
    </article>
  )
}
