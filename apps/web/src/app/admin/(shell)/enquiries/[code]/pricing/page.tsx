import { db } from '@indus/db'
import { applyMarkup } from '@indus/domain'
import { Callout, EmptyState, Panel, StatusPill } from '@indus/ui'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import AdminPageShell from '../../../../../../components/admin/AdminPageShell'
import GenerateQuoteForm from './_components/generate-quote-form'
import SelectOfferButton from './_components/select-offer-button'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Pricing — Indus Admin' }

type Props = { params: Promise<{ code: string }> }

const PREVIEW_MARKUP = 30

export default async function EnquiryPricingPage({ params }: Props) {
  const { code } = await params
  const enquiry = await db.enquiry.findUnique({
    where: { code: decodeURIComponent(code) },
    select: {
      id: true,
      code: true,
      title: true,
      lines: {
        orderBy: { position: 'asc' },
        select: {
          id: true, position: true, description: true, qty: true, unit: true,
          offerLines: {
            orderBy: { unitPrice: 'asc' },
            select: {
              id: true, unitPrice: true, moq: true, leadTimeDays: true, kind: true,
              selectedAt: true, reviewFlags: true, sourceQuote: true,
              offer: { select: { supplierName: true, currency: true, incoterm: true } },
            },
          },
        },
      },
      quotes: { orderBy: { revision: 'desc' }, take: 1, select: { code: true, revision: true, total: true } },
    },
  })
  if (!enquiry) notFound()

  const selectedCount = enquiry.lines.filter((l) => l.offerLines.some((o) => o.selectedAt)).length
  const latestQuote = enquiry.quotes[0]

  return (
    <AdminPageShell
      title="Pricing"
      breadcrumbs={
        <span className="font-mono text-[12px] text-ih-muted">
          {enquiry.code} · {selectedCount} of {enquiry.lines.length} lines priced
          {latestQuote ? ` · ${latestQuote.code}` : ''}
        </span>
      }
    >
      {/* PF-9: card-stack editor, no rail — one 860px cap on the single
          body wrapper so every card ends on the same right edge. */}
      <div className="flex max-w-[860px] flex-col gap-6">
        <Callout>
          Prices below are the supplier&rsquo;s, as extracted. Pick one per line, then set the
          markup — the estimate uses your existing template, in AED, with VAT decided by ship-to
          country.
        </Callout>

        {enquiry.lines.length === 0 ? (
          <Panel>
            <EmptyState condition="NO LINES" message="This enquiry has no items to price." />
          </Panel>
        ) : (
          enquiry.lines.map((line) => (
            <Panel key={line.id}>
              <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[15px] font-medium text-ih-ink">
                  {line.position}. {line.description}
                </h2>
                <span className="font-mono text-[12px] text-ih-muted">
                  {line.qty ? `${line.qty.toString()} ${line.unit ?? ''}`.trim() : 'qty to confirm'}
                </span>
              </header>

              {line.offerLines.length === 0 ? (
                <p className="text-[13px] text-ih-muted">
                  No supplier has quoted this line yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {line.offerLines.map((o) => {
                    const cost = o.unitPrice ? Number(o.unitPrice) : null
                    const preview =
                      cost != null ? applyMarkup(cost, { mode: 'percentage', value: PREVIEW_MARKUP }) : null
                    return (
                      <li
                        key={o.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ih-border bg-ih-surface px-3 py-2"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] text-ih-ink">{o.offer.supplierName}</span>
                            {o.selectedAt ? <StatusPill tone="success" size="sm">Selected</StatusPill> : null}
                            {o.kind === 'alternative' ? (
                              <StatusPill tone="warning" size="sm">Alternative part</StatusPill>
                            ) : null}
                            {o.kind === 'declined' ? (
                              <StatusPill tone="danger" size="sm">Declined</StatusPill>
                            ) : null}
                          </div>
                          <span className="font-mono text-[12px] text-ih-muted">
                            {cost != null ? `${o.offer.currency ?? ''} ${cost}`.trim() : 'no readable price'}
                            {o.moq ? ` · MOQ ${o.moq.toString()}` : ''}
                            {o.leadTimeDays ? ` · ${o.leadTimeDays}d` : ''}
                            {o.offer.incoterm ? ` · ${o.offer.incoterm}` : ''}
                            {preview ? ` · sells at ${preview.sellPerUnitAed} (${preview.marginPct}% margin)` : ''}
                          </span>
                        </div>
                        {cost != null && o.kind !== 'declined' ? (
                          <SelectOfferButton
                            offerLineId={o.id}
                            enquiryLineId={line.id}
                            selected={!!o.selectedAt}
                            requiresConfirmation={o.kind === 'alternative'}
                          />
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>
          ))
        )}

        {selectedCount > 0 ? (
          <Panel>
            <header className="mb-4 flex flex-col gap-1">
              <h2 className="text-[15px] font-medium text-ih-ink">Generate the estimate</h2>
              <p className="text-[13px] text-ih-muted">
                Uses your existing Estimate template. A 30% markup is a 23.08% margin — pick the
                mode you actually mean.
              </p>
            </header>
            <GenerateQuoteForm enquiryId={enquiry.id} linesPriced={selectedCount} />
          </Panel>
        ) : null}
      </div>
    </AdminPageShell>
  )
}
