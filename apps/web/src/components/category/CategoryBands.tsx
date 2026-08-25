import Link from 'next/link'
import { list, str, type SectionValues } from '@indus/domain'
import type { CategorySizeSummary, GccMarketLink } from '../../lib/category-bands'
import { stockLine } from '../../lib/category-bands'

/**
 * The editorial bands on a catalogue shelf page.
 *
 * All of them EXCEPT the size band render only when someone has written the
 * copy. That is deliberate and it is the whole discipline of this template:
 * 195 categories inherit it and 86 of them hold four products or fewer, so a
 * band that rendered an empty heading — or worse, a generated paragraph — on
 * every shelf would be the doorway pattern this catalogue is explicitly not
 * following. An unwritten band is invisible, not thin.
 *
 * The size band is the exception because its content is read from the size
 * tables rather than written, so it is either true or absent.
 */

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-ih-muted mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em]">
      {children}
    </p>
  )
}

function Heading({ children }: { children: string }) {
  return (
    <h2 className="mb-4 font-serif text-[clamp(22px,2.6vw,28px)] font-normal leading-[1.12] tracking-[-0.01em]">
      {children}
    </h2>
  )
}

/**
 * A written band: eyebrow, heading, prose.
 *
 * Paragraphs split on a blank line, so an editor gets more than one without
 * needing a rich-text control on a field that only ever holds prose.
 */
