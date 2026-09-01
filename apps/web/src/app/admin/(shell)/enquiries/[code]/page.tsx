import { db } from '@indus/db'
import { AdminSectionHead, Callout, DataTable, EmptyState, Panel, StatusPill } from '@indus/ui'
import type { Metadata } from 'next'
import Link from 'next/link'
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

type RankedCandidate = {
  candidate: { name: string; country: string | null; supplierId: string | null }
  score: number
}

export default async function EnquiryDetailPage({ params }: Props) {
  const { code } = await params
  const enquiry = await db.enquiry.findUnique({
    where: { code: decodeURIComponent(code) },
    include: { lines: { orderBy: { position: 'asc' } } },
  })
  if (!enquiry) notFound()

  const latestRun = await db.researchRun.findFirst({
    where: { enquiryId: enquiry.id },
    orderBy: { createdAt: 'desc' },
    include: {
      results: { orderBy: { createdAt: 'asc' }, include: { enquiryLine: { select: { description: true, position: true } } } },
    },
  })

  const needsReview = enquiry.lines.filter((l) => l.reviewStatus === 'needs_review').length
  const running = latestRun?.status === 'queued' || latestRun?.status === 'running'
  const nav = `/admin/enquiries/${enquiry.code}`

  return (
    <AdminPageShell
      title={enquiry.title}
      breadcrumbs={
        <span className="font-mono text-[12px] text-ih-muted">
          {enquiry.code}
          {enquiry.bidNo ? ` · ${enquiry.bidNo}` : ''}
          {enquiry.revision ? ` · ${enquiry.revision}` : ''}
          {enquiry.buyerName ? ` · ${enquiry.buyerName}` : ''}
        </span>
      }
      actions={
        <div className="flex items-center gap-3">
          <Link className="text-[13px] text-ih-ink-2 hover:underline" href={`${nav}/rfq`}>Supplier RFQs</Link>
          <Link className="text-[13px] text-ih-ink-2 hover:underline" href={`${nav}/offers`}>Offers</Link>
          <Link className="text-[13px] text-ih-ink-2 hover:underline" href={`${nav}/pricing`}>Pricing</Link>
          <ResearchButton
            enquiryId={enquiry.id}
            disabled={enquiry.lines.length === 0 || running}
            {...(running
              ? { disabledReason: 'Research already running.' }
              : enquiry.lines.length === 0
                ? { disabledReason: 'Add line items first.' }
                : {})}
          />
        </div>
      }
    >
      {/* PF-10 detail shape. `items-start` lets the rail stick; `min-w-0` on the
          main column is load-bearing — without it the line-items table blows the
          1fr track out and pushes the rail off the right of the screen. */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel>
            <AdminSectionHead
              variant="panel"
              title="Line items"
              description={
                enquiry.lines.length === 0
                  ? 'No items were found in the pasted text. That is expected when the item list sits behind a portal login.'
                  : `${enquiry.lines.length} extracted · ${needsReview} awaiting review`
              }
            />
            <div className="mt-4">
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
                ]}
              />
            </div>
          </Panel>

          {latestRun ? (
            <Panel>
              <AdminSectionHead
                variant="panel"
                title="Supplier research"
                description={`${latestRun.completedCount} of ${latestRun.itemCount} items · ${latestRun.cacheHitCount} from cache · $${(latestRun.costUsdMicros / 1_000_000).toFixed(2)}`}
              />

              {latestRun.error ? (
                <div className="mt-3">
                  <Callout tone="danger">{latestRun.error}</Callout>
                </div>
              ) : null}

              <div className="mt-4 flex flex-col gap-3">
                {latestRun.results.length === 0 ? (
                  <p className="text-[13px] text-ih-muted">
                    No per-item results yet.
                  </p>
                ) : (
                  latestRun.results.map((result) => {
                    const ranked = (result.candidates as unknown as RankedCandidate[]) ?? []
                    return (
                      <div key={result.id} className="rounded-lg border border-ih-border p-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-[14px] text-ih-ink">
                            {result.enquiryLine?.position}. {result.enquiryLine?.description}
                          </span>
                          <span className="flex items-center gap-2">
                            {result.cacheHit ? <StatusPill size="sm">Cached</StatusPill> : null}
                            <StatusPill
                              size="sm"
                              tone={
                                result.status === 'completed'
                                  ? 'good'
                                  : result.status === 'failed'
                                    ? 'danger'
                                    : 'warn'
                              }
                            >
                              {result.status.replace('_', ' ')}
                            </StatusPill>
                          </span>
                        </div>
                        {result.error ? (
                          <p className="mt-1 text-[12px] text-ih-danger">{result.error}</p>
                        ) : null}
                        {ranked.length > 0 ? (
                          <ul className="mt-2 flex flex-col gap-1">
                            {ranked.slice(0, 5).map((entry, i) => (
                              <li key={`${entry.candidate.name}-${i}`} className="text-[13px] text-ih-ink-2">
                                <span className="text-ih-ink">{entry.candidate.name}</span>
                                <span className="font-mono text-[12px] text-ih-muted">
                                  {entry.candidate.country ? ` · ${entry.candidate.country}` : ''} · {entry.score}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : result.status === 'completed' ? (
                          <p className="mt-1 text-[12px] text-ih-muted">
                            No suppliers cleared the filters for this item.
                          </p>
                        ) : null}
                        <p className="mt-1 text-[12px] text-ih-muted">
                          {result.reachableCount} of {result.candidateCount} reachable
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </Panel>
          ) : null}

          <Panel>
            <AdminSectionHead
              variant="panel"
              title="Source text"
              description="Verbatim, after line-ending normalisation. Every line above traces back to this."
            />
            <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-ih-border bg-ih-surface-2 p-3 font-mono text-[12px] leading-relaxed text-ih-ink-2">
              {enquiry.rawText}
            </pre>
          </Panel>
        </div>

        <aside className="sticky top-7 flex flex-col gap-6">
          <Panel>
            <AdminSectionHead title="Details" level={3} />
            <dl className="mt-4 flex flex-col gap-3 text-[13px]">
              <div>
                <dt className="text-ih-muted">Status</dt>
                <dd className="font-mono text-ih-ink">{enquiry.status}</dd>
              </div>
              <div>
                <dt className="text-ih-muted">Closes</dt>
                <dd className="font-mono text-ih-ink">
                  {enquiry.closingAt
                    ? enquiry.closingAt.toISOString().slice(0, 16).replace('T', ' ')
                    : '—'}
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
        </aside>
      </div>
    </AdminPageShell>
  )
}
