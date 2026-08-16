import type { Metadata } from 'next'
import { db } from '@indus/db'
import IndustriesClient from './IndustriesClient'
import AdminPageShell from '../../../../components/admin/AdminPageShell'

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
    <AdminPageShell
      title={'Industries'}
      sub={<>{industries.length} {industries.length === 1 ? 'industry' : 'industries'}</>}
    >
      <IndustriesClient industries={industries} />
    
    </AdminPageShell>
  )
}
