import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../../../lib/admin-auth'
import { hasRole, ROLES } from '../../../../lib/rbac'
import { db } from '@indus/db'

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
    <div className="px-8 py-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-primary)]">Competitor scraper</h1>
          <p className="text-[13px] text-[var(--color-muted)] mt-1">
            Crawl a competitor catalogue, pick the products you want, and ingest their images into your own listings.
          </p>
        </div>
        <Link
          href="/admin/scraper/new"
          className="h-9 px-4 bg-[var(--color-accent)] text-white font-mono text-[12px] tracking-wider uppercase grid place-items-center hover:opacity-90"
        >
          Start a crawl
        </Link>
      </header>

      {jobs.length === 0 ? (
        <div className="border border-[var(--color-border-default)] bg-[var(--color-surface)] p-10 text-center">
          <p className="text-[14px] text-[var(--color-body)]">No crawls yet.</p>
          <p className="text-[12px] text-[var(--color-muted)] mt-2">
            Start your first crawl by pasting a competitor sitemap URL or a list of product URLs.
          </p>
        </div>
      ) : (
        <table className="w-full border border-[var(--color-border-default)] text-[13px]">
          <thead className="bg-[var(--color-deep)] text-[var(--color-muted)] uppercase font-mono text-[10px] tracking-wider">
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
              <tr key={j.id} className="border-t border-[var(--color-border-default)] hover:bg-[var(--color-deep)]">
                <td className="px-3 py-2 font-mono text-[12px]">
                  <Link href={`/admin/scraper/${j.id}`} className="text-[var(--color-accent)] hover:underline">
                    {j.code}
                  </Link>
                </td>
                <td className="px-3 py-2">{j.hostname}</td>
                <td className="px-3 py-2 font-mono text-[11px] uppercase">{j.status}</td>
                <td className="px-3 py-2 text-right">{j.totalFound}</td>
                <td className="px-3 py-2 text-[var(--color-muted)]">{j.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
