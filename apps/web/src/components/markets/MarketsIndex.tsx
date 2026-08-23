import Link from 'next/link'
import { Button } from '@indus/ui'
import type { MarketIndexRegion } from '@indus/domain'
import type { MarketThumbnail } from '../../lib/market-thumbnails'
import MarketDestinationCard from './MarketDestinationCard'
import MarketsIndexEnquiry from './MarketsIndexEnquiry'
import MarketsIndexToolbar from './MarketsIndexToolbar'

/**
 * The designed `/markets` hub.
 *
 * Its three jobs, in the order they earn their keep:
 *
 *   1. HUB FOR 126 MARKET PAGES. The reciprocal link between this page and
 *      each `/markets/{slug}` is the backbone of the whole markets section —
 *      every market page links back here from its sitemap block, and every new
 *      market gains 125 inbound links by existing. Nothing on this page is
 *      allowed to break that: every card is a link, at every viewport, in the
 *      server-rendered HTML.
 *   2. HONEST COVERAGE STATEMENT. Every destination, with a published transit
 *      band where there is one and "Quoted per consignment" where there is
 *      not. The page this replaces named five markets in its closing copy
 *      while linking 126 — the contradiction is what made a buyer read the
 *      other 121 cards as aspirational. EVERY NUMBER ON THE PAGE IS DERIVED;
 *      see `markets-index.ts`. That includes this docblock: it deliberately
 *      states no counts, because a comment drifts as silently as copy does.
 *   3. LEAD CAPTURE for destinations that are not on the list at all.
 *
 * A server component throughout. The only client boundaries are the toolbar
 * and the closing form; the 126 silhouettes are finished SVG path strings by
 * the time they reach the browser.
 *
 * HEADING TREE: one H1 ("Export markets"), then twelve H2s — one per region
 * plus the closing band. Country names are LINK TEXT, not headings. Promoting
 * them would hang 126 H3s off the outline and destroy it.
 */
/**
 * Copy for the four editable bands, from Pages & Blocks · Export markets.
 *
 * Passed in rather than read here: this is a shared presentational component
 * and the page is the only node that knows which document it is rendering.
 * Every field is nullable, and every use falls back to what the page shipped
 * with, so a blanked field is a hidden element rather than a hole.
 */
export type MarketsIndexCopy = {
  hero: {
    eyebrow: string | null
    heading: string | null
    body: string | null
    primaryCtaLabel: string | null
    whatsappCtaLabel: string | null
    tiles: { label: string; value: string }[]
  }
  manifest: { label: string; value: string }[]
  cta: {
    eyebrow: string | null
    heading: string | null
    body: string | null
    whatsappCtaLabel: string | null
    emailCtaLabel: string | null
    phonePrefix: string | null
    phoneSuffix: string | null
  }
  /** Section keys that are switched on, in the editor's order. */
  order: string[]
}

