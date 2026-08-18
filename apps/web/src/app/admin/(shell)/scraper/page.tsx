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
          className="grid h-9 place-items-center rounded-md bg-ih-accent px-4 text-[13px] font-medium text-ih-accent-fg transition-opacity hover:bg-ih-accent-hover"
        >
          Start a crawl
        </Link>
      }
    >

      {jobs.length === 0 ? (
        <div className="border border-ih-border bg-ih-bg p-10 text-center">
          <p className="text-[14px] text-ih-ink-2">No crawls yet.</p>
          <p className="text-[12px] text-ih-muted mt-2">
            Start your first crawl by pasting a competitor sitemap URL or a list of product URLs.
          </p>
        </div>
      ) : (
        <table className="w-full border border-ih-border text-[13px]">
          <thead className="bg-ih-surface-2 text-ih-muted uppercase font-mono text-[10.5px] tracking-wider">
            <tr>
              <th className="text-left px-3 py-2">Code</th>
              <th className="text-left px-3 py-2">Host</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Products found</th>
              <th className="text-left px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t border-ih-border hover:bg-ih-surface-2">
                <td className="px-3 py-2 font-mono text-[12px]">
                  <Link href={`/admin/scraper/${j.id}`} className="text-ih-accent hover:underline">
                    {j.code}
                  </Link>
                </td>
                <td className="px-3 py-2">{j.hostname}</td>
                <td className="px-3 py-2 font-mono text-[11px] uppercase">{j.status}</td>
                <td className="px-3 py-2 text-right">{j.totalFound}</td>
                <td className="px-3 py-2 text-ih-muted">{j.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminPageShell>
  )
}
