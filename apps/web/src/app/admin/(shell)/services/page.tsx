import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import { SERVICE_CASE_CATEGORY_LABELS } from '@indus/domain'
import AdminPageShell from '../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Service cases — Indus Admin' }

/**
 * Every case, whatever its status — the point of the screen is to reach the
 * ones that are not live, so filtering to published would defeat it.
 */
export const dynamic = 'force-dynamic'

export default async function ServiceCasesPage() {
  const cases = await db.serviceCase.findMany({
    orderBy: [{ publishedAt: 'desc' }, { caseNumber: 'desc' }],
    select: {
      id: true,
      slug: true,
      caseNumber: true,
      title: true,
      status: true,
      category: true,
      isFeatured: true,
      publishedAt: true,
    },
  })

  const published = cases.filter((c) => c.status === 'published').length

  return (
    <AdminPageShell
      title="Service cases"
      sub={
        <>
          {cases.length} {cases.length === 1 ? 'case' : 'cases'} · {published} published
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-ih-border border-b text-left">
              <th className="py-2 pr-4 font-medium">#</th>
              <th className="py-2 pr-4 font-medium">Title</th>
              <th className="py-2 pr-4 font-medium">Category</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Published</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-ih-border/60 border-b">
                <td className="py-2 pr-4 font-mono text-xs">{c.caseNumber}</td>
                <td className="py-2 pr-4">
                  <Link className="underline" href={`/admin/services/${c.id}`}>
                    {c.title}
                  </Link>
                  {c.isFeatured ? (
                    <span className="ml-2 font-mono text-[10px] uppercase">· case of the week</span>
                  ) : null}
                </td>
                <td className="py-2 pr-4">
                  {SERVICE_CASE_CATEGORY_LABELS[c.category] ?? c.category}
                </td>
                <td className="py-2 pr-4">{c.status}</td>
                <td className="py-2 pr-4 font-mono text-xs">
                  {c.publishedAt ? c.publishedAt.toISOString().slice(0, 10) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cases.length === 0 ? (
          <p className="text-ih-muted py-8 text-center">No service cases yet.</p>
        ) : null}
      </div>
    </AdminPageShell>
  )
}
