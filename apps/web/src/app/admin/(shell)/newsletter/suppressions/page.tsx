import { db } from '@indus/db'
import { DataTable, EmptyState, Field, Input, NavTabs, Pagination, Panel, StatusPill, type StatusTone } from '@indus/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import ActionForm from '../../../../../components/admin/newsletter/ActionForm'
import NewsletterTabs from '../../../../../components/admin/newsletter/NewsletterTabs'
import { ROLES } from '../../../../../lib/rbac'
import { requireStaffRole } from '../../../../../lib/staff-session'
import { checkSuppressionAction } from '../actions'

export const metadata: Metadata = { title: 'Newsletter suppressions — Indus Admin' }
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ reason?: string; page?: string }> }

const PAGE_SIZE = 50
const REASONS = ['unsubscribed', 'bounced', 'complained'] as const
type Reason = (typeof REASONS)[number]
const REASON_LABEL: Record<Reason, string> = { unsubscribed: 'Unsubscribed', bounced: 'Bounced', complained: 'Spam complaint' }
const REASON_TONE: Record<Reason, StatusTone> = { unsubscribed: 'neutral', bounced: 'danger', complained: 'warning' }

/**
 * Read-only. The table holds a one-way hash of each address, never the
 * address, so it cannot be browsed by person — only counted, and checked one
 * address at a time.
 */
export default async function NewsletterSuppressionsPage({ searchParams }: Props) {
  await requireStaffRole(ROLES.NEWSLETTER_WRITE)
  const sp = await searchParams
  const reason = (REASONS as readonly string[]).includes(sp.reason ?? '') ? (sp.reason as Reason) : null
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const where = reason ? { reason } : {}

  const [groups, total, rows] = await Promise.all([
    db.newsletterSuppression.groupBy({ by: ['reason'], _count: { _all: true } }),
    db.newsletterSuppression.count({ where }),
    db.newsletterSuppression.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { emailHash: true, reason: true, createdAt: true },
    }),
  ])
  const count = (r: Reason) => groups.find((g) => g.reason === r)?._count._all ?? 0
  const all = groups.reduce((n, g) => n + g._count._all, 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const url = (r: Reason | null, p = 1) => {
    const qs = new URLSearchParams()
    if (r) qs.set('reason', r)
    if (p > 1) qs.set('page', String(p))
    const s = qs.toString()
    return `/admin/newsletter/suppressions${s ? `?${s}` : ''}`
  }

  return (
    <AdminPageShell title="Suppressions" sub={`${all.toLocaleString('en-US')} addresses that are never mailed by a campaign`}>
      <div className="flex flex-col gap-6">
        <NewsletterTabs active="suppressions" />

        <Panel>
          <h2 className="mb-1 text-[15px] font-medium text-ih-ink">Check an address</h2>
          <p className="mb-3 max-w-[70ch] text-[13.5px] text-ih-ink-2">
            Only a one-way fingerprint of each address is kept, so the list below cannot show who is on it. Enter an
            address to see whether it is suppressed and why. Nothing you type is stored.
          </p>
          <ActionForm action={checkSuppressionAction} submitLabel="Check" pendingLabel="Checking…">
            <Field label="Email" className="min-w-[280px]">
              <Input name="email" type="email" required maxLength={254} autoComplete="off" />
            </Field>
          </ActionForm>
        </Panel>

        <NavTabs
          variant="chip"
          label="Filter by reason"
          items={[
            { href: url(null), active: !reason, label: 'All', count: all },
            ...REASONS.map((r) => ({ href: url(r), active: reason === r, label: REASON_LABEL[r], count: count(r) })),
          ]}
        />

        <DataTable
          minWidth="sm"
          rows={rows}
          rowKey={(r) => r.emailHash}
          columns={[
            {
              key: 'hash',
              header: 'Fingerprint',
              cell: (r) => <span className="tabular-nums text-ih-ink-2" title={r.emailHash}>{r.emailHash.slice(0, 12)}…</span>,
            },
            {
              key: 'reason',
              header: 'Reason',
              cell: (r) => <StatusPill tone={REASON_TONE[r.reason as Reason] ?? 'neutral'}>{REASON_LABEL[r.reason as Reason] ?? r.reason}</StatusPill>,
            },
            { key: 'since', header: 'Since', cell: (r) => <span className="tabular-nums text-ih-ink-2">{r.createdAt.toISOString().slice(0, 10)}</span> },
          ]}
          emptyState={<EmptyState condition="NONE" message="Nobody has unsubscribed, bounced or complained yet." />}
        />

        {totalPages > 1 ? (
          <Pagination currentPage={page} totalPages={totalPages} buildUrl={(n) => url(reason, n)} linkComponent={Link} />
        ) : null}
      </div>
    </AdminPageShell>
  )
}
