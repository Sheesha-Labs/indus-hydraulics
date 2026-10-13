import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ResolvedBlogArticle } from '../../lib/blog-article'
import { monthKey, monthLabel, shortDate } from '../../lib/blog-dates'
import { mediaUrl } from '../../lib/media'
import { ArrowLeftIcon } from '../designed/icons'
import BlogArticleRenderer from './BlogArticleRenderer'
import BlogBreadcrumb from './BlogBreadcrumb'
import type { BlogTopic } from './BlogIndexView'
import type { BlogPostCardData } from './BlogPostCard'
import HubArticleList from './HubArticleList'
import HubJumpBar, { type JumpTarget } from './HubJumpBar'
import HubTopicsBar from './HubTopicsBar'
import CategoryLinkBlockView from './blocks/CategoryLinkBlock'
import CtaBlockView, { type ArticleContact } from './blocks/CtaBlock'
import DirectAnswerBlockView from './blocks/DirectAnswerBlock'
import { planHubBlocks, splitStartHere, type HubListItem } from './topic-hub'

type Props = {
  category: { name: string; slug: string; lede: string | null }
  /** Newest first, as `listBlogPosts` returns them. */
  posts: BlogPostCardData[]
  /** The hub's own body, or null when it has none. */
  body: ResolvedBlogArticle | null
  topics: BlogTopic[]
  contact: ArticleContact
}

/** 20px gutters on a phone, 32px at tablet and laptop widths, 48px on the 1440 grid. */
const WRAP = 'mx-auto max-w-[var(--spacing-max-w)] px-5 min-[761px]:px-8 min-[1181px]:px-12'
/** Clears the 107px sticky site header and the 72px jump bar under it. */
const ANCHOR = 'scroll-mt-[180px]'

/**
 * A blog topic hub — "Index first".
 *
 * Reads as a short map of the subject and hands the reader to the right
 * article: the quick answer in the header, one large "Start here" article,
 * every other article as a compact dated list (sortable), then the topic
 * guide, the catalogue links and the enquiry panel.
 *
 * The hub body goes through the same block views as an article. The first
 * `direct_answer` moves to the header, every `category_link` to Parts and every
 * `cta_block` to the end; the rest is the guide, in source order.
 *
 * Presentation only: every article is a real <a href> in the server HTML, and
 * the route's JSON-LD and metadata are untouched. A div, not <main> — the
 * storefront layout provides the page's one main landmark.
 */
export default function BlogTopicHub({ category, posts, body, topics, contact }: Props) {
  const plan = body ? planHubBlocks(body.blocks) : null
  const quick = body && plan?.quickAnswer != null ? body.blocks[plan.quickAnswer] : undefined
  const quickAnswer = quick?.type === 'direct_answer' ? quick : undefined

  const parts =
    body && plan
      ? plan.categoryLinks.flatMap((i) => {
          const b = body.blocks[i]
          return b?.type === 'category_link' && body.categoriesBySlug.has(b.slug) ? [{ i, block: b }] : []
        })
      : []
  const ctas =
    body && plan
      ? plan.ctas.flatMap((i) => {
          const b = body.blocks[i]
          return b?.type === 'cta_block' ? [{ i, block: b }] : []
        })
      : []
  const hasGuide = Boolean(body && plan?.hasGuide)

  const { start, rest } = splitStartHere(posts)
  const items = rest.map(toListItem)
  const totalMinutes = posts.reduce((sum, p) => sum + (p.readingMinutes ?? 0), 0)
  const newest = posts.find((p) => p.publishedAt)?.publishedAt ?? null

  const targets: JumpTarget[] = [
    ...(posts.length > 0 ? [{ id: 'hub-articles', label: 'Articles', count: posts.length }] : []),
    ...(hasGuide ? [{ id: 'hub-guide', label: 'Topic guide' }] : []),
    ...(parts.length > 0 ? [{ id: 'hub-parts', label: 'Parts' }] : []),
  ]

  return (
    <div className="pb-12 min-[761px]:pb-[72px]">
      <div className={WRAP}>
        <BlogBreadcrumb current={category.name} />
      </div>

      <header
        className={`${WRAP} grid grid-cols-1 items-end gap-6 pt-4 min-[761px]:pt-9 ${
          quickAnswer ? 'min-[961px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] min-[961px]:gap-16' : ''
        }`}
      >
        <div className="min-w-0">
          <p className="eyebrow">Topic</p>
          <h1 className="mt-3.5 text-balance font-serif text-[38px] font-normal leading-[1.02] tracking-[-0.015em] text-ih-ink min-[761px]:text-[60px]">
            {category.name}
          </h1>
          {category.lede && (
            <p className="mt-[18px] max-w-[640px] text-[16px] leading-[1.6] text-ih-ink-2 min-[761px]:text-[18px]">
              {category.lede}
            </p>
          )}
          <dl className="m-0 mt-[22px] flex gap-3.5 min-[761px]:mt-7 min-[761px]:gap-8">
            <Stat label="Articles" value={String(posts.length)} />
            {totalMinutes > 0 && <Stat label="Reading" value={`${totalMinutes} min`} />}
            {newest && (
              <Stat label="Updated" value={<time dateTime={newest.toISOString()}>{shortDate(newest)}</time>} />
            )}
          </dl>
        </div>
        {quickAnswer && <DirectAnswerBlockView block={quickAnswer} headingLevel="h2" />}
      </header>

      <HubTopicsBar topics={topics} current={category.slug} />
      <HubJumpBar targets={targets} />

      {posts.length > 0 ? (
        <section
          id="hub-articles"
          aria-labelledby={rest.length > 0 ? 'hub-articles-heading' : 'hub-start-heading'}
          className={`${WRAP} ${ANCHOR} flex flex-col gap-8 pt-2 min-[761px]:gap-12 min-[761px]:pt-4`}
        >
          {start && <StartHere post={start} />}
          {rest.length > 0 && <HubArticleList items={items} total={posts.length} showHead />}
        </section>
      ) : (
        <div className={`${WRAP} pt-4`}>
          <div
            role="status"
            className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-ih-border-strong bg-ih-surface px-5 py-12 text-center min-[761px]:px-6 min-[761px]:py-[72px]"
          >
            <p className="eyebrow">0 articles</p>
            <p className="max-w-[560px] font-serif text-[24px] leading-[1.15] tracking-[-0.01em] min-[761px]:text-[30px]">
              No articles in this topic yet.
            </p>
          </div>
        </div>
      )}

      {body && plan && hasGuide && (
        <section
          id="hub-guide"
          aria-labelledby="hub-guide-heading"
          className={`${WRAP} ${ANCHOR} mt-14 min-[761px]:mt-20`}
        >
          <div className="max-w-[1000px] border-t border-ih-ink pt-7">
            <p className="eyebrow">Topic guide</p>
            <h2
              id="hub-guide-heading"
              className="mb-5 mt-2 font-serif text-[30px] font-normal leading-[1.06] tracking-[-0.01em] text-ih-ink min-[761px]:mb-7 min-[761px]:text-[40px]"
            >
              The short version
            </h2>
            <BlogArticleRenderer article={body} contact={contact} skip={plan.guideSkip} variant="hub" />
          </div>
        </section>
      )}

      {body && parts.length > 0 && (
        <section id="hub-parts" aria-label="Parts in this topic" className={`${WRAP} ${ANCHOR} mt-10`}>
          <div className="grid max-w-[1000px] grid-cols-1 gap-4 min-[761px]:grid-cols-2">
            {parts.map(({ i, block }) => (
              <CategoryLinkBlockView key={i} block={block} categoriesBySlug={body.categoriesBySlug} />
            ))}
          </div>
        </section>
      )}

      {ctas.length > 0 && (
        <div className={`${WRAP} mt-10 flex flex-col gap-6`}>
          {ctas.map(({ i, block }) => (
            <div key={i} className="max-w-[1000px]">
              <CtaBlockView block={block} contact={contact} />
            </div>
          ))}
        </div>
      )}

      <div className={WRAP}>
        <Link
          href="/blog"
          className="mt-10 inline-flex min-h-10 items-center gap-2 text-[14px] font-medium text-ih-ink-2 hover:text-ih-accent"
        >
          <ArrowLeftIcon />
          Back to Blog
        </Link>
      </div>
    </div>
  )
}

