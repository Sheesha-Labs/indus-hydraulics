import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@indus/ui'
import {
  MARKET_INCOTERM_OPTIONS,
  MARKET_OPERATIONS,
  MARKET_REGIONS,
  MARKET_STANDARDS,
  MARKET_TARIFF_LINES,
  MARKET_URGENCY_OPTIONS,
  formatCoordinates,
  freightBarPercents,
  isRightToLeft,
  marketDestinationCount,
  marketOrderSequence,
  marketSlugByName,
  str,
  type Market,
  type MarketPage,
} from '@indus/domain'
import type { MarketMapModel } from '../../lib/market-geometry'
import type { PageContent } from '../../lib/page-content'
import MarketCatalogueIndex, { type CatalogueCluster } from './MarketCatalogueIndex'
import MarketFigure from './MarketFigure'
import MarketIndustries, { type MarketBrand } from './MarketIndustries'
import MarketMapPanel from './MarketMapPanel'
import MarketQuickEnquiry from './MarketQuickEnquiry'
import MarketQuoteForm from './MarketQuoteForm'

/**
 * The designed export-market page.
 *
 * Sixteen sections, full-bleed, and the order is deliberate: a reader who
 * takes in nothing else passes a lead form twice, and a crawler meets the
 * catalogue link mass before the FAQ. Do not reorder without deciding which of
 * those two you are giving up.
 *
 * A server component throughout. The only client boundaries on the page are
 * the two forms — everything else, including the hero map, is markup by the
 * time it reaches the browser.
 *
 * HEADING TREE: one H1; the H2 sequence IS the page outline and should read as
 * a table of contents; cluster and sector headings are H3. The regional labels
 * in the closing sitemap are styled `<p>`, NOT headings — promoting them would
 * hang eleven more H3s below the FAQ and dilute the tree for no gain.
 */
