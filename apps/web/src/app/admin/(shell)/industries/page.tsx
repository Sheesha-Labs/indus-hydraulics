import type { Metadata } from 'next'
import { db } from '@indus/db'
import IndustriesClient from './IndustriesClient'

export const metadata: Metadata = { title: 'Industries — Indus Admin' }

type Props = { params: Promise<Record<string, never>> }

export default async function IndustriesPage({ params }: Props) {
  await params

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
    <div className="px-8 py-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Industries</h1>
          <p className="text-[13px] text-[var(--color-muted)] mt-1">
            {industries.length} {industries.length === 1 ? 'industry' : 'industries'}
          </p>
        </div>
      </div>

      <IndustriesClient industries={industries} />
    </div>
  )
}
