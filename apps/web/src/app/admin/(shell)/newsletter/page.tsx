import { db } from '@indus/db'
import { KpiTile } from '@indus/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

import AdminPageShell from '../../../../components/admin/AdminPageShell'
import NewsletterTabs from '../../../../components/admin/newsletter/NewsletterTabs'
import { ROLES } from '../../../../lib/rbac'
import { requireStaffRole } from '../../../../lib/staff-session'

export const metadata: Metadata = { title: 'Newsletter — Indus Admin' }
export const dynamic = 'force-dynamic'

/** A request-time cutoff; outside the component so render stays pure. */
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000)
}

export default async function NewsletterOverviewPage() {
  await requireStaffRole(ROLES.NEWSLETTER_WRITE)

  const since = daysAgo(30)
  const [byStatus, newThisMonth, lists, contacts, suppressions] = await Promise.all([
    db.newsletterSubscriber.groupBy({ by: ['status'], _count: { _all: true } }),
    db.newsletterSubscriber.count({ where: { confirmedAt: { gte: since } } }),
    db.newsletterList.count(),
    db.newsletterListContact.count({ where: { status: 'active' } }),
    db.newsletterSuppression.count(),
  ])
  const count = (s: string) => byStatus.find((g) => g.status === s)?._count._all ?? 0

  return (
    <AdminPageShell title="Newsletter" sub="Who can be mailed: confirmed subscribers, staff lists, and the addresses that must never be mailed again.">
      <div className="flex flex-col gap-6">
        <NewsletterTabs active="overview" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Link href="/admin/newsletter/subscribers?status=confirmed" className="block rounded-[10px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label="Confirmed subscribers" value={count('confirmed').toLocaleString('en-US')} />
          </Link>
          <Link href="/admin/newsletter/subscribers?status=pending" className="block rounded-[10px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label="Awaiting confirmation" value={count('pending').toLocaleString('en-US')} />
          </Link>
          <KpiTile label="Confirmed, last 30 days" value={newThisMonth.toLocaleString('en-US')} />
          <Link href="/admin/newsletter/lists" className="block rounded-[10px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label={`On ${lists} list${lists === 1 ? '' : 's'}`} value={contacts.toLocaleString('en-US')} />
          </Link>
          <Link href="/admin/newsletter/suppressions" className="block rounded-[10px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label="Suppressed addresses" value={suppressions.toLocaleString('en-US')} />
          </Link>
        </div>
        <p className="max-w-[70ch] text-[14px] leading-[1.6] text-ih-ink-2">
          Subscribers join through the form on the site and confirm by email. Lists are addresses staff upload or add by
          hand — only people who agreed to hear from Indus. Anyone who unsubscribes, bounces or reports spam, from either,
          is suppressed everywhere and is never mailed again by a campaign.
        </p>
      </div>
    </AdminPageShell>
  )
}
