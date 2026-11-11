import { db } from '@indus/db'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import Composer from '../../../../../../components/admin/newsletter/Composer'
import { CAMPAIGN_STATUS_LABELS, EDITABLE_STATUSES, type CampaignStatus } from '../../../../../../lib/newsletter/campaign'
import { audienceSize, campaignProblemsLive, draftOf, loadSender } from '../../../../../../lib/newsletter/campaigns'
import { deliveryCounts } from '../../../../../../lib/newsletter/send'
import { formatFrom } from '../../../../../../lib/newsletter/sender'
import { ROLES, hasRole } from '../../../../../../lib/rbac'
import { requireStaffRole } from '../../../../../../lib/staff-session'

export const metadata: Metadata = { title: 'Newsletter editor — Indus Admin' }
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function CampaignPage({ params }: Props) {
  const session = await requireStaffRole(ROLES.NEWSLETTER_WRITE)
  const { id } = await params
  const row = await db.newsletterCampaign.findUnique({ where: { id } })
  if (!row) notFound()

  const draft = draftOf(row)
  const [lists, problems, size, sender, counts, subscribers] = await Promise.all([
    db.newsletterList.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, _count: { select: { contacts: { where: { status: 'active' } } } } },
    }),
    campaignProblemsLive(draft),
    audienceSize(draft.audience, draft.listIds),
    loadSender(),
    row.status === 'draft' ? Promise.resolve(null) : deliveryCounts(row.id),
    // What "Every confirmed subscriber" reaches on its own, suppressions out.
    audienceSize('all', []),
  ])

  return (
    // Composer renders AdminPageShell itself: the bar carries "Saved at",
    // which is client state.
    <Composer
      id={row.id}
      initial={draft}
      status={row.status as CampaignStatus}
      statusLabel={CAMPAIGN_STATUS_LABELS[row.status as CampaignStatus]}
      editable={EDITABLE_STATUSES.includes(row.status as CampaignStatus)}
      canSend={hasRole(session, ROLES.NEWSLETTER_SEND)}
      lists={lists.map((l) => ({ id: l.id, name: l.name, count: l._count.contacts }))}
      subscriberCount={subscribers}
      initialProblems={problems}
      initialAudienceSize={size}
      from={formatFrom(sender)}
      replyTo={sender.replyTo}
      testSentAt={row.testSentAt?.toISOString() ?? null}
      send={{
        maxPerHour: row.maxPerHour,
        dryRun: row.dryRun,
        scheduledAt: row.scheduledAt?.toISOString() ?? null,
        startedAt: row.startedAt?.toISOString() ?? null,
        sentAt: row.sentAt?.toISOString() ?? null,
        counts,
      }}
    />
  )
}
