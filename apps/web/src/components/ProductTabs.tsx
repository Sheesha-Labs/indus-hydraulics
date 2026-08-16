'use client'

import { useState } from 'react'
import Link from 'next/link'
import { replacementUrlPath } from '@indus/domain'

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
  faqs: Faq[]
  isSignedIn: boolean
  leadTimeDays?: number | null
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
  faqs,
  isSignedIn,
  leadTimeDays,
  warrantyMonths,
  countryOfOrigin,
  hsCode,
  weightKg,
}: Props) {
  const [active, setActive] = useState(0)

  const allSpecs = Object.values(specGroups).flat()
  const tabs = [
    { label: 'Description' },
    { label: 'Shipping & Lead Time' },
    { label: `Documents${documents.length > 0 ? ` (${documents.length})` : ''}` },
    { label: 'Compatibility' },
    { label: `FAQ${faqs.length > 0 ? ` (${faqs.length})` : ''}` },
  ]

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
            key={tab.label}
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
      {active === 0 && (
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="mb-4 font-serif text-[26px] font-normal tracking-[-0.01em]">Product description</h2>
            {descriptionLong ? (
              <div
                className="prose prose-sm max-w-none text-[var(--color-body)] leading-[1.65] prose-headings:text-[var(--color-primary)] prose-headings:font-semibold"
                dangerouslySetInnerHTML={{ __html: descriptionLong }}
              />
            ) : descriptionShort ? (
              <p className="text-[14px] text-[var(--color-muted)] leading-[1.65] mb-4">{descriptionShort}</p>
            ) : (
              <p className="text-[14px] text-[var(--color-muted)]">No description available.</p>
            )}

            {allSpecs.length > 0 && (
              <div className="mt-8">
                {Object.entries(specGroups).map(([group, specs]) => (
                  <div key={group} className="mb-6">
                    <h4 className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-2">{group}</h4>
                    <table className="w-full font-mono text-[13px] border border-[var(--color-border)]">
                      <thead>
                        <tr>
                          <th className="px-3.5 py-2.5 text-left bg-[var(--color-deep)] text-[var(--color-muted)] text-[11px] tracking-[0.08em] uppercase font-medium w-1/2">Parameter</th>
                          <th className="px-3.5 py-2.5 text-left bg-[var(--color-deep)] text-[var(--color-muted)] text-[11px] tracking-[0.08em] uppercase font-medium">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {specs.map((spec) => (
                          <tr key={spec.id} className="border-t border-[var(--color-border-2)]">
                            <td className="px-3.5 py-2.5 text-[var(--color-muted)]">{spec.label}</td>
                            <td className="px-3.5 py-2.5 font-medium text-[var(--color-primary)]">
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
              leadTimeDays={leadTimeDays}
              warrantyMonths={warrantyMonths}
              countryOfOrigin={countryOfOrigin}
              hsCode={hsCode}
              weightKg={weightKg}
            />
          </div>
        </div>
      )}

      {/* Shipping & Lead Time — driven entirely by product DB fields */}
      {active === 1 && (
        <div className="max-w-[680px]">
          <ShippingTable
            leadTimeDays={leadTimeDays}
            warrantyMonths={warrantyMonths}
            countryOfOrigin={countryOfOrigin}
            hsCode={hsCode}
            weightKg={weightKg}
          />
        </div>
      )}

      {/* Documents */}
      {active === 2 && (
        <div>
          {documents.length === 0 ? (
            <p className="text-[14px] text-[var(--color-muted)]">No documents available for this product.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-4 border border-[var(--color-border)] bg-[var(--color-elevated)]">
                  <div className="w-9 h-11 bg-[var(--color-surface)] border border-[var(--color-border)] grid place-items-center font-mono text-[9px] font-semibold text-[var(--color-accent)] shrink-0">
                    {doc.kind.toUpperCase().slice(0, 4)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium truncate">{doc.title}</div>
                    <div className="font-mono text-[11px] text-[var(--color-muted)] mt-0.5">{doc.kind} · {doc.language.toUpperCase()}</div>
                  </div>
                  {doc.isGated && !isSignedIn ? (
                    <Link href={`/sign-in`} className="shrink-0 h-8 px-4 flex items-center border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors">
                      Sign in to download →
                    </Link>
                  ) : doc.mediaUrl ? (
                    <a
                      href={doc.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 h-8 px-4 flex items-center border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
                    >
                      ↓ Download
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compatibility */}
      {active === 3 && (
        <div>
          {crossReferences.length === 0 ? (
            <p className="text-[14px] text-[var(--color-muted)]">No cross-reference data available. Contact our team for compatibility assistance.</p>
          ) : (
            <div>
              <p className="text-[14px] text-[var(--color-muted)] mb-6">The following competitor part numbers are compatible with or superseded by this SKU. Click through to the dedicated replacement page for each.</p>
              <div className="grid grid-cols-3 gap-2">
                {crossReferences.map((ref) => {
                  const href = replacementUrlPath(ref.competitorBrand, ref.competitorMpn)
                  const inner = (
                    <>
                      <div className="text-[var(--color-muted)] text-[10px] uppercase tracking-[0.08em] mb-0.5">{ref.competitorBrand}</div>
                      <div className="text-[var(--color-primary)] font-medium text-[13px]">{ref.competitorMpn}</div>
                      {ref.compatibility && (
                        <div className="text-[var(--color-muted)] text-[10px] mt-1">{ref.compatibility}</div>
                      )}
                      {href && (
                        <div className="font-mono text-[10px] text-[var(--color-accent)] mt-1.5">View replacement →</div>
                      )}
                    </>
                  )
                  return href ? (
                    <Link
                      key={ref.id}
                      href={href}
                      className="block px-4 py-3 border border-[var(--color-border)] bg-[var(--color-elevated)] font-mono text-[12px] hover:border-[var(--color-body)] transition-colors"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={ref.id} className="px-4 py-3 border border-[var(--color-border)] bg-[var(--color-elevated)] font-mono text-[12px]">
                      {inner}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAQ */}
      {active === 4 && (
        <div className="max-w-[820px]">
          {faqs.length === 0 ? (
            <p className="text-[14px] text-[var(--color-muted)]">
              No FAQs for this product yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {faqs.map((f) => (
                <details
                  key={f.id}
                  className="group border border-[var(--color-border)] bg-[var(--color-elevated)] [&[open]>summary>span:last-child]:rotate-180"
                >
                  <summary className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer text-[14px] font-medium text-[var(--color-primary)] list-none [&::-webkit-details-marker]:hidden hover:bg-[var(--color-deep)] transition-colors">
                    <span>{f.question}</span>
                    <span className="font-mono text-[14px] text-[var(--color-muted)] transition-transform shrink-0">▾</span>
                  </summary>
                  <div className="px-5 pb-5 pt-1 text-[14px] text-[var(--color-body)] leading-[1.6] whitespace-pre-wrap border-t border-[var(--color-border-2)]">
                    {f.answer}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ShippingTable({
  leadTimeDays,
  warrantyMonths,
  countryOfOrigin,
  hsCode,
  weightKg,
}: {
  leadTimeDays?: number | null
  warrantyMonths?: number | null
  countryOfOrigin?: string | null
  hsCode?: string | null
  weightKg?: number | null
}) {
  const rows: Array<{ lbl: string; val: string }> = []

  if (leadTimeDays === null || leadTimeDays === undefined) {
    rows.push({ lbl: 'Lead Time', val: 'Contact us for current lead time.' })
  } else if (leadTimeDays === 0) {
    rows.push({ lbl: 'Lead Time', val: 'In stock — ships same day.' })
  } else {
    rows.push({
      lbl: 'Lead Time',
      val: `Typically dispatched within ${leadTimeDays} working day${leadTimeDays === 1 ? '' : 's'}.`,
    })
  }
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
    <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-6 flex flex-col gap-4">
      {rows.map((row) => (
        <div
          key={row.lbl}
          className="grid gap-4 pb-4 border-b border-[var(--color-border-2)] last:pb-0 last:border-0"
          style={{ gridTemplateColumns: '110px 1fr' }}
        >
          <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--color-muted)] pt-0.5">
            {row.lbl}
          </span>
          <span className="text-[14px] text-[var(--color-body)] leading-[1.5]">{row.val}</span>
        </div>
      ))}
    </div>
  )
}

