'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  competitorBrandSlug,
  documentKindBadge,
  documentKindLabel,
  parseFaqAnswer,
  replacementUrlPath,
  type ProductAvailability,
  type VariantLike,
} from '@indus/domain'
import ProductSizeTable, { type SizeEquivalents } from './ProductSizeTable'

type Spec = {
  id: string
  label: string
  value: string
  unit?: string | null
  group?: string | null
  isFilterable: boolean
}

type Doc = {
  id: string
  title: string
  kind: string
  language: string
  isGated: boolean
  mediaUrl?: string
}

type CrossRef = {
  id: string
  competitorBrand: string
  competitorMpn: string
  compatibility?: string | null
}

type SeriesSummary = {
  brand: string
  series: string[]
  sizes: number
  /** SAE / MS codes: printed, but there is no replacement hub to link to. */
  isStandard: boolean
}

type Faq = {
  id: string
  question: string
  answer: string
}

type Props = {
  sku: string
  productId: string
  descriptionShort?: string | null
  descriptionLong?: string | null
  specGroups: Record<string, Spec[]>
  documents: Doc[]
  crossReferences: CrossRef[]
  /** Competitor series matched size by size, per brand. */
  seriesSummaries?: SeriesSummary[]
  variants: VariantLike[]
  /** Per-size competitor numbers for the size table's equivalent columns. */
  variantEquivalents?: SizeEquivalents | null
  /** Shown above the size table, e.g. "Parker 13943 / 1L943". */
  variantEquivalenceNote?: string | null
  /** Competitor named by the cross-references, for the not-affiliated line. */
  variantEquivalenceBrand?: string | null
  /** Whether the size table may offer the range in 316 stainless on request. */
  variantStainlessOnRequest?: boolean
  /** Heading of the size table's part-number column: Indus's, or the maker's on a branded listing. */
  variantPartNumberHeading?: string
  faqs: Faq[]
  availability: ProductAvailability
  warrantyMonths?: number | null
  countryOfOrigin?: string | null
  hsCode?: string | null
  weightKg?: number | null
}

