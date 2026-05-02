import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '../../../lib/auth'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'My Quotes' }

type Props = {
  searchParams: Promise<{ status?: string }>
}

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'engineer_review', label: 'With engineer' },
  { key: 'quote_sent', label: 'Awaiting your approval' },
  { key: 'accepted', label: 'Approved' },
  { key: 'closed', label: 'Closed' },
]

const STATUS_LABELS: Record<string, string> = {
  draft: 'DRAFT',
  submitted: 'SUBMITTED',
  engineer_review: 'ENGINEER',
  engineer_questions_pending: 'QUESTIONS',
  quote_sent: 'APPROVE',
  accepted: 'APPROVED',
  declined: 'CLOSED',
  expired: 'CLOSED',
  cancelled: 'CLOSED',
  order_created: 'ORDER',
  fulfilling: 'FULFILLING',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
  paid: 'PAID',
}

const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  draft: { fg: 'var(--color-muted)', bg: 'var(--color-surface)' },
  submitted: { fg: 'oklch(0.4 0.15 270)', bg: 'oklch(0.96 0.04 270)' },
  engineer_review: { fg: 'oklch(0.62 0.16 45)', bg: 'oklch(0.97 0.04 60)' },
  engineer_questions_pending: { fg: 'oklch(0.5 0.14 60)', bg: 'oklch(0.97 0.04 60)' },
  quote_sent: { fg: 'oklch(0.4 0.15 270)', bg: 'oklch(0.96 0.04 270)' },
  accepted: { fg: 'oklch(0.45 0.13 150)', bg: 'oklch(0.95 0.05 150)' },
  declined: { fg: 'var(--color-muted)', bg: 'var(--color-surface)' },
  expired: { fg: 'var(--color-muted)', bg: 'var(--color-surface)' },
  cancelled: { fg: 'var(--color-muted)', bg: 'var(--color-surface)' },
  order_created: { fg: 'oklch(0.45 0.13 150)', bg: 'oklch(0.95 0.05 150)' },
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default async function AccountQuotesPage({ searchParams }: Props) {
  const sp = await searchParams
  const session = await auth()

  const statusFilter = sp.status ?? ''

  // Map tab keys to actual status values
  const statusWhere = (() => {
    if (!statusFilter) return {}
    if (statusFilter === 'closed') return { status: { in: ['declined', 'expired', 'cancelled'] as never[] } }
    return { status: statusFilter as never }
  })()

  const rfqs = await db.rfq.findMany({
    where: {
      accountId: session!.user.accountId,
      ...statusWhere,
    },
    include: {
      lines: { select: { id: true, requestedQty: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Count per tab
  const allRfqs = await db.rfq.findMany({
    where: { accountId: session!.user.accountId },
    select: { status: true },
  })

  function countFor(tabKey: string) {
    if (!tabKey) return allRfqs.length
    if (tabKey === 'closed') return allRfqs.filter((r) => ['declined', 'expired', 'cancelled'].includes(r.status)).length
    return allRfqs.filter((r) => r.status === tabKey).length
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase">
            <Link href={`/account`} className="hover:text-[var(--color-primary)]">Account</Link>
            {' / '}Quotes
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight mt-1.5">My quotes</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/quote`}
            className="h-9 px-4 flex items-center bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 transition-opacity"
          >
            + New RFQ
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-0 border-b border-[var(--color-border)] mb-5 overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const count = countFor(tab.key)
          const active = statusFilter === tab.key
          return (
            <Link
              key={tab.key}
              href={tab.key ? `/account/quotes?status=${tab.key}` : `/account/quotes`}
              className={`px-4 py-2.5 border-b-2 -mb-px font-mono text-[12px] whitespace-nowrap transition-colors ${
                active
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-semibold'
                  : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-body)]'
              }`}
            >
              {tab.label}
              {' '}
              <span className={active ? 'text-[var(--color-muted)]' : 'text-[var(--color-muted)]'}>{count}</span>
            </Link>
          )
        })}
      </div>

      {rfqs.length === 0 ? (
        <div className="py-16 border border-dashed border-[var(--color-border)] text-center">
          <p className="text-[var(--color-muted)] text-sm">No quotes found.</p>
          <Link href={`/c`} className="mt-4 inline-block font-mono text-[12px] text-[var(--color-accent)] hover:underline">
            Browse products →
          </Link>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[130px_1fr_90px_100px_130px_110px] gap-3.5 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
            <span>RFQ #</span>
            <span>Subject</span>
            <span className="text-right">Lines</span>
            <span className="text-right">Total</span>
            <span>Updated</span>
            <span className="text-right">Status</span>
          </div>

          {rfqs.map((rfq) => {
            const colors = STATUS_COLORS[rfq.status] ?? STATUS_COLORS.draft!
            const label = STATUS_LABELS[rfq.status] ?? rfq.status.toUpperCase()
            return (
              <Link
                key={rfq.id}
                href={`/quote/${rfq.code}`}
                className="grid grid-cols-[130px_1fr_90px_100px_130px_110px] gap-3.5 px-4 py-3.5 border-b border-[var(--color-border-2)] last:border-0 items-center text-[var(--color-primary)] hover:bg-[var(--color-deep)] transition-colors"
              >
                <span className="font-mono text-[12px]">{rfq.code}</span>
                <div>
                  <div className="font-medium text-[13px] truncate max-w-[280px]">
                    {rfq.subject ?? rfq.lines.length > 0 ? `${rfq.lines.length} line${rfq.lines.length !== 1 ? 's' : ''}` : 'Draft RFQ'}
                  </div>
                  {rfq.urgency === 'plant_down' && (
                    <div className="font-mono text-[11px] text-[var(--color-danger)]">plant-down</div>
                  )}
                </div>
                <span className="font-mono text-right text-[12px]">{rfq.lines.length}</span>
                <span className="font-mono text-right text-[13px] font-medium">—</span>
                <span className="font-mono text-[11px] text-[var(--color-muted)]">{timeAgo(new Date(rfq.updatedAt))}</span>
                <span className="text-right">
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 border"
                    style={{ color: colors.fg, background: colors.bg, borderColor: `${colors.fg}33` }}
                  >
                    ● {label}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Standing PO CTA */}
      <div className="mt-8 p-5 border border-[var(--color-border)] bg-[var(--color-elevated)] grid grid-cols-[1fr_auto] gap-4 items-center">
        <div>
          <b className="text-[14px]">Convert quotes to a standing PO?</b>
          <p className="mt-1 text-[13px] text-[var(--color-muted)]">
            Bundle recurring lines (e.g. seals, filters) into a quarterly schedule. Talk to your sales engineer.
          </p>
        </div>
        <button className="shrink-0 h-9 px-4 border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors whitespace-nowrap">
          Set up standing PO →
        </button>
      </div>
    </div>
  )
}
