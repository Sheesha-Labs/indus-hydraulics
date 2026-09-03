import { db } from '@indus/db'
import { Callout, DataTable, EmptyState, Panel, StatusPill } from '@indus/ui'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import AdminPageShell from '../../../../../../components/admin/AdminPageShell'
import PasteOfferForm from './_components/paste-offer-form'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Supplier offers — Indus Admin' }

type Props = { params: Promise<{ code: string }> }

const FLAG_LABEL: Record<string, string> = {
  decimal_convention_ambiguous: 'Number format unclear',
  price_unreadable: 'Price unreadable',
  alternative_part: 'Alternative part',
}

export default async function EnquiryOffersPage({ params }: Props) {
  const { code } = await params
  const enquiry = await db.enquiry.findUnique({
    where: { code: decodeURIComponent(code) },
    select: { id: true, code: true, title: true },
  })
  if (!enquiry) notFound()

  const offers = await db.supplierOffer.findMany({
    where: { enquiryId: enquiry.id },
    orderBy: { receivedAt: 'desc' },
    include: { lines: { orderBy: { position: 'asc' } } },
  })

  return (
    <AdminPageShell
      title="Supplier offers"
      breadcrumbs={
        <span className="font-mono text-[12px] text-ih-muted">
          {enquiry.code} · {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
        </span>
      }
    >
      {/* PF-9: card-stack editor, no rail — one 860px cap on the single
          body wrapper so every card ends on the same right edge. */}
      <div className="flex max-w-[860px] flex-col gap-6">
        <Panel>
          <header className="mb-4 flex flex-col gap-1">
            <h2 className="text-[15px] font-medium text-ih-ink">Paste a reply</h2>
            <p className="text-[13px] text-ih-muted">
              Paste the supplier&rsquo;s whole email. Prices are read as written and the number
              format is decided across the whole message, not value by value.
            </p>
          </header>
          <PasteOfferForm enquiryId={enquiry.id} />
        </Panel>

        {offers.length === 0 ? (
          <Panel>
            <EmptyState
              condition="NO OFFERS YET"
              message="Nothing has come back from a supplier for this enquiry."
            />
          </Panel>
        ) : (
          offers.map((offer) => {
            const unreadable = offer.lines.filter((l) => l.reviewFlags.includes('price_unreadable')).length
            return (
              <Panel key={offer.id}>
                <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[15px] font-medium text-ih-ink">{offer.supplierName}</h2>
                    <p className="font-mono text-[12px] text-ih-muted">
                      {offer.currency ?? 'currency not stated'} · {offer.incoterm ?? 'incoterm not stated'}
                      {offer.decimalConvention ? ` · ${offer.decimalConvention}-decimal` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {offer.attributionMethod === 'reference_token' ? (
                      <StatusPill tone="success" size="sm">Reference matched</StatusPill>
                    ) : (
                      <StatusPill tone="warning" size="sm">Attributed by hand</StatusPill>
                    )}
                    {unreadable > 0 ? (
                      <StatusPill tone="danger" size="sm">{unreadable} unreadable</StatusPill>
                    ) : null}
                  </div>
                </header>

                {offer.decimalConvention === 'ambiguous' ? (
                  <Callout tone="warning">
                    The number format in this message could not be settled — &ldquo;1.234&rdquo; may
                    mean 1234 or 1.234. Prices were left unread rather than guessed. Check them
                    against the source text below.
                  </Callout>
                ) : null}

                <DataTable
                  minWidth="md"
                  rowKey={(row) => row.id}
                  rows={offer.lines}
                  emptyState={
                    <EmptyState
                      condition="NOTHING EXTRACTED"
                      message="No line in this reply carried a price we could trace to the text."
                    />
                  }
                  columns={[
                    { key: 'pos', header: '#', numeric: true, cell: (r) => r.position },
                    {
                      key: 'description',
                      header: 'Item',
                      width: '40%',
                      cell: (r) => (
                        <div className="flex flex-col gap-1">
                          <span className="text-ih-ink">{r.description}</span>
                          <span className="text-[12px] text-ih-muted">{r.sourceQuote}</span>
                        </div>
                      ),
                    },
                    {
                      key: 'price',
                      header: 'Unit',
                      numeric: true,
                      cell: (r) =>
                        r.unitPrice ? r.unitPrice.toString() : <span className="text-ih-muted">—</span>,
                    },
                    {
                      key: 'moq',
                      header: 'MOQ',
                      numeric: true,
                      cell: (r) => (r.moq ? r.moq.toString() : '—'),
                    },
                    {
                      key: 'lead',
                      header: 'Lead',
                      numeric: true,
                      cell: (r) => (r.leadTimeDays ? `${r.leadTimeDays}d` : '—'),
                    },
                    {
                      key: 'flags',
                      header: 'Flags',
                      cell: (r) =>
                        r.reviewFlags.length === 0 ? (
                          <span className="text-ih-muted">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {r.reviewFlags.map((f) => (
                              <StatusPill key={f} tone="warning" size="sm">
                                {FLAG_LABEL[f] ?? f}
                              </StatusPill>
                            ))}
                          </div>
                        ),
                    },
                  ]}
                />
              </Panel>
            )
          })
        )}
      </div>
    </AdminPageShell>
  )
}
