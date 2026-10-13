import Link from 'next/link'
import { str, strOr, type SectionValues } from '@indus/domain'
import { Button } from '@indus/ui'
import type { PageContent } from '../../lib/page-content'
import { BLOG_PAGE_SIZE } from '../../lib/blog-index'
import HomeNewsletterForm from '../HomeNewsletterForm'
import { ArrowRightIcon, SearchIcon } from '../designed/icons'
import BlogPager from './BlogPager'
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
  /**
   * Section visibility and copy from Pages & Blocks. Both routes that render
   * this view pass the same `blog` document — /blog and /blog/page/N are the
   * same page with a different slice of articles.
   */
  content: PageContent
}

/** Fallback when the document has no empty-state copy. */
const EMPTY_MESSAGE = 'No articles have been published yet.'

/** 48px gutters on the 1440 grid, 20px at 760 and below. */
const WRAP = 'mx-auto max-w-[var(--spacing-max-w)] px-5 min-[761px]:px-[var(--spacing-page-gutter)]'

/** The two band panels, in the editor's order. Nothing else belongs in the band. */
const BAND_KEYS = new Set(['newsletter_card', 'help_card'])

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

/**
 * Shared index body for /blog and /blog/page/[n] — "Topic library".
 *
 * Readers arrive with a specific problem (a thread, a hose grade, a failure, a
 * standard), so search and every topic come before any chronology: hero with
 * search, the topic index, the newest articles as an even grid, then one navy
 * band holding the newsletter and "ask an engineer".
 *
 * Every article, topic and page link is a real <a href> and search is a native
 * GET form, so the page needs no client island beyond the newsletter form.
 *
 * Pages & Blocks mapping: `topics` toggles the topic index and `topics_card`
 * supplies its heading (its position in the order no longer means anything —
 * there is no sidebar). `newsletter_card` and `help_card` render in the band,
 * in the editor's order.
 */
