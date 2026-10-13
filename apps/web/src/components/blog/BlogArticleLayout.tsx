import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { RelatedArticlesBlock } from '@indus/domain'
import type { ResolvedBlogArticle } from '../../lib/blog-article'
import { mediaUrl } from '../../lib/media'
import { ArrowLeftIcon } from '../designed/icons'
import ArticleContents, { type ContentsEntry } from './ArticleContents'
import BlogArticleRenderer from './BlogArticleRenderer'
import BlogBreadcrumb from './BlogBreadcrumb'
import type { BlogPostCardData } from './BlogPostCard'
import CopyLinkButton from './CopyLinkButton'
import MoreOnTopic from './MoreOnTopic'
import { layoutArticle, stepNumber } from './article-layout'
import AsOfStampBlockView from './blocks/AsOfStampBlock'
import CategoryLinkBlockView from './blocks/CategoryLinkBlock'
import CtaBlockView, { type ArticleContact } from './blocks/CtaBlock'
import KeyTakeawaysBlockView from './blocks/KeyTakeawaysBlock'
import MarketReachBlockView, { liveMarketGroups } from './blocks/MarketReachBlock'
import RelatedArticlesBlockView, { resolvedRelated } from './blocks/RelatedArticlesBlock'

type Person = { name: string; href: string | null; jobTitle: string | null }

export type BlogArticleLayoutProps = {
  title: string
  excerpt: string | null
  /** Published topic, or null when the post's category is unpublished. */
  category: { name: string; slug: string } | null
  byline: Person
  reviewer: Person | null
  reviewedAt: Date | null
  publishedAt: Date | null
  /** Shown only when meaningfully later than `publishedAt` — same source as the JSON-LD. */
  updatedAt: Date | null
  readingMinutes: number
  hero: { storagePath: string; alt: string | null } | null
  heroCaption: string | null
  /** Canonical URL, for the copy-link button. */
  url: string
  /** Null for a legacy post that still renders `legacyBody`. */
  article: ResolvedBlogArticle | null
  legacyBody: string
  contact: ArticleContact
  moreFromTopic: BlogPostCardData[]
}

/** 20px gutters on a phone, 32px at tablet and laptop widths, 48px on the 1440 grid. */
const WRAP = 'mx-auto max-w-[var(--spacing-max-w)] px-5 min-[761px]:px-8 min-[1181px]:px-12'
/** The single 1000px reading measure every block shares. */
const MEASURE = 'mx-auto min-w-0 max-w-[1000px]'

const BODY_ID = 'article-body'
const HERO_ID = 'article-hero'

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', DATE_FORMAT)
}

/**
 * The blog article page, "Manual" layout.
 *
 * One centred 1000px reading column for the whole article: the quick answer
 * and the navy "At a glance" panel up top, the body in source order, then a
 * numbered "What next" (find the part, read next, where we deliver) and the
 * enquiry panel. Contents run as a sticky bar on wide screens and a floating
 * pill on a phone. No sidebars.
 *
 * Presentation only. Every block the resolver returns still renders, every
 * link block is still a real <a href> (some of them moved to the foot), and
 * every `section_head` keeps `id={anchor}`.
 *
 * A div, not <main>: the storefront layout already provides the page's one
 * main landmark.
 */