export default function MarketsIndex({
  regions,
  thumbnails,
  totals,
  destinationNames,
  contact,
  showAuditStrip,
  copy,
}: {
  regions: readonly MarketIndexRegion[]
  /** Keyed by market slug. Null for a country Natural Earth cannot match. */
  thumbnails: ReadonlyMap<string, MarketThumbnail | null>
  totals: { destinations: number; regions: number; withStatedTransit: number }
  destinationNames: readonly string[]
  contact: { phone: string | null; email: string | null; hours: string | null; whatsappUrl: string | null }
  /** The build-time audit strip. Staging only — see the gate at the call site. */
  showAuditStrip: boolean
  copy: MarketsIndexCopy
}) {
  const manifest = copy.manifest
  const tiles = copy.hero.tiles
  const on = (key: string) => copy.order.includes(key)

  return (
    <div className="bg-ih-surface">
      {/* ── Breadcrumb strip ── */}
      <div className="border-b border-ih-border bg-ih-surface px-5 py-3 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <nav aria-label="Breadcrumb" className="mono flex items-center gap-2 text-[12px] text-ih-muted">
            <Link href="/" className="hover:text-ih-accent">
              Home
            </Link>
            <span aria-hidden="true" className="opacity-50">
              /
            </span>
            <span className="text-ih-ink-2">Export markets</span>
          </nav>
          <span className="mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted-2">
            {totals.destinations} destinations · {totals.regions} regions
          </span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="border-b border-ih-border bg-ih-surface px-5 pb-12 pt-10 sm:px-8 lg:px-12 lg:pb-14 lg:pt-14">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
              {copy.hero.eyebrow}
            </p>
            {/* Deliberately short. The H1 on a hub page should not compete with
                the 126 country names below it. */}
            <h1 className="mt-[18px] font-serif text-[38px] leading-[1.02] tracking-[-0.01em] sm:text-[48px] lg:text-[62px] lg:leading-none">
              {copy.hero.heading}
            </h1>
            <p className="mt-5 max-w-[680px] text-pretty text-[16px] leading-[1.6] text-ih-ink-2">
              {copy.hero.body}
            </p>

            <div className="mt-[26px] flex flex-wrap gap-2.5">
              {copy.hero.primaryCtaLabel && (
                <Button asChild kind="primary" size="lg">
                  {/* An in-page jump, not a navigation — the form is already on
                      this page and the reader keeps their place. */}
                  <a href="#enquiry">
                    {copy.hero.primaryCtaLabel} <span aria-hidden="true">→</span>
                  </a>
                </Button>
              )}
              {contact.whatsappUrl && copy.hero.whatsappCtaLabel && (
                <Button asChild kind="outline" size="lg">
                  <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    {copy.hero.whatsappCtaLabel}
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* The 1px gap over the border colour IS the divider — there are no
              internal rules in this grid. */}
          {tiles.length > 0 && (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ih-border bg-ih-border">
              {tiles.map((tile) => (
                <div key={tile.label} className="bg-ih-surface px-5 pb-5 pt-[18px]">
                  <dt className="mono text-[9.5px] uppercase tracking-[0.13em] text-ih-muted">
                    {tile.label}
                  </dt>
                  {/* A count and a place name are different kinds of fact, so
                      they are set in different faces: tabular numerals for the
                      first, the display serif for the second. The test is what
                      the value IS after the live counts are substituted, not
                      what the editor typed. */}
                  {/^\d[\d,]*$/.test(tile.value) ? (
                    <dd className="m-0 mt-1.5 text-[30px] font-medium tabular-nums leading-none tracking-[-0.025em]">
                      {tile.value}
                    </dd>
                  ) : (
                    <dd className="m-0 mt-1.5 font-serif text-[24px] leading-none tracking-[-0.025em]">
                      {tile.value}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ── Manifest strip ── */}
      {on('manifest') && manifest.length > 0 && (
        <div className="bg-ih-navy px-5 sm:px-8 lg:px-12">
          <dl className="mx-auto grid max-w-[1440px] grid-cols-2 gap-px bg-white/15 sm:grid-cols-3 lg:grid-cols-6">
            {manifest.map((fact) => (
              <div key={fact.label} className="bg-ih-navy px-5 pb-6 pt-[22px]">
                <dt className="mono text-[9px] uppercase tracking-[0.16em] text-ih-steel">
                  {fact.label}
                </dt>
                <dd className="mono m-0 mt-2 text-[14px] leading-[1.35] tracking-[-0.01em] text-white">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <MarketsIndexToolbar
        regions={regions.map((region) => ({
          name: region.name,
          anchor: region.anchor,
          count: region.cards.length,
          haystacks: region.cards.map((card) => card.search),
        }))}
      />

      {/* ── Eleven regional sections ── */}
      {regions.map((region, index) => (
        <section
          key={region.anchor}
          id={`region-${region.anchor}`}
          aria-labelledby={`region-${region.anchor}-heading`}
          /*
            Alternating ground, and it is not decoration: eleven sections of
            cards run to roughly 7,300px, and without the alternation the whole
            thing reads as one undifferentiated wall.

            scroll-mt clears the sticky header (107px), plus the toolbar where
            it is also sticky, so a jump-nav link lands on the heading rather
            than under it. Below `sm` only the header sticks.
          */
          className={`scroll-mt-[120px] border-t border-ih-border px-5 pb-14 pt-12 sm:scroll-mt-[168px] sm:px-8 lg:px-12 lg:pb-[60px] lg:pt-14 ${
            index % 2 ? 'bg-ih-surface' : 'bg-ih-bg'
          }`}
        >
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-7 grid grid-cols-1 items-end gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-14">
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
                  {region.index} · {region.cards.length} destinations ·{' '}
                  {region.withStatedTransit > 0
                    ? `${region.withStatedTransit} with a stated transit band`
                    : 'quoted per consignment'}
                </p>
                <h2
                  id={`region-${region.anchor}-heading`}
                  className="mt-3 font-serif text-[28px] leading-[1.1] tracking-[-0.01em] sm:text-[34px]"
                >
                  {region.name}
                </h2>
              </div>
              {/* The line that makes this page worth reading rather than
                  scanning — a card grid cannot say that Egypt needs no canal
                  transit. */}
              <p className="text-[13.5px] leading-[1.6] text-ih-muted">{region.note}</p>
            </div>

            {/*
              minmax(0,1fr) rather than 1fr on every breakpoint. A bare `1fr`
              track floors at min-content, and one long country name would push
              the whole grid wider than its container — which is how the
              standards table on the market page put a scrollbar on the entire
              document.
            */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-[repeat(6,minmax(0,1fr))]">
              {region.cards.map((card) => (
                <MarketDestinationCard
                  key={card.slug}
                  card={card}
                  thumbnail={thumbnails.get(card.slug) ?? null}
                />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── Closing CTA + enquiry ── */}
      <section id="enquiry" className="scroll-mt-[120px] bg-ih-navy px-5 py-14 sm:px-8 lg:px-12 lg:py-[60px]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,470px)] lg:gap-14">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-steel">
              {copy.cta.eyebrow}
            </p>
            <h2 className="mt-3.5 font-serif text-[32px] leading-[1.05] tracking-[-0.01em] text-white sm:text-[42px]">
              {copy.cta.heading}
            </h2>
            {/*
              The second sentence of the body is the compliance line, and it
              belongs here rather than on the cards. An earlier design badged
              individual markets as screened; that read as a political
              statement about those countries. Said once, in the register of
              how we quote, it is a statement about our process. Keep it.
            */}
            <p className="mt-3.5 max-w-[620px] text-[15px] leading-[1.65] text-[oklch(0.84_0.02_250)]">
              {copy.cta.body}
            </p>

            <div className="mt-[26px] flex flex-wrap gap-2.5">
              {contact.whatsappUrl && copy.cta.whatsappCtaLabel && (
                <Button asChild kind="onnavy" size="lg">
                  <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    {copy.cta.whatsappCtaLabel}
                  </a>
                </Button>
              )}
              {contact.email && copy.cta.emailCtaLabel && (
                <Button asChild kind="onnavy" size="lg">
                  <a href={`mailto:${contact.email}?subject=${encodeURIComponent('Export enquiry')}`}>
                    {copy.cta.emailCtaLabel}
                  </a>
                </Button>
              )}
            </div>

            {contact.phone && copy.cta.phonePrefix && (
              <p className="mono mt-[26px] text-[11px] uppercase tracking-[0.08em] text-[oklch(0.75_0.03_250)]">
                {copy.cta.phonePrefix}{' '}
                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="underline underline-offset-4">
                  {contact.phone}
                </a>
                {copy.cta.phoneSuffix ? ` ${copy.cta.phoneSuffix}` : null}
              </p>
            )}
          </div>

          <MarketsIndexEnquiry destinations={destinationNames} contactEmail={contact.email} />
        </div>
      </section>

      {/*
        Reviewer's aid, not customer furniture. Gated on VERCEL_ENV rather than
        NODE_ENV at the call site — a Vercel preview build runs with
        NODE_ENV=production, which would hide the strip on exactly the deploy
        where someone is reviewing this page.
      */}
      {showAuditStrip && (
        <div className="flex flex-wrap justify-between gap-6 border-t border-ih-border bg-ih-surface px-5 py-4 sm:px-8 lg:px-12">
          <span className="mono text-[10px] uppercase tracking-[0.08em] text-ih-muted-2">
            Canonical /markets · schema: BreadcrumbList · ItemList ({totals.destinations}) · Service
          </span>
          <span className="mono text-[10px] uppercase tracking-[0.08em] text-ih-muted-2">
            {totals.destinations} destinations · {totals.destinations} pages live ·{' '}
            {totals.withStatedTransit} with a stated band
          </span>
        </div>
      )}
    </div>
  )
}