export default function ProductTabs({
  descriptionShort,
  descriptionLong,
  specGroups,
  documents,
  crossReferences,
  seriesSummaries = [],
  variants,
  variantEquivalents,
  variantEquivalenceNote,
  variantEquivalenceBrand,
  variantStainlessOnRequest,
  variantPartNumberHeading,
  faqs,
  availability,
  warrantyMonths,
  countryOfOrigin,
  hsCode,
  weightKg,
}: Props) {
  const [active, setActive] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)
  /** Where the strip sat on screen when a tab was tapped, to hold it there. */
  const anchorTop = useRef<number | null>(null)

  /*
    Switching panels changes the page height under the reader's thumb, and on a
    phone that read as the tab bar "jumping" (owner report, 2026-11-19). Before
    paint, put the strip back where it was on screen, then scroll the chosen
    tab fully into the strip — sideways only, so the page never moves twice.
  */
  useLayoutEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    if (anchorTop.current !== null) {
      const drift = strip.getBoundingClientRect().top - anchorTop.current
      if (Math.abs(drift) > 1)
        window.scrollBy({ top: drift, behavior: 'instant' as ScrollBehavior })
      anchorTop.current = null
    }
    const btn = strip.querySelector<HTMLElement>('[aria-selected="true"]')
    if (btn) {
      const left = btn.offsetLeft - strip.offsetLeft
      const right = left + btn.offsetWidth
      if (left < strip.scrollLeft) strip.scrollTo({ left: left - 8, behavior: 'smooth' })
      else if (right > strip.scrollLeft + strip.clientWidth)
        strip.scrollTo({ left: right - strip.clientWidth + 8, behavior: 'smooth' })
    }
  }, [active])

  function choose(i: number) {
    anchorTop.current = stripRef.current?.getBoundingClientRect().top ?? null
    setActive(i)
  }

  const allSpecs = Object.values(specGroups).flat()
  /*
    Keyed rather than positional. The sizes tab only exists for products that
    have a size table, so `active === 3` no longer names one panel — every
    index below it would shift under a product without variants.
  */
  const tabs = [
    { id: 'description', label: 'Description' },
    ...(variants.length > 0
      ? [{ id: 'sizes' as const, label: `Sizes & Part Numbers (${variants.length})` }]
      : []),
    { id: 'shipping', label: 'Shipping & Lead Time' },
    { id: 'documents', label: `Documents${documents.length > 0 ? ` (${documents.length})` : ''}` },
    { id: 'compatibility', label: 'Compatibility' },
    { id: 'faq', label: `FAQ${faqs.length > 0 ? ` (${faqs.length})` : ''}` },
  ]
  const activeId = tabs[Math.min(active, tabs.length - 1)]?.id ?? 'description'
  /*
    Which panels are in the HTML, not just which one is visible — 2026-09-26.

    Every panel used to be `activeId === 'x' && (…)`, so the server HTML held
    the Description panel and nothing else. A crawler renders the page it is
    given and does not click tabs, so the size table (part numbers, ratings,
    dimensions), the FAQ and the competitor cross-references were never seen by
    Google on any product page. The FAQPage JSON-LD also described questions
    that were not on the page, which Google's structured-data rules do not
    allow. A panel with content is now always rendered and hidden when
    inactive; Google indexes tab content that is in the DOM.

    An EMPTY panel ("No FAQs for this product yet") still renders only when it
    is opened, so that boilerplate is not indexed on every page that lacks it.
    The Shipping tab repeats the Description panel's shipping column, so it
    stays on-demand as well: the same table twice is duplication, not content.
  */
  const inHtml = {
    documents: documents.length > 0 || activeId === 'documents',
    compatibility:
      crossReferences.length > 0 || seriesSummaries.length > 0 || activeId === 'compatibility',
    faq: faqs.length > 0 || activeId === 'faq',
  }

  return (
    <div className="border-ih-border mb-8 border-t pt-8">
      {/* Tab headers */}
      {/*
        The tab labels are whitespace-nowrap and five of them do not fit a
        phone, so the strip scrolls INSIDE its own container. Without
        overflow-x-auto here the whole page scrolls sideways instead — it was
        pushing the document to 710px at a 375px viewport.
      */}
      {/*
        overscroll-x-none: no rubber-band, so the strip cannot be dragged out
        past its first or last tab and spring back (the "jiggle"), and a swipe
        that ends at an edge does not hand off to the page. Snap stops a fling
        on a whole tab. Scrollbar hidden: the cut-off last label is the cue.
      */}
      <div
        ref={stripRef}
        role="tablist"
        aria-label="Product information"
        className="no-scrollbar border-ih-border mb-8 flex snap-x snap-proximity overflow-x-auto overscroll-x-none border-b"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`tab-panel-${tab.id}`}
            onClick={() => choose(i)}
            className={`-mb-px shrink-0 snap-start border-b-[1.5px] px-4 py-3 text-[13.5px] whitespace-nowrap transition-colors sm:px-5 ${
              i === active
                ? 'border-ih-accent text-ih-accent'
                : 'text-ih-muted hover:text-ih-ink border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <TabPanel id="description" activeId={activeId}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="mb-4 font-serif text-[26px] font-normal tracking-[-0.01em]">
              Product description
            </h2>
            {descriptionLong ? (
              /*
                `ih-rich-text` (globals.css), not `prose`. @tailwindcss/typography
                is not installed and globals.css declares no `@plugin`, so every
                `prose*` class here compiled to nothing while preflight still
                stripped heading sizes and list markers — headings, bullets and
                tables in stored product HTML all rendered as flat body text.
              */
              <div
                className="ih-rich-text max-w-none"
                dangerouslySetInnerHTML={{ __html: descriptionLong }}
              />
            ) : descriptionShort ? (
              <p className="text-ih-muted mb-4 text-[14px] leading-[1.65]">{descriptionShort}</p>
            ) : (
              <p className="text-ih-muted text-[14px]">No description available.</p>
            )}

            {allSpecs.length > 0 && (
              <div className="mt-8">
                {Object.entries(specGroups).map(([group, specs]) => (
                  <div key={group} className="mb-6">
                    <h4 className="text-ih-muted mb-2 font-mono text-[10.5px] font-medium tracking-[0.13em] uppercase">
                      {group}
                    </h4>
                    <table className="border-ih-border w-full border font-mono text-[13px]">
                      <thead>
                        <tr>
                          <th className="bg-ih-surface-2 text-ih-muted w-1/2 px-3.5 py-2.5 text-left text-[11px] font-medium tracking-[0.08em] uppercase">
                            Parameter
                          </th>
                          <th className="bg-ih-surface-2 text-ih-muted px-3.5 py-2.5 text-left text-[11px] font-medium tracking-[0.08em] uppercase">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {specs.map((spec) => (
                          <tr key={spec.id} className="border-ih-border border-t">
                            <td className="text-ih-muted px-3.5 py-2.5">{spec.label}</td>
                            <td className="text-ih-ink px-3.5 py-2.5 font-medium">
                              {spec.value}
                              {spec.unit ? ` ${spec.unit}` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping column — driven entirely by product DB fields */}
          <div>
            <h2 className="mb-4 font-serif text-[26px] font-normal tracking-[-0.01em]">
              Shipping &amp; lead time
            </h2>
            <ShippingTable
              availability={availability}
              warrantyMonths={warrantyMonths}
              countryOfOrigin={countryOfOrigin}
              hsCode={hsCode}
              weightKg={weightKg}
            />
          </div>
        </div>
      </TabPanel>

      {/* Sizes & part numbers — the orderable variants under this listing */}
      {variants.length > 0 && (
        <TabPanel id="sizes" activeId={activeId}>
          <ProductSizeTable
            variants={variants}
            equivalents={variantEquivalents}
            equivalenceNote={variantEquivalenceNote}
            equivalenceBrand={variantEquivalenceBrand}
            stainlessOnRequest={variantStainlessOnRequest}
            partNumberHeading={variantPartNumberHeading}
          />
        </TabPanel>
      )}

      {/* Shipping & Lead Time — driven entirely by product DB fields */}
      {activeId === 'shipping' && (
        <div className="max-w-[680px]">
          <ShippingTable
            availability={availability}
            warrantyMonths={warrantyMonths}
            countryOfOrigin={countryOfOrigin}
            hsCode={hsCode}
            weightKg={weightKg}
          />
        </div>
      )}

      {/* Documents */}
      {inHtml.documents && (
        <TabPanel id="documents" activeId={activeId}>
          {documents.length === 0 ? (
            <p className="text-ih-muted text-[14px]">No documents available for this product.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border-ih-border bg-ih-surface flex items-center gap-4 border p-4"
                >
                  <div className="bg-ih-bg border-ih-border text-ih-accent grid h-11 w-9 shrink-0 place-items-center border font-mono text-[9px] font-semibold">
                    {documentKindBadge(doc.kind)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium">{doc.title}</div>
                    <div className="text-ih-muted mt-0.5 font-mono text-[11px]">
                      {documentKindLabel(doc.kind)} · {doc.language.toUpperCase()}
                    </div>
                  </div>
                  {/*
                    Always a link. /api/documents/<id> checks the session at
                    request time and sends anonymous visitors to sign-in, so
                    this component no longer needs to know who is looking —
                    which is what keeps the PDP statically renderable.
                  */}
                  <a
                    href={doc.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 flex h-8 shrink-0 items-center border px-4 font-mono text-[11px] transition-colors"
                  >
                    {doc.isGated ? '🔒 On request' : '↓ Download'}
                  </a>
                </div>
              ))}
            </div>
          )}
        </TabPanel>
      )}

      {/* Compatibility */}
      {inHtml.compatibility && (
        <TabPanel id="compatibility" activeId={activeId}>
          {seriesSummaries.length > 0 && (
            <div className="mb-8">
              <p className="text-ih-muted mb-4 text-[14px]">
                This listing is matched size by size to the series below. The size table gives the
                exact equivalent part number for every Indus part number.
              </p>
              <div className="border-ih-border overflow-x-auto border">
                <table className="w-full min-w-[520px] font-mono text-[12.5px]">
                  <thead>
                    <tr className="bg-ih-surface-2 text-ih-muted text-[11px] tracking-[0.08em] uppercase">
                      <th scope="col" className="px-3.5 py-2.5 text-left font-medium">
                        Maker / standard
                      </th>
                      <th scope="col" className="px-3.5 py-2.5 text-left font-medium">
                        Series
                      </th>
                      <th scope="col" className="px-3.5 py-2.5 text-right font-medium">
                        Sizes matched
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {seriesSummaries.map((s) => (
                      <tr key={s.brand} className="border-ih-border border-t">
                        <th scope="row" className="text-ih-ink px-3.5 py-2.5 text-left font-medium">
                          {s.isStandard ? (
                            s.brand
                          ) : (
                            <Link
                              href={`/replacement/${competitorBrandSlug(s.brand)}`}
                              className="hover:text-ih-accent"
                            >
                              {s.brand}
                            </Link>
                          )}
                        </th>
                        <td className="text-ih-ink-2 px-3.5 py-2.5">{s.series.join(', ')}</td>
                        <td className="text-ih-ink-2 px-3.5 py-2.5 text-right">{s.sizes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {crossReferences.length === 0 &&
          seriesSummaries.length > 0 ? null : crossReferences.length === 0 ? (
            <p className="text-ih-muted text-[14px]">
              No cross-reference data available. Contact our team for compatibility assistance.
            </p>
          ) : (
            <div>
              <p className="text-ih-muted mb-6 text-[14px]">
                The following competitor part numbers are compatible with or superseded by this SKU.
                Click through to the dedicated replacement page for each.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {crossReferences.map((ref) => {
                  const href = replacementUrlPath(ref.competitorBrand, ref.competitorMpn)
                  const inner = (
                    <>
                      <div className="text-ih-muted mb-0.5 text-[10px] tracking-[0.08em] uppercase">
                        {ref.competitorBrand}
                      </div>
                      <div className="text-ih-ink text-[13px] font-medium">{ref.competitorMpn}</div>
                      {ref.compatibility && (
                        <div className="text-ih-muted mt-1 text-[10px]">{ref.compatibility}</div>
                      )}
                      {href && (
                        <div className="text-ih-accent mt-1.5 font-mono text-[10px]">
                          View replacement →
                        </div>
                      )}
                    </>
                  )
                  return href ? (
                    <Link
                      key={ref.id}
                      href={href}
                      className="border-ih-border bg-ih-surface hover:border-ih-accent block border px-4 py-3 font-mono text-[12px] transition-colors"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      key={ref.id}
                      className="border-ih-border bg-ih-surface border px-4 py-3 font-mono text-[12px]"
                    >
                      {inner}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </TabPanel>
      )}

      {/* FAQ */}
      {inHtml.faq && (
        <TabPanel id="faq" activeId={activeId} className="max-w-[820px]">
          {faqs.length === 0 ? (
            <p className="text-ih-muted text-[14px]">No FAQs for this product yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {faqs.map((f) => (
                <details
                  key={f.id}
                  className="group border-ih-border bg-ih-surface border [&[open]>summary>span:last-child]:rotate-180"
                >
                  <summary className="text-ih-ink hover:bg-ih-surface-2 flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[14px] font-medium transition-colors [&::-webkit-details-marker]:hidden">
                    <span>{f.question}</span>
                    <span className="text-ih-muted shrink-0 font-mono text-[14px] transition-transform">
                      ▾
                    </span>
                  </summary>
                  <div className="text-ih-ink-2 border-ih-border border-t px-5 pt-1 pb-5 text-[14px] leading-[1.6] whitespace-pre-wrap">
                    {parseFaqAnswer(f.answer).map((seg, i) =>
                      seg.kind === 'link' ? (
                        <Link
                          key={i}
                          href={seg.href}
                          className="text-ih-accent hover:text-ih-accent-hover underline underline-offset-2"
                        >
                          {seg.text}
                        </Link>
                      ) : (
                        seg.text
                      )
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </TabPanel>
      )}
    </div>
  )
}

/**
 * One tab's content, present in the HTML whether or not it is the open tab.
 *
 * `hidden` rather than a class: it takes the panel out of layout and out of
 * the accessibility tree, and it sits on this plain wrapper so a panel's own
 * `grid` or `flex` display can never override it.
 */
function TabPanel({
  id,
  activeId,
  className,
  children,
}: {
  id: string
  activeId: string
  className?: string
  children: ReactNode
}) {
  return (
    <div role="tabpanel" id={`tab-panel-${id}`} hidden={id !== activeId} className={className}>
      {children}
    </div>
  )
}

function ShippingTable({
  availability,
  warrantyMonths,
  countryOfOrigin,
  hsCode,
  weightKg,
}: {
  availability: ProductAvailability
  warrantyMonths?: number | null
  countryOfOrigin?: string | null
  hsCode?: string | null
  weightKg?: number | null
}) {
  const rows: Array<{ lbl: string; val: string }> = []

  // The same resolved availability the pill above shows. Reading `leadTimeDays`
  // here instead is how this row came to say "dispatched within 14 working
  // days" under a pill claiming ex-stock.
  rows.push({ lbl: 'Lead Time', val: availability.deliveryNote })
  if (countryOfOrigin) rows.push({ lbl: 'Origin', val: `Made in ${countryOfOrigin}` })
  if (hsCode) rows.push({ lbl: 'HS Code', val: hsCode })
  if (weightKg) rows.push({ lbl: 'Weight', val: `${weightKg} kg` })
  if (warrantyMonths) {
    rows.push({
      lbl: 'Warranty',
      val: `${warrantyMonths} month${warrantyMonths === 1 ? '' : 's'} from invoice date — manufacturer-backed.`,
    })
  }

  return (
    <div className="border-ih-border bg-ih-surface flex flex-col gap-4 border p-6">
      {rows.map((row) => (
        <div
          key={row.lbl}
          className="border-ih-border grid gap-4 border-b pb-4 last:border-0 last:pb-0"
          style={{ gridTemplateColumns: '110px 1fr' }}
        >
          <span className="text-ih-muted pt-0.5 font-mono text-[11px] tracking-[0.08em] uppercase">
            {row.lbl}
          </span>
          <span className="text-ih-ink-2 text-[14px] leading-[1.5]">{row.val}</span>
        </div>
      ))}
    </div>
  )
}