export default function BlogArticleLayout(props: BlogArticleLayoutProps) {
  const { article, category } = props
  const layout = article ? layoutArticle(article.blocks) : null

  const entries: ContentsEntry[] = article
    ? article.blocks.flatMap((b) =>
        b.type === 'section_head' ? [{ anchor: b.anchor, number: b.number, title: b.title }] : [],
      )
    : []

  return (
    <div className="pb-12 min-[761px]:pb-[72px]">
      <div className={WRAP}>
        <BlogBreadcrumb
          trail={category ? [{ href: `/blog/c/${category.slug}`, label: category.name }] : []}
        />
      </div>

      <header
        className={`${WRAP} flex flex-col items-start pt-4 text-left min-[761px]:items-center min-[761px]:pt-10 min-[761px]:text-center`}
      >
        {category && (
          <Link
            href={`/blog/c/${category.slug}`}
            className="inline-flex min-h-10 items-center font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ih-accent hover:underline hover:underline-offset-[3px]"
          >
            {category.name}
          </Link>
        )}
        <h1 className="mt-2 max-w-[1000px] text-balance font-serif text-[38px] font-normal leading-[1.02] tracking-[-0.015em] text-ih-ink min-[761px]:text-[66px]">
          {props.title}
        </h1>
        {props.excerpt && (
          <p className="mt-3.5 max-w-[700px] text-[16px] leading-[1.6] text-ih-ink-2 min-[761px]:mt-5 min-[761px]:text-[18px]">
            {props.excerpt}
          </p>
        )}
        <DocumentStrip {...props} sections={entries.length} />
      </header>

      {props.hero && (
        <figure id={HERO_ID} className="m-0 mt-6 min-[761px]:mt-11">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ih-surface-3 min-[761px]:aspect-[21/8]">
            <Image
              src={mediaUrl(props.hero.storagePath)}
              alt={props.hero.alt ?? props.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          {/* The caption says why the picture is here; the alt says what is in it. Never Media.caption. */}
          {props.heroCaption && (
            <figcaption className={`${WRAP} mt-3 text-[13.5px] leading-[1.5] text-ih-muted min-[761px]:text-center`}>
              {props.heroCaption}
            </figcaption>
          )}
        </figure>
      )}

      <ArticleContents entries={entries} bodyId={BODY_ID} heroId={HERO_ID} />

      <div className={`${WRAP} mt-7 min-[761px]:mt-14`}>
        <div className={MEASURE}>
          {article && layout ? (
            <>
              <AtAGlance article={article} takeaways={layout.takeaways} stamp={layout.stamp} />
              <BlogArticleRenderer article={article} contact={props.contact} skip={layout.skip} id={BODY_ID} />
            </>
          ) : (
            // Legacy posts — written before the block editor — keep their HTML.
            <div
              id={BODY_ID}
              className="ih-rich-text min-w-0 max-w-none"
              dangerouslySetInnerHTML={{ __html: props.legacyBody }}
            />
          )}
        </div>
      </div>

      {article && layout && <WhatNext article={article} layout={layout} contact={props.contact} />}

      <div className={WRAP}>
        <div className={MEASURE}>
          {category && <MoreOnTopic articles={props.moreFromTopic} topic={category} />}
          <Link
            href="/blog"
            className="mt-10 inline-flex min-h-10 items-center gap-2 text-[14px] font-medium text-ih-ink-2 hover:text-ih-accent"
          >
            <ArrowLeftIcon />
            Back to Blog
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * The document-control strip that replaces the byline row: who wrote it, when,
 * when it was last updated (only when meaningfully later), how long it is, who
 * reviewed it (when anyone has), and a copy-link button.
 *
 * Wide: one row of cells divided by hairlines. Phone: "Written by" across the
 * top, the rest paired two-up beneath it.
 */
function DocumentStrip(props: BlogArticleLayoutProps & { sections: number }) {
  const { byline, reviewer } = props
  const reading =
    props.sections > 0
      ? `${props.readingMinutes} min · ${props.sections} ${props.sections === 1 ? 'section' : 'sections'}`
      : `${props.readingMinutes} min`

  const cells: Array<{ key: string; label: string; value: ReactNode; srLabel?: boolean }> = [
    { key: 'by', label: 'Written by', value: <PersonValue person={byline} /> },
    ...(props.publishedAt
      ? [{ key: 'pub', label: 'Published', value: <DateValue date={props.publishedAt} /> }]
      : []),
    ...(props.updatedAt ? [{ key: 'upd', label: 'Updated', value: <DateValue date={props.updatedAt} /> }] : []),
    { key: 'read', label: 'Reading', value: reading },
    ...(reviewer
      ? [
          {
            key: 'rev',
            label: 'Reviewed by',
            value: (
              <>
                <PersonValue person={reviewer} />
                {props.reviewedAt ? (
                  <>
                    {' · '}
                    <DateValue date={props.reviewedAt} />
                  </>
                ) : null}
              </>
            ),
          },
        ]
      : []),
    { key: 'share', label: 'Share', value: <CopyLinkButton url={props.url} />, srLabel: true },
  ]

  return (
    <dl className="m-0 mt-[22px] grid w-full grid-cols-2 overflow-hidden rounded-lg border border-ih-border bg-ih-surface text-left min-[761px]:mt-8 min-[761px]:flex min-[761px]:w-auto min-[761px]:max-w-full">
      {cells.map((cell, i) => (
        <div
          key={cell.key}
          className={[
            'flex min-w-0 flex-col justify-center gap-1 px-3.5 py-2.5',
            cell.key === 'share' ? 'min-[761px]:px-3 min-[761px]:py-2.5' : 'min-[761px]:px-[22px] min-[761px]:py-3',
            i === 0 ? 'col-span-2' : 'border-t border-ih-border min-[761px]:border-t-0',
            // Phone pairs cells two-up after the full-width first one: the
            // right-hand cell of each pair gets the rule. Wide: every cell does.
            i > 0 ? ((i - 1) % 2 === 1 ? 'border-l' : 'min-[761px]:border-l') : '',
          ].join(' ')}
        >
          <dt
            className={
              cell.srLabel ? 'sr-only' : 'font-mono text-[10px] uppercase tracking-[0.12em] text-ih-muted'
            }
          >
            {cell.label}
          </dt>
          <dd className="m-0 text-[14px] text-ih-ink">{cell.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function PersonValue({ person }: { person: Person }) {
  return (
    <>
      {person.href ? (
        <Link href={person.href} className="font-semibold hover:text-ih-accent">
          {person.name}
        </Link>
      ) : (
        <span className="font-semibold">{person.name}</span>
      )}
      {person.jobTitle ? `, ${person.jobTitle}` : null}
    </>
  )
}

function DateValue({ date }: { date: Date }) {
  return <time dateTime={date.toISOString()}>{formatDate(date)}</time>
}

/** The first `key_takeaways`, with the first `as_of_stamp` inside it. A lone stamp still leads. */
function AtAGlance({
  article,
  takeaways,
  stamp,
}: {
  article: ResolvedBlogArticle
  takeaways: number | null
  stamp: number | null
}) {
  const kt = takeaways !== null ? article.blocks[takeaways] : undefined
  const st = stamp !== null ? article.blocks[stamp] : undefined
  const stampBlock = st?.type === 'as_of_stamp' ? st : undefined

  if (kt?.type === 'key_takeaways') {
    return (
      <div className="mb-7 min-[761px]:mb-12">
        <KeyTakeawaysBlockView block={kt} stamp={stampBlock} />
      </div>
    )
  }
  if (stampBlock) {
    return (
      <div className="mb-7 min-[761px]:mb-12">
        <AsOfStampBlockView block={stampBlock} />
      </div>
    )
  }
  return null
}

/**
 * The numbered foot of the article. Each step renders only when its blocks
 * resolve to at least one live link, and the steps are renumbered over what
 * renders, so the sequence never skips a number. The enquiry panel follows.
 */
function WhatNext({
  article,
  layout,
  contact,
}: {
  article: ResolvedBlogArticle
  layout: ReturnType<typeof layoutArticle>
  contact: ArticleContact
}) {
  const steps: Array<{ key: string; body: ReactNode }> = []

  const categoryLinks = layout.categoryLinks.flatMap((i) => {
    const b = article.blocks[i]
    return b?.type === 'category_link' && article.categoriesBySlug.has(b.slug) ? [{ i, block: b }] : []
  })
  if (categoryLinks.length > 0) {
    steps.push({
      key: 'part',
      body: (
        <>
          <h3 className="mb-3 text-[15px] font-semibold text-ih-ink">Find the part</h3>
          <div className="flex flex-col gap-3">
            {categoryLinks.map(({ i, block }) => (
              <CategoryLinkBlockView key={i} block={block} categoriesBySlug={article.categoriesBySlug} />
            ))}
          </div>
        </>
      ),
    })
  }

  // Every related_articles block reads as one "Read next" list, de-duplicated.
  const relatedSlugs = [
    ...new Set(
      layout.related.flatMap((i) => {
        const b = article.blocks[i]
        return b?.type === 'related_articles' ? b.slugs : []
      }),
    ),
  ]
  const readNext: RelatedArticlesBlock = { type: 'related_articles', slugs: relatedSlugs }
  if (relatedSlugs.length > 0 && resolvedRelated(readNext, article.articlesBySlug).length > 0) {
    steps.push({
      key: 'read',
      body: <RelatedArticlesBlockView block={readNext} articlesBySlug={article.articlesBySlug} variant="step" />,
    })
  }

  layout.markets.forEach((i) => {
    const b = article.blocks[i]
    if (b?.type === 'market_reach' && liveMarketGroups(b, article.livePageLinks).length > 0) {
      steps.push({
        key: `market-${i}`,
        body: <MarketReachBlockView block={b} livePageLinks={article.livePageLinks} variant="step" />,
      })
    }
  })

  const ctas = layout.ctas.flatMap((i) => {
    const b = article.blocks[i]
    return b?.type === 'cta_block' ? [{ i, block: b }] : []
  })

  if (steps.length === 0 && ctas.length === 0) return null

  return (
    <section
      aria-labelledby={steps.length > 0 ? 'what-next' : undefined}
      aria-label={steps.length > 0 ? undefined : 'Enquiry'}
      className={`${WRAP} mt-14 min-[761px]:mt-20`}
    >
      <div className={MEASURE}>
        {steps.length > 0 && (
          <>
            <h2
              id="what-next"
              className="border-b border-ih-ink pb-4 font-serif text-[30px] font-normal leading-[1.05] tracking-[-0.01em] text-ih-ink min-[761px]:text-[44px]"
            >
              What next
            </h2>
            <ol className="m-0 list-none p-0">
              {steps.map((step, n) => (
                <li
                  key={step.key}
                  className="grid grid-cols-1 gap-2 border-b border-ih-border py-6 min-[761px]:grid-cols-[120px_minmax(0,1fr)] min-[761px]:gap-8 min-[761px]:py-8"
                >
                  <span className="font-mono text-[18px] tracking-[-0.02em] text-ih-accent min-[761px]:text-[28px]">
                    {stepNumber(n)}
                  </span>
                  <div className="min-w-0">{step.body}</div>
                </li>
              ))}
            </ol>
          </>
        )}
        {ctas.length > 0 && (
          <div className={`flex flex-col gap-6 ${steps.length > 0 ? 'mt-12' : ''}`}>
            {ctas.map(({ i, block }) => (
              <CtaBlockView key={i} block={block} contact={contact} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