export default function BlogIndexView({ posts, topics, totalPosts, page, totalPages, content }: Props) {
  const hero = content.values('hero')
  const showTopics = content.isOn('topics') && topics.length > 0
  const band = content.order.filter((key) => BAND_KEYS.has(key))

  const from = (page - 1) * BLOG_PAGE_SIZE + 1
  const to = from + posts.length - 1

  return (
    <>
      <section className="border-b border-ih-border bg-ih-surface">
        <div
          className={`${WRAP} grid grid-cols-1 items-end gap-7 pt-9 pb-8 min-[761px]:pt-16 min-[761px]:pb-14 min-[961px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] min-[961px]:gap-16`}
        >
          <div>
            <p className="eyebrow">{str(hero, 'eyebrow')}</p>
            <HeroHeading text={str(hero, 'heading') ?? ''} />
            <p className="mt-3.5 max-w-[600px] text-[15px] leading-[1.6] text-ih-ink-2 min-[761px]:mt-[18px] min-[761px]:text-[16px]">
              {str(hero, 'body')}
            </p>
          </div>

          {totalPosts > 0 && (
            <form action="/search" method="get" role="search" className="flex flex-col gap-2.5 pb-1">
              <label htmlFor="blog-search" className="text-[13px] font-medium text-ih-ink">
                Search the articles
              </label>
              <div className="flex gap-2">
                <input
                  id="blog-search"
                  type="search"
                  name="q"
                  placeholder="A thread, a hose grade, a standard"
                  className="h-12 w-full min-w-0 flex-1 rounded-md border border-ih-border bg-ih-surface px-3 text-[15px] text-ih-ink transition-[border-color] duration-150 placeholder:text-ih-muted focus:border-ih-accent motion-reduce:transition-none"
                />
                <Button type="submit" kind="navy" size="lg" icon={<SearchIcon />}>
                  Search
                </Button>
              </div>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ih-muted">
                {plural(totalPosts, 'article', 'articles')}
                {showTopics ? ` · ${plural(topics.length, 'topic', 'topics')}` : ''} · page {page} of{' '}
                {totalPages}
              </p>
            </form>
          )}
        </div>
      </section>

      {showTopics && (
        <section className={`${WRAP} pt-10 min-[761px]:pt-16`} aria-labelledby="blog-topics-heading">
          <SectionHead
            id="blog-topics-heading"
            heading={strOr(content.values('topics_card'), 'heading', 'Browse by topic')}
            count={plural(topics.length, 'topic', 'topics')}
          />
          <TopicTiles topics={topics} />
        </section>
      )}

      <section className={`${WRAP} pt-12 min-[761px]:pt-[72px]`} aria-labelledby="blog-latest-heading">
        <SectionHead
          id="blog-latest-heading"
          heading={page > 1 ? 'Earlier articles' : 'Latest articles'}
          count={posts.length > 0 ? `${from}–${to} of ${totalPosts} · newest first` : null}
        />
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 min-[761px]:grid-cols-2 min-[761px]:gap-x-6 min-[761px]:gap-y-11 min-[961px]:grid-cols-3 min-[1181px]:grid-cols-4">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} variant="grid" />
            ))}
          </div>
        ) : (
          <EmptyState message={strOr(content.values('articles'), 'empty_message', EMPTY_MESSAGE)} />
        )}
        <BlogPager page={page} totalPages={totalPages} />
      </section>

      {band.length > 0 && (
        <section className={`${WRAP} py-12 min-[761px]:py-20`}>
          <div className="grid grid-cols-1 overflow-hidden rounded-lg bg-ih-navy min-[761px]:auto-cols-fr min-[761px]:grid-flow-col min-[761px]:rounded-xl">
            {band.map((key, i) => {
              const divider = i > 0 ? 'border-t border-white/14 min-[761px]:border-t-0 min-[761px]:border-l' : ''
              return key === 'newsletter_card' ? (
                <NewsletterPanel key={key} copy={content.values(key)} className={divider} />
              ) : (
                <HelpPanel key={key} copy={content.values(key)} className={divider} />
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}

/**
 * The editable heading is one string. The clause after its LAST " — " is set
 * in italic, per the display pattern; a heading without one is all roman.
 */
function HeroHeading({ text }: { text: string }) {
  const i = text.lastIndexOf(' — ')
  return (
    <h1 className="mt-3.5 max-w-[760px] text-balance font-serif text-[36px] font-normal leading-[1.04] tracking-[-0.01em] min-[761px]:mt-[18px] min-[761px]:text-[54px]">
      {i > 0 ? (
        <>
          {text.slice(0, i)} — <em className="italic">{text.slice(i + 3)}</em>
        </>
      ) : (
        text
      )}
    </h1>
  )
}

function SectionHead({ id, heading, count }: { id: string; heading: string; count: string | null }) {
  return (
    <div className="mb-1 flex items-baseline justify-between gap-6 border-b border-ih-border pb-3 min-[761px]:mb-7 min-[761px]:pb-3.5">
      <h2 id={id} className="font-serif text-[28px] font-normal leading-[1.08] tracking-[-0.01em] min-[761px]:text-[34px]">
        {heading}
      </h2>
      {count && (
        <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.06em] text-ih-muted">
          {count}
        </span>
      )}
    </div>
  )
}

/**
 * One tile per topic: 5 columns at full width, 3 between 761 and 1180 (both
 * divide the 15 live topics evenly), and a plain list on a phone.
 *
 * The hairlines are the ul's background showing through a 1px gap, so an
 * unfilled last row would show a grey block. It is padded with blank cells —
 * separately for the 5- and 3-column layouts, each shown only at its own width.
 */
function TopicTiles({ topics }: { topics: BlogTopic[] }) {
  const pad5 = (5 - (topics.length % 5)) % 5
  const pad3 = (3 - (topics.length % 3)) % 3
  const pads = Array.from({ length: Math.max(pad5, pad3) }, (_, i) => i)

  return (
    <ul className="m-0 grid list-none grid-cols-1 p-0 min-[761px]:grid-cols-3 min-[761px]:gap-px min-[761px]:overflow-hidden min-[761px]:rounded-lg min-[761px]:border min-[761px]:border-ih-border min-[761px]:bg-ih-border min-[1181px]:grid-cols-5">
      {topics.map((topic) => (
        <li key={topic.slug} className="flex border-b border-ih-border min-[761px]:border-b-0 min-[761px]:bg-ih-surface">
          <Link
            href={`/blog/c/${topic.slug}`}
            className="group flex min-h-[52px] flex-1 items-center gap-3 py-2.5 transition-colors duration-150 focus-visible:-outline-offset-3! motion-reduce:transition-none min-[761px]:min-h-36 min-[761px]:flex-col min-[761px]:items-stretch min-[761px]:justify-between min-[761px]:gap-6 min-[761px]:px-5 min-[761px]:pt-5 min-[761px]:pb-[18px] min-[761px]:hover:bg-ih-surface-2"
          >
            <span className="flex-1 text-balance text-[15px] font-medium leading-[1.28] tracking-[-0.015em] text-ih-ink transition-colors duration-150 group-hover:text-ih-accent motion-reduce:transition-none min-[761px]:flex-none min-[761px]:text-[17px]">
              {topic.name}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-[14px] leading-none text-ih-muted min-[761px]:text-[26px] min-[761px]:tracking-[-0.03em] min-[761px]:text-ih-ink">
                {topic.count}
              </span>
              <span className="hidden text-[12px] text-ih-muted min-[761px]:inline">
                {topic.count === 1 ? 'article' : 'articles'}
              </span>
              <span className="ml-auto flex self-center text-ih-muted-2 transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-ih-accent motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                <ArrowRightIcon />
              </span>
            </span>
          </Link>
        </li>
      ))}
      {pads.map((i) => (
        <li
          key={`pad-${i}`}
          aria-hidden="true"
          className={`hidden bg-ih-surface ${i < pad3 ? 'min-[761px]:block' : ''} ${
            i < pad5 ? 'min-[1181px]:block' : 'min-[1181px]:hidden'
          }`}
        />
      ))}
    </ul>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-dashed border-ih-border-strong bg-ih-surface px-5 py-12 text-center min-[761px]:mt-0 min-[761px]:px-6 min-[761px]:py-[72px]"
    >
      <p className="eyebrow">0 articles</p>
      <p className="max-w-[560px] font-serif text-[24px] leading-[1.15] tracking-[-0.01em] min-[761px]:text-[30px]">
        {message}
      </p>
    </div>
  )
}

function NewsletterPanel({ copy, className }: { copy: SectionValues; className: string }) {
  const eyebrow = str(copy, 'eyebrow')
  const heading = str(copy, 'heading')
  const body = str(copy, 'body')
  return (
    <div className={`flex min-w-0 flex-col gap-3 px-[22px] py-7 min-[761px]:p-12 ${className}`}>
      {eyebrow && (
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-steel">{eyebrow}</p>
      )}
      {heading && (
        <h2 className="font-serif text-[26px] font-normal leading-[1.1] tracking-[-0.01em] text-white min-[761px]:text-[30px]">
          {heading}
        </h2>
      )}
      {body && <p className="text-[14px] leading-[1.6] text-ih-on-navy">{body}</p>}
      <div className="mt-1.5">
        <HomeNewsletterForm tone="navy" source="blog_index" />
      </div>
    </div>
  )
}

function HelpPanel({ copy, className }: { copy: SectionValues; className: string }) {
  const heading = str(copy, 'heading')
  const body = str(copy, 'body')
  const label = str(copy, 'cta_label')
  return (
    <div
      className={`flex min-w-0 flex-col items-start justify-end gap-2.5 px-[22px] py-7 min-[761px]:p-12 ${className}`}
    >
      {heading && (
        <h2 className="text-[19px] font-medium leading-[1.25] tracking-[-0.015em] text-white">{heading}</h2>
      )}
      {body && <p className="text-[14px] leading-[1.6] text-ih-on-navy">{body}</p>}
      {label && (
        <Button asChild kind="onnavy" className="mt-1.5 focus-visible:outline-ih-steel!">
          <Link href={str(copy, 'cta_href') ?? '/contact'}>{label}</Link>
        </Button>
      )}
    </div>
  )
}
