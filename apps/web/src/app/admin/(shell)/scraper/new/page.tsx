import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../../../../lib/admin-auth'
import { hasRole, ROLES } from '../../../../../lib/rbac'
import StartScrapeForm from './StartScrapeForm'

export const metadata: Metadata = { title: 'Start a crawl — Indus Admin' }

type Props = { params: Promise<Record<string, never>> }

export default async function NewScrapeJobPage({ params }: Props) {
  await params
  const session = await auth()
  if (!hasRole(session, ROLES.COMPETITOR_SCRAPE)) redirect('/admin')

  return (
    <div className="px-8 py-8 max-w-[680px]">
      <header className="mb-6">
        <Link
          href="/admin/scraper"
          className="text-[11px] font-mono uppercase tracking-wider text-ih-muted hover:text-ih-ink"
        >
          ← Back to crawls
        </Link>
        <h1 className="text-[22px] font-semibold text-ih-ink mt-2">Start a new crawl</h1>
        <p className="text-[13px] text-ih-muted mt-1">
          Paste a competitor sitemap URL — or a list of product URLs, one per line — and we&rsquo;ll discover their catalogue in the background.
        </p>
      </header>

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
    </div>
  )
}
