import type { Metadata } from 'next'
import { db } from '@indus/db'
import AdminTopbar from '../../../../components/AdminTopbar'
import IndustriesClient from './IndustriesClient'

export const metadata: Metadata = { title: 'Industries — Indus Admin' }

type Props = { params: Promise<{ locale: string }> }

export default async function IndustriesPage({ params }: Props) {
  const { locale } = await params

  const industriesRaw = await db.industry.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { accounts: true } },
    },
  })

  const industries = industriesRaw.map((i) => ({
    id: i.id,
    slug: i.slug,
    name: i.name,
    description: i.description,
    seoTitle: i.seoTitle,
    seoDescription: i.seoDescription,
    isPublished: i.isPublished,
    accountCount: i._count.accounts,
  }))

  return (
    <>
      <AdminTopbar crumbs={[{ label: 'Catalogue' }, { label: 'Industries' }]} />
      <div className="px-8 py-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">Industries</h1>
            <p className="text-[13px] text-[var(--color-muted)] mt-1">
              {industries.length} {industries.length === 1 ? 'industry' : 'industries'}
            </p>
          </div>
        </div>

        <IndustriesClient locale={locale} industries={industries} />
      </div>
    </>
  )
}
