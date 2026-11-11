import { db } from '@indus/db'
import { DataTable, EmptyState, KpiTile, Panel, StatusPill, type StatusTone } from '@indus/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

import AdminPageShell from '../../../../components/admin/AdminPageShell'
import NewsletterTabs from '../../../../components/admin/newsletter/NewsletterTabs'
import StartCampaignButton from '../../../../components/admin/newsletter/StartCampaignButton'
import { CAMPAIGN_STATUS_LABELS, type CampaignStatus } from '../../../../lib/newsletter/campaign'
import { STARTERS, STARTER_META } from '../../../../lib/newsletter/starters'
import { ROLES } from '../../../../lib/rbac'
import { requireStaffRole } from '../../../../lib/staff-session'

export const metadata: Metadata = { title: 'Newsletter — Indus Admin' }
export const dynamic = 'force-dynamic'

const STATUS_TONE: Record<CampaignStatus, StatusTone> = {
  draft: 'neutral',
  scheduled: 'info',
  sending: 'warning',
  sent: 'success',
  cancelled: 'neutral',
}

function when(c: { status: string; scheduledAt: Date | null; sentAt: Date | null; updatedAt: Date }): string {
  const fmt = (d: Date) => d.toISOString().slice(0, 16).replace('T', ' ')
  if (c.status === 'sent' && c.sentAt) return `Sent ${fmt(c.sentAt)}`
  if (c.status === 'scheduled' && c.scheduledAt) return `For ${fmt(c.scheduledAt)}`
  return `Edited ${fmt(c.updatedAt)}`
}

export default async function NewsletterPage() {
  await requireStaffRole(ROLES.NEWSLETTER_WRITE)

  const [byStatus, lists, contacts, suppressions, campaigns] = await Promise.all([
    db.newsletterSubscriber.groupBy({ by: ['status'], _count: { _all: true } }),
    db.newsletterList.count(),
    db.newsletterListContact.count({ where: { status: 'active' } }),
    db.newsletterSuppression.count(),
    db.newsletterCampaign.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        subject: true,
        status: true,
        format: true,
        audience: true,
        listIds: true,
        recipientCount: true,
        scheduledAt: true,
        sentAt: true,
        updatedAt: true,
      },
    }),
  ])
  const count = (s: string) => byStatus.find((g) => g.status === s)?._count._all ?? 0

  return (
    <AdminPageShell title="Newsletter" sub="Write, test and send newsletters to subscribers and lists.">
      <div className="flex flex-col gap-6">
        <NewsletterTabs active="campaigns" />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Link href="/admin/newsletter/subscribers?status=confirmed" className="block rounded-[10px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label="Confirmed subscribers" value={count('confirmed').toLocaleString('en-US')} hint={`${count('pending').toLocaleString('en-US')} awaiting confirmation`} />
          </Link>
          <Link href="/admin/newsletter/lists" className="block rounded-[10px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label={`On ${lists} list${lists === 1 ? '' : 's'}`} value={contacts.toLocaleString('en-US')} />
          </Link>
          <Link href="/admin/newsletter/suppressions" className="block rounded-[10px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label="Never mailed again" value={suppressions.toLocaleString('en-US')} />
          </Link>
          <KpiTile label="Newsletters sent" value={campaigns.filter((c) => c.status === 'sent').length.toLocaleString('en-US')} />
        </div>

        <Panel>
          <h2 className="mb-1 text-[15px] font-medium text-ih-ink">New newsletter</h2>
          <p className="mb-3 text-[13.5px] text-ih-ink-2">Start from a layout — the ones that feature products, categories or articles fill themselves with the latest from the site — or from one of your templates.</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STARTERS.map((s) => (
              <li key={s} className="flex flex-col gap-2 rounded-[10px] border border-ih-border p-3">
                <div>
                  <p className="text-[14px] font-medium text-ih-ink">{STARTER_META[s].label}</p>
                  <p className="text-[12.5px] text-ih-muted">{STARTER_META[s].hint}</p>
                </div>
                <div>
                  <StartCampaignButton input={{ starter: s }} label="Start" kind={s === 'blank' ? 'ghost' : 'outline'} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-ih-muted">
            Or <Link href="/admin/newsletter/templates" className="text-ih-accent underline underline-offset-2">start from a saved template</Link>.
          </p>
        </Panel>

        <DataTable
          minWidth="lg"
          rows={campaigns}
          rowKey={(c) => c.id}
          columns={[
            {
              key: 'subject',
              header: 'Newsletter',
              width: '44%',
              cell: (c) => (
                <Link href={`/admin/newsletter/campaigns/${c.id}`} className="font-medium text-ih-ink hover:underline">
                  {c.subject || <span className="text-ih-muted">(no subject yet)</span>}
                </Link>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              cell: (c) => <StatusPill tone={STATUS_TONE[c.status as CampaignStatus]}>{CAMPAIGN_STATUS_LABELS[c.status as CampaignStatus]}</StatusPill>,
            },
            {
              key: 'audience',
              header: 'To',
              cell: (c) => (
                <span className="text-ih-ink-2">
                  {[c.audience === 'all' ? 'Subscribers' : '', c.listIds.length ? `${c.listIds.length} list${c.listIds.length === 1 ? '' : 's'}` : '']
                    .filter(Boolean)
                    .join(' + ') || '—'}
                </span>
              ),
            },
            {
              key: 'recipients',
              header: 'Recipients',
              numeric: true,
              cell: (c) => <span className="tabular-nums">{c.status === 'draft' || c.status === 'scheduled' ? '—' : c.recipientCount.toLocaleString('en-US')}</span>,
            },
            { key: 'when', header: 'When', cell: (c) => <span className="tabular-nums text-ih-ink-2">{when(c)}</span> },
          ]}
          emptyState={<EmptyState condition="NO NEWSLETTERS YET" message="Start one from a layout above." />}
        />
      </div>
    </AdminPageShell>
  )
}
