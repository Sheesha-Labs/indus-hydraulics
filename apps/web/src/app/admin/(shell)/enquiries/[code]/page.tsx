import { db } from '@indus/db'
import { DataTable, EmptyState, Panel, StatusPill } from '@indus/ui'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import ResearchButton from './_components/research-button'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Enquiry — Indus Admin' }

type Props = { params: Promise<{ code: string }> }

const FLAG_LABEL: Record<string, string> = {
  qty_not_stated: 'No quantity',
  unit_not_stated: 'No unit',
  description_very_short: 'Very short',
  title_sourced: 'From title',
}

export default async function EnquiryDetailPage({ params }: Props) {
  const { code } = await params
  const enquiry = await db.enquiry.findUnique({
    where: { code: decodeURIComponent(code) },
    include: { lines: { orderBy: { position: 'asc' } } },
  })
  if (!enquiry) notFound()

  const needsReview = enquiry.lines.filter((l) => l.reviewStatus === 'needs_review').length

  const activeRun = await db.researchRun.findFirst({
    where: { enquiryId: enquiry.id, status: { in: ['queued', 'running'] } },
    select: { id: true },
  })

  return (
    <AdminPageShell
      title={enquiry.title}
      sub={
        <span className="font-mono text-[12px] text-ih-muted">
          {enquiry.code}
          {enquiry.bidNo ? ` · ${enquiry.bidNo}` : ''}
          {enquiry.revision ? ` · ${enquiry.revision}` : ''}
          {enquiry.buyerName ? ` · ${enquiry.buyerName}` : ''}
        </span>
      }
      actions={
        <ResearchButton
          enquiryId={enquiry.id}
          disabled={enquiry.lines.length === 0 || !!activeRun}
          {...(activeRun
            ? { disabledReason: 'Research already running.' }
            : enquiry.lines.length === 0
              ? { disabledReason: 'Add line items first.' }
              : {})}
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Panel>
            <header className="mb-4 flex flex-col gap-1">
              <h2 className="text-[15px] font-medium text-ih-ink">Line items</h2>
              <p className="text-[13px] text-ih-muted">
                {enquiry.lines.length === 0
                  ? 'No items were found in the pasted text. That is expected when the item list is behind a portal login.'
                  : `${enquiry.lines.length} extracted · ${needsReview} awaiting review`}
              </p>
            </header>
            <DataTable
              minWidth="md"
              rowKey={(row) => row.id}
              rows={enquiry.lines}
              emptyState={
                <EmptyState
                  condition="NO LINE ITEMS"
                  message="The paste carried no numbered item list. Sign in to the portal, copy the items, and paste them into a new enquiry."
                />
              }
              columns={[
                { key: 'pos', header: '#', numeric: true, cell: (r) => r.position },
                {
                  key: 'description',
                  header: 'Description',
                  width: '44%',
                  cell: (r) => (
                    <div className="flex flex-col gap-1">
                      <span className="text-ih-ink">{r.description}</span>
                      {r.partNumber ? (
                        <span className="font-mono text-[12px] text-ih-muted">P/N {r.partNumber}</span>
                      ) : null}
                      {r.certification ? (
                        <span className="font-mono text-[12px] text-ih-ink-2">{r.certification}</span>
                      ) : null}
                      <span className="text-[12px] text-ih-muted">{r.sourceText}</span>
                    </div>
                  ),
                },
                {
                  key: 'qty',
                  header: 'Qty',
                  numeric: true,
                  cell: (r) => (r.qty ? `${r.qty.toString()} ${r.unit ?? ''}`.trim() : '—'),
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
                          <StatusPill key={f} tone="warn" size="sm">
                            {FLAG_LABEL[f] ?? f}
                          </StatusPill>
                        ))}
                      </div>
                    ),
                },
                {
                  key: 'review',
                  header: 'Review',
                  cell: (r) => (
                    <StatusPill tone={r.reviewStatus === 'confirmed' ? 'good' : 'muted'}>
                      {r.reviewStatus === 'needs_review' ? 'Needs review' : r.reviewStatus}
                    </StatusPill>
                  ),
                },
              ]}
            />
          </Panel>

          <Panel>
            <header className="mb-4 flex flex-col gap-1">
              <h2 className="text-[15px] font-medium text-ih-ink">Source text</h2>
              <p className="text-[13px] text-ih-muted">
                Verbatim, after line-ending normalisation. Every line above traces back to this.
              </p>
            </header>
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[6px] border border-ih-border bg-ih-surface-2 p-3 font-mono text-[12px] leading-relaxed text-ih-ink-2">
              {enquiry.rawText}
            </pre>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel>
            <h2 className="mb-4 text-[15px] font-medium text-ih-ink">Details</h2>
            <dl className="flex flex-col gap-3 text-[13px]">
              <div>
                <dt className="text-ih-muted">Status</dt>
                <dd className="font-mono text-ih-ink">{enquiry.status}</dd>
              </div>
              <div>
                <dt className="text-ih-muted">Closes</dt>
                <dd className="font-mono text-ih-ink">
                  {enquiry.closingAt ? enquiry.closingAt.toISOString().slice(0, 16).replace('T', ' ') : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-ih-muted">Source portal</dt>
                <dd className="text-ih-ink">{enquiry.sourcePortal ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-ih-muted">Extractor</dt>
                <dd className="font-mono text-ih-ink">{enquiry.extractorName ?? '—'}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </AdminPageShell>
  )
}
