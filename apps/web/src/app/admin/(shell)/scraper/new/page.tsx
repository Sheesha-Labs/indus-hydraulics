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
          className="flex h-9 items-center rounded-md border border-ih-border bg-ih-surface px-4 text-[13px] font-medium transition-colors hover:border-ih-accent hover:text-ih-accent"
        >
          ← Back to crawls
        </Link>
      }
      bodyClassName="max-w-2xl"
    >
      {/* Kept in the body: the bar's subtitle is a one-line summary, this is
          the instruction people follow. */}
      <p className="mb-6 text-[13px] text-ih-muted">
        Paste a competitor sitemap URL — or a list of product URLs, one per line — and we&rsquo;ll discover their catalogue in the background.
      </p>

      <div className="border border-ih-border bg-ih-bg p-6">
        <StartScrapeForm />
      </div>

      <aside className="mt-6 border-l-2 border-ih-accent bg-ih-surface-2 p-4 text-[12px] text-ih-ink-2">
        <p className="font-mono uppercase tracking-wider text-[10px] text-ih-muted mb-1.5">
          What happens next
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>The crawl is queued and runs in the background — you can close this tab.</li>
          <li>We discover product URLs from the sitemap (or use your pasted list).</li>
          <li>Each product page is parsed for title, brand, description, and candidate images.</li>
          <li>Once finished, you select which products to ingest from the job page.</li>
        </ol>
      </aside>
    </AdminPageShell>
  )
}
