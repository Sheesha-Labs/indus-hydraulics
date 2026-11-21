import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../../../../lib/admin-auth'
import { hasRole, ROLES } from '../../../../../lib/rbac'
import StartScrapeForm from './StartScrapeForm'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Start a crawl — Indus Admin' }

type Props = { params: Promise<Record<string, never>> }

export default async function NewScrapeJobPage({ params }: Props) {
  await params
  const session = await auth()
  if (!hasRole(session, ROLES.COMPETITOR_SCRAPE)) redirect('/admin')

  return (
    <AdminPageShell
      title="Start a new crawl"
      sub="Paste a sitemap URL, or product URLs one per line"
      actions={
        <Link
          href="/admin/scraper"
          className="border-ih-border bg-ih-surface hover:border-ih-accent hover:text-ih-accent flex h-9 items-center rounded-md border px-4 text-[13px] font-medium transition-colors"
        >
          ← Back to crawls
        </Link>
      }
      bodyClassName="max-w-2xl"
    >
      {/* Kept in the body: the bar's subtitle is a one-line summary, this is
          the instruction people follow. */}
      <p className="text-ih-muted mb-6 text-[13px]">
        Paste a competitor sitemap URL — or a list of product URLs, one per line — and we&rsquo;ll
        discover their catalogue in the background.
      </p>

      <div className="border-ih-border bg-ih-bg rounded-lg border p-6">
        <StartScrapeForm />
      </div>

      <aside className="border-ih-accent bg-ih-surface-2 text-ih-ink-2 mt-6 border-l-2 p-4 text-[12px]">
        <p className="text-ih-muted mb-1.5 text-[10.5px] tracking-wider uppercase tabular-nums">
          What happens next
        </p>
        <ol className="list-inside list-decimal space-y-1">
          <li>The crawl is queued and runs in the background — you can close this tab.</li>
          <li>We discover product URLs from the sitemap (or use your pasted list).</li>
          <li>Each product page is parsed for title, brand, description, and candidate images.</li>
          <li>Once finished, you select which products to ingest from the job page.</li>
        </ol>
      </aside>
    </AdminPageShell>
  )
}
