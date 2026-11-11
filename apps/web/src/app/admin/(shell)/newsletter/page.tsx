import { db } from '@indus/db'
import { DataTable, EmptyState, KpiTile, StatusPill, type StatusTone } from '@indus/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

import AdminPageShell from '../../../../components/admin/AdminPageShell'
import NewsletterTabs from '../../../../components/admin/newsletter/NewsletterTabs'
import NewNewsletterDialog from '../../../../components/admin/newsletter/NewNewsletterDialog'
import { CAMPAIGN_STATUS_LABELS, type CampaignStatus } from '../../../../lib/newsletter/campaign'
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

const DUBAI = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai' })

function when(c: { status: string; scheduledAt: Date | null; sentAt: Date | null; updatedAt: Date }): string {
  if (c.status === 'sent' && c.sentAt) return `Sent ${DUBAI.format(c.sentAt)}`
  if (c.status === 'scheduled' && c.scheduledAt) return `For ${DUBAI.format(c.scheduledAt)}`
  return `Edited ${DUBAI.format(c.updatedAt)}`
}

function audience(c: { audience: string; listIds: string[] }): string {
  const lists = c.listIds.length ? `${c.listIds.length} custom list${c.listIds.length === 1 ? '' : 's'}` : ''
  if (c.audience === 'all') return lists ? `Every confirmed subscriber + ${lists}` : 'Every confirmed subscriber'
  return lists || '—'
}

export default async function NewsletterPage() {
  await requireStaffRole(ROLES.NEWSLETTER_WRITE)

  const [byStatus, lists, contacts, suppressions, campaigns, saved] = await Promise.all([
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
    db.newsletterTemplate.findMany({ orderBy: { updatedAt: 'desc' }, select: { id: true, name: true, description: true } }),
  ])
  const count = (s: string) => byStatus.find((g) => g.status === s)?._count._all ?? 0

  return (
    <AdminPageShell title="Newsletter" breadcrumbs="Content · Newsletter" actions={<NewNewsletterDialog saved={saved} />}>
      <div className="flex flex-col gap-6">
        <NewsletterTabs
          active="campaigns"
          counts={{ campaigns: campaigns.length, templates: saved.length, subscribers: count('confirmed'), lists }}
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Link href="/admin/newsletter/subscribers?status=confirmed" className="block rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label="Confirmed" value={count('confirmed').toLocaleString('en-US')} hint="receive newsletters" />
          </Link>
          <Link href="/admin/newsletter/subscribers?status=pending" className="block rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label="Pending" value={count('pending').toLocaleString('en-US')} hint="haven’t confirmed yet" />
          </Link>
          <Link href="/admin/newsletter/lists" className="block rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label="On lists" value={contacts.toLocaleString('en-US')} hint={`active contacts on ${lists} list${lists === 1 ? '' : 's'}`} />
          </Link>
          <Link href="/admin/newsletter/suppressions" className="block rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label="Suppressed" value={suppressions.toLocaleString('en-US')} hint="never mailed again" />
          </Link>
        </div>

        <DataTable
          minWidth="lg"
          rows={campaigns}
          rowKey={(c) => c.id}
          columns={[
            {
              key: 'subject',
              header: 'Subject',
              width: '40%',
              cell: (c) => (
                <span className="flex min-w-0 items-center gap-2">
                  <Link href={`/admin/newsletter/campaigns/${c.id}`} className="truncate font-medium text-ih-ink hover:text-ih-accent">
                    {c.subject || <span className="text-ih-muted">(no subject yet)</span>}
                  </Link>
                  {c.format === 'rich' ? <span className="shrink-0 text-[12px] text-ih-muted">rich text</span> : null}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              cell: (c) => <StatusPill tone={STATUS_TONE[c.status as CampaignStatus]}>{CAMPAIGN_STATUS_LABELS[c.status as CampaignStatus]}</StatusPill>,
            },
            { key: 'audience', header: 'Audience', cell: (c) => <span className="text-ih-ink-2">{audience(c)}</span> },
            {
              key: 'recipients',
              header: 'Recipients',
              numeric: true,
              cell: (c) => <span className="tabular-nums">{c.status === 'draft' || c.status === 'scheduled' ? '—' : c.recipientCount.toLocaleString('en-US')}</span>,
            },
            { key: 'when', header: 'When', cell: (c) => <span className="whitespace-nowrap tabular-nums text-ih-ink-2">{when(c)}</span> },
          ]}
          emptyState={<EmptyState condition="NO NEWSLETTERS YET" message="Start one with New newsletter." />}
        />
      </div>
    </AdminPageShell>
  )
}
