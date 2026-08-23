import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, Images, FileText, Plus } from 'lucide-react'
import { db } from '@indus/db'
import { MASTER_PAGES, SUBPAGE_KINDS, masterContentKey } from '@indus/domain'
import AdminPageShell from '../../../../components/admin/AdminPageShell'
import { countSubPageRecords } from '../../../../lib/sub-page-records'

export const metadata: Metadata = { title: 'Pages & Blocks — Indus Admin' }

export const dynamic = 'force-dynamic'

type Props = { params: Promise<Record<string, never>> }

/**
 * Pages & Blocks — the index.
 *
 * Three families, in the order a content manager thinks about them:
 *
 *  1. **Master pages** — the routes in the main navigation. Each is a fixed
 *     composition whose sections can be reordered, hidden and re-worded.
 *  2. **Sub-pages** — pages that exist once per record from a shared template.
 *     They arrive as their templates are wired up.
 *  3. **Standalone pages** — the old free-form `cms_pages` rows, which still
 *     back the policy routes as a whole-body override.
 *
 * This replaced "Pages & Hero". The homepage carousel is still here, one level
 * down at /admin/pages/hero — it is one section's imagery, not a page.
 */
export default async function AdminPagesIndex({ params }: Props) {
  await params

  const [standalone, heroSlideCount, edited, subEditedByKind, totalByKind] = await Promise.all([
    db.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } }),
    db.homepageHeroSlide.count(),
    db.pageContent.findMany({
      where: { kind: 'master' },
      select: { key: true, updatedAt: true },
    }),
    db.pageContent.groupBy({
      by: ['kind'],
      where: { kind: { in: SUBPAGE_KINDS.map((k) => k.kind) } },
      _count: { _all: true },
    }),
    countSubPageRecords(SUBPAGE_KINDS.map((k) => k.kind)),
  ])

  // How many pages of each kind EXIST, against how many have been touched. A
  // count of records alone would read as "126 markets edited" on a section
  // nobody has opened.
  const editedCount = new Map(subEditedByKind.map((row) => [row.kind, row._count._all]))

  // Which master pages have ever been saved, so a card can say "never edited"
  // rather than implying an edit history that does not exist.
  const editedByKey = new Map(edited.map((row) => [row.key, row.updatedAt]))

  const storefront = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com').replace(
    /\/$/,
    '',
  )

  return (
    <AdminPageShell
      title="Pages & Blocks"
      actions={
        <Link
          href="/admin/pages/static/new"
          className="flex h-9 items-center rounded-md bg-ih-accent px-4 font-mono text-[12px] text-ih-accent-fg transition-colors hover:bg-ih-accent-hover"
        >
          <Plus size={13} strokeWidth={1.9} className="mr-1.5" />
          New standalone page
        </Link>
      }
      bodyClassName="flex flex-col gap-10"
    >
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-[15px] font-medium tracking-[-0.01em]">Master pages</h2>
          <p className="mt-1 max-w-[74ch] text-[13px] leading-[1.55] text-ih-muted">
            The top-level routes. Open one to reorder its sections, hide the ones you don&apos;t
            want, and edit its copy, links and images. Anything you leave untouched keeps the
            wording the page ships with.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MASTER_PAGES.map((page) => {
            const updatedAt = editedByKey.get(masterContentKey(page.key))
            return (
              <li key={page.key}>
                <Link
                  href={`/admin/pages/master/${page.key}`}
                  className="flex h-full flex-col gap-1 rounded-lg border border-ih-border bg-ih-surface p-4 transition-colors hover:border-ih-accent"
                >
                  <span className="text-[13.5px] font-medium text-ih-ink">{page.label}</span>
                  <span className="font-mono text-[11px] text-ih-muted">{page.path}</span>
                  <span className="mt-1.5 font-mono text-[11px] text-ih-muted-2">
                    {page.sections.length} sections ·{' '}
                    {updatedAt
                      ? `edited ${updatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                      : 'never edited'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3 border-t border-ih-border pt-8">
        <div>
          <h2 className="text-[15px] font-medium tracking-[-0.01em]">Sub-pages</h2>
          <p className="mt-1 max-w-[74ch] text-[13px] leading-[1.55] text-ih-muted">
            Pages that exist once per record, built from a shared template. Editing one changes that
            page only; everything left blank keeps the wording the template builds from the record.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SUBPAGE_KINDS.map((kind) => {
            const total = totalByKind[kind.kind] ?? 0
            const touched = editedCount.get(kind.kind) ?? 0
            return (
              <li key={kind.kind}>
                <Link
                  href={kind.adminPath}
                  className="flex h-full flex-col gap-1 rounded-lg border border-ih-border bg-ih-surface p-4 transition-colors hover:border-ih-accent"
                >
                  <span className="text-[13.5px] font-medium text-ih-ink">{kind.label}</span>
                  <span className="font-mono text-[11px] text-ih-muted">{kind.publicPath}/…</span>
                  <span className="mt-1.5 font-mono text-[11px] text-ih-muted-2">
                    {total} {total === 1 ? kind.itemLabel : `${kind.itemLabel}s`} · {touched} edited
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3 border-t border-ih-border pt-8">
        <div>
          <h2 className="text-[15px] font-medium tracking-[-0.01em]">Other content</h2>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <li>
            <Link
              href="/admin/pages/hero"
              className="flex h-full flex-col gap-1 rounded-lg border border-ih-border bg-ih-surface p-4 transition-colors hover:border-ih-accent"
            >
              <span className="flex items-center gap-2 text-[13.5px] font-medium text-ih-ink">
                <Images size={14} strokeWidth={1.7} aria-hidden="true" />
                Homepage carousel
              </span>
              <span className="font-mono text-[11px] text-ih-muted">Hero visual on /</span>
              <span className="mt-1.5 font-mono text-[11px] text-ih-muted-2">
                {heroSlideCount} {heroSlideCount === 1 ? 'slide' : 'slides'}
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3 border-t border-ih-border pt-8">
        <div>
          <h2 className="text-[15px] font-medium tracking-[-0.01em]">Standalone pages</h2>
          <p className="mt-1 max-w-[74ch] text-[13px] leading-[1.55] text-ih-muted">
            Free-form pages with a single rich-text body. Publishing one whose slug matches a policy
            route — <span className="font-mono text-[12px] text-ih-ink-2">privacy</span>,{' '}
            <span className="font-mono text-[12px] text-ih-ink-2">terms</span>,{' '}
            <span className="font-mono text-[12px] text-ih-ink-2">shipping</span>,{' '}
            <span className="font-mono text-[12px] text-ih-ink-2">returns</span>,{' '}
            <span className="font-mono text-[12px] text-ih-ink-2">warranty</span>,{' '}
            <span className="font-mono text-[12px] text-ih-ink-2">about</span> — replaces that
            page&apos;s whole body.
          </p>
        </div>

        {standalone.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ih-border bg-ih-surface-2 px-4 py-6 text-center text-[13px] text-ih-muted">
            No standalone pages yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-ih-border">
            <div className="grid grid-cols-[1fr_100px_110px_70px] border-b border-ih-border bg-ih-bg px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
              <div>Title</div>
              <div className="text-center">Status</div>
              <div className="text-right">Updated</div>
              <div />
            </div>
            {standalone.map((page, i) => (
              <div
                key={page.id}
                className={`grid grid-cols-[1fr_100px_110px_70px] items-center bg-ih-surface px-4 py-3.5 ${i > 0 ? 'border-t border-ih-border' : ''}`}
              >
                {/* Title is the link, matching every other admin list. */}
                <div className="min-w-0">
                  <Link
                    href={`/admin/pages/static/${page.id}`}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-ih-ink hover:text-ih-accent"
                  >
                    <FileText size={13} strokeWidth={1.7} aria-hidden="true" />
                    <span className="truncate">{page.title}</span>
                  </Link>
                  <div className="font-mono text-[11px] text-ih-muted">/{page.slug}</div>
                </div>
                <div className="flex justify-center">
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-medium ${page.isPublished ? 'bg-ih-success-soft text-ih-success-ink' : 'bg-ih-surface-2 text-ih-muted'}`}
                  >
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="text-right font-mono text-[12px] text-ih-muted">
                  {page.updatedAt.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                {/* The public page, not a second route to the editor.
                    Absolute, not root-relative: one app serves both surfaces,
                    so a bare `/slug` from inside the console is exactly the
                    shape `admin-path-prefix.test.ts` exists to catch. */}
                <div className="flex justify-end">
                  {page.isPublished ? (
                    <a
                      href={`${storefront}/${page.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-ih-accent hover:underline"
                    >
                      View ↗
                    </a>
                  ) : (
                    <span className="font-mono text-[11px] text-ih-muted-2">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="border-t border-ih-border pt-6 text-[12.5px] text-ih-muted">
        Looking for articles? They live under{' '}
        <Link href="/admin/blog" className="text-ih-accent hover:underline">
          Blog Editor
        </Link>
        . Navigation and the megamenu are under{' '}
        <Link href="/admin/navigation" className="text-ih-accent hover:underline">
          Navigation
        </Link>
        .{' '}
        <a
          href={storefront}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-ih-accent hover:underline"
        >
          View the site <ExternalLink size={11} aria-hidden="true" />
        </a>
      </p>
    </AdminPageShell>
  )
}