export default function MarketLanding({
  market,
  page,
  mapModel,
  clusters,
  brands,
  contact,
  showAuditStrip,
  content,
}: {
  market: Market
  page: MarketPage
  mapModel: MarketMapModel | null
  clusters: CatalogueCluster[]
  brands: MarketBrand[]
  contact: { phone: string | null; email: string | null; hours: string | null; whatsappUrl: string | null }
  /** The build-time audit strip. Staging only — see the docblock on it. */
  showAuditStrip: boolean
  /**
   * Band order, visibility and heading overrides for THIS market, from Pages
   * & Blocks. Every copy field is an override: blank keeps the wording the
   * template builds from the record, which is why an unedited market renders
   * exactly as it did before this existed.
   */
  content: PageContent
}) {
  const orderSteps = marketOrderSequence(page)
  // Looked up, never derived — see the docblock on `marketSlugByName`.
  const slugByName = marketSlugByName()
  const freightWidths = freightBarPercents(page.freight)
  const destinations = marketDestinationCount()

  const heroCopy = content.values('hero')
  const standardsCopy = content.values('standards')
  const freightCopy = content.values('freight')
  const gazetteerCopy = content.values('gazetteer')
  const faqCopy = content.values('faq')
  const closingCopy = content.values('closing_form')
  const sitemapCopy = content.values('sitemap')

  /** An override with `{market}` resolved, or the template's own wording. */
  const over = (values: Parameters<typeof str>[0], key: string, built: string): string =>
    (str(values, key) ?? built).replace(/\{market\}/g, market.name)

  /*
    Where the hero's quote button points.

    The mid-page form owns `#quote`. An editor who hides it would otherwise
    leave the hero button jumping to an anchor that is no longer in the
    document — a dead control with no error anywhere. When it is off the button
    goes to the closing form instead, and when BOTH are off the button is
    dropped rather than left pointing at nothing.
  */
  const quoteAnchor = content.isOn('quote_form')
    ? '#quote'
    : content.isOn('closing_form')
      ? '#closing-quote'
      : null

  /*
    Every band, keyed. The page renders `content.order`, which is the editor's
    arrangement for THIS market with hidden bands already dropped.

    The shipped order is deliberate and the reasons are on the component
    docblock: a reader who takes in nothing else passes a lead form twice, and
    a crawler meets the catalogue link mass before the FAQ. Reordering is now
    something a content manager can do — that trade-off is theirs to make.
  */
  const bands: Record<string, ReactNode> = {
    // 3. Hero
    hero: (
      <section className="border-b border-ih-border bg-ih-surface px-5 pb-12 pt-10 sm:px-8 lg:px-12 lg:pb-[60px] lg:pt-14">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,664px)] lg:gap-14">
        <div>
          <div className="flex items-center gap-2.5">
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
              {over(heroCopy, 'eyebrow', 'Export from Dubai')}
            </p>
            <span className="mono rounded-[3px] bg-ih-accent-soft px-2 py-1 text-[9.5px] uppercase tracking-[0.1em] text-ih-accent">
              {market.countryCode}
            </span>
          </div>

          {/* The italic country name is not decoration — it is how the
              template shows the reader which word is the variable. */}
          <h1 className="mt-5 max-w-[640px] font-serif text-[38px] leading-[1.02] tracking-[-0.01em] sm:text-[48px] lg:text-[62px] lg:leading-[1]">
            {/* The italic country name is not decoration — it is how the
                template shows the reader which word is the variable. An
                override replaces the whole line, italics included. */}
            {str(heroCopy, 'heading') ? (
              over(heroCopy, 'heading', '')
            ) : (
              <>
                Hydraulic &amp; industrial hose supplier in <em>{market.name}</em>
              </>
            )}
          </h1>

          <p className="mt-5 max-w-[640px] text-pretty text-[16px] leading-[1.6] text-ih-ink-2">
            {str(heroCopy, 'lede') ?? page.lede}
          </p>

          <dl className="mt-7 border-t border-ih-border">
            {page.facts.map((fact) => (
              <div
                key={fact.label}
                className="grid grid-cols-1 gap-x-5 gap-y-1 border-b border-ih-border py-3 sm:grid-cols-[148px_1fr]"
              >
                <dt className="mono pt-0.5 text-[10px] uppercase tracking-[0.1em] text-ih-muted">
                  {fact.label}
                </dt>
                <dd className="m-0 text-[13.5px] leading-[1.5] text-ih-ink-2">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {quoteAnchor && (
              <Button asChild kind="primary" size="lg">
                {/* An in-page jump, not a navigation — a lead form is already
                    on this page and the reader keeps their place. Which one
                    it points at depends on which are switched on. */}
                <a href={quoteAnchor}>
                  {over(heroCopy, 'primary_cta_label', 'Request an export quote')}{' '}
                  <span aria-hidden="true">→</span>
                </a>
              </Button>
            )}
            {contact.whatsappUrl && (
              <Button asChild kind="outline" size="lg">
                <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  {over(heroCopy, 'whatsapp_cta_label', 'WhatsApp us')}
                </a>
              </Button>
            )}
            {contact.email && (
              <Button asChild kind="ghost" size="lg">
                <a href={`mailto:${contact.email}?subject=${encodeURIComponent(`Export enquiry — ${market.name}`)}`}>
                  Email {contact.email}
                </a>
              </Button>
            )}
          </div>
        </div>

        <MarketMapPanel model={mapModel} countryName={market.name} lane={page.lane} />
      </div>
    </section>
    ),

    // 4. Manifest strip
    manifest: (
      <div className="bg-ih-navy px-5 sm:px-8 lg:px-12">
      {/* The 1px gap over a translucent white ground IS the divider — there
          are no border rules in this grid. */}
      <dl className="mx-auto grid max-w-[1440px] grid-cols-2 gap-px bg-white/15 sm:grid-cols-3 lg:grid-cols-6">
        {page.manifest.map((cell) => (
          <div key={cell.label} className="bg-ih-navy px-5 pb-6 pt-[22px]">
            <dt className="mono text-[9px] uppercase tracking-[0.16em] text-ih-steel">
              {cell.label}
            </dt>
            <dd className="mono m-0 mt-2 text-[14px] leading-[1.35] tracking-[-0.01em] text-white">
              {cell.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
    ),

    // 5. Operations band
    operations: (
      <div className="grid grid-cols-1 gap-px border-b border-ih-border bg-ih-border sm:grid-cols-2 lg:grid-cols-4">
      {MARKET_OPERATIONS.map((op, index) => (
        <div key={op.label} className="bg-ih-surface">
          <MarketFigure
            src={null}
            label={
              // Only the fourth caption names the destination. One
              // photograph serves every market; the caption localises it.
              index === 3
                ? `${op.shot} · bound for ${page.map.crossing.name.toLowerCase()}`
                : op.shot
            }
            ratio="aspect-[4/3]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            priority
          />
          <div className="px-4 pb-4 pt-3.5 sm:px-[18px]">
            <p className="mono text-[9.5px] uppercase tracking-[0.14em] text-ih-accent">
              {String(index + 1).padStart(2, '0')} · {op.label}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-[1.55] text-ih-muted">
              {op.caption.replace('{market}', market.name)}
            </p>
          </div>
        </div>
      ))}
    </div>
    ),

    // 6. Catalogue index
    catalogue: (
      <MarketCatalogueIndex clusters={clusters} marketName={market.name} />
    ),

    // 7. Lead form, mid page
    quote_form: (
      <section
      id="quote"
      className="scroll-mt-24 border-b border-t border-ih-border bg-ih-surface-2 px-5 py-14 sm:px-8 lg:px-12 lg:py-16"
    >
      <div className="mx-auto max-w-[1440px]">
        <MarketQuoteForm
          marketSlug={market.slug}
          marketName={market.name}
          countryCode={market.countryCode}
          currency={page.currency}
          dialCode={page.dialCode}
          cities={page.cities.map((c) => c.name)}
          incoterms={MARKET_INCOTERM_OPTIONS}
          urgencies={MARKET_URGENCY_OPTIONS}
          contactPhone={contact.phone}
          contactEmail={contact.email}
          contactHours={contact.hours}
        />
      </div>
    </section>
    ),

    // 8. Standards + tariff
    standards: (
      <section className="border-b border-t border-ih-border bg-ih-surface px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
      {/*
        `minmax(0, …)` on BOTH columns, and `min-w-0` on the child that holds
        the table. A grid column's default `min-width: auto` is the content's
        min-content width, and the standards table declares `min-w-[520px]`
        so it stays readable — which at 1024px pushed the whole grid 80px
        past the viewport and put a horizontal scrollbar on the document. The
        table's own `overflow-x-auto` cannot help until the column is
        allowed to be narrower than its contents.
      */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-14">
        <div className="min-w-0">
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
            {over(standardsCopy, 'eyebrow', 'Standards')}
          </p>
          <h2 className="mb-5 mt-3 font-serif text-[26px] leading-[1.12] sm:text-[32px]">
            {over(standardsCopy, 'heading', `Standards we supply and certify against for ${market.name}`)}
          </h2>
          {/* Wide tables get their own scroller rather than pushing the page
              sideways — a horizontally scrolling body breaks every section. */}
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ih-border">
                  {['Standard', 'Types', 'Applies to'].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="mono px-4 py-[11px] text-[10.5px] font-medium uppercase tracking-[0.08em] text-ih-muted"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MARKET_STANDARDS.map((row) => (
                  <tr key={row.standard} className="border-b border-ih-border transition-colors hover:bg-ih-surface-2">
                    <td className="mono whitespace-nowrap px-4 py-3.5 text-[13px] font-medium text-ih-ink">
                      {row.standard}
                    </td>
                    <td className="mono px-4 py-3.5 text-[13px] text-ih-ink-2">{row.types}</td>
                    <td className="px-4 py-3.5 text-[13px] text-ih-muted">{row.appliesTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
            {over(standardsCopy, 'tariff_eyebrow', 'Customs')}
          </p>
          <h2 className="mb-5 mt-3 font-serif text-[26px] leading-[1.12] sm:text-[32px]">
            {over(standardsCopy, 'tariff_heading', 'Tariff lines we declare under')}
          </h2>
          <ul className="list-none overflow-hidden rounded-lg border border-ih-border p-0">
            {MARKET_TARIFF_LINES.map((line) => (
              <li
                key={line.hsCode}
                className="grid grid-cols-[72px_1fr] gap-3 border-b border-ih-border px-4 py-3 last:border-b-0"
              >
                <span className="mono text-[11.5px] text-ih-ink">{line.hsCode}</span>
                <span>
                  <span className="block text-[12.5px] leading-[1.45] text-ih-ink-2">
                    {line.description}
                  </span>
                  <span className="mt-1 block text-[11.5px] text-ih-muted">{line.useCase}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] leading-[1.6] text-ih-muted">
            Classification is confirmed line by line at quotation. This is the set most
            consignments to {market.name} are declared under.
          </p>
        </div>
      </div>
    </section>
    ),

    // 9. Freight ladder + order sequence
    freight: (
      <section className="bg-ih-bg px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
            {over(freightCopy, 'eyebrow', 'Freight')}
          </p>
          <h2 className="mb-5 mt-3 font-serif text-[26px] leading-[1.12] sm:text-[32px]">
            {over(freightCopy, 'heading', 'Three ways in, priced per shipment')}
          </h2>
          {page.freight.map((mode, index) => (
            <div key={mode.name} className="border-t border-ih-border py-4">
              <div className="flex items-baseline justify-between gap-5">
                <span className="text-[15px] font-medium">{mode.name}</span>
                <span className={`mono text-[13px] ${index === 0 ? 'text-ih-accent' : 'text-ih-ink-2'}`}>
                  {mode.transit}
                </span>
              </div>
              {/*
                Bar length is derived from the transit string next to it, not
                authored — so a copy edit can never leave the bar contradicting
                the number. The width has to be an inline custom property
                because it is a per-row computed percentage; Tailwind cannot
                express an arbitrary runtime value as a class.
              */}
              <div
                className="mt-2.5 h-1.5 overflow-hidden rounded-[3px] bg-ih-surface-3"
                role="presentation"
              >
                <div
                  className={`h-full ${index === 0 ? 'bg-ih-accent' : 'bg-ih-steel'}`}
                  style={{ width: `${freightWidths[index]}%` }}
                />
              </div>
              {/*
                Route and use-case sit on one line from 640px up. Below that
                they STACK. Held on one row they did two bad things on a phone,
                both only on the markets with the longest use-case strings:
                "Alternative when Mombasa is congested" is `whitespace-nowrap`,
                so it ran off the right edge of the document at 320px (eight
                markets did, by up to 58px), and the route beside it was
                squeezed into a four-line ribbon three words wide. Neither is
                visible above 375px, which is why it shipped.
              */}
              <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5">
                <span className="min-w-0 text-[12.5px] text-ih-muted">{mode.route}</span>
                <span className="mono text-[10px] uppercase tracking-[0.08em] text-ih-muted-2 sm:whitespace-nowrap">
                  {mode.useCase}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
            {over(freightCopy, 'sequence_eyebrow', 'Sequence')}
          </p>
          <h2 className="mb-5 mt-3 font-serif text-[26px] leading-[1.12] sm:text-[32px]">
            {over(freightCopy, 'sequence_heading', `How an order to ${market.name} works`)}
          </h2>
          <ol className="flex list-none flex-col gap-0.5 p-0">
            {orderSteps.map((step, index) => (
              <li
                key={step}
                className="grid grid-cols-[42px_1fr] gap-4 rounded-md border border-ih-border bg-ih-surface px-5 py-[18px] sm:grid-cols-[54px_1fr]"
              >
                <span className="mono text-[22px] tracking-[-0.02em] text-ih-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[13.5px] leading-[1.6] text-ih-ink-2">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
    ),

    // 10. Industries + brands
    sectors: (
      <MarketIndustries sectors={page.sectors} brands={brands} marketName={market.name} />
    ),

    // 11. City gazetteer
    gazetteer: (
      <section className="border-b border-t border-ih-border bg-ih-surface px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
            {over(gazetteerCopy, 'eyebrow', 'Delivery coverage')}
          </p>
          <h2 className="mt-3.5 font-serif text-[26px] leading-[1.12] sm:text-[34px]">
            {over(gazetteerCopy, 'heading', `Cities and sites we deliver to in ${market.name}`)}
          </h2>
          <p className="mt-3.5 text-[13.5px] leading-[1.65] text-ih-muted">
            {str(gazetteerCopy, 'intro') ??
              'DAP deliveries go to the site gate. Coordinates are given because project sites are easier to name that way than by address.'}
          </p>
          <p className="mono mt-4 text-[10.5px] uppercase tracking-[0.08em] text-ih-muted-2">
            {page.cities.length} locations listed
          </p>
        </div>

        <ul className="grid list-none grid-cols-2 gap-px border border-ih-border bg-ih-border p-0 sm:grid-cols-3 lg:grid-cols-4">
          {page.cities.map((city) => (
            <li key={city.name} className="bg-ih-surface px-4 py-3.5">
              <p className="text-[13.5px] font-medium">{city.name}</p>
              <p className="mt-0.5 text-[11.5px] text-ih-muted">{city.region}</p>
              {/*
                Hidden from assistive tech: a screen reader renders
                "4.82°N 7.01°E" digit by digit and it carries no meaning the
                city and region above have not already given.
              */}
              <p
                aria-hidden="true"
                className="mono mt-2 text-[9.5px] tracking-[0.04em] text-ih-muted-2"
              >
                {formatCoordinates(city.coords)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
    ),

    // 12. FAQ
    faq: (
      <section className="bg-ih-bg px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
          {over(faqCopy, 'eyebrow', 'Questions we get asked')}
        </p>
        <h2 className="mb-8 mt-3.5 font-serif text-[30px] leading-[1.08] sm:text-[40px]">
          {over(faqCopy, 'heading', `Supplying ${market.name}, in detail`)}
        </h2>
        {/* Zero row gap on purpose — the top borders do the separating, and a
            gap would double the rule spacing between stacked items. */}
        <div className="grid grid-cols-1 gap-x-14 gap-y-0 lg:grid-cols-2">
          {page.faqs.map((faq, index) => (
            <div key={faq.question} className="border-t border-ih-border py-5">
              <div className="flex gap-3.5">
                <span className="mono pt-[3px] text-[10.5px] text-ih-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-[16px] font-medium leading-[1.35]">{faq.question}</h3>
                  <p className="mt-2 text-[13.5px] leading-[1.65] text-ih-muted">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    ),

    // 13. Lead form, end of page
    closing_form: (
      <section className="bg-ih-navy px-5 py-14 sm:px-8 lg:px-12 lg:py-[60px]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,470px)] lg:gap-14">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-steel">
            {over(closingCopy, 'eyebrow', 'Next step')}
          </p>
          <h2 className="mt-3.5 font-serif text-[32px] leading-[1.08] text-white sm:text-[42px]">
            {over(closingCopy, 'heading', `Shipping to ${market.name}?`)}
          </h2>
          <p className="mt-3.5 max-w-[620px] text-[15px] leading-[1.65] text-white/85">
            Send the part numbers, or the bore, thread and pressure if you do not have them. We
            quote from real stock, in {page.currency}, with the Incoterm stated rather than
            assumed.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {contact.whatsappUrl && (
              <Button asChild kind="onnavy" size="lg">
                <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  WhatsApp us
                </a>
              </Button>
            )}
            {contact.email && (
              <Button asChild kind="onnavy" size="lg">
                <a href={`mailto:${contact.email}?subject=${encodeURIComponent(`Export enquiry — ${market.name}`)}`}>
                  Email the export desk
                </a>
              </Button>
            )}
          </div>
          {contact.phone && (
            <p className="mono mt-6 text-[11px] uppercase tracking-[0.08em] text-white/70">
              Plant-down? Call{' '}
              <a href={`tel:${contact.phone}`} className="text-white hover:text-ih-steel">
                {contact.phone}
              </a>{' '}
              — 24/7
            </p>
          )}
        </div>

        <MarketQuickEnquiry
          marketSlug={market.slug}
          marketName={market.name}
          countryCode={market.countryCode}
          dialCode={page.dialCode}
          contactEmail={contact.email}
        />
      </div>
    </section>
    ),

    // 14. Market sitemap
    sitemap: (
      <section className="border-t border-ih-border bg-ih-surface px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
              {over(sitemapCopy, 'eyebrow', `Other export markets · ${destinations} destinations`)}
            </p>
            <h2 className="mt-3 font-serif text-[26px] leading-[1.12] sm:text-[32px]">
              {over(sitemapCopy, 'heading', `We run the same lane from Dubai to ${destinations - 1} other markets`)}
            </h2>
          </div>
          <Button asChild kind="ghost" size="sm">
            <Link href="/markets">
              All export markets <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>

        {/*
          Columns rather than a grid. The eleven regions run from six entries
          to twenty-one, and column flow balances them; a grid leaves one very
          long column beside four short ones.
        */}
        <div className="columns-1 gap-x-[26px] sm:columns-2 lg:columns-3 xl:columns-5">
          {MARKET_REGIONS.map(([region, countries]) => (
            <div key={region} className="mb-6 break-inside-avoid">
              <p className="mono border-b border-ih-border-strong pb-2 text-[9.5px] uppercase tracking-[0.13em] text-ih-muted">
                {region}
              </p>
              <div className="mt-1 flex flex-col">
                {countries.map((country) => {
                  if (country === market.name) {
                    return (
                      <span key={country} className="py-1 text-[12px] font-medium text-ih-accent">
                        {country} — this page
                      </span>
                    )
                  }
                  const slug = slugByName.get(country)
                  // Unreachable while the sync test passes; rendering the
                  // name unlinked beats rendering a 404 if it ever does not.
                  if (!slug) {
                    return (
                      <span key={country} className="py-1 text-[12px] text-ih-muted">
                        {country}
                      </span>
                    )
                  }
                  return (
                    <Link
                      key={country}
                      href={`/markets/${slug}`}
                      className="py-1 text-[12px] text-ih-ink-2 transition-colors hover:text-ih-accent"
                    >
                      {country}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      </section>
    ),
  }

  return (
    <div className="bg-ih-surface">
      {/* The breadcrumb is not a band. It is chrome the page is identified by,
          and there is no arrangement in which hiding it is right. */}
      <div className="border-b border-ih-border bg-ih-surface px-5 py-3 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <nav aria-label="Breadcrumb" className="mono flex items-center gap-2 text-[12px] text-ih-muted">
            <Link href="/" className="hover:text-ih-accent">
              Home
            </Link>
            <span aria-hidden="true" className="opacity-50">
              /
            </span>
            <Link href="/markets" className="hover:text-ih-accent">
              Export markets
            </Link>
            <span aria-hidden="true" className="opacity-50">
              /
            </span>
            <span className="text-ih-ink-2">{market.name}</span>
          </nav>
          <span className="flex items-center gap-2.5">
            <span className="mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted-2">
              Lane {page.lane}
            </span>
            {page.localName && (
              // Direction is tested on the string, never stored per market —
              // the same field carries Arabic, Amharic, Swahili and French
              // across the record set.
              <span dir={isRightToLeft(page.localName) ? 'rtl' : 'ltr'} className="text-[13px] text-ih-muted">
                {page.localName}
              </span>
            )}
          </span>
        </div>
      </div>

      {content.order.map((key) =>
        bands[key] ? <Fragment key={key}>{bands[key]}</Fragment> : null,
      )}

      {/*
        Build audit strip. Not customer furniture: it exists so a reviewer can
        see at a glance that a market page is fully wired — the schema it
        emits, the link counts, the gazetteer size. Rendered off production
        only; the flag is resolved by the route.
      */}
      {showAuditStrip && (
        <div className="border-t border-ih-border bg-ih-surface px-5 py-4 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-6">
            <span className="mono text-[10px] uppercase tracking-[0.08em] text-ih-muted-2">
              canonical /markets/{market.slug} · schema: breadcrumblist · faqpage ({page.faqs.length}) ·
              service
            </span>
            <span className="mono text-[10px] uppercase tracking-[0.08em] text-ih-muted-2">
              {clusters.reduce((n, c) => n + c.subRanges.length + 1, 0)} catalogue links ·{' '}
              {page.cities.length} locations · {destinations} markets
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
