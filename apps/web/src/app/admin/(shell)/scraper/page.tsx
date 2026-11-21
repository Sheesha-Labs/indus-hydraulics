import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../../../lib/admin-auth'
import { hasRole, ROLES } from '../../../../lib/rbac'
import { db } from '@indus/db'
import AdminPageShell from '../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Competitor scraper — Indus Admin' }

type Props = { params: Promise<Record<string, never>> }

export default async function ScraperJobsPage({ params }: Props) {
  await params
  const session = await auth()
  if (!hasRole(session, ROLES.COMPETITOR_SCRAPE)) redirect('/admin')

  const jobs = await db.scraperJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      code: true,
      hostname: true,
      status: true,
      totalFound: true,
      createdAt: true,
    },
  })

  return (
    <AdminPageShell
      title="Competitor scraper"
      sub="Crawl a competitor catalogue and ingest their images into your listings"
      actions={
        // uppercase dropped: the tracking-wider + uppercase pair rendered this
        // as "START A CRAWL", and v2 topbar buttons are sentence case.
        <Link
          href="/admin/scraper/new"
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover grid h-9 place-items-center rounded-md px-4 text-[13px] font-medium transition-opacity"
        >
          Start a crawl
        </Link>
      }
    >
      {jobs.length === 0 ? (
        <div className="border-ih-border bg-ih-bg rounded-lg border p-10 text-center">
          <p className="text-ih-ink-2 text-[14px]">No crawls yet.</p>
          <p className="text-ih-muted mt-2 text-[12px]">
            Start your first crawl by pasting a competitor sitemap URL or a list of product URLs.
          </p>
        </div>
      ) : (
        <table className="border-ih-border w-full border text-[13px]">
          <thead className="bg-ih-surface-2 text-ih-muted text-[10.5px] tracking-wider uppercase tabular-nums">
            <tr>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Host</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Products found</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-ih-border hover:bg-ih-surface-2 border-t">
                <td className="px-3 py-2 text-[12px] tabular-nums">
                  <Link href={`/admin/scraper/${j.id}`} className="text-ih-accent hover:underline">
                    {j.code}
                  </Link>
                </td>
                <td className="px-3 py-2">{j.hostname}</td>
                <td className="px-3 py-2 text-[11px] uppercase tabular-nums">{j.status}</td>
                <td className="px-3 py-2 text-right">{j.totalFound}</td>
                <td className="text-ih-muted px-3 py-2">
                  {j.createdAt.toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminPageShell>
  )
}
