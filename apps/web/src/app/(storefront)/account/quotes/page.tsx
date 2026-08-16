import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '../../../../lib/auth'
import { db } from '@indus/db'
import RequestAgainButton, { type RequestAgainItem } from '../../../../components/RequestAgainButton'
import { mediaUrl } from '../../../../lib/media'

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

// Badge pairings come from the v2 contract (tokens.css .ih-badge--*), not from
// ad-hoc tints. Neutral = the default badge; accent = in the queue; steel =
// with an engineer; warn = waiting on the customer; success = won.
const NEUTRAL = { fg: 'var(--color-ih-ink-2)', bg: 'var(--color-ih-surface-2)' }
const ACCENT = { fg: 'var(--color-ih-accent)', bg: 'var(--color-ih-accent-soft)' }
const STEEL = { fg: 'oklch(0.42 0.07 240)', bg: 'var(--color-ih-steel-soft)' }
const WARN = { fg: 'oklch(0.46 0.1 62)', bg: 'var(--color-ih-warning-soft)' }
const SUCCESS = { fg: 'oklch(0.38 0.09 150)', bg: 'var(--color-ih-success-soft)' }

const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  draft: NEUTRAL,
  submitted: ACCENT,
  engineer_review: STEEL,
  engineer_questions_pending: WARN,
  quote_sent: ACCENT,
  accepted: SUCCESS,
  declined: NEUTRAL,
  expired: NEUTRAL,
  cancelled: NEUTRAL,
  order_created: SUCCESS,
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
      lines: {
        select: {
          id: true,
          requestedQty: true,
          customerTargetPrice: true,
          product: {
            select: {
              sku: true,
              title: true,
              brand: { select: { name: true } },
              images: { take: 1, orderBy: { position: 'asc' }, include: { media: true } },
            },
          },
        },
      },
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
          <div className="font-mono text-[11px] tracking-[0.14em] text-ih-muted uppercase">
            <Link href={`/account`} className="hover:text-ih-ink">Account</Link>
            {' / '}Quotes
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight mt-1.5">My quotes</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/quote`}
            className="h-9 px-4 flex items-center bg-ih-accent text-white font-mono text-[12px] hover:opacity-90 transition-opacity"
          >
            + New RFQ
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-0 border-b border-ih-border mb-5 overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const count = countFor(tab.key)
          const active = statusFilter === tab.key
          return (
            <Link
              key={tab.key}
              href={tab.key ? `/account/quotes?status=${tab.key}` : `/account/quotes`}
              className={`px-4 py-2.5 border-b-2 -mb-px font-mono text-[12px] whitespace-nowrap transition-colors ${
                active
                  ? 'border-ih-ink text-ih-ink font-semibold'
                  : 'border-transparent text-ih-muted hover:text-ih-ink-2'
              }`}
            >
              {tab.label}
              {' '}
              <span className={active ? 'text-ih-muted' : 'text-ih-muted'}>{count}</span>
            </Link>
          )
        })}
      </div>

      {rfqs.length === 0 ? (
        <div className="py-16 border border-dashed border-ih-border text-center">
          <p className="text-ih-muted text-sm">No quotes found.</p>
          <Link href={`/c`} className="mt-4 inline-block font-mono text-[12px] text-ih-accent hover:underline">
            Browse products →
          </Link>
        </div>
      ) : (
        <div className="border border-ih-border bg-ih-surface overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[130px_1fr_90px_100px_130px_110px_90px] gap-3.5 px-4 py-3 bg-ih-bg border-b border-ih-border font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
            <span>RFQ #</span>
            <span>Subject</span>
            <span className="text-right">Lines</span>
            <span className="text-right">Total</span>
            <span>Updated</span>
            <span className="text-right">Status</span>
            <span className="text-right">Action</span>
          </div>

          {rfqs.map((rfq) => {
            const colors = STATUS_COLORS[rfq.status] ?? STATUS_COLORS.draft!
            const label = STATUS_LABELS[rfq.status] ?? rfq.status.toUpperCase()
            const reorderItems: RequestAgainItem[] = rfq.lines.map((l) => ({
              sku: l.product.sku,
              title: l.product.title,
              ...(l.product.brand?.name ? { brand: l.product.brand.name } : {}),
              ...(l.product.images[0]?.media?.storagePath ? { imageUrl: mediaUrl(l.product.images[0].media.storagePath) } : {}),
              qty: l.requestedQty,
              ...(l.customerTargetPrice ? { targetPrice: String(l.customerTargetPrice) } : {}),
            }))
            return (
              <Link
                key={rfq.id}
                href={`/quote/${rfq.code}`}
                className="grid grid-cols-[130px_1fr_90px_100px_130px_110px_90px] gap-3.5 px-4 py-3.5 border-b border-ih-border last:border-0 items-center text-ih-ink hover:bg-ih-surface-2 transition-colors"
              >
                <span className="font-mono text-[12px]">{rfq.code}</span>
                <div>
                  <div className="font-medium text-[13px] truncate max-w-[280px]">
                    {rfq.subject ?? rfq.lines.length > 0 ? `${rfq.lines.length} line${rfq.lines.length !== 1 ? 's' : ''}` : 'Draft RFQ'}
                  </div>
                  {rfq.urgency === 'plant_down' && (
                    <div className="font-mono text-[11px] text-ih-danger">plant-down</div>
                  )}
                </div>
                <span className="font-mono text-right text-[12px]">{rfq.lines.length}</span>
                <span className="font-mono text-right text-[13px] font-medium">—</span>
                <span className="font-mono text-[11px] text-ih-muted">{timeAgo(new Date(rfq.updatedAt))}</span>
                <span className="text-right">
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 border"
                    style={{ color: colors.fg, background: colors.bg, borderColor: `${colors.fg}33` }}
                  >
                    ● {label}
                  </span>
                </span>
                <span className="flex justify-end">
                  <RequestAgainButton items={reorderItems} rfqCode={rfq.code} />
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Standing PO CTA */}
      <div className="mt-8 p-5 border border-ih-border bg-ih-surface grid grid-cols-[1fr_auto] gap-4 items-center">
        <div>
          <b className="text-[14px]">Convert quotes to a standing PO?</b>
          <p className="mt-1 text-[13px] text-ih-muted">
            Bundle recurring lines (e.g. seals, filters) into a quarterly schedule. Talk to your sales engineer.
          </p>
        </div>
        <button className="shrink-0 h-9 px-4 border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors whitespace-nowrap">
          Set up standing PO →
        </button>
      </div>
    </div>
  )
}
