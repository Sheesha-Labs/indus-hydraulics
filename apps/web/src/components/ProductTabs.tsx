'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { replacementUrlPath, type ProductAvailability, type VariantLike } from '@indus/domain'
import ProductSizeTable from './ProductSizeTable'

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
  variants: VariantLike[]
  /** Shown above the size table, e.g. "Parker 13943 / 1L943". */
  variantEquivalenceNote?: string | null
  /** Competitor named by the cross-references, for the not-affiliated line. */
  variantEquivalenceBrand?: string | null
  /** Whether the size table may offer the range in 316 stainless on request. */
  variantStainlessOnRequest?: boolean
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
  variants,
  variantEquivalenceNote,
  variantEquivalenceBrand,
  variantStainlessOnRequest,
  faqs,
  availability,
  warrantyMonths,
  countryOfOrigin,
  hsCode,
  weightKg,
}: Props) {
  const [active, setActive] = useState(0)

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
    compatibility: crossReferences.length > 0 || activeId === 'compatibility',
    faq: faqs.length > 0 || activeId === 'faq',
  }

  return (
    <div className="mb-8 border-t border-ih-border pt-8">
      {/* Tab headers */}
      {/*
        The tab labels are whitespace-nowrap and five of them do not fit a
        phone, so the strip scrolls INSIDE its own container. Without
        overflow-x-auto here the whole page scrolls sideways instead — it was
        pushing the document to 710px at a 375px viewport.
      */}
      <div className="mb-8 flex overflow-x-auto border-b border-ih-border">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActive(i)}
            className={`-mb-px whitespace-nowrap border-b-[1.5px] px-5 py-3 text-[13.5px] transition-colors ${
              i === active
                ? 'border-ih-accent text-ih-accent'
                : 'border-transparent text-ih-muted hover:text-ih-ink'
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
            <h2 className="mb-4 font-serif text-[26px] font-normal tracking-[-0.01em]">Product description</h2>
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
              <p className="text-[14px] text-ih-muted leading-[1.65] mb-4">{descriptionShort}</p>
            ) : (
              <p className="text-[14px] text-ih-muted">No description available.</p>
            )}

            {allSpecs.length > 0 && (
              <div className="mt-8">
                {Object.entries(specGroups).map(([group, specs]) => (
                  <div key={group} className="mb-6">
                    <h4 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-2">{group}</h4>
                    <table className="w-full font-mono text-[13px] border border-ih-border">
                      <thead>
                        <tr>
                          <th className="px-3.5 py-2.5 text-left bg-ih-surface-2 text-ih-muted text-[11px] tracking-[0.08em] uppercase font-medium w-1/2">Parameter</th>
                          <th className="px-3.5 py-2.5 text-left bg-ih-surface-2 text-ih-muted text-[11px] tracking-[0.08em] uppercase font-medium">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {specs.map((spec) => (
                          <tr key={spec.id} className="border-t border-ih-border">
                            <td className="px-3.5 py-2.5 text-ih-muted">{spec.label}</td>
                            <td className="px-3.5 py-2.5 font-medium text-ih-ink">
                              {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
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
            <h2 className="mb-4 font-serif text-[26px] font-normal tracking-[-0.01em]">Shipping &amp; lead time</h2>
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
            equivalenceNote={variantEquivalenceNote}
            equivalenceBrand={variantEquivalenceBrand}
            stainlessOnRequest={variantStainlessOnRequest}
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
            <p className="text-[14px] text-ih-muted">No documents available for this product.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-4 border border-ih-border bg-ih-surface">
                  <div className="w-9 h-11 bg-ih-bg border border-ih-border grid place-items-center font-mono text-[9px] font-semibold text-ih-accent shrink-0">
                    {doc.kind.toUpperCase().slice(0, 4)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium truncate">{doc.title}</div>
                    <div className="font-mono text-[11px] text-ih-muted mt-0.5">{doc.kind} · {doc.language.toUpperCase()}</div>
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
                    className="shrink-0 h-8 px-4 flex items-center border border-ih-border font-mono text-[11px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors"
                  >
                    {doc.isGated ? '🔒 Sign in to download' : '↓ Download'}
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
          {crossReferences.length === 0 ? (
            <p className="text-[14px] text-ih-muted">No cross-reference data available. Contact our team for compatibility assistance.</p>
          ) : (
            <div>
              <p className="text-[14px] text-ih-muted mb-6">The following competitor part numbers are compatible with or superseded by this SKU. Click through to the dedicated replacement page for each.</p>
              <div className="grid grid-cols-3 gap-2">
                {crossReferences.map((ref) => {
                  const href = replacementUrlPath(ref.competitorBrand, ref.competitorMpn)
                  const inner = (
                    <>
                      <div className="text-ih-muted text-[10px] uppercase tracking-[0.08em] mb-0.5">{ref.competitorBrand}</div>
                      <div className="text-ih-ink font-medium text-[13px]">{ref.competitorMpn}</div>
                      {ref.compatibility && (
                        <div className="text-ih-muted text-[10px] mt-1">{ref.compatibility}</div>
                      )}
                      {href && (
                        <div className="font-mono text-[10px] text-ih-accent mt-1.5">View replacement →</div>
                      )}
                    </>
                  )
                  return href ? (
                    <Link
                      key={ref.id}
                      href={href}
                      className="block px-4 py-3 border border-ih-border bg-ih-surface font-mono text-[12px] hover:border-ih-accent transition-colors"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={ref.id} className="px-4 py-3 border border-ih-border bg-ih-surface font-mono text-[12px]">
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
            <p className="text-[14px] text-ih-muted">
              No FAQs for this product yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {faqs.map((f) => (
                <details
                  key={f.id}
                  className="group border border-ih-border bg-ih-surface [&[open]>summary>span:last-child]:rotate-180"
                >
                  <summary className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer text-[14px] font-medium text-ih-ink list-none [&::-webkit-details-marker]:hidden hover:bg-ih-surface-2 transition-colors">
                    <span>{f.question}</span>
                    <span className="font-mono text-[14px] text-ih-muted transition-transform shrink-0">▾</span>
                  </summary>
                  <div className="px-5 pb-5 pt-1 text-[14px] text-ih-ink-2 leading-[1.6] whitespace-pre-wrap border-t border-ih-border">
                    {f.answer}
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
    <div className="border border-ih-border bg-ih-surface p-6 flex flex-col gap-4">
      {rows.map((row) => (
        <div
          key={row.lbl}
          className="grid gap-4 pb-4 border-b border-ih-border last:pb-0 last:border-0"
          style={{ gridTemplateColumns: '110px 1fr' }}
        >
          <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-ih-muted pt-0.5">
            {row.lbl}
          </span>
          <span className="text-[14px] text-ih-ink-2 leading-[1.5]">{row.val}</span>
        </div>
      ))}
    </div>
  )
}

