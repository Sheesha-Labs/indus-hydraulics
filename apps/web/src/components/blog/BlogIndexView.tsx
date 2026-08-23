import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { str } from '@indus/domain'
import type { PageContent } from '../../lib/page-content'
import HomeNewsletterForm from '../HomeNewsletterForm'
import BlogPostCard, { type BlogPostCardData } from './BlogPostCard'

export type BlogTopic = {
  slug: string
  name: string
  count: number
}

type Props = {
  posts: BlogPostCardData[]
  topics: BlogTopic[]
  totalPosts: number
  page: number
  totalPages: number
  /** Slug of the active topic, when rendered as a category hub. */
  activeTopicSlug?: string
  /**
   * Section order, visibility and copy from Pages & Blocks. Both routes that
   * render this view pass the same `blog` document — /blog and /blog/page/N
   * are the same page with a different slice of articles.
   */
  content: PageContent
}

/**
 * Shared index body for /blog and /blog/page/[n].
 *
 * Everything here reads from the database. The version this replaces shipped
 * three hardcoded arrays — TOPICS, EDITOR_PICKS and TOPIC_COUNTS — which
 * rendered eight topic chips with no handler, five invented article titles,
 * and per-topic counts of 42/18/23 directly above a live "0 articles". The
 * counts are now real, and the chips are links to hubs that exist.
 */
export default function BlogIndexView({
  posts,
  topics,
  totalPosts,
  page,
  totalPages,
  activeTopicSlug,
  content,
}: Props) {
  const [lead, ...rest] = posts

  const hero = content.values('hero')
  const topicsCopy = content.values('topics')
  const articles = content.values('articles')
  const newsletterCard = content.values('newsletter_card')
  const topicsCard = content.values('topics_card')
  const helpCard = content.values('help_card')

  /*
    The three sidebar cards render in the editor's order. They are the only
    part of this page whose arrangement is a genuine choice — the hero, the
    chips and the article grid each sit where the layout puts them, so those
    are locked.
  */
  const asideCards: Record<string, ReactNode> = {
    newsletter_card: (
      <div className="bg-ih-navy p-6">
        <p className="mono mb-2 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-accent">
          {str(newsletterCard, 'eyebrow')}
        </p>
        <h2 className="mb-3 text-[16px] font-semibold text-white">{str(newsletterCard, 'heading')}</h2>
        <p className="mb-4 text-[13px] leading-[1.5] text-[oklch(0.78_0_0)]">
          {str(newsletterCard, 'body')}
        </p>
        <HomeNewsletterForm />
      </div>
    ),
    topics_card:
      topics.length > 0 ? (
        <div className="border border-ih-border bg-ih-surface p-6">
          <h2 className="mb-3 text-[16px] font-semibold">{str(topicsCard, 'heading')}</h2>
          <div className="mono text-[12px]">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/blog/c/${topic.slug}`}
                className="flex items-center justify-between border-b border-dashed border-ih-border py-2 text-ih-ink-2 transition-colors last:border-0 hover:text-ih-accent"
              >
                <span>{topic.name}</span>
                <span className="text-ih-muted-2">{topic.count}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null,
    help_card: (
      <div className="border border-ih-border bg-ih-surface p-6">
        <h2 className="mb-2 text-[16px] font-semibold">{str(helpCard, 'heading')}</h2>
        <p className="mb-4 text-[13px] leading-[1.5] text-ih-muted">{str(helpCard, 'body')}</p>
        {str(helpCard, 'cta_label') ? (
          <Link
            href={str(helpCard, 'cta_href') ?? '/contact'}
            className="mono flex h-10 w-full items-center justify-center border border-ih-border text-[12px] text-ih-ink-2 transition-colors hover:bg-ih-surface-2"
          >
            {str(helpCard, 'cta_label')}
          </Link>
        ) : null}
      </div>
    ),
  }

  return (
    <div className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
      <div className="border-b border-ih-border py-14">
        <p className="mono mb-3 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
          {str(hero, 'eyebrow')}
        </p>
        <h1 className="mb-4 max-w-[780px] font-serif text-[clamp(40px,5vw,64px)] font-normal leading-[1.05] tracking-[-0.03em]">
          {str(hero, 'heading')}
        </h1>
        <p className="mb-5 max-w-[580px] text-[17px] leading-[1.55] text-ih-muted">
          {str(hero, 'body')}
        </p>
        <div className="mono flex gap-6 text-[12px] text-ih-muted">
          <span>
            <b className="text-ih-ink">{totalPosts}</b> {totalPosts === 1 ? 'article' : 'articles'}
          </span>
          {totalPages > 1 && (
            <span>
              Page <b className="text-ih-ink">{page}</b> of {totalPages}
            </span>
          )}
        </div>
      </div>

      {topics.length > 0 && content.isOn('topics') && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-ih-border py-6">
          <Link
            href="/blog"
            className={`shrink-0 whitespace-nowrap border px-3.5 py-2 text-[13px] font-medium ${
              activeTopicSlug
                ? 'border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent'
                : 'border-ih-ink bg-ih-navy text-white'
            }`}
          >
            {str(topicsCopy, 'all_label')}
          </Link>
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/blog/c/${topic.slug}`}
              className={`shrink-0 whitespace-nowrap border px-3.5 py-2 text-[13px] font-medium ${
                activeTopicSlug === topic.slug
                  ? 'border-ih-ink bg-ih-navy text-white'
                  : 'border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent'
              }`}
            >
              {topic.name}
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="my-12 border border-dashed border-ih-border py-16 text-center">
          <p className="text-ih-muted">{str(articles, 'empty_message')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            {lead && (
              <div className="mb-10 border-b border-ih-border pb-10">
                <BlogPostCard post={lead} />
              </div>
            )}
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
              {rest.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>

          <aside className="flex min-w-0 flex-col gap-5">
            {content.order.map((key) =>
              asideCards[key] ? <Fragment key={key}>{asideCards[key]}</Fragment> : null,
            )}
          </aside>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mono flex items-center justify-between border-t border-ih-border py-8 text-[12px]"
        >
          {page > 1 ? (
            <Link
              href={page === 2 ? '/blog' : `/blog/page/${page - 1}`}
              rel="prev"
              className="text-ih-accent hover:underline"
            >
              ← Newer
            </Link>
          ) : (
            <span className="text-ih-muted-2">← Newer</span>
          )}
          <span className="text-ih-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/blog/page/${page + 1}`} rel="next" className="text-ih-accent hover:underline">
              Older →
            </Link>
          ) : (
            <span className="text-ih-muted-2">Older →</span>
          )}
        </nav>
      )}
    </div>
  )
}
