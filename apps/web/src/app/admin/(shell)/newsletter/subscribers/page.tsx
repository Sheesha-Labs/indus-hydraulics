import { db } from '@indus/db'
import { DataTable, EmptyState, NavTabs, Pagination, StatusPill, type StatusTone } from '@indus/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import ActionButton from '../../../../../components/admin/newsletter/ActionButton'
import DownloadCsvButton from '../../../../../components/admin/newsletter/DownloadCsvButton'
import NewsletterTabs from '../../../../../components/admin/newsletter/NewsletterTabs'
import {
  RESEND_CONFIRMATION_COOLDOWN_MS,
  RESEND_CONFIRMATION_MAX,
  SUBSCRIBER_STATUSES,
  subscriberCounts,
  subscriberWhere,
  type SubscriberFilters,
  type SubscriberStatus,
} from '../../../../../lib/newsletter/admin'
import { ROLES, hasRole } from '../../../../../lib/rbac'
import { requireStaffRole } from '../../../../../lib/staff-session'
import { exportSubscribersAction, resendConfirmationsAction, unsubscribeSubscriberAction } from '../actions'

export const metadata: Metadata = { title: 'Newsletter subscribers — Indus Admin' }
export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string; page?: string }>
}

const PAGE_SIZE = 50

const STATUS_LABEL: Record<SubscriberStatus, string> = {
  pending: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  unsubscribed: 'Unsubscribed',
  bounced: 'Bounced',
}

const STATUS_TONE: Record<SubscriberStatus, StatusTone> = {
  pending: 'warning',
  confirmed: 'success',
  unsubscribed: 'neutral',
  bounced: 'danger',
}

const SOURCE_LABEL: Record<string, string> = {
  homepage_footer: 'Home page',
  blog_index: 'Blog',
  other: 'Other',
}

/** Whether a pending subscriber may be sent another confirmation now. */
function resendDue(sentAt: Date | null): boolean {
  return !sentAt || sentAt.getTime() < Date.now() - RESEND_CONFIRMATION_COOLDOWN_MS
}

function day(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : '—'
}

const inputClass =
  'h-9 rounded-lg border border-ih-border bg-ih-surface px-2.5 text-[14px] text-ih-ink outline-none placeholder:text-ih-muted focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft'

