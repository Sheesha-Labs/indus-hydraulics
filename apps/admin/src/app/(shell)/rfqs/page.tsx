import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'RFQ Queue — Indus Admin' }

type Props = {
  searchParams: Promise<{ status?: string; urgency?: string }>
}

const STATUS_FILTERS = [
  { key: '', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'engineer_review', label: 'Under Review' },
  { key: 'engineer_questions_pending', label: 'Questions' },
  { key: 'quote_sent', label: 'Quote Sent' },
  { key: 'accepted', label: 'Accepted' },
]

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  engineer_review: 'Under Review',
  engineer_questions_pending: 'Questions',
  quote_sent: 'Quote Sent',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
  cancelled: 'Cancelled',
  order_created: 'Order Created',
}

const STATUS_COLORS: Record<string, string> = {
  submitted: 'text-[oklch(0.4_0.12_220)] bg-[oklch(0.95_0.05_220)]',
  engineer_review: 'text-[oklch(0.4_0.12_220)] bg-[oklch(0.95_0.05_220)]',
  engineer_questions_pending: 'text-[oklch(0.5_0.12_60)] bg-[oklch(0.95_0.08_60)]',
  quote_sent: 'text-[oklch(0.4_0.14_160)] bg-[oklch(0.95_0.06_160)]',
  accepted: 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.93_0.08_145)]',
  declined: 'text-[oklch(0.5_0.1_25)] bg-[oklch(0.95_0.04_25)]',
}

const URGENCY_COLORS: Record<string, string> = {
  routine: 'text-[var(--color-muted)]',
  priority: 'text-[oklch(0.5_0.12_60)] font-semibold',
  plant_down: 'text-[oklch(0.5_0.14_25)] font-semibold',
}

export default async function AdminRfqsPage({ searchParams }: Props) {
  const sp = await searchParams

  const statusFilter = sp.status ?? ''
  const urgencyFilter = sp.urgency ?? ''

  const rfqs = await db.rfq.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter as never } : { status: { not: 'draft' } }),
      ...(urgencyFilter ? { urgency: urgencyFilter as never } : {}),
    },
    include: {
      account: { select: { legalName: true, code: true } },
      lines: { select: { id: true } },
      assignedEngineer: { select: { name: true } },
    },
    orderBy: [{ urgency: 'desc' }, { submittedAt: 'desc' }],
  })

  function filterUrl(overrides: Record<string, string | undefined>) {
    const base = { status: statusFilter || undefined, urgency: urgencyFilter || undefined }
    const merged = { ...base, ...overrides }
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return `/rfqs${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="px-8 py-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">RFQ Queue</h1>
        <div className="font-mono text-[13px] text-[var(--color-muted)]">{rfqs.length} requests</div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => {
          const href = filterUrl({ status: f.key || undefined })
          const active = statusFilter === f.key
          return (
            <Link
              key={f.key}
              href={href}
              className={`px-3 py-1.5 font-mono text-[12px] border transition-colors ${
                active
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                  : 'border-[var(--color-border)] text-[var(--color-body)] hover:border-[var(--color-body)]'
              }`}
            >
              {f.label}
            </Link>
          )
        })}

        <div className="ml-auto flex gap-2">
          {['routine', 'priority', 'plant_down'].map((u) => (
            <Link
              key={u}
              href={filterUrl({ urgency: urgencyFilter === u ? undefined : u })}
              className={`px-3 py-1.5 font-mono text-[12px] border transition-colors ${
                urgencyFilter === u
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                  : 'border-[var(--color-border)] text-[var(--color-body)] hover:border-[var(--color-body)]'
              }`}
            >
              {u === 'plant_down' ? '🔴 Plant Down' : u === 'priority' ? '🟡 Priority' : 'Routine'}
            </Link>
          ))}
        </div>
      </div>

      {rfqs.length === 0 ? (
        <div className="py-16 border border-dashed border-[var(--color-border)] text-center">
          <p className="text-[var(--color-muted)]">No RFQs match these filters.</p>
        </div>
      ) : (
        <div className="border border-[var(--color-border)]">
          {/* Header */}
          <div className="grid grid-cols-[1fr_180px_80px_80px_130px_130px] px-4 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
            <div>Reference</div>
            <div>Account</div>
            <div className="text-center">Lines</div>
            <div className="text-center">Urgency</div>
            <div className="text-center">Status</div>
            <div className="text-right">Submitted</div>
          </div>

          {rfqs.map((rfq, i) => (
            <Link
              key={rfq.id}
              href={`/rfqs/${rfq.code}`}
              className={`grid grid-cols-[1fr_180px_80px_80px_130px_130px] px-4 py-3.5 items-center bg-[var(--color-elevated)] hover:bg-[var(--color-deep)] transition-colors ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}
            >
              <div>
                <div className="font-mono text-[13px] font-semibold text-[var(--color-primary)]">{rfq.code}</div>
                {rfq.subject && (
                  <div className="text-[12px] text-[var(--color-muted)] mt-0.5 truncate max-w-[260px]">{rfq.subject}</div>
                )}
                {rfq.assignedEngineer && (
                  <div className="font-mono text-[10px] text-[var(--color-caption)] mt-0.5">
                    Eng: {rfq.assignedEngineer.name}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[13px] font-medium text-[var(--color-primary)] truncate">{rfq.account.legalName}</div>
                <div className="font-mono text-[11px] text-[var(--color-muted)]">{rfq.account.code}</div>
              </div>
              <div className="text-center font-mono text-[13px] text-[var(--color-primary)]">{rfq.lines.length}</div>
              <div className={`text-center font-mono text-[11px] capitalize ${URGENCY_COLORS[rfq.urgency] ?? ''}`}>
                {rfq.urgency === 'plant_down' ? '🔴 P.Down' : rfq.urgency}
              </div>
              <div className="flex justify-center">
                <span className={`px-2 py-0.5 font-mono text-[10px] font-semibold ${STATUS_COLORS[rfq.status] ?? 'text-[var(--color-muted)] bg-[var(--color-deep)]'}`}>
                  {STATUS_LABELS[rfq.status] ?? rfq.status}
                </span>
              </div>
              <div className="text-right font-mono text-[12px] text-[var(--color-muted)]">
                {rfq.submittedAt ? new Date(rfq.submittedAt).toLocaleDateString() : '—'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
