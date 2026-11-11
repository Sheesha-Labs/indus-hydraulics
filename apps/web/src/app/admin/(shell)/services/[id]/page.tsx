import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import { SERVICE_CASE_CATEGORY_LABELS } from '@indus/domain'
import { ChevronRight, ExternalLink } from 'lucide-react'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import { mediaUrl } from '../../../../../lib/media'
import ServiceCaseForm from './ServiceCaseForm'

export const metadata: Metadata = { title: 'Edit service case — Indus Admin' }

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditServiceCasePage({ params }: Props) {
  const { id } = await params
  const row = await db.serviceCase.findUnique({
    where: { id },
    include: { heroImage: { select: { storagePath: true, alt: true } } },
  })
  if (!row) notFound()

  const isLive = row.status === 'published'

  return (
    <AdminPageShell
      title={row.title}
      // Where you are, above what it is; the crumb is also the way back.
      breadcrumbs={
        <span className="inline-flex min-w-0 items-center gap-1">
          <Link href="/admin/services">Service cases</Link>
          <ChevronRight size={11} aria-hidden="true" className="shrink-0" />
          <span className="truncate">
            <span className="tabular-nums">Case {row.caseNumber}</span> · /services/{row.slug}
          </span>
        </span>
      }
      actions={
        isLive ? (
          <a
            href={`/services/${row.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-ih-muted transition-colors hover:bg-ih-surface-2 hover:text-ih-ink"
          >
            View on site
            <ExternalLink size={13} strokeWidth={1.8} aria-hidden="true" />
          </a>
        ) : null
      }
      bodyClassName="max-w-[1320px]"
    >
      <ServiceCaseForm
        row={{
          id: row.id,
          status: row.status,
          isFeatured: row.isFeatured,
          title: row.title,
          titleAccent: row.titleAccent,
          deck: row.deck,
          topicLabel: row.topicLabel,
          region: row.region,
          caseDateLabel: row.caseDateLabel,
          cardOneLiner: row.cardOneLiner,
          cardTagLabel: row.cardTagLabel,
          cardTagStyle: row.cardTagStyle,
          cardDurationLabel: row.cardDurationLabel,
          durationDays: row.durationDays,
          savingsAmount: row.savingsAmount,
          seoTitle: row.seoTitle,
          seoDescription: row.seoDescription,
          robotsIndex: row.robotsIndex,
        }}
        meta={{
          slug: row.slug,
          caseNumber: row.caseNumber,
          categoryLabel: SERVICE_CASE_CATEGORY_LABELS[row.category] ?? row.category,
          publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
          updatedAt: row.updatedAt.toISOString(),
          heroUrl: row.heroImage?.storagePath ? mediaUrl(row.heroImage.storagePath) : null,
          heroAlt: row.heroImage?.alt ?? null,
          savingsCurrency: row.savingsCurrency,
        }}
      />
    </AdminPageShell>
  )
}
