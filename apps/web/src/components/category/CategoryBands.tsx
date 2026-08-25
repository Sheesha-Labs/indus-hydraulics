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
    <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
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

  const paragraphs = (body ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const eyebrow = str(values, 'eyebrow')

  return (
    <section className="border-b border-ih-border py-8">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {heading && <Heading>{heading}</Heading>}
      <div className="flex max-w-[68ch] flex-col gap-3">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="text-[15px] leading-[1.65] text-ih-ink-2">
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
    <section className="border-b border-ih-border py-8">
      <Eyebrow>Size range</Eyebrow>
      <div className="flex flex-wrap gap-x-12 gap-y-4">
        <Figure value={summary.sizes.toLocaleString('en-GB')} label="orderable sizes" />
        <Figure value={String(summary.products)} label="listings with a size table" />
        {bore && <Figure value={bore} label="bore range" />}
      </div>
      <p className="mt-4 max-w-[68ch] text-[14px] leading-[1.6] text-ih-muted">
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
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ih-muted">{label}</span>
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
 */
export function CategoryDeliveryBand({
  values,
  markets,
  categoryName,
}: {
  values: SectionValues
  markets: GccMarketLink[]
  categoryName: string
}) {
  const stock = stockLine()
  if (!stock && markets.length === 0) return null

  const body = str(values, 'body')
  const paragraphs = (body ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)

  return (
    <section className="border-b border-ih-border py-8">
      <Eyebrow>{str(values, 'eyebrow') ?? 'Delivery'}</Eyebrow>
      <Heading>{str(values, 'heading') ?? `${categoryName} across the Gulf`}</Heading>
      <div className="flex max-w-[68ch] flex-col gap-3">
        {stock && <p className="text-[15px] leading-[1.65] text-ih-ink-2">{stock}</p>}
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="text-[15px] leading-[1.65] text-ih-ink-2">
            {paragraph}
          </p>
        ))}
      </div>
      {markets.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {markets.map((market) => (
            <Link
              key={market.slug}
              href={`/markets/${market.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-ih-border bg-ih-surface px-3 py-1.5 text-[12.5px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent"
            >
              {market.name}
              <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ih-muted">
                {market.leadTime}
              </span>
            </Link>
          ))}
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
    <section className="border-b border-ih-border py-8">
      <Eyebrow>{str(values, 'eyebrow') ?? 'Questions we get asked'}</Eyebrow>
      <Heading>{str(values, 'heading') ?? 'About this range'}</Heading>
      <dl className="flex max-w-[74ch] flex-col">
        {faqs.map((faq, index) => (
          <div
            key={faq.question}
            className={`flex flex-col gap-2 py-4 ${index > 0 ? 'border-t border-ih-border' : ''}`}
          >
            <dt className="flex gap-3 text-[15.5px] font-medium leading-[1.4]">
              <span className="font-mono text-[12px] text-ih-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              {faq.question}
            </dt>
            <dd className="m-0 pl-[30px] text-[15px] leading-[1.65] text-ih-ink-2">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
