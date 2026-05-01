'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { askProductQuestion } from '../actions/product-qa'

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

type Question = {
  id: string
  askerName: string
  question: string
  answer: string | null
  answeredAt: string | null
  createdAt: string
}

type Props = {
  locale: string
  sku: string
  productId: string
  descriptionShort?: string | null
  descriptionLong?: string | null
  specGroups: Record<string, Spec[]>
  documents: Doc[]
  crossReferences: CrossRef[]
  questions: Question[]
  isSignedIn: boolean
  leadTimeDays?: number | null
  warrantyMonths?: number | null
  countryOfOrigin?: string | null
  hsCode?: string | null
  weightKg?: number | null
}

export default function ProductTabs({
  locale,
  sku,
  productId,
  descriptionShort,
  descriptionLong,
  specGroups,
  documents,
  crossReferences,
  questions,
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
    { label: 'Technical Specs' },
    { label: 'Shipping & Lead Time' },
    { label: `Documents${documents.length > 0 ? ` (${documents.length})` : ''}` },
    { label: 'Compatibility' },
    { label: `Q&A${questions.length > 0 ? ` (${questions.length})` : ''}` },
  ]

  return (
    <div className="border-t border-[var(--color-border)] pt-8 mb-8">
      {/* Tab headers */}
      <div className="flex border-b border-[var(--color-border)] mb-8">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`px-6 py-3.5 text-[14px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              i === active
                ? 'text-[var(--color-primary)] border-[var(--color-accent)]'
                : 'text-[var(--color-muted)] border-transparent hover:text-[var(--color-body)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Description */}
      {active === 0 && (
        <div className="grid gap-12" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-4">Product description</h2>
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

          {/* Shipping column */}
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-4">Shipping &amp; lead time</h2>
            <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-6 flex flex-col gap-4">
              {[
                {
                  lbl: 'Lead Time',
                  val:
                    leadTimeDays === null || leadTimeDays === undefined
                      ? 'Contact us for current lead time.'
                      : leadTimeDays === 0
                        ? 'In stock — ships same day.'
                        : `Ex-stock orders typically dispatch within ${leadTimeDays} working days.`,
                },
                {
                  lbl: 'Dispatch',
                  val: 'Same-day dispatch on orders confirmed before 14:00 IST (Mon–Sat).',
                },
                {
                  lbl: 'Domestic',
                  val: 'India: 1–3 working days via Blue Dart / DTDC Plus.',
                },
                {
                  lbl: 'International',
                  val: 'DHL / FedEx priority — 3–7 working days globally.',
                },
                ...(countryOfOrigin ? [{ lbl: 'Origin', val: `Made in ${countryOfOrigin}. Origin certificate on request.` }] : []),
                ...(hsCode ? [{ lbl: 'HS Code', val: hsCode }] : []),
                ...(weightKg ? [{ lbl: 'Weight', val: `${weightKg} kg (shipped weight higher with packaging)` }] : []),
                {
                  lbl: 'Warranty',
                  val: warrantyMonths
                    ? `${warrantyMonths} months from invoice date — manufacturer-backed.`
                    : '24 months from invoice date — manufacturer-backed.',
                },
              ].map((row) => (
                <div key={row.lbl} className="grid gap-4 pb-4 border-b border-[var(--color-border-2)] last:pb-0 last:border-0" style={{ gridTemplateColumns: '110px 1fr' }}>
                  <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--color-muted)] pt-0.5">{row.lbl}</span>
                  <span className="text-[14px] text-[var(--color-body)] leading-[1.5]">{row.val}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 border border-[var(--color-border)] bg-[var(--color-elevated)] flex gap-3.5 items-start">
              <span className="font-mono text-[11px] bg-[var(--color-accent)] text-white px-2 py-0.5 shrink-0">TIP</span>
              <p className="text-[13px] leading-[1.55] text-[var(--color-body)]">
                <b>Ordering tip — </b>if you're sourcing for a new build, ask us to bundle matching accessories. Our engineers can recommend the right coupling, strainer and fittings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Technical Specs */}
      {active === 1 && (
        <div>
          {Object.keys(specGroups).length === 0 ? (
            <p className="text-[14px] text-[var(--color-muted)]">No specifications available for this product.</p>
          ) : (
            <div className="grid grid-cols-2 gap-8">
              {Object.entries(specGroups).map(([group, specs]) => (
                <div key={group}>
                  <h3 className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-2">{group}</h3>
                  <table className="w-full font-mono text-[13px] border border-[var(--color-border)]">
                    <tbody>
                      {specs.map((spec) => (
                        <tr key={spec.id} className="border-b border-[var(--color-border-2)] last:border-0">
                          <td className="px-3.5 py-2.5 text-[var(--color-muted)] w-1/2 bg-[var(--color-deep)]">{spec.label}</td>
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
      )}

      {/* Shipping & Lead Time */}
      {active === 2 && (
        <div className="max-w-[680px]">
          <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-6 flex flex-col gap-4">
            {[
              {
                lbl: 'Lead Time',
                val:
                  leadTimeDays === null || leadTimeDays === undefined
                    ? 'Contact us for current lead time. We respond within 4 hours.'
                    : leadTimeDays === 0
                      ? 'In stock — ships same day.'
                      : `Ex-stock orders typically dispatch within ${leadTimeDays} working days.`,
              },
              { lbl: 'Dispatch', val: 'Same-day dispatch on orders confirmed before 14:00 IST (Mon–Sat). Houston cut-off: 15:00 CST.' },
              { lbl: 'Domestic', val: 'India: 1–3 working days via Blue Dart / DTDC Plus. Free shipping on orders ≥ ₹50,000.' },
              { lbl: 'International', val: 'DHL / FedEx priority — 3–7 working days globally. Customs & duties calculated at order confirmation.' },
              { lbl: 'Packaging', val: 'Wooden crate (ISPM-15 fumigated) on Euro pallet where required.' },
              ...(countryOfOrigin ? [{ lbl: 'Origin', val: `Made in ${countryOfOrigin}. Origin certificate (EUR.1) issued with every shipment to eligible jurisdictions.` }] : []),
              ...(hsCode ? [{ lbl: 'HS Code', val: hsCode }] : []),
              ...(weightKg ? [{ lbl: 'Weight', val: `${weightKg} kg (dry). Shipped weight higher with packaging.` }] : []),
              {
                lbl: 'Warranty',
                val: warrantyMonths
                  ? `${warrantyMonths} months from invoice date — manufacturer-backed. Failure analysis service available at no charge for warranty claims.`
                  : '24 months from invoice date — manufacturer-backed.',
              },
              { lbl: 'Returns', val: '30-day return window for unopened sealed units. Engineered-to-order configurations are non-returnable.' },
            ].map((row) => (
              <div key={row.lbl} className="grid gap-4 pb-4 border-b border-[var(--color-border-2)] last:pb-0 last:border-0" style={{ gridTemplateColumns: '110px 1fr' }}>
                <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--color-muted)] pt-0.5">{row.lbl}</span>
                <span className="text-[14px] text-[var(--color-body)] leading-[1.5]">{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {active === 3 && (
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
                    <Link href={`/${locale}/sign-in`} className="shrink-0 h-8 px-4 flex items-center border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors">
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
      {active === 4 && (
        <div>
          {crossReferences.length === 0 ? (
            <p className="text-[14px] text-[var(--color-muted)]">No cross-reference data available. Contact our team for compatibility assistance.</p>
          ) : (
            <div>
              <p className="text-[14px] text-[var(--color-muted)] mb-6">The following competitor part numbers are compatible with or superseded by this SKU.</p>
              <div className="grid grid-cols-3 gap-2">
                {crossReferences.map((ref) => (
                  <div key={ref.id} className="px-4 py-3 border border-[var(--color-border)] bg-[var(--color-elevated)] font-mono text-[12px]">
                    <div className="text-[var(--color-muted)] text-[10px] uppercase tracking-[0.08em] mb-0.5">{ref.competitorBrand}</div>
                    <div className="text-[var(--color-primary)] font-medium text-[13px]">{ref.competitorMpn}</div>
                    {ref.compatibility && (
                      <div className="text-[var(--color-muted)] text-[10px] mt-1">{ref.compatibility}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Q&A */}
      {active === 5 && (
        <div className="max-w-[820px] flex flex-col gap-8">
          {questions.length === 0 ? (
            <p className="text-[14px] text-[var(--color-muted)]">
              No questions yet. Be the first to ask — our applications engineers typically respond within 4 hours.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {questions.map((q) => (
                <div key={q.id} className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-5">
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <span className="text-[13px] font-semibold text-[var(--color-primary)]">{q.askerName}</span>
                    <span className="font-mono text-[10px] text-[var(--color-caption)] shrink-0">
                      {new Date(q.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[14px] text-[var(--color-body)] leading-[1.55] whitespace-pre-wrap mb-4">{q.question}</p>
                  {q.answer ? (
                    <div className="border-t border-[var(--color-border-2)] pt-4 mt-4">
                      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-accent)] mb-1.5 inline-block">
                        Indus Engineering · Reply
                      </span>
                      <p className="text-[14px] text-[var(--color-body)] leading-[1.6] whitespace-pre-wrap">{q.answer}</p>
                    </div>
                  ) : (
                    <p className="text-[12px] text-[var(--color-caption)] italic">Awaiting reply…</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <AskQuestionForm productId={productId} />
        </div>
      )}
    </div>
  )
}

function AskQuestionForm({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await askProductQuestion(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <div className="border border-[oklch(0.55_0.12_150)] bg-[oklch(0.96_0.04_150)] p-5">
        <p className="text-[14px] text-[oklch(0.4_0.12_150)] font-medium mb-1">Thanks — your question is in the queue.</p>
        <p className="text-[13px] text-[var(--color-body)]">
          An applications engineer will reply within 4 working hours. Your question will appear here once published.
        </p>
      </div>
    )
  }

  return (
    <form action={onSubmit} className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-5 flex flex-col gap-3">
      <input type="hidden" name="productId" value={productId} />
      <h3 className="text-[16px] font-semibold tracking-[-0.01em]">Ask a question about this product</h3>
      <p className="text-[12px] text-[var(--color-muted)]">
        Send anything technical — application fit, dimensions, alternatives, lead time. Replies typically come within 4 working hours.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          name="askerName"
          placeholder="Your name *"
          maxLength={120}
          className="h-10 px-3 border border-[var(--color-border)] bg-white text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
        />
        <input
          name="askerEmail"
          type="email"
          placeholder="Email (optional, for replies)"
          maxLength={255}
          className="h-10 px-3 border border-[var(--color-border)] bg-white text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
        />
      </div>
      <textarea
        required
        name="question"
        rows={4}
        placeholder="Your question *"
        maxLength={2000}
        className="px-3 py-2 border border-[var(--color-border)] bg-white text-[13px] resize-y focus:outline-none focus:border-[var(--color-accent)]"
      />
      {error && (
        <p className="text-[12px] text-[oklch(0.5_0.18_25)]" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-10 px-5 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 self-start"
      >
        {pending ? 'Sending…' : 'Submit question'}
      </button>
    </form>
  )
}