export function CategoryProseBand({ values }: { values: SectionValues }) {
  const body = str(values, 'body')
  const heading = str(values, 'heading')
  if (!body && !heading) return null

  const paragraphs = (body ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  const eyebrow = str(values, 'eyebrow')

  return (
    <section className="border-ih-border border-b py-8">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {heading && <Heading>{heading}</Heading>}
      <div className="flex max-w-[68ch] flex-col gap-3">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="text-ih-ink-2 text-[15px] leading-[1.65]">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}

/**
 * What the size tables on this shelf cover.
 *
 * Not written by anyone: the figures come from `product_variants`, so the band
 * is right the day a size table lands and absent until one does.
 */
export function CategorySizeBand({ summary }: { summary: CategorySizeSummary | null }) {
  if (!summary || summary.sizes === 0) return null

  const bore = summary.boreInch
    ? `${summary.boreInch.min} to ${summary.boreInch.max}`
    : summary.boreMm
      ? `DN${summary.boreMm.min} to DN${summary.boreMm.max}`
      : null

  return (
    <section className="border-ih-border border-b py-8">
      <Eyebrow>Size range</Eyebrow>
      <div className="flex flex-wrap gap-x-12 gap-y-4">
        <Figure value={summary.sizes.toLocaleString('en-GB')} label="orderable sizes" />
        <Figure value={String(summary.products)} label="listings with a size table" />
        {bore && <Figure value={bore} label="bore range" />}
      </div>
      <p className="text-ih-muted mt-4 max-w-[68ch] text-[14px] leading-[1.6]">
        Every size above is a part number you can quote from. Open any listing for its full table.
      </p>
    </section>
  )
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[24px] font-medium tabular-nums leading-none tracking-[-0.02em]">
        {value}
      </span>
      <span className="text-ih-muted font-mono text-[11px] uppercase tracking-[0.1em]">
        {label}
      </span>
    </div>
  )
}

/**
 * Stock position, and the links out to the export markets.
 *
 * The links are the point of the band. Market pages have linked into 187
 * categories since they shipped and no category has ever linked back, so the
 * whole markets section has been a one-way street. This band renders on every
 * shelf whether or not anyone has written copy for it, because the links are
 * worth having on their own and the stock line is true of the whole catalogue.
 *
 * `exportRegions` extends it past the Gulf. The chips above are the five other
 * GCC states with a transit band on each, which is more useful than a plain
 * link and is why they stay as they are; the rows below are the rest of the
 * world, three regions rotating per category so 46 shelves under Hoses &
 * Fittings do not carry one list 46 times. See `category-market-reach.ts`.
 *
 * The generated paragraph is a FALLBACK, not an addition: an editor who has
 * written body copy for this shelf keeps exactly what they wrote, because they
 * were writing about this category and the generated line is about its root.
 * Same rule as the blog's `skus` fallback.
 */
export function CategoryDeliveryBand({
  values,
  markets,
  categoryName,
  exportRegions,
}: {
  values: SectionValues
  markets: GccMarketLink[]
  categoryName: string
  exportRegions?: {
    body: string
    groups: Array<{ region: string; markets: Array<{ slug: string; name: string }> }>
  } | null
}) {
  const stock = stockLine()
  if (!stock && markets.length === 0 && !exportRegions) return null

  const body = str(values, 'body')
  const paragraphs = (body ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  const generated = paragraphs.length === 0 && exportRegions ? exportRegions.body : null

  return (
    <section className="border-ih-border border-b py-8">
      <Eyebrow>{str(values, 'eyebrow') ?? 'Delivery'}</Eyebrow>
      <Heading>{str(values, 'heading') ?? `${categoryName} across the Gulf`}</Heading>
      <div className="flex max-w-[68ch] flex-col gap-3">
        {stock && <p className="text-ih-ink-2 text-[15px] leading-[1.65]">{stock}</p>}
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="text-ih-ink-2 text-[15px] leading-[1.65]">
            {paragraph}
          </p>
        ))}
        {generated && <p className="text-ih-ink-2 text-[15px] leading-[1.65]">{generated}</p>}
      </div>
      {markets.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {markets.map((market) => (
            <Link
              key={market.slug}
              href={`/markets/${market.slug}`}
              className="border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors"
            >
              {market.name}
              <span className="text-ih-muted font-mono text-[10.5px] uppercase tracking-[0.08em]">
                {market.leadTime}
              </span>
            </Link>
          ))}
        </div>
      )}
      {exportRegions && (
        <div className="border-ih-border mt-6 border-t pt-5">
          <p className="mono text-ih-muted mb-3 text-[10.5px] uppercase tracking-[0.12em]">
            Beyond the Gulf
          </p>
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
            {exportRegions.groups.map((group) => (
              <div key={group.region}>
                <dt className="mono text-ih-muted text-[10.5px] uppercase tracking-[0.12em]">
                  {group.region}
                </dt>
                <dd className="text-ih-ink m-0 mt-1 text-[14px] leading-[1.55]">
                  {group.markets.map((market, i) => (
                    <span key={market.slug}>
                      {i > 0 && <span className="text-ih-muted">, </span>}
                      <Link
                        href={`/markets/${market.slug}`}
                        className="text-ih-ink hover:text-ih-accent underline underline-offset-[3px] transition-colors"
                      >
                        {market.name}
                      </Link>
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-ih-muted mt-4 text-[13.5px] leading-[1.55]">
            <Link href="/markets" className="text-ih-accent font-medium hover:underline">
              See every export destination
              <span aria-hidden="true"> →</span>
            </Link>
          </p>
        </div>
      )}
    </section>
  )
}

export type CategoryFaq = { question: string; answer: string }

/** The questions an editor has written for this shelf. */
export function categoryFaqs(values: SectionValues): CategoryFaq[] {
  // `faqList` names its rows `items` and its columns `q` / `a`. Reading
  // `faqs`/`question`/`answer` here type-checks, renders nothing, and looks
  // exactly like an editor who has not written any questions yet.
  return list(values, 'items')
    .map((row) => ({
      question: typeof row.q === 'string' ? row.q.trim() : '',
      answer: typeof row.a === 'string' ? row.a.trim() : '',
    }))
    .filter((row) => row.question && row.answer)
}

/**
 * The FAQ band.
 *
 * The page emits FAQPage structured data from the SAME list, and only when
 * this band is switched on — markup for questions a reader cannot see is a
 * Google violation rather than merely stale, which is why the route gates the
 * JSON-LD on `content.isOn('faq')` and on this list being non-empty.
 */
export function CategoryFaqBand({ values }: { values: SectionValues }) {
  const faqs = categoryFaqs(values)
  if (faqs.length === 0) return null

  return (
    <section className="border-ih-border border-b py-8">
      <Eyebrow>{str(values, 'eyebrow') ?? 'Questions we get asked'}</Eyebrow>
      <Heading>{str(values, 'heading') ?? 'About this range'}</Heading>
      <dl className="flex max-w-[74ch] flex-col">
        {faqs.map((faq, index) => (
          <div
            key={faq.question}
            className={`flex flex-col gap-2 py-4 ${index > 0 ? 'border-ih-border border-t' : ''}`}
          >
            <dt className="flex gap-3 text-[15.5px] font-medium leading-[1.4]">
              <span className="text-ih-accent font-mono text-[12px]">
                {String(index + 1).padStart(2, '0')}
              </span>
              {faq.question}
            </dt>
            <dd className="text-ih-ink-2 m-0 pl-[30px] text-[15px] leading-[1.65]">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
