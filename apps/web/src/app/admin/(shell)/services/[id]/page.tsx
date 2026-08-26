import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import ServiceCaseForm from './ServiceCaseForm'

export const metadata: Metadata = { title: 'Edit service case — Indus Admin' }

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditServiceCasePage({ params }: Props) {
  const { id } = await params
  const row = await db.serviceCase.findUnique({ where: { id } })
  if (!row) notFound()

  return (
    <AdminPageShell
      title={row.title}
      sub={
        <>
          Case {row.caseNumber} ·{' '}
          <Link className="underline" href={`/services/${row.slug}`}>
            /services/{row.slug}
          </Link>
        </>
      }
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
      />
    </AdminPageShell>
  )
}