export default async function NewsletterSubscribersPage({ searchParams }: Props) {
  const session = await requireStaffRole(ROLES.NEWSLETTER_WRITE)
  const canExport = hasRole(session, ROLES.NEWSLETTER_SEND)
  const sp = await searchParams

  const status = (SUBSCRIBER_STATUSES as readonly string[]).includes(sp.status ?? '') ? (sp.status as SubscriberStatus) : null
  const filters: SubscriberFilters = { status, q: sp.q ?? null, from: sp.from ?? null, to: sp.to ?? null }
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const where = subscriberWhere(filters)

  const [counts, total, rows] = await Promise.all([
    subscriberCounts(filters),
    db.newsletterSubscriber.count({ where }),
    db.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        status: true,
        source: true,
        createdAt: true,
        confirmedAt: true,
        confirmationSentAt: true,
        unsubscribedAt: true,
      },
    }),
  ])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  function url(overrides: Record<string, string | undefined>) {
    const merged: Record<string, string | undefined> = {
      status: status ?? undefined,
      q: filters.q || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      page: page === 1 ? undefined : String(page),
      ...overrides,
    }
    const qs = new URLSearchParams(Object.entries(merged).filter((e): e is [string, string] => Boolean(e[1]))).toString()
    return `/admin/newsletter/subscribers${qs ? `?${qs}` : ''}`
  }

  const filtered = Boolean(filters.q || filters.from || filters.to)

  return (
    <AdminPageShell
      title="Subscribers"
      sub={`${total.toLocaleString('en-US')} ${total === 1 ? 'person' : 'people'}${status ? ` · ${STATUS_LABEL[status].toLowerCase()}` : ''}`}
      actions={
        <>
          {counts.pending > 0 ? (
            <ActionButton
              action={resendConfirmationsAction.bind(null, null)}
              kind="outline"
              size="dense"
              confirm={`Send a fresh confirmation email to up to ${RESEND_CONFIRMATION_MAX} people who have not confirmed and were last mailed more than 24 hours ago?`}
            >
              Re-send pending confirmations
            </ActionButton>
          ) : null}
          {canExport ? <DownloadCsvButton action={exportSubscribersAction.bind(null, filters)} /> : null}
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <NewsletterTabs active="subscribers" />

        <form method="GET" action="/admin/newsletter/subscribers" className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-[12px] text-ih-muted">
            Email contains
            <input name="q" defaultValue={filters.q ?? ''} placeholder="name@company.com" className={`${inputClass} w-64`} />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-ih-muted">
            Signed up from
            <input type="date" name="from" defaultValue={filters.from ?? ''} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-ih-muted">
            to
            <input type="date" name="to" defaultValue={filters.to ?? ''} className={inputClass} />
          </label>
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <button type="submit" className="h-9 rounded-lg bg-ih-navy px-4 text-[14px] font-medium text-ih-bg hover:bg-ih-ink">
            Apply
          </button>
          {filtered ? (
            <Link href={url({ q: undefined, from: undefined, to: undefined, page: undefined })} className="ml-1 self-center text-[12.5px] text-ih-muted underline underline-offset-2 hover:text-ih-ink">
              Clear
            </Link>
          ) : null}
        </form>

        <NavTabs
          variant="chip"
          label="Filter by status"
          items={[
            { href: url({ status: undefined, page: undefined }), active: !status, label: 'All', count: counts.all },
            ...SUBSCRIBER_STATUSES.map((s) => ({
              href: url({ status: s, page: undefined }),
              active: status === s,
              label: STATUS_LABEL[s],
              count: counts[s],
            })),
          ]}
        />

        <DataTable
          minWidth="lg"
          rows={rows}
          rowKey={(r) => r.id}
          columns={[
            { key: 'email', header: 'Email', width: '35%', cell: (r) => <span className="tabular-nums text-ih-ink">{r.email}</span> },
            {
              key: 'status',
              header: 'Status',
              cell: (r) => <StatusPill tone={STATUS_TONE[r.status as SubscriberStatus]}>{STATUS_LABEL[r.status as SubscriberStatus]}</StatusPill>,
            },
            { key: 'source', header: 'From', cell: (r) => <span className="text-ih-ink-2">{SOURCE_LABEL[r.source ?? ''] ?? r.source ?? '—'}</span> },
            { key: 'signed', header: 'Signed up', cell: (r) => <span className="tabular-nums text-ih-ink-2">{day(r.createdAt)}</span> },
            {
              key: 'confirmed',
              header: 'Confirmed',
              cell: (r) => <span className="tabular-nums text-ih-ink-2">{day(r.confirmedAt)}</span>,
            },
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              cell: (r) => (
                <div className="flex flex-wrap justify-end gap-1">
                  {r.status === 'pending' && resendDue(r.confirmationSentAt) ? (
                    <ActionButton action={resendConfirmationsAction.bind(null, [r.id])} aria-label={`Re-send confirmation to ${r.email}`}>
                      Re-send
                    </ActionButton>
                  ) : null}
                  {r.status === 'pending' || r.status === 'confirmed' ? (
                    <ActionButton
                      action={unsubscribeSubscriberAction.bind(null, r.id)}
                      confirm={`Unsubscribe ${r.email}? They will not be mailed again, from the newsletter or any list, unless they sign up again themselves.`}
                      aria-label={`Unsubscribe ${r.email}`}
                    >
                      Unsubscribe
                    </ActionButton>
                  ) : null}
                </div>
              ),
            },
          ]}
          emptyState={
            <EmptyState
              condition={filtered || status ? 'NO MATCHES' : 'NO SUBSCRIBERS YET'}
              message={
                filtered || status
                  ? 'Nobody matches these filters.'
                  : 'People who sign up through the form on the site appear here once they enter their address.'
              }
            />
          }
        />

        {totalPages > 1 ? (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            buildUrl={(n) => url({ page: n === 1 ? undefined : String(n) })}
            linkComponent={Link}
          />
        ) : null}
      </div>
    </AdminPageShell>
  )
}