function toListItem(post: BlogPostCardData): HubListItem {
  const date = post.publishedAt
  return {
    slug: post.slug,
    title: post.title,
    dateTime: date ? date.toISOString() : null,
    dateLabel: date ? shortDate(date) : null,
    monthKey: date ? monthKey(date) : null,
    monthLabel: date ? monthLabel(date) : null,
    minutes: post.readingMinutes,
  }
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-auto flex-col-reverse gap-1.5 border-t-2 border-ih-accent pt-3 min-[761px]:min-w-24 min-[761px]:flex-none">
      <dt className="font-mono text-[10px] uppercase tracking-[0.13em] text-ih-muted">{label}</dt>
      <dd className="m-0 whitespace-nowrap font-mono text-[18px] leading-[1.05] tracking-[-0.03em] text-ih-ink min-[761px]:text-[24px]">
        {value}
      </dd>
    </div>
  )
}

/**
 * The oldest article in the topic, as the one large card. The title link's
 * ::after covers the card. Alt text is `heroAlt ?? title`; Media.caption is
 * never rendered.
 */
function StartHere({ post }: { post: BlogPostCardData }) {
  return (
    <article className="group relative grid grid-cols-1 items-center gap-4 rounded-lg border border-ih-border bg-ih-surface p-3.5 min-[761px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] min-[761px]:gap-8 min-[761px]:rounded-xl min-[761px]:p-6">
      <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-ih-surface-3">
        {post.heroPath ? (
          <Image
            src={mediaUrl(post.heroPath)}
            alt={post.heroAlt ?? post.title}
            fill
            sizes="(max-width: 760px) calc(100vw - 70px), (max-width: 1440px) 52vw, 740px"
            className="object-cover transition-opacity duration-150 group-hover:opacity-90 motion-reduce:transition-none"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <p className="eyebrow">Start here</p>
        <h2
          id="hub-start-heading"
          className="text-pretty font-serif text-[26px] font-normal leading-[1.08] tracking-[-0.01em] text-ih-ink min-[761px]:text-[34px]"
        >
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors duration-150 after:absolute after:inset-0 after:content-[''] group-hover:text-ih-accent motion-reduce:transition-none"
          >
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="text-[14.5px] leading-[1.65] text-ih-ink-2 min-[761px]:text-[15px]">{post.excerpt}</p>
        )}
        <p className="flex flex-wrap gap-x-2 font-mono text-[11px] tracking-[0.02em] text-ih-muted">
          {post.publishedAt && (
            <time dateTime={post.publishedAt.toISOString()}>{shortDate(post.publishedAt)}</time>
          )}
          {post.publishedAt && post.readingMinutes ? <span aria-hidden="true">·</span> : null}
          {post.readingMinutes ? <span>{post.readingMinutes} min read</span> : null}
        </p>
      </div>
    </article>
  )
}
